const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const { readFileSync, mkdtempSync, rmSync } = require('node:fs');
const { createServer } = require('node:http');
const { resolve, join } = require('node:path');

const archive = process.env.PREVIEW_ZIP || resolve(__dirname, '../downloads/bada-anteprima.zip');
const temporary = mkdtempSync('/tmp/bada-preview-');
const digest = buffer => createHash('sha256').update(buffer).digest('hex');

async function styled(page, theme) {
  await page.evaluate(() => document.fonts.ready);
  const result = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    const hero = getComputedStyle(document.querySelector('.hero-section'));
    return {
      margin: body.margin,
      family: body.fontFamily,
      fontLoaded: [...document.fonts].some(font => font.family.includes('DM Sans') && font.status === 'loaded'),
      headingSize: parseFloat(getComputedStyle(document.querySelector('h1')).fontSize),
      layout: getComputedStyle(document.querySelector('.product-screens')).display,
      heroBackground: hero.backgroundColor,
      scheme: getComputedStyle(document.documentElement).colorScheme,
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
  assert.equal(result.margin, '0px', 'Bundled CSS overrides browser defaults');
  assert(result.family.includes('DM Sans') && result.fontLoaded, 'The bundled DM Sans font loads');
  assert(result.headingSize >= 32 && ['grid', 'flex'].includes(result.layout), 'Hero typography and screenshot layout are styled');
  assert(!['transparent', 'rgba(0, 0, 0, 0)'].includes(result.heroBackground));
  assert.equal(result.scheme, theme);
  assert.equal(result.overflow, false, `No horizontal page overflow in ${theme}`);
}

async function images(page, scriptsEnabled) {
  assert.equal(await page.locator('main img').count(), 6);
  if (scriptsEnabled) {
    for (const image of await page.locator('main img').all()) {
      await image.scrollIntoViewIfNeeded();
      await page.waitForFunction(element => element.complete && element.naturalWidth > 0, await image.elementHandle());
    }
    await page.locator('.product-screens, .screenshots-grid').evaluateAll(regions => regions.forEach(region => { region.scrollLeft = 0; }));
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  }
  assert(await page.locator('main img').evaluateAll(elements => elements.every(image => image.complete && image.naturalWidth === 1080 && image.naturalHeight === 1920 && image.getAttribute('src').startsWith('data:image/png;base64,'))), 'Six original PNGs load from the standalone HTML');
}

async function theme(page, selected) {
  const toggle = page.locator('#theme-toggle');
  assert(await toggle.isVisible(), 'Bundled theme script reveals the switch');
  if (await page.locator('html').getAttribute('data-theme') !== selected) {
    await toggle.focus();
    await page.keyboard.press('Space');
  }
  assert.equal(await page.locator('html').getAttribute('data-theme'), selected);
  assert.equal(await toggle.getAttribute('aria-checked'), String(selected === 'dark'));
  assert.equal(await page.locator('#theme-label').textContent(), selected === 'dark' ? 'Scuro' : 'Chiaro');
}

async function viewer(page, checkDownload) {
  const opener = page.locator('.hero-screen .screenshot-link');
  await opener.focus();
  await page.keyboard.press('Enter');
  const dialog = page.locator('.screenshot-dialog');
  assert(await dialog.evaluate(element => element.open), 'Bundled viewer opens');
  const image = dialog.locator('.viewer-image');
  await page.waitForFunction(element => element.complete && element.naturalWidth === 1080, await image.elementHandle());
  await page.waitForFunction(() => !document.querySelector('.viewer-stage').hasAttribute('aria-busy'));
  const frame = dialog.locator('.viewer-frame');
  const frameWidth = () => frame.evaluate(element => element.getBoundingClientRect().width);
  const available = await page.locator('.viewer-stage').evaluate(stage => {
    const padding = getComputedStyle(stage.querySelector('.viewer-canvas'));
    return stage.clientWidth - parseFloat(padding.paddingLeft) - parseFloat(padding.paddingRight);
  });
  assert(Math.abs(await frameWidth() - Math.min(792, available)) < 1, 'Standalone screenshot opens at full visible width without upscaling');
  assert(await page.locator('.viewer-stage').evaluate(stage => stage.scrollWidth <= stage.clientWidth), 'Initial standalone view has no horizontal clipping');
  const initialWidth = await frameWidth();
  await page.locator('#viewer-zoom-in').click();
  assert(await frameWidth() > initialWidth, 'Bundled zoom still enlarges the fitted screenshot');
  await page.locator('#viewer-fit').click();
  assert(await frameWidth() <= available + 1, 'Fit keeps the screen within the viewer');
  await page.locator('#viewer-actual').click();
  assert.equal(Math.round(await frameWidth()), 792, '1:1 preserves the original app screen width');
  assert.equal(await page.locator('#viewer-zoom').textContent(), '100%');
  if (checkDownload) {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#viewer-original').click(),
    ]);
    assert.equal(await download.failure(), null);
    const expected = readFileSync(resolve(__dirname, '../site/assets/screenshots/store-1-mese.png'));
    assert.equal(digest(readFileSync(await download.path())), digest(expected), 'Original-file download preserves the supplied monthly PNG');
    await download.delete();
  }
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('.screenshot-dialog').open && !document.querySelector('.viewer-canvas').children.length);
  assert(await opener.evaluate(element => element === document.activeElement));
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');
}

