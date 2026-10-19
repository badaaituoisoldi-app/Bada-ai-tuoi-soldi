const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const seed = require('./seed.cjs');
const [W, H, DPR] = [390, 844, 2];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const theme of ['light', 'dark']) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: DPR, colorScheme: theme });
    const sd = { ...seed, 'budget-prefs': JSON.stringify({ ...JSON.parse(seed['budget-prefs']), theme }) };
    await ctx.addInitScript(s => { if (!localStorage.getItem('__seeded')) { for (const k in s) localStorage.setItem(k, s[k]); localStorage.setItem('__seeded', '1'); } }, sd);
    const p = await ctx.newPage();
    await p.clock.install({ time: new Date('2026-10-19T10:00:00') });
    await p.goto('http://localhost:8081/', { waitUntil: 'networkidle' });
    await p.waitForTimeout(1200); await p.clock.runFor(8000); await p.waitForTimeout(800);
    await p.screenshot({ path: `final/${theme}-mese.png` });
    for (const [name, file] of [['Entrate/uscite', 'spese'], ['Obiettivi', 'obiettivi']]) {
      await p.getByText(name, { exact: true }).last().evaluate(e => e.click());
      await p.clock.runFor(2000); await p.waitForTimeout(700);
      await p.screenshot({ path: `final/${theme}-${file}.png` });
    }
    await p.getByText('Impostazioni', { exact: true }).last().evaluate(e => e.click());
    await p.clock.runFor(1500);
    const el = p.getByText('Importa movimenti (CSV)').first();
    await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(400);
    await el.click(); await p.clock.runFor(4000); await p.waitForTimeout(1500);
    await p.screenshot({ path: `final/${theme}-importazione.png` });
    await ctx.close();
  }
  await b.close();
})();
