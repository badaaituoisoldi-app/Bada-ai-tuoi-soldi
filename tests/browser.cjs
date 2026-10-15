const { chromium } = require('playwright');
const { default: AxeBuilder } = require('@axe-core/playwright');
const assert = require('node:assert/strict');
const { readFileSync, readdirSync } = require('node:fs');
const { resolve, relative, basename } = require('node:path');
const { createHash } = require('node:crypto');

const baseURL = process.env.SITE_URL || 'http://127.0.0.1:8000/Bada-ai-tuoi-soldi/';
const siteRoot = resolve(__dirname, '../site');
const viewports = [320, 360, 390, 430, 768, 1024, 1440];
const suppliedImages = [
  'assets/copertina-onde.png',
  'assets/feature-graphic.png',
  'assets/screenshots/store-1-mese.png',
  'assets/screenshots/store-2-impostazioni.png',
  'assets/screenshots/store-3-uscite.png',
  'assets/screenshots/store-4-obiettivi.png',
  'assets/screenshots/store-5-anno.png',
  'assets/screenshots/store-6-import.png',
];
const contentSelector = '.hero-intro, .hero-screen, .steps article, .balance-note, .feature-card, .extras article, .screenshots-grid figure, .privacy-content li, .closing > div, .closing > img';
const auditTags = ['wcag2a', 'wcag2aa', 'wcag21aa'];

