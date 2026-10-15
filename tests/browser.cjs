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
  'assets/copertina-onde.png', 'assets/feature-graphic.png',
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
  const hidden = await page.locator('[data-reveal], .chapter-image:not([aria-hidden="true"])').evaluateAll(elements => elements.filter(element => {
    const style = getComputedStyle(element);
    return style.display === 'none' || style.visibility !== 'visible' || Number(style.opacity) !== 1 || element.getBoundingClientRect().height === 0;
  }).map(element => element.className));
  assert.deepEqual(hidden, [], `Content stays visible (${state})`);
}
async function screenshotLinks(page) {
  const links = page.locator('.screenshot-link');
  assert.equal(await links.count(), 8, 'Two hero, three story and three tools screenshot links');
  const hrefs = await links.evaluateAll(elements => elements.map(element => element.getAttribute('href')));
  assert.deepEqual([...new Set(hrefs)].sort(), suppliedImages.filter(path => path.includes('/screenshots/')).sort(), 'All six original screenshot sources are linked');
  for (const link of await links.all()) assert.equal(await link.getAttribute('href'), await link.locator('img').getAttribute('src'), 'Thumbnail and viewer use the same original');
}
async function scrollChapter(page, index) {
  await page.locator('.story-chapter').nth(index).evaluate(element => {
    const box = element.getBoundingClientRect();
    scrollTo({ top: scrollY + box.top + box.height / 2 - innerHeight * 0.46, behavior: 'instant' });
  });
  await settle(page);
}
async function exerciseStory(page, width) {
  assert.equal(await page.locator('.story-chapter').count(), 3);
  if (width > 900) {
    assert(await page.locator('.story-layout').evaluate(element => element.classList.contains('is-enhanced')));
    assert.equal(await page.locator('.story-stage').evaluate(element => getComputedStyle(element).position), 'sticky');
    for (let index = 0; index < 3; index++) {
      await scrollChapter(page, index);
      await page.waitForFunction(index => document.querySelectorAll('.story-chapter')[index].classList.contains('is-current'), index);
      const current = page.locator('.story-stage .chapter-image.is-current');
      assert.equal(await current.count(), 1);
      assert.equal(await current.locator('a').getAttribute('data-title'), await page.locator('.story-chapter').nth(index).getAttribute('data-title'));
      await loaded(page, current.locator('img'));
      assert.equal(await current.getAttribute('aria-hidden'), 'false');
      for (const inactive of await page.locator('.story-stage .chapter-image:not(.is-current)').all()) {
        assert.equal(await inactive.getAttribute('aria-hidden'), 'true');
        assert.equal(await inactive.locator('a').getAttribute('tabindex'), '-1');
      }
    }
    assert.equal(await page.locator('.story-controls [data-story-step]').count(), 3);
    for (const index of [1, 2, 0]) {
      const button = page.locator(`[data-story-step="${index}"]`);
      await button.focus();
      await page.keyboard.press('Enter');
      await page.waitForFunction(index => document.querySelectorAll('.story-chapter')[index].classList.contains('is-current') && document.querySelector(`[data-story-step="${index}"]`).getAttribute('aria-pressed') === 'true', index);
      assert.equal(await page.locator('.story-controls [aria-pressed="true"]').count(), 1, 'One story choice is pressed');
      assert(await button.evaluate(element => element === document.activeElement), 'Choosing a story keeps keyboard focus on its button');
      const chapter = page.locator('.story-chapter').nth(index);
      assert(await chapter.evaluate(element => {
        const box = element.getBoundingClientRect();
        return Math.abs(box.top + box.height / 2 - innerHeight / 2) < innerHeight * 0.15;
      }), 'Keyboard choice brings its chapter near the viewport centre');
      const current = page.locator('.story-stage .chapter-image.is-current');
      assert.equal(await current.locator('a').getAttribute('data-title'), await chapter.getAttribute('data-title'), 'Keyboard choice displays the matching original screenshot');
      await loaded(page, current.locator('img'));
    }
  } else {
    assert.equal(await page.locator('.story-layout.is-enhanced').count(), 0);
    assert(await page.locator('.story-stage').evaluate(element => element.hidden));
    assert.equal(await page.locator('.story-controls').isVisible(), false, 'Story choice controls are hidden on mobile');
    assert.equal(await page.locator('.story-chapter > .chapter-image').count(), 3, 'Mobile story images remain beside their own text');
  }
}
async function loadVisibleImages(page) {
  for (const image of await page.locator('main img').all()) {
    if (await image.evaluate(element => Boolean(element.closest('.story-stage')))) continue;
    if (!await image.isVisible()) continue;
    await image.scrollIntoViewIfNeeded();
    await loaded(page, image);
  }
  await top(page);
}
async function openViewer(page, opener) {
  await opener.focus();
  const thumbWidth = await opener.locator('img').evaluate(element => element.getBoundingClientRect().width);
  const priorOverflow = await page.evaluate(() => document.body.style.overflow);
  await page.keyboard.press('Enter');
  const dialog = page.locator('.screenshot-dialog');
  assert(await dialog.evaluate(element => element.open), 'Keyboard opens the viewer');
  const entryDuration = await dialog.evaluate(element => Math.max(0, ...element.getAnimations().map(animation => Number(animation.effect.getTiming().duration))));
  assert(await dialog.evaluate(element => element.contains(document.activeElement)), 'Focus stays in the dialog');
  const image = dialog.locator('img.viewer-image');
  await loaded(page, image);
  await page.waitForFunction(() => !document.querySelector('.viewer-stage').hasAttribute('aria-busy'));
  const source = new URL(await opener.getAttribute('href'), baseURL).href;
  assert.equal(await image.getAttribute('src'), source);
  assert.equal(await page.locator('#viewer-original').getAttribute('href'), source);
  assert.equal(await image.getAttribute('alt'), await opener.locator('img').getAttribute('alt'));
  assert(await image.evaluate((element, width) => element.getBoundingClientRect().width > width * 1.5, thumbWidth), 'Viewer image is substantially larger than the thumbnail');
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
  return { dialog, image, priorOverflow, entryDuration };
}
async function closeViewer(page, opener, state, method) {
  if (method === 'Escape') await page.keyboard.press('Escape');
  else await page.locator('.dialog-close').click();
  await page.waitForFunction(priorOverflow => !document.querySelector('.screenshot-dialog').open && !document.querySelector('.viewer-canvas').children.length && document.body.style.overflow === priorOverflow, state.priorOverflow);
  assert(await opener.evaluate(element => element === document.activeElement), `${method} restores focus to the opener`);
  assert.equal(await page.locator('.screenshot-open').count(), 0, 'Closing restores document scrolling');
}
async function zoomAndPan(page, state) {
  const width = () => state.image.evaluate(element => element.getBoundingClientRect().width);
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
  await page.locator('#viewer-actual').click();
  assert.equal(Math.round(await width()), 1080, '1:1 uses the original 1080px image width');
  assert.equal(await page.locator('#viewer-zoom').textContent(), '100%');
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
  assert.equal(Math.round(await width()), 1080, 'Keyboard shortcut restores 1:1');
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
    const context = await browser.newContext({ reducedMotion: 'reduce' });
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
      assert.equal(await page.locator('form, .calculator, #result').count(), 0);
      assert.equal(await page.locator('.site-header a[href*="play.google.com"]').count(), 0, 'Header has no store CTA');
      await screenshotLinks(page);
      await exerciseStory(page, width);
      await loadVisibleImages(page);
      await visibleContent(page, `reduced motion at ${width}px`);
      await noOverflow(page, width, 'page and internal screenshot rail');
      await audit(page, `${width}px`);
      await page.screenshot({ path: `/tmp/bada-${width}.png`, fullPage: true });
      console.log(`Verified viewport ${width}px and responsive story`);
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
    assert.equal(await nav.count(), 4);
    for (const link of await nav.all()) {
      await link.focus();
      await page.keyboard.press('Enter');
      assert.equal(new URL(page.url()).hash, await link.getAttribute('href'));
    }
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const opener = page.locator('.hero-screen-main .screenshot-link');
      const state = await openViewer(page, opener);
      await audit(page, `zoom viewer at ${width}px`);
      await zoomAndPan(page, state);
      await closeViewer(page, opener, state, 'Escape');
      await noOverflow(page, width, 'after zoom viewer');
      const tool = page.locator('.tool-card .screenshot-link').nth(1);
      const toolState = await openViewer(page, tool);
      assert.equal(await page.locator('#screenshot-title').textContent(), 'Importazione CSV');
      await closeViewer(page, tool, toolState, 'button');
      console.log(`Verified real zoom, fit, 1:1, pan and close at ${width}px`);
    }

    const motionContext = await browser.newContext({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 1000 } });
    motionContext.setDefaultTimeout(15000);
    const motionPage = await motionContext.newPage();
    observe(motionPage);
    await motionPage.goto(baseURL);
    await motionPage.evaluate(() => document.fonts.ready);
    await motionPage.waitForFunction(() => document.querySelector('.hero-intro').classList.contains('in-view') && getComputedStyle(document.querySelector('.hero-intro')).opacity === '1');
    assert(await motionPage.locator('.hero-intro').evaluate(element => getComputedStyle(element).transitionDuration.split(',').some(duration => parseFloat(duration) >= 0.6)), 'Reveal movement has perceptible duration');
    const lastCopy = motionPage.locator('.story-chapter').nth(2).locator('.chapter-copy');
    assert.equal(await lastCopy.evaluate(element => element.classList.contains('in-view')), false);
    await scrollChapter(motionPage, 2);
    await motionPage.waitForFunction(() => document.querySelectorAll('.story-chapter')[2].classList.contains('is-current') && document.querySelectorAll('.chapter-copy')[2].classList.contains('in-view'));
    assert(await motionPage.locator('.reading-progress').evaluate(element => new DOMMatrix(getComputedStyle(element).transform).a > 0.05), 'Rapid scrolling updates reading progress');
    assert(await motionPage.locator('.hero-visual').evaluate(element => parseFloat(element.style.getPropertyValue('--hero-pan')) < 0), 'Hero responds to scrolling');
    assert(await motionPage.locator('.story-stage .chapter-image.is-current').evaluate(element => getComputedStyle(element).transitionDuration.split(',').some(duration => parseFloat(duration) >= 0.65)), 'Story screenshot changes use a visible crossfade');
    await top(motionPage);
    await motionPage.waitForFunction(() => !document.querySelectorAll('.chapter-copy')[2].classList.contains('in-view'));
    await scrollChapter(motionPage, 2);
    await motionPage.waitForFunction(() => document.querySelectorAll('.chapter-copy')[2].classList.contains('in-view') && getComputedStyle(document.querySelectorAll('.chapter-copy')[2]).opacity === '1');
    const motionOpener = motionPage.locator('.story-stage .chapter-image.is-current .screenshot-link');
    const motionState = await openViewer(motionPage, motionOpener);
    assert(motionState.entryDuration >= 200, 'Viewer entry animates with normal motion');
    await closeViewer(motionPage, motionOpener, motionState, 'Escape');
    await motionPage.emulateMedia({ reducedMotion: 'reduce' });
    await motionPage.waitForFunction(() => !document.querySelector('.reveal') && document.querySelector('.hero-visual').style.getPropertyValue('--hero-pan') === '0px');
    await visibleContent(motionPage, 'reduced-motion preference changed');
    assert(await motionPage.locator('[data-reveal], .chapter-image').evaluateAll(elements => elements.every(element => getComputedStyle(element).transitionDuration.split(',').every(duration => parseFloat(duration) === 0))));
    console.log('Verified rapid scrolling, repeated reveals, story crossfade, progress and reduced motion');

    const noJsContext = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'no-preference', viewport: { width: 390, height: 1000 } });
    noJsContext.setDefaultTimeout(15000);
    const staticPage = await noJsContext.newPage();
    observe(staticPage);
    await staticPage.goto(baseURL);
    assert.equal(await staticPage.locator('.reveal, .story-layout.is-enhanced').count(), 0);
    assert.equal(await staticPage.locator('.story-chapter > .chapter-image').count(), 3);
    await visibleContent(staticPage, 'JavaScript disabled');
    assert(await staticPage.evaluate(() => [...document.images].every(image => image.complete && image.naturalWidth > 0)), 'All original images load without JavaScript');
    await screenshotLinks(staticPage);
    await staticPage.locator('details summary').first().click();
    assert(await staticPage.locator('details').first().evaluate(element => element.open));
    await noOverflow(staticPage, 390, 'JavaScript disabled');
    assert.equal(errors.length, 0, JSON.stringify(errors));
    assert(requests.every(url => url.startsWith(new URL(baseURL).origin)), 'No external asset requests');
    console.log(`PASS: ${viewports.length} widths, original PNG paths${process.env.ORIGINAL_ASSETS_DIR ? '/hashes' : ''}, responsive story and screenshot rail, real zoom/fit/1:1/pan/keyboard scrolling, viewer cleanup/focus, repeated scroll effects, reduced motion, native no-JS content/FAQ, keyboard navigation and axe WCAG A/AA.`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
