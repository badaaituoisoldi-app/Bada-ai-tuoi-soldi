const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { default: AxeBuilder } = require("@axe-core/playwright");

const baseURL =
  process.env.SITE_URL || "http://127.0.0.1:8000/Bada-ai-tuoi-soldi/";
const executablePath = process.env.CHROMIUM_PATH || "/usr/bin/chromium";
const auditTags = ["wcag2a", "wcag2aa", "wcag21aa"];

(async () => {
  const browser = await chromium.launch({
    executablePath,
    args: ["--no-sandbox"],
  });
  try {
    for (const language of ["it", "en"]) {
      for (const width of [320, 390, 1440]) {
        for (const colorScheme of ["light", "dark"]) {
          const context = await browser.newContext({
            viewport: { width, height: 844 },
            colorScheme,
          });
          const page = await context.newPage();
          const label = `${language}, ${width}px, ${colorScheme}`;
          const scriptRequests = [];
          page.on("request", (request) => {
            if (request.resourceType() === "script")
              scriptRequests.push(request.url());
          });
          const url = new URL(language === "en" ? "en/" : "./", baseURL).href;
          const response = await page.goto(url);
          assert(response.ok(), `Page loads (${label})`);
          await page.evaluate(() => document.fonts.ready);
          assert.equal(
            await page.locator("html").getAttribute("lang"),
            language,
            label,
          );
          assert.equal(
            await page.locator("h1").count(),
            1,
            `One H1 (${label})`,
          );
          assert.equal(
            await page.locator("script").count(),
            0,
            `No page scripts (${label})`,
          );

          const images = page.locator("img");
          assert((await images.count()) > 0, `Images are present (${label})`);
          for (const image of await images.all()) {
            await image.scrollIntoViewIfNeeded();
            await page.waitForFunction(
              (element) => element.complete && element.naturalWidth > 0,
              await image.elementHandle(),
            );
          }
          assert.deepEqual(scriptRequests, [], `No script requests (${label})`);
          assert(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
            `No horizontal overflow (${label})`,
          );

          const playLinks = await page
            .locator("a[href]")
            .evaluateAll((links) =>
              links
                .map((link) => link.href)
                .filter((href) => new URL(href).hostname === "play.google.com"),
            );
          assert(
            playLinks.length > 0,
            `Google Play links are present (${label})`,
          );
          for (const href of playLinks) {
            const params = new URL(href).searchParams;
            assert.equal(
              params.get("utm_source"),
              "sito",
              `Play source: ${href}`,
            );
            assert(
              params.get("utm_campaign")?.trim(),
              `Play campaign: ${href}`,
            );
          }
          const { violations } = await new AxeBuilder({ page })
            .withTags(auditTags)
            .analyze();
          assert.deepEqual(violations, [], `Accessibility (${label})`);
          console.log(
            `PASS ${label}: layout, images, H1, Play links, no scripts, axe`,
          );
          await context.close();
        }
      }
    }
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