function checkImageSources() {
  const sources = ['index.html', 'styles.css'].map(file => readFileSync(resolve(siteRoot, file), 'utf8')).join('\n');
  const paths = [...sources.matchAll(/assets\/[^\s"'()<>]+\.(?:png|jpe?g|webp|gif|avif|svg)/gi)].map(match => match[0]);
  assert.deepEqual([...new Set(paths)].sort(), [...suppliedImages].sort(), 'HTML and CSS reference exactly the supplied PNGs');
  assert(!sources.includes('data:image'), 'No generated inline raster images');
  const imageFiles = [];
  function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (/\.(png|jpe?g|webp|gif|avif|svg)$/i.test(entry.name)) imageFiles.push(relative(siteRoot, path).replaceAll('\\', '/'));
    }
  }
  walk(resolve(siteRoot, 'assets'));
  assert.deepEqual(imageFiles.sort(), [...suppliedImages].sort(), 'Only supplied raster assets are present');
  if (process.env.ORIGINAL_ASSETS_DIR) {
    const digest = path => createHash('sha256').update(readFileSync(path)).digest('hex');
    for (const asset of suppliedImages) {
      assert.equal(digest(resolve(siteRoot, asset)), digest(resolve(process.env.ORIGINAL_ASSETS_DIR, basename(asset))), `${asset} preserves the supplied PNG bytes`);
    }
  }
}

async function settle(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function assertNoOverflow(page, width, state) {
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}px (${state})`);
}

async function loadLazyImages(page) {
  for (const image of await page.locator('img[loading="lazy"]').all()) {
    await image.scrollIntoViewIfNeeded();
    await page.waitForFunction(element => element.complete && element.naturalWidth > 0, await image.elementHandle());
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForFunction(() => window.scrollY === 0);
  await settle(page);
}

async function assertContentVisible(page, state) {
  const hidden = await page.locator(contentSelector).evaluateAll(elements => elements.filter(element => {
    const style = getComputedStyle(element);
    return style.display === 'none' || style.visibility !== 'visible' || Number(style.opacity) !== 1 || element.getBoundingClientRect().height === 0;
  }).map(element => element.className));
  assert.deepEqual(hidden, [], `All content remains visible (${state})`);
}

async function audit(page, state) {
  const results = await new AxeBuilder({ page }).withTags(auditTags).analyze();
  assert.deepEqual(results.violations, [], `Accessibility violations (${state})`);
}

async function checkScreenshotLinks(page) {
  const links = page.locator('.screenshot-link');
  assert.equal(await links.count(), 7, 'Hero and six gallery screenshot links are present');
  const hrefs = await links.evaluateAll(elements => elements.map(element => element.getAttribute('href')));
  assert.deepEqual([...new Set(hrefs)].sort(), suppliedImages.filter(path => path.includes('/screenshots/')).sort(), 'Screenshot links lead directly to all six supplied PNGs');
  for (const link of await links.all()) {
    assert.equal(await link.getAttribute('href'), await link.locator('img').getAttribute('src'), 'Thumbnail and enlarged source are the same original PNG');
  }
}

async function closeAndCheckFocus(page, opener, method) {
  if (method === 'Escape') await page.keyboard.press('Escape');
  else await page.locator('.dialog-close').click();
  await page.waitForFunction(() => !document.querySelector('.screenshot-dialog').open);
  assert(await opener.evaluate(element => element === document.activeElement), `${method} returns keyboard focus to the screenshot link`);
}

async function openScreenshot(page, opener) {
  await opener.focus();
  await page.keyboard.press('Enter');
  const dialog = page.locator('.screenshot-dialog');
  assert(await dialog.evaluate(element => element.open), 'Keyboard activation opens the screenshot dialog');
  assert(await dialog.evaluate(element => element.contains(document.activeElement)), 'Keyboard focus stays inside the open dialog');
  const image = dialog.locator('.dialog-media img');
  await page.waitForFunction(element => element.complete && element.naturalWidth > 0, await image.elementHandle());
  assert.equal(await image.getAttribute('src'), new URL(await opener.getAttribute('href'), baseURL).href, 'Dialog displays the original source PNG');
  assert.equal(await image.getAttribute('alt'), await opener.locator('img').getAttribute('alt'));
  return dialog;
}

(async () => {
  checkImageSources();
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  const errors = [];
  const requests = [];
  function observe(page) {
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    page.on('request', request => requests.push(request.url()));
  }
  try {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    context.setDefaultTimeout(15000);
    const page = await context.newPage();
    observe(page);
    for (const width of viewports) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(baseURL);
      await page.evaluate(() => document.fonts.ready);
      await loadLazyImages(page);
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('form, .calculator, #result').count(), 0, 'The website has no app simulator or calculation form');
      await assertNoOverflow(page, width, 'page');
      await assertContentVisible(page, `reduced motion at ${width}px`);
      assert(await page.evaluate(() => [...document.images].every(image => image.complete && image.naturalWidth > 0)), 'All image assets load');
      await checkScreenshotLinks(page);
      await audit(page, `${width}px`);
      await page.screenshot({ path: `/tmp/bada-${width}.png`, fullPage: true });
      console.log(`Verified viewport ${width}px`);
    }
    assert.equal(await page.locator('details').count(), 8, 'All eight FAQs are present');
    for (const details of await page.locator('details').all()) {
      await details.locator('summary').focus();
      await page.keyboard.press('Enter');
      assert(await details.evaluate(element => element.open));
      await page.keyboard.press('Enter');
      assert.equal(await details.evaluate(element => element.open), false);
    }
    const anchors = await page.locator('a').evaluateAll(elements => elements.map(element => element.getAttribute('href')));
    for (const href of anchors.filter(href => href && href.startsWith('#') && href.length > 1)) assert(await page.locator(href).count(), `Section target ${href} exists`);
    const navigation = page.locator('.site-header nav a[href^="#"]');
    assert.equal(await navigation.count(), 4);
    for (const link of await navigation.all()) {
      await link.focus();
      assert(await link.evaluate(element => element === document.activeElement));
      await page.keyboard.press('Enter');
      assert.equal(new URL(page.url()).hash, await link.getAttribute('href'));
    }
    assert(anchors.includes('https://play.google.com/store/apps/details?id=com.bada.aituoisoldi&hl=it'));
    assert(anchors.includes('https://badaaituoisoldi-app.github.io/bada-privacy/Privacy-it.html'));
    assert(anchors.includes('mailto:bada.aituoisoldi@gmail.com'));
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const hero = page.locator('.hero-screen .screenshot-link');
      await openScreenshot(page, hero);
      await audit(page, `screenshot dialog at ${width}px`);
      await closeAndCheckFocus(page, hero, 'Escape');
      const gallery = page.locator('.screenshots-grid .screenshot-link').nth(4);
      await openScreenshot(page, gallery);
      assert.equal(await page.locator('#screenshot-title').textContent(), 'Importazione CSV');
      await closeAndCheckFocus(page, gallery, 'button');
      await assertNoOverflow(page, width, 'after screenshot dialog');
    }
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');

    const motionContext = await browser.newContext({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 1000 } });
    motionContext.setDefaultTimeout(15000);
    const motionPage = await motionContext.newPage();
    observe(motionPage);
    await motionPage.goto(baseURL);
    console.log('Verifying normal-motion reveals and dialog');
    await motionPage.evaluate(() => document.fonts.ready);
    await motionPage.waitForFunction(() => document.querySelector('.hero-intro').classList.contains('is-visible'));
    assert(await motionPage.locator('.hero-intro').evaluate(element => getComputedStyle(element).transitionDuration.split(',').some(duration => parseFloat(duration) > 0)), 'Normal motion enables subtle reveal transitions');
    const figure = motionPage.locator('.screenshots-grid figure').first();
    assert.equal(await figure.evaluate(element => element.classList.contains('is-visible')), false, 'Below-fold screenshot waits for scrolling');
    await figure.scrollIntoViewIfNeeded();
    await motionPage.waitForFunction(element => element.classList.contains('is-visible') && getComputedStyle(element).opacity === '1', await figure.elementHandle());
    const motionOpener = figure.locator('.screenshot-link');
    const motionDialog = await openScreenshot(motionPage, motionOpener);
    assert(await motionDialog.evaluate(element => getComputedStyle(element).animationDuration.split(',').some(duration => parseFloat(duration) > 0)), 'Normal motion animates dialog entry');
    await closeAndCheckFocus(motionPage, motionOpener, 'Escape');
    await openScreenshot(motionPage, motionOpener);
    await closeAndCheckFocus(motionPage, motionOpener, 'button');
    assert(await motionPage.locator('.reveal:not(.is-visible)').count() > 0, 'There is pending content before reduced motion is enabled');
    await motionPage.emulateMedia({ reducedMotion: 'reduce' });
    await motionPage.waitForFunction(() => [...document.querySelectorAll('.reveal')].every(element => element.classList.contains('is-visible')));
    await assertContentVisible(motionPage, 'reduced-motion preference changed');
    assert(await motionPage.locator('.reveal, .screenshot-link, .dialog-close').evaluateAll(elements => elements.every(element => getComputedStyle(element).transitionDuration.split(',').every(duration => parseFloat(duration) === 0))), 'Reduced motion removes transition durations');

    const noJsContext = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'no-preference', viewport: { width: 390, height: 1000 } });
    noJsContext.setDefaultTimeout(15000);
    const staticPage = await noJsContext.newPage();
    observe(staticPage);
    await staticPage.goto(baseURL);
    console.log('Verifying content without JavaScript');
    // Browsers load images eagerly without JavaScript; no script callbacks are
    // needed to make the native content visible or to await page load.
    assert(await staticPage.evaluate(() => [...document.images].every(image => image.complete && image.naturalWidth > 0)), 'Original images load without JavaScript');
    await assertContentVisible(staticPage, 'JavaScript disabled');
    assert.equal(await staticPage.locator('.reveal').count(), 0, 'No content depends on a reveal script without JavaScript');
    await checkScreenshotLinks(staticPage);
    await staticPage.locator('details summary').first().click();
    assert(await staticPage.locator('details').first().evaluate(element => element.open), 'Native FAQs work without JavaScript');
    await assertNoOverflow(staticPage, 390, 'JavaScript disabled');
    assert.equal(errors.length, 0, JSON.stringify(errors));
    assert(requests.every(url => url.startsWith(new URL(baseURL).origin)), 'No external asset requests');
    console.log(`PASS: ${viewports.length} viewports, supplied PNG whitelist${process.env.ORIGINAL_ASSETS_DIR ? ' and unchanged source hashes' : ''}, assets, no overflow or simulator, 8 keyboard FAQs, section navigation, 7 original screenshot links, modal source/Escape/button/focus, normal and reduced-motion reveals, no-JS visible content, no external requests or browser errors, axe WCAG A/AA.`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
