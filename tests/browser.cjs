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
  'assets/feature-graphic.png',
  'assets/screenshots/store-1-mese.png', 'assets/screenshots/store-2-impostazioni.png',
  'assets/screenshots/store-3-uscite.png', 'assets/screenshots/store-4-obiettivi.png',
  'assets/screenshots/store-5-anno.png', 'assets/screenshots/store-6-import.png',
];
const auditTags = ['wcag2a', 'wcag2aa', 'wcag21aa'];

function checkImageSources() {
  const source = ['index.html', 'styles.css'].map(file => readFileSync(resolve(siteRoot, file), 'utf8')).join('\n');
  const paths = [...source.matchAll(/assets\/[^\s"'()<>]+\.(?:png|jpe?g|webp|gif|avif|svg)/gi)].map(match => match[0]);
  assert.deepEqual([...new Set(paths)].sort(), [...suppliedImages].sort(), 'HTML and CSS use exactly the supplied PNGs');
  assert(!source.includes('data:image'), 'No generated inline raster images');
  const images = [];
  function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (/\.(png|jpe?g|webp|gif|avif|svg)$/i.test(entry.name)) images.push(relative(siteRoot, path).replaceAll('\\', '/'));
    }
  }
  walk(resolve(siteRoot, 'assets'));
  assert.deepEqual(images.sort(), [...suppliedImages].sort(), 'No unapproved image files');
  if (process.env.ORIGINAL_ASSETS_DIR) {
    const digest = path => createHash('sha256').update(readFileSync(path)).digest('hex');
    for (const asset of suppliedImages) assert.equal(digest(resolve(siteRoot, asset)), digest(resolve(process.env.ORIGINAL_ASSETS_DIR, basename(asset))), `${asset} preserves the original PNG bytes`);
  }
}

async function settle(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
async function top(page) {
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForFunction(() => scrollY === 0);
  await settle(page);
}
async function noOverflow(page, width, state) {
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Page overflow at ${width}px (${state})`);
}
async function loaded(page, image) {
  await page.waitForFunction(element => element.complete && element.naturalWidth > 0, await image.elementHandle());
}
async function audit(page, state) {
  const result = await new AxeBuilder({ page }).withTags(auditTags).analyze();
  assert.deepEqual(result.violations, [], `Accessibility violations (${state})`);
}
async function visibleContent(page, state) {
  const hidden = await page.locator('[data-reveal], .hero-intro, .product-screens figure, .capability, .screenshots-grid figure, .privacy-content, .closing').evaluateAll(elements => elements.filter(element => {
    const style = getComputedStyle(element);
    return style.display === 'none' || style.visibility !== 'visible' || Number(style.opacity) !== 1 || element.getBoundingClientRect().height === 0;
  }).map(element => element.className));
  assert.deepEqual(hidden, [], `Content stays visible (${state})`);
}
async function screenshotLinks(page) {
  const links = page.locator('.screenshot-link');
  assert.equal(await links.count(), 6, 'Three hero and three gallery screenshots');
  const hrefs = await links.evaluateAll(elements => elements.map(element => element.getAttribute('href')));
  assert.deepEqual([...new Set(hrefs)].sort(), suppliedImages.filter(path => path.includes('/screenshots/')).sort(), 'All six original screenshot sources are linked');
  for (const link of await links.all()) {
    const href = await link.getAttribute('href');
    assert.equal(href, await link.locator('img').getAttribute('src'), 'Thumbnail and viewer use the same original');
    const crop = (await link.getAttribute('data-crop')).trim().split(/\s+/).map(Number);
    assert.deepEqual(crop, [144, href.includes('store-3-uscite') ? 315 : 401, 792, 1424], 'Each crop matches the supplied app screen bounds');
  }
}
async function assertTheme(page, theme, scripted = true) {
  if (scripted) {
    await page.waitForFunction(theme => document.documentElement.dataset.theme === theme, theme);
    const toggle = page.locator('#theme-toggle');
    assert(await toggle.isVisible(), 'Theme switch is available with JavaScript');
    assert.equal(await toggle.getAttribute('role'), 'switch');
    assert.equal(await toggle.getAttribute('aria-label'), 'Tema scuro');
    assert.equal(await toggle.getAttribute('aria-checked'), String(theme === 'dark'));
    assert.equal(await page.locator('#theme-label').textContent(), theme === 'dark' ? 'Scuro' : 'Chiaro');
  }
  const palette = await page.evaluate(() => ({
    scheme: getComputedStyle(document.documentElement).colorScheme,
    background: getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g).slice(0, 3).map(Number),
  }));
  assert.equal(palette.scheme, theme, 'Native controls use the selected color scheme');
  const brightness = palette.background.reduce((sum, value) => sum + value, 0) / 3;
  assert(theme === 'dark' ? brightness < 90 : brightness > 180, `The ${theme} theme changes the visible page background`);
}
async function chooseTheme(page, theme) {
  if (await page.locator('html').getAttribute('data-theme') !== theme) {
    await page.locator('#theme-toggle').focus();
    await page.keyboard.press('Space');
  }
  await assertTheme(page, theme);
}
async function cropGeometry(container, crop, state) {
  const geometry = await container.evaluate(element => {
    const box = element.getBoundingClientRect();
    const image = element.querySelector('img');
    const source = image.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      width: box.width, height: box.height,
      sourceWidth: source.width, sourceHeight: source.height,
      offsetX: source.left - box.left, offsetY: source.top - box.top,
      naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight,
      clipped: style.overflowX === 'hidden' && style.overflowY === 'hidden',
      radius: parseFloat(style.borderTopLeftRadius),
    };
  });
  const [x, y, width, height] = crop;
  const scale = geometry.width / width;
  const near = (actual, expected, label) => assert(Math.abs(actual - expected) < 1.5, `${state}: ${label} is ${actual}, expected ${expected}`);
  near(geometry.height, height * scale, 'crop height');
  near(geometry.sourceWidth, 1080 * scale, 'original image width');
  near(geometry.sourceHeight, 1920 * scale, 'original image height');
  near(geometry.offsetX, -x * scale, 'horizontal source offset');
  near(geometry.offsetY, -y * scale, 'vertical source offset');
  assert.equal(geometry.naturalWidth, 1080);
  assert.equal(geometry.naturalHeight, 1920);
  assert(geometry.clipped && geometry.radius > 0, `${state}: rounded crop hides poster areas`);
}
async function thumbnailCrops(page) {
  for (const link of await page.locator('.screenshot-link').all()) {
    const crop = (await link.getAttribute('data-crop')).trim().split(/\s+/).map(Number);
    await cropGeometry(link, crop, `Thumbnail ${await link.getAttribute('data-title')}`);
  }
}
async function loadVisibleImages(page) {
  for (const image of await page.locator('main img').all()) {
    if (!await image.isVisible()) continue;
    await image.scrollIntoViewIfNeeded();
    await loaded(page, image);
  }
  await page.locator('.product-screens, .screenshots-grid').evaluateAll(regions => regions.forEach(region => { region.scrollLeft = 0; }));
  await top(page);
}
async function openViewer(page, opener) {
  await opener.focus();
  const thumbWidth = await opener.evaluate(element => element.getBoundingClientRect().width);
  const crop = (await opener.getAttribute('data-crop')).trim().split(/\s+/).map(Number);
  const priorOverflow = await page.evaluate(() => document.body.style.overflow);
  await page.keyboard.press('Enter');
  const dialog = page.locator('.screenshot-dialog');
  assert(await dialog.evaluate(element => element.open), 'Keyboard opens the viewer');
  const entryDuration = await dialog.evaluate(element => Math.max(0, ...element.getAnimations().map(animation => Number(animation.effect.getTiming().duration))));
  assert(await dialog.evaluate(element => element.contains(document.activeElement)), 'Focus stays in the dialog');
  const image = dialog.locator('img.viewer-image');
  const frame = dialog.locator('.viewer-frame');
  await loaded(page, image);
  await page.waitForFunction(() => !document.querySelector('.viewer-stage').hasAttribute('aria-busy'));
  const source = new URL(await opener.getAttribute('href'), baseURL).href;
  assert.equal(await image.getAttribute('src'), source);
  assert.equal(await page.locator('#viewer-original').getAttribute('href'), source);
  assert.equal(await image.getAttribute('alt'), await opener.locator('img').getAttribute('alt'));
  assert(await frame.evaluate((element, width) => element.getBoundingClientRect().width > width * 1.5, thumbWidth), 'Visible app screen is substantially larger than the thumbnail');
  await cropGeometry(frame, crop, 'Initial viewer crop');
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
  return { dialog, image, frame, crop, priorOverflow, entryDuration };
}
async function closeViewer(page, opener, state, method) {
  if (method === 'Escape') await page.keyboard.press('Escape');
  else await page.locator('.dialog-close').click();
  await page.waitForFunction(priorOverflow => !document.querySelector('.screenshot-dialog').open && !document.querySelector('.viewer-canvas').children.length && document.body.style.overflow === priorOverflow, state.priorOverflow);
  assert(await opener.evaluate(element => element === document.activeElement), `${method} restores focus to the opener`);
  assert.equal(await page.locator('.screenshot-open').count(), 0, 'Closing restores document scrolling');
}
async function zoomAndPan(page, state) {
  const width = () => state.frame.evaluate(element => element.getBoundingClientRect().width);
  let previous = await width();
  await page.locator('#viewer-zoom-in').click();
  assert(await width() > previous, 'Zoom plus increases actual rendered width');
  previous = await width();
  await page.locator('#viewer-zoom-out').click();
  assert(await width() < previous, 'Zoom minus decreases actual rendered width');
  await page.locator('#viewer-fit').click();
  const available = await page.locator('.viewer-stage').evaluate(stage => {
    const style = getComputedStyle(stage.querySelector('.viewer-canvas'));
    return stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  });
  assert(await width() <= available + 1, `Fit image width ${await width()} fits available width ${available}`);
  await cropGeometry(state.frame, state.crop, 'Fit viewer crop');
  await page.locator('#viewer-actual').click();
  assert.equal(Math.round(await width()), 792, '1:1 uses the original 792px app screen width');
  assert.equal(Math.round(await state.image.evaluate(element => element.getBoundingClientRect().width)), 1080, '1:1 retains the full original source behind the crop');
  await cropGeometry(state.frame, state.crop, '1:1 viewer crop');
  assert.equal(await page.locator('#viewer-zoom').textContent(), '100%');
  await page.locator('#viewer-zoom-in').click();
  await page.locator('#viewer-zoom-in').click();
  await page.locator('#viewer-zoom-in').click();
  await page.locator('#viewer-zoom-in').click();
  const stage = page.locator('.viewer-stage');
  await stage.evaluate(element => { element.scrollLeft = 60; element.scrollTop = 60; });
  const before = await stage.evaluate(element => ({ x: element.scrollLeft, y: element.scrollTop }));
  const box = await stage.boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + Math.min(220, box.height / 2);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 40, y - 55, { steps: 4 });
  await page.mouse.up();
  const after = await stage.evaluate(element => ({ x: element.scrollLeft, y: element.scrollTop }));
  assert(after.x > before.x && after.y > before.y, 'Mouse dragging pans the enlarged source in both directions');
  await stage.evaluate(element => { element.scrollTop = 0; });
  await stage.focus();
  await page.keyboard.press('ArrowDown');
  await page.waitForFunction(element => element.scrollTop > 0, await stage.elementHandle());
  await page.keyboard.press('0');
  assert(await width() <= available + 1, 'Keyboard shortcut fits the screenshot');
  await page.keyboard.press('1');
  assert.equal(Math.round(await width()), 792, 'Keyboard shortcut restores crop at 1:1');
}

(async () => {
  checkImageSources();
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  const errors = [], requests = [];
  function observe(page) {
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    page.on('request', request => requests.push(request.url()));
  }
  try {
    const context = await browser.newContext({ reducedMotion: 'reduce', colorScheme: 'light' });
    context.setDefaultTimeout(15000);
    const page = await context.newPage();
    observe(page);
    for (const path of suppliedImages) {
      const response = await page.request.get(new URL(path, baseURL).href);
      assert.equal(response.status(), 200, `${path} loads under the deployment base path`);
      assert.equal(createHash('sha256').update(await response.body()).digest('hex'), createHash('sha256').update(readFileSync(resolve(siteRoot, path))).digest('hex'));
    }
    for (const width of viewports) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(baseURL);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('form, .calculator, #result, .story-layout, .story-stage, .story-controls, .reading-progress').count(), 0, 'The page has no simulator, story controls or reading progress');
      assert.equal(await page.locator('.site-header a[href*="play.google.com"]').count(), 0, 'Header has no store CTA');
      assert(await page.locator('.site-header').evaluate(element => !['fixed', 'sticky'].includes(getComputedStyle(element).position)), 'Header scrolls naturally with the page');
      assert.equal(await page.locator('.hero-screen').count(), 1);
      assert.equal(await page.locator('.product-screens > figure').count(), 3);
      assert.equal(await page.locator('.capability').count(), 3);
      assert.equal(await page.locator('.screenshots-grid figure').count(), 3);
      await screenshotLinks(page);
      await loadVisibleImages(page);
      for (const theme of ['light', 'dark']) {
        await chooseTheme(page, theme);
        await thumbnailCrops(page);
        assert(await page.locator('.screenshot-link img').evaluateAll(images => images.every(image => getComputedStyle(image).filter === 'none')), 'Themes preserve the original screenshot colors');
        await visibleContent(page, `${theme}, reduced motion at ${width}px`);
        await noOverflow(page, width, `${theme} page and internal screenshot rail`);
        await audit(page, `${width}px ${theme}`);
        await top(page);
        await page.screenshot({ path: theme === 'light' ? `/tmp/bada-${width}.png` : `/tmp/bada-${width}-dark.png`, fullPage: true });
      }
      console.log(`Verified viewport ${width}px in light and dark themes`);
    }
    assert.equal(await page.locator('details').count(), 8);
    for (const details of await page.locator('details').all()) {
      await details.locator('summary').focus();
      await page.keyboard.press('Enter');
      assert(await details.evaluate(element => element.open));
      await page.keyboard.press('Enter');
    }
    const anchors = await page.locator('a').evaluateAll(elements => elements.map(element => element.getAttribute('href')));
    for (const href of anchors.filter(href => href && href.startsWith('#') && href.length > 1)) assert(await page.locator(href).count());
    assert(anchors.includes('https://play.google.com/store/apps/details?id=com.bada.aituoisoldi&hl=it'));
    assert(anchors.includes('https://badaaituoisoldi-app.github.io/bada-privacy/Privacy-it.html'));
    const nav = page.locator('.site-header nav a');
    assert.equal(await nav.count(), 3);
    for (const link of await nav.all()) {
      await link.focus();
      await page.keyboard.press('Enter');
      assert.equal(new URL(page.url()).hash, await link.getAttribute('href'));
    }
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const theme of ['light', 'dark']) {
        await chooseTheme(page, theme);
        const opener = page.locator('.hero-screen .screenshot-link');
        const state = await openViewer(page, opener);
        await audit(page, `zoom viewer at ${width}px ${theme}`);
        await zoomAndPan(page, state);
        await closeViewer(page, opener, state, 'Escape');
        await noOverflow(page, width, `${theme} after zoom viewer`);
        for (const [selector, title] of [
          ['.screen-expenses .screenshot-link', 'Entrate e uscite'],
          ['.screenshots-grid .screenshot-link', 'Importazione CSV'],
        ]) {
          const link = title === 'Entrate e uscite' ? page.locator(selector).first() : page.locator(selector).nth(1);
          const nextState = await openViewer(page, link);
          assert.equal(await page.locator('#screenshot-title').textContent(), title);
          await closeViewer(page, link, nextState, 'button');
        }
      }
      console.log(`Verified real zoom, fit, 1:1, pan and close at ${width}px in both themes`);
    }

    const preferenceContext = await browser.newContext({ colorScheme: 'dark', reducedMotion: 'reduce', viewport: { width: 390, height: 1000 } });
    preferenceContext.setDefaultTimeout(15000);
    const preferencePage = await preferenceContext.newPage();
    observe(preferencePage);
    await preferencePage.goto(baseURL);
    await assertTheme(preferencePage, 'dark');
    assert.equal(await preferencePage.evaluate(() => localStorage.getItem('bada-site-theme')), null, 'System defaults do not create a manual preference');
    await preferencePage.emulateMedia({ colorScheme: 'light' });
    await assertTheme(preferencePage, 'light');
    await preferencePage.emulateMedia({ colorScheme: 'dark' });
    await assertTheme(preferencePage, 'dark');
    await preferencePage.locator('#theme-toggle').focus();
    await preferencePage.keyboard.press('Space');
    await assertTheme(preferencePage, 'light');
    assert.equal(await preferencePage.evaluate(() => localStorage.getItem('bada-site-theme')), 'light');
    await preferencePage.emulateMedia({ colorScheme: 'light' });
    await preferencePage.emulateMedia({ colorScheme: 'dark' });
    await assertTheme(preferencePage, 'light');
    await preferencePage.reload();
    await assertTheme(preferencePage, 'light');
    await preferencePage.locator('#theme-toggle').focus();
    await preferencePage.keyboard.press('Enter');
    await assertTheme(preferencePage, 'dark');
    assert.equal(await preferencePage.evaluate(() => localStorage.getItem('bada-site-theme')), 'dark');
    await preferencePage.reload();
    await preferencePage.emulateMedia({ colorScheme: 'light' });
    await assertTheme(preferencePage, 'dark');

    const blockedContext = await browser.newContext({ colorScheme: 'dark', reducedMotion: 'reduce' });
    blockedContext.setDefaultTimeout(15000);
    await blockedContext.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('Storage blocked for test', 'SecurityError'); } });
    });
    const blockedPage = await blockedContext.newPage();
    observe(blockedPage);
    await blockedPage.goto(baseURL);
    await assertTheme(blockedPage, 'dark');
    await chooseTheme(blockedPage, 'light');
    await blockedPage.emulateMedia({ colorScheme: 'light' });
    await blockedPage.emulateMedia({ colorScheme: 'dark' });
    await assertTheme(blockedPage, 'light');
    await blockedPage.reload();
    await assertTheme(blockedPage, 'dark');
    await chooseTheme(blockedPage, 'light');
    console.log('Verified keyboard theme switch, OS defaults/live updates, persisted choices and blocked storage');

    const motionContext = await browser.newContext({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 1000 } });
    motionContext.setDefaultTimeout(15000);
    const motionPage = await motionContext.newPage();
    observe(motionPage);
    await motionPage.goto(baseURL);
    await motionPage.evaluate(() => document.fonts.ready);
    await motionPage.waitForFunction(() => document.querySelector('.hero-intro').classList.contains('is-visible') && getComputedStyle(document.querySelector('.hero-intro')).opacity === '1');
    assert(await motionPage.locator('.hero-intro').evaluate(element => getComputedStyle(element).transitionDuration.split(',').some(duration => parseFloat(duration) >= 0.6)), 'Reveal movement has perceptible duration');
    const feature = motionPage.locator('.capability').last();
    assert.equal(await feature.evaluate(element => element.classList.contains('is-visible')), false, 'A below-fold feature waits to enter view');
    await feature.scrollIntoViewIfNeeded();
    await motionPage.waitForFunction(element => element.classList.contains('is-visible') && getComputedStyle(element).opacity === '1', await feature.elementHandle());
    await top(motionPage);
    assert(await feature.evaluate(element => element.classList.contains('is-visible') && getComputedStyle(element).opacity === '1'), 'A revealed feature stays visible after leaving the viewport');
    const motionOpener = motionPage.locator('.hero-screen .screenshot-link');
    const motionState = await openViewer(motionPage, motionOpener);
    assert(motionState.entryDuration >= 200, 'Viewer entry animates with normal motion');
    await closeViewer(motionPage, motionOpener, motionState, 'Escape');
    await motionPage.emulateMedia({ reducedMotion: 'reduce' });
    await motionPage.waitForFunction(() => [...document.querySelectorAll('[data-reveal]')].every(element => getComputedStyle(element).opacity === '1'));
    await visibleContent(motionPage, 'reduced-motion preference changed');
    assert(await motionPage.locator('[data-reveal]').evaluateAll(elements => elements.every(element => getComputedStyle(element).transitionDuration.split(',').every(duration => parseFloat(duration) === 0))));
    console.log('Verified one-time feature reveals and reduced motion');

    for (const theme of ['light', 'dark']) {
      const noJsContext = await browser.newContext({ javaScriptEnabled: false, colorScheme: theme, reducedMotion: 'no-preference', viewport: { width: 390, height: 1000 } });
      noJsContext.setDefaultTimeout(15000);
      const staticPage = await noJsContext.newPage();
      observe(staticPage);
      await staticPage.goto(baseURL);
      await assertTheme(staticPage, theme, false);
      assert.equal(await staticPage.locator('#theme-toggle').isVisible(), false, 'Nonfunctional theme switch is hidden without JavaScript');
      assert.equal(await staticPage.locator('.reveal').count(), 0);
      assert.equal(await staticPage.locator('main img').count(), 6);
      await visibleContent(staticPage, `JavaScript disabled, ${theme}`);
      assert(await staticPage.evaluate(() => [...document.images].every(image => image.complete && image.naturalWidth > 0)), 'All original images load without JavaScript');
      await screenshotLinks(staticPage);
      await thumbnailCrops(staticPage);
      await staticPage.locator('details summary').first().click();
      assert(await staticPage.locator('details').first().evaluate(element => element.open));
      await noOverflow(staticPage, 390, `JavaScript disabled, ${theme}`);
    }
    assert.equal(errors.length, 0, JSON.stringify(errors));
    assert(requests.every(url => url.startsWith(new URL(baseURL).origin)), 'No external asset requests');
    console.log(`PASS: ${viewports.length} widths in light/dark, theme switch/OS/persistence/blocked storage/no-JS fallback, original PNG paths${process.env.ORIGINAL_ASSETS_DIR ? '/hashes' : ''} and crop geometry, real zoom/fit/1:1/pan/keyboard scrolling in both themes, viewer cleanup/focus, one-time reveals, reduced motion, native FAQs/navigation and axe WCAG A/AA.`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
