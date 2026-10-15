const { chromium } = require('playwright');
const { default: AxeBuilder } = require('@axe-core/playwright');
const baseURL = process.env.SITE_URL || 'http://127.0.0.1:8000/Bada-ai-tuoi-soldi/';
const assert = require('node:assert/strict');
const viewports = [320,360,390,430,768,1024,1440];
const initialAmounts = {income:'1800',expenses:'1100',margin:'100',goals:'150'};
async function setAmounts(page, amounts){
 for(const [id,value] of Object.entries(amounts))await page.locator(`#${id}`).fill(String(value));
}
async function resultAmount(page){
 const text = await page.locator('#result').textContent();
 return Number(text.replace(/\u2212/g,'-').replace(/[^0-9,.-]/g,'').replace(/\./g,'').replace(',','.'));
}
async function assertNoOverflow(page,width,state){
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow at ${width}px (${state})`);
}
async function loadLazyImages(page){
 for(const image of await page.locator('img[loading="lazy"]').all()){
  await image.scrollIntoViewIfNeeded();
  await page.waitForFunction(element=>element.complete&&element.naturalWidth>0,await image.elementHandle());
 }
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
 await page.waitForFunction(()=>window.scrollY===0);
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}
async function resetCalculator(page){
 const reset = page.locator('form.calculator [type="reset"]');
 assert.equal(await reset.count(),1,'Calculator has one accessible reset control');
 await reset.click();
 await page.waitForFunction(()=>document.querySelector('#result').value.replace(/\s/g,'')==='450,00€');
 for(const [id,value] of Object.entries(initialAmounts))assert.equal(await page.locator(`#${id}`).inputValue(),value,`Reset restores ${id}`);
 assert.equal(await resultAmount(page),450,'Reset restores the initial available amount');
}
(async()=>{
 const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const context = await browser.newContext(); const page = await context.newPage(); const errors=[]; const requests=[];
 page.on('pageerror', e=>errors.push(e.message));
 page.on('response', r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 page.on('request', r=>requests.push(r.url()));
 for(const width of viewports){
  await page.setViewportSize({width,height:1000});
  await page.goto(baseURL);
  await page.evaluate(()=>document.fonts.ready);
  await loadLazyImages(page);
  assert.equal(await page.locator('h1').count(),1);
  await assertNoOverflow(page,width,'initial');
  assert(await page.evaluate(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0)));
  const audit = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  assert.deepEqual(audit.violations, [], `Accessibility violations at ${width}`);
  await page.screenshot({path:`/tmp/bada-${width}.png`,fullPage:true});
  await page.locator('#expenses').fill('2000');
  assert.equal(await resultAmount(page),-450);
  assert.match(await page.locator('#result-label').textContent(),/negativo/i);
  await assertNoOverflow(page,width,'negative available amount');
  await setAmounts(page,{income:0,expenses:0,margin:0,goals:0});
  assert.equal(await resultAmount(page),0,'All-zero inputs give zero');
  await assertNoOverflow(page,width,'all-zero inputs');
  await page.locator('#income').fill('100000000');
  assert.equal(await resultAmount(page),100000000,'Maximum income is accepted');
  await assertNoOverflow(page,width,'maximum positive available amount');
  await setAmounts(page,{income:100000000,expenses:100000000,margin:100000000,goals:100000000});
  assert.equal(await resultAmount(page),-200000000,'All maximum inputs calculate correctly');
  await assertNoOverflow(page,width,'all maximum inputs');
  await resetCalculator(page);
 }
 assert.match(await page.locator('#result').textContent(),/450,00/);
 await page.locator('#expenses').fill('2000');
 assert.match(await page.locator('#result').textContent(),/-450,00/);
 assert.equal(await page.locator('#result-label').textContent(),'Disponibile negativo');
 await page.locator('#expenses').fill('1550');
 assert.match(await page.locator('#result').textContent(),/0,00/);
 await page.locator('#expenses').fill('1100.01');
 assert.match(await page.locator('#result').textContent(),/449,99/);
 await page.locator('#income').fill('');
 assert.equal(await page.locator('#result-label').textContent(),'Controlla gli importi');
 await page.locator('#income').fill('-1');
 assert.equal(await page.locator('#result-label').textContent(),'Controlla gli importi');
 await page.locator('#income').fill('100000001');
 assert.equal(await page.locator('#result-label').textContent(),'Controlla gli importi','Amounts above the supported maximum are rejected');
 await resetCalculator(page);
 assert.equal(await page.locator('details').count(),8,'All eight FAQs are present');
 for(const d of await page.locator('details').all()){
  const s=d.locator('summary');await s.focus();await page.keyboard.press('Enter');assert(await d.evaluate(e=>e.open));await page.keyboard.press('Enter');
 }
 const anchors=await page.locator('a').evaluateAll(as=>as.map(a=>a.getAttribute('href')));
 for(const a of anchors.filter(a=>a&&a.startsWith('#')&&a.length>1))assert(await page.locator(a).count());
 const navigation=page.locator('.site-header nav a[href^="#"]');
 assert(await navigation.count()>0,'Header section navigation is present');
 for(const link of await navigation.all()){
  const href=await link.getAttribute('href');
  await link.focus();
  assert(await link.evaluate(element=>element===document.activeElement),'Navigation link accepts keyboard focus');
  await page.keyboard.press('Enter');
  assert.equal(new URL(page.url()).hash,href,'Keyboard activation navigates to the section');
 }
 assert(anchors.includes('https://play.google.com/store/apps/details?id=com.bada.aituoisoldi&hl=it'));
 assert(anchors.includes('https://badaaituoisoldi-app.github.io/bada-privacy/Privacy-it.html'));
 assert.equal(await page.locator('.screenshot-link').count(),7,'Hero and six gallery images are present');
 for (const width of [320,1440]) {
  await page.setViewportSize({width,height:1000});
  const opener = page.locator('.hero-screen .screenshot-link');
  await opener.focus();
  await page.keyboard.press('Enter');
  const dialog = page.locator('.screenshot-dialog');
  assert(await dialog.evaluate(e=>e.open),'Keyboard activation opens screenshot dialog');
  const enlarged = dialog.locator('.dialog-media img');
  await page.waitForFunction(img=>img.complete&&img.naturalWidth>0,await enlarged.elementHandle());
  assert.equal(await enlarged.getAttribute('src'),await opener.getAttribute('href').then(href=>new URL(href,baseURL).href));
  assert.equal(await enlarged.getAttribute('alt'),await opener.locator('img').getAttribute('alt'));
  const modalAudit = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  assert.deepEqual(modalAudit.violations,[],`Screenshot dialog accessibility at ${width}`);
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!document.querySelector('.screenshot-dialog').open);
  assert(await opener.evaluate(e=>e===document.activeElement),'Closing the dialog returns keyboard focus');
  const galleryOpener = page.locator('.screenshots-grid .screenshot-link').nth(4);
  await galleryOpener.click();
  assert(await dialog.evaluate(e=>e.open));
  assert.equal(await dialog.locator('#screenshot-title').textContent(),'Importazione CSV');
  await dialog.locator('.dialog-close').click();
  assert.equal(await dialog.evaluate(e=>e.open),false,'Close button dismisses screenshot');
  await assertNoOverflow(page,width,'after screenshot dialog');
 }
 assert.equal(errors.length,0,JSON.stringify(errors));
 assert(requests.every(u=>u.startsWith(new URL(baseURL).origin)),'External requests');
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
 const noJs = await browser.newContext({javaScriptEnabled:false});
 const staticPage = await noJs.newPage(); await staticPage.goto(baseURL);
 assert(await staticPage.locator('noscript').isVisible());
 await staticPage.locator('details summary').first().click();
 assert(await staticPage.locator('details').first().evaluate(e=>e.open));
 console.log(`PASS: ${viewports.length} viewports, no overflow including negative/zero/maximum amounts, assets, initial/negative/zero/decimal/invalid/maximum calculations, calculator reset, screenshot keyboard dialog/Escape/close/focus, 8 keyboard FAQs, keyboard section navigation, anchors, no external requests or browser errors, reduced motion, axe WCAG A/AA, no-JS content and FAQ.`);
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
