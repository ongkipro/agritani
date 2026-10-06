import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('/home/ongki/Projects/tokophi/node_modules/playwright-core');
// Run: npx astro preview --port 4392, then node proof/ui/t57/verify.mjs proof/ui/t57
const OUT = process.argv[2]; const B = 'http://localhost:4392';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
for (const w of [360, 1440]) {
  const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
  await p.goto(B + '/alat/kalkulator-dosis/', { waitUntil: 'networkidle' });
  const h = await p.$$eval('.preset-chip', (els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
  ok(h.length === 11 && h.every((x) => x >= 44), `${w}: 11 preset chips >=44px (${[...new Set(h)]})`);
  const pressed = () => p.$$eval('.preset-chip[aria-pressed=true]', (e) => e.map((x) => x.textContent.trim()));
  ok(JSON.stringify(await pressed()) === '["16 L (Standar)"]', `${w}: initial pressed = 16 L`);
  await p.click('text=20 L (Elektrik)'); ok((await p.inputValue('#input-tank-vol')) === '20' && JSON.stringify(await pressed()) === '["20 L (Elektrik)"]', `${w}: click 20 L fills input + moves pressed`);
  await p.fill('#input-tank-vol', '18'); ok(!(await pressed()).some((t) => t.includes(' L (')), `${w}: typing 18 releases tank chip`);
  await p.click('text=2.500 m² (1/4 ha)'); ok((await p.inputValue('#input-area')) === '2500' && (await p.textContent('#label-area-unit')).includes('m²') && (await pressed()).includes('2.500 m² (1/4 ha)'), `${w}: area chip sets value+unit, pressed`);
  await p.click('.preset-chip[data-area-val="1"]'); ok((await pressed()).includes('1 ha') && !(await pressed()).includes('2.500 m² (1/4 ha)'), `${w}: area chip switch`);
  await p.fill('#input-dose', '2'); await p.focus('[data-spray-preset="300"]'); await p.keyboard.press('Enter');
  ok((await p.inputValue('#input-spray-vol')) === '300' && (await pressed()).includes('300 L/ha (Standar)'), `${w}: keyboard Enter on spray chip`);
  ok(await p.isVisible('#calc-result-container'), `${w}: result shows after inputs`);
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${w}: no horizontal overflow`);
  await p.screenshot({ path: `${OUT}/kalkulator-${w}.png`, fullPage: true });
  for (const path of ['/', '/jurnal/']) {
    await p.goto(B + path, { waitUntil: 'networkidle' });
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
    await p.waitForTimeout(300);
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${w} ${path}: no horizontal overflow`);
    if (path === '/') {
      const al = await p.evaluate(() => { const h = [...document.querySelectorAll('h2')].find((e) => e.textContent.includes('Instrumen Cepat')); const t = document.querySelector('a[href="/alat/cuaca-tani/"] h3'); return [Math.round(h.getBoundingClientRect().left), Math.round(t.getBoundingClientRect().left)]; });
      ok(al[0] === al[1], `${w}: tool rows align with heading (${al})`);
      const st = await p.evaluate(() => [...document.querySelectorAll('.tabular-nums')].filter((e) => /^(>8 Tahun|\d+ Panduan|Akses Terbuka)$/.test(e.textContent.trim())).map((e) => [e.textContent.trim(), Math.round(e.getBoundingClientRect().height)]));
      ok(st.length === 3 && st.every(([, hh]) => hh < 50), `${w}: stats single-line ${JSON.stringify(st)}`);
      const lk = await p.evaluate(() => Math.round([...document.querySelectorAll('a')].find((a) => a.textContent.includes('Semua komoditas')).getBoundingClientRect().height));
      ok(lk <= 36, `${w}: "Semua komoditas" one line (${lk}px)`);
    }
    if (path === '/jurnal/' && w === 360) {
      const shown = await p.evaluate(() => [...document.querySelectorAll('article .topic-link')].filter((a) => { const dot = [...a.parentElement.children].find((c) => c.textContent.trim() === '·'); return dot && getComputedStyle(dot).display !== 'none'; }).length);
      ok(shown === 0, `360 /jurnal/: no visible topic separator on phones`);
    }
    await p.screenshot({ path: `${OUT}/${path === '/' ? 'home' : 'jurnal'}-${w}.png`, fullPage: true });
  }
  if (w === 360) {
    const hit = await p.evaluate(() => { const a = document.querySelector('nav[aria-label="Topik Pertanian Cepat"] a'); const r = a.getBoundingClientRect(); return [document.elementFromPoint(r.left + 10, r.top - 3) === a, document.elementFromPoint(r.left + 10, r.bottom + 3) === a]; });
    ok(hit[0] && hit[1], `360: topic chip hit area extends above/below (${hit})`);
  }
}
await b.close();