(async () => {
  let server;
  let browser;
  const httpRequests = [];
  const browserRequests = [];
  const errors = [];
  try {
    execFileSync('python3', ['-c', 'import sys,zipfile\nwith zipfile.ZipFile(sys.argv[1]) as z:\n assert z.namelist() == ["Bada.html"], "Preview ZIP must contain only Bada.html"\n z.extract("Bada.html", sys.argv[2])', archive, temporary]);
    const html = readFileSync(join(temporary, 'Bada.html'));
    server = createServer((request, response) => {
      httpRequests.push(request.url);
      if (request.url !== '/') { response.writeHead(404); response.end(); return; }
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      response.end(html);
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const url = `http://127.0.0.1:${server.address().port}/`;
    browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
    function observe(page) {
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', request => {
        if (/^https?:/.test(request.url())) browserRequests.push({ url: request.url(), type: request.resourceType() });
      });
    }
    const context = await browser.newContext({ reducedMotion: 'reduce', colorScheme: 'light', acceptDownloads: true });
    context.setDefaultTimeout(15000);
    const page = await context.newPage();
    observe(page);
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(url);
      await images(page, true);
      for (const id of ['schermate-principali', 'altre-schermate']) {
        const controls = page.locator(`[data-gallery-controls="${id}"]`);
        assert.equal(await controls.isVisible(), width === 320);
        if (width === 320) {
          await page.locator(`#${id}`).focus();
          await page.keyboard.press('Home');
          await controls.locator('[data-gallery-next]').click();
          await page.waitForFunction(id => document.querySelector(`[data-gallery-controls="${id}"] [data-gallery-position]`).textContent === '2 di 3', id);
          await controls.locator('[data-gallery-prev]').click();
          await page.waitForFunction(id => document.querySelector(`[data-gallery-controls="${id}"] [data-gallery-position]`).textContent === '1 di 3', id);
        }
      }
      for (const selected of ['light', 'dark']) {
        await theme(page, selected);
        await styled(page, selected);
        if (width === 1440 && selected === 'light') await page.screenshot({ path: '/tmp/bada-single-file-1440.png' });
        await viewer(page, width === 320 && selected === 'light');
      }
      assert.equal(await page.locator('details').count(), 8);
      for (const details of await page.locator('details').all()) {
        await details.locator('summary').focus();
        await page.keyboard.press('Enter');
        assert(await details.evaluate(element => element.open));
        await page.keyboard.press('Enter');
      }
    }
    const noJs = await browser.newContext({ javaScriptEnabled: false, colorScheme: 'dark', viewport: { width: 390, height: 1000 } });
    const staticPage = await noJs.newPage();
    observe(staticPage);
    await staticPage.goto(url);
    await styled(staticPage, 'dark');
    await images(staticPage, false);
    assert.equal(await staticPage.locator('#theme-toggle').isVisible(), false);
    assert(await staticPage.locator('.gallery-controls').evaluateAll(elements => elements.every(element => element.hidden)));
    await staticPage.locator('details summary').first().click();
    assert(await staticPage.locator('details').first().evaluate(element => element.open));
    assert.equal(errors.length, 0, JSON.stringify(errors));
    assert(browserRequests.length > 0 && browserRequests.every(request => request.url === url && request.type === 'document'), 'Only the HTML document needs an HTTP request');
    assert(httpRequests.length > 0 && httpRequests.every(path => path === '/'), `The extracted preview requests no asset files: ${JSON.stringify(httpRequests)}`);
    console.log('PASS: standalone ZIP/HTML, 320/1440 light and dark, embedded CSS/DM Sans/6 original PNGs, no asset requests, theme switch, cropped viewer fit/1:1/close/focus, original PNG download hash, 8 keyboard FAQs, styled no-JS dark fallback.');
  } finally {
    if (browser) await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
    rmSync(temporary, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exit(1); });
