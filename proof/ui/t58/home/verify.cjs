// T-58C browser evidence: hero image loading, pause control, focus rings, CLS, console.
// Usage: node proof/ui/t58/home/verify.cjs <origin> <label>
// Example: node proof/ui/t58/home/verify.cjs http://localhost:4403 after
const { chromium } = require('/home/ongki/Projects/tokophi/node_modules/playwright-core');
const sharp = require('sharp');
const path = require('node:path');
const fs = require('node:fs');

const origin = process.argv[2] || 'http://localhost:4403';
const label = process.argv[3] || 'after';
const outDir = __dirname;
const viewports = [
  { name: '360', width: 360, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  { name: '1440', width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
];

async function shot(page, file, opts = {}) {
  const buf = await page.screenshot(opts);
  await sharp(buf).webp({ quality: 80 }).toFile(path.join(outDir, file));
}

function imageStats(entries, cutoff) {
  const imgs = entries.filter((e) => e.initiatorType === 'img' || /\.(webp|png|jpe?g|svg|avif)(\?|$)/.test(e.name));
  const atLoad = imgs.filter((e) => e.startTime <= cutoff);
  const hero = (list) => list.filter((e) => /\/hero-/.test(e.name));
  const bytes = (list) => list.reduce((s, e) => s + (e.encodedBodySize || e.transferSize || 0), 0);
  return {
    heroAtLoad: hero(atLoad).map((e) => e.name.split('/').pop()),
    heroTotal: hero(imgs).map((e) => e.name.split('/').pop()),
    imageCountAtLoad: atLoad.length,
    imageBytesAtLoad: bytes(atLoad),
    heroBytesAtLoad: bytes(hero(atLoad)),
  };
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
  const report = { origin, label, viewports: {} };
  for (const vp of viewports) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.deviceScaleFactor, isMobile: vp.isMobile, hasTouch: vp.hasTouch });
    const page = await ctx.newPage();
    const consoleErrors = [];
    page.on('console', (m) => { if (m.type() === 'error' || /Content Security Policy/i.test(m.text())) consoleErrors.push(m.text()); });
    page.on('pageerror', (e) => consoleErrors.push(String(e)));
    await page.addInitScript(() => {
      window.__cls = 0;
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto(origin + '/', { waitUntil: 'load' });
    const loadEnd = await page.evaluate(() => performance.getEntriesByType('navigation')[0].loadEventEnd);
    const entriesAtLoad = await page.evaluate(() => performance.getEntriesByType('resource').map((e) => ({ name: e.name, initiatorType: e.initiatorType, startTime: e.startTime, encodedBodySize: e.encodedBodySize, transferSize: e.transferSize })));
    const r = { ...imageStats(entriesAtLoad, loadEnd), loadEventEnd: Math.round(loadEnd) };
    await page.waitForTimeout(2500);
    r.heroAtLoadPlus2500ms = await page.evaluate(() => performance.getEntriesByType('resource').filter((e) => /\/hero-/.test(e.name)).map((e) => e.name.split('/').pop()));
    // Idle hydration: wait until all 5 hero images are in the resource list (max 6s).
    const t0 = Date.now();
    await page.waitForFunction(() => performance.getEntriesByType('resource').filter((e) => /\/hero-/.test(e.name)).length >= 5, null, { timeout: 6000 }).catch(() => {});
    r.heroAfterIdleMs = Date.now() - t0;
    r.heroAfterIdle = await page.evaluate(() => performance.getEntriesByType('resource').filter((e) => /\/hero-/.test(e.name)).map((e) => e.name.split('/').pop()));
    await shot(page, `${label}-home-hero-${vp.name}.webp`, { clip: { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, 760) } });

    // Pause control
    const toggle = page.locator('#hero-slider-toggle');
    if (await toggle.count()) {
      r.toggleVisible = await toggle.isVisible();
      r.toggleBox = await toggle.boundingBox();
      if (r.toggleVisible) {
        await toggle.click();
        await page.mouse.move(0, vp.height - 1); // leave the slider so hover-pause does not mask the result
        r.toggleAfterClick = { pressed: await toggle.getAttribute('aria-pressed'), label: await toggle.getAttribute('aria-label') };
        const idx = () => page.evaluate(() => [...document.querySelectorAll('.hero-slide')].findIndex((s) => s.classList.contains('opacity-100')));
        const seq = [];
        for (let i = 0; i < 6; i++) { seq.push(await idx()); await page.waitForTimeout(2000); }
        r.pausedIndexSequence = seq; // sampled every 2s over 10s; must be constant
        await toggle.focus();
        await page.keyboard.press('Shift+Tab');
        await page.keyboard.press('Tab'); // keyboard-origin focus so :focus-visible applies
        r.toggleFocusedByKeyboard = await toggle.evaluate((el) => el.matches(':focus-visible'));
        await shot(page, `${label}-home-pause-focus-${vp.name}.webp`, { clip: { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, 760) } });
        await toggle.click();
        r.toggleAfterResume = { pressed: await toggle.getAttribute('aria-pressed'), label: await toggle.getAttribute('aria-label') };
        await page.mouse.move(0, vp.height - 1);
        await page.locator('h2').first().focus().catch(() => {});
        const before = await idx();
        await page.waitForTimeout(5600);
        r.resumeAdvanced = (await idx()) !== before;
      }
    } else {
      r.toggleVisible = false;
    }
    r.cls = await page.evaluate(() => window.__cls);
    r.overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

    // Header search focus ring (keyboard)
    const search = page.locator('#header-search-input');
    await page.evaluate(() => window.scrollTo(0, 0));
    const trigger = page.locator(vp.isMobile ? '#header-search-trigger-mobile' : '#header-search-trigger-desktop');
    await trigger.focus();
    await page.keyboard.press('Enter');
    await search.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
    if (await search.isVisible()) {
      if (!(await search.evaluate((el) => document.activeElement === el))) await page.keyboard.press('Tab');
      await page.waitForTimeout(300);
      r.searchFocus = await search.evaluate((el) => { const cs = getComputedStyle(el); return { focused: document.activeElement === el, outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, offset: cs.outlineOffset }; });
      const b = await search.boundingBox();
      await shot(page, `${label}-search-focus-${vp.name}.webp`, { clip: { x: Math.max(0, b.x - 16), y: Math.max(0, b.y - 16), width: Math.min(vp.width - Math.max(0, b.x - 16), b.width + 32), height: b.height + 32 } });
    }

    // Calculator input focus ring (keyboard)
    await page.goto(origin + '/alat/kalkulator-dosis/', { waitUntil: 'load' });
    const dose = page.locator('#input-dose');
    await dose.scrollIntoViewIfNeeded();
    await dose.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(400); // the wrapper has transition-all; read settled values
    r.doseFocus = await dose.evaluate((el) => { const cs = getComputedStyle(el); const w = getComputedStyle(el.parentElement); return { focused: document.activeElement === el, inputOutline: `${cs.outlineStyle} ${cs.outlineWidth}`, wrapperOutline: `${w.outlineStyle} ${w.outlineWidth} ${w.outlineColor}`, wrapperOffset: w.outlineOffset }; });
    const wb = await dose.locator('xpath=..').boundingBox();
    await shot(page, `${label}-dose-focus-${vp.name}.webp`, { clip: { x: Math.max(0, wb.x - 16), y: Math.max(0, wb.y - 40), width: Math.min(vp.width - Math.max(0, wb.x - 16), wb.width + 32), height: wb.height + 72 } });
    r.consoleErrors = consoleErrors;
    report.viewports[vp.name] = r;
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(outDir, `${label}-results.json`), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
})();
