// T-58C: with prefers-reduced-motion the slider must not autoplay and the toggle must offer "Putar".
// Usage: node proof/ui/t58/home/reduced-motion.cjs <origin>
const { chromium } = require('/home/ongki/Projects/tokophi/node_modules/playwright-core');
const origin = process.argv[2] || 'http://localhost:4403';
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
  const ctx = await b.newContext({ viewport: { width: 360, height: 780 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(origin + '/', { waitUntil: 'load' });
  const idx = () => p.evaluate(() => [...document.querySelectorAll('.hero-slide')].findIndex((s) => s.classList.contains('opacity-100')));
  const label = await p.locator('#hero-slider-toggle').getAttribute('aria-label');
  const seq = [];
  for (let i = 0; i < 4; i++) { seq.push(await idx()); await p.waitForTimeout(2000); }
  await p.locator('#hero-slider-toggle').click();
  await p.mouse.move(0, 779);
  await p.waitForTimeout(5800);
  const afterOptIn = await idx();
  console.log(JSON.stringify({ initialLabel: label, indexEvery2s: seq, indexAfterUserPressedPutar: afterOptIn }));
  await b.close();
})();
