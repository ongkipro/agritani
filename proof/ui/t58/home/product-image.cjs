// T-58C item 5: rendered size vs chosen candidate for the aussie-lahan field photo.
// Usage: node proof/ui/t58/home/product-image.cjs <origin>
const { chromium } = require('/home/ongki/Projects/tokophi/node_modules/playwright-core');
const origin = process.argv[2] || 'http://localhost:4403';
const cases = [
  { w: 360, h: 780, dpr: 2 },
  { w: 412, h: 823, dpr: 1.75 }, // Lighthouse mobile
  { w: 768, h: 1024, dpr: 2 },
  { w: 1440, h: 900, dpr: 1 },
];
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
  for (const c of cases) {
    const ctx = await b.newContext({ viewport: { width: c.w, height: c.h }, deviceScaleFactor: c.dpr });
    const p = await ctx.newPage();
    await p.goto(origin + '/produk/aussie/', { waitUntil: 'load' });
    const img = p.locator('#foto-lahan img').first();
    await img.scrollIntoViewIfNeeded();
    await p.waitForFunction((el) => el.complete && el.naturalWidth > 0, await img.elementHandle());
    const info = await img.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const e = performance.getEntriesByName(el.currentSrc)[0];
      return { rendered: `${Math.round(r.width)}x${Math.round(r.height)}`, natural: `${el.naturalWidth}x${el.naturalHeight}`, file: el.currentSrc.split('/').pop(), bytes: e ? e.encodedBodySize : null };
    });
    console.log(`${c.w}@${c.dpr}x`, JSON.stringify(info));
    await ctx.close();
  }
  await b.close();
})();
