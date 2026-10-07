// T-58A browser proof for Jurnal listings/hubs. Usage: node proof/ui/t58/hubs/verify-hubs.mjs [origin]
// Needs a running `astro preview` of a fresh build (default http://localhost:4401). Writes WebP screenshots + results.json here.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const { chromium } = require('/home/ongki/Projects/tokophi/node_modules/playwright-core');

const ORIGIN = process.argv[2] || 'http://localhost:4401';
const OUT = path.dirname(new URL(import.meta.url).pathname);
const ROUTES = {
  jurnal: '/jurnal/',
  halaman2: '/jurnal/halaman/2/',
  topik: '/jurnal/topik/proteksi-tanaman/',
  komoditas: '/jurnal/komoditas/padi/',
  tag: '/jurnal/tag/padi/',
};
const VIEWPORTS = [360, 1440];
const failures = [];
const results = {};
const fail = (msg) => {
  failures.push(msg);
  console.log('  FAIL', msg);
};

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });

async function measure(page, vw) {
  return page.evaluate((vw) => {
    const vis = (el) => !!el && getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().height > 0;
    const main = document.querySelector('main');
    const picker = document.querySelector('nav[aria-labelledby="komoditas-picker-heading"]');
    const aside = document.querySelector('main aside');
    const items = [...document.querySelectorAll('.article-item-wrapper')];
    const shown = items.filter(vis);
    const firstRow = shown[0]?.getBoundingClientRect();
    const rowHeights = shown.slice(0, 12).map((el) => Math.round(el.getBoundingClientRect().height));
    const content = picker?.parentElement?.getBoundingClientRect();
    // Tap targets in <main> smaller than 44px, except inline links inside running text and hidden duplicates.
    const small = [...main.querySelectorAll('a, button, summary')]
      .filter((el) => {
        if (!vis(el)) return false;
        if (el.getAttribute('aria-hidden') === 'true' && el.tabIndex < 0) return false;
        const cs = getComputedStyle(el);
        if (cs.display === 'inline' && el.closest('p') && !el.closest('nav[aria-label="Breadcrumb"]')) return false;
        // Stretched links (row titles, card titles): ::after covers the positioned row/card, measure that instead.
        if (getComputedStyle(el, '::after').position === 'absolute') {
          const host = el.closest('article, .card, [class*="relative"]');
          if (host && host.getBoundingClientRect().height >= 44) return false;
        }
        const r = el.getBoundingClientRect();
        // .link-more adds an invisible 5px ::before above and below (DESIGN §3.3.4).
        const h = r.height + (el.classList.contains('link-more') ? 10 : 0);
        return r.width < 44 || h < 44;
      })
      .map((el) => {
        const r = el.getBoundingClientRect();
        return `${el.tagName.toLowerCase()} "${el.textContent.trim().replace(/\s+/g, ' ').slice(0, 30)}" ${Math.round(r.width)}x${Math.round(r.height)}`;
      });
    const img = shown[0]?.querySelector('img');
    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      picker: vis(picker)
        ? { top: Math.round(picker.getBoundingClientRect().top + scrollY), width: Math.round(picker.getBoundingClientRect().width), contentWidth: Math.round(content.width) }
        : null,
      aside: vis(aside) ? { position: getComputedStyle(aside).position, top: getComputedStyle(aside).top, width: Math.round(aside.getBoundingClientRect().width) } : null,
      firstRowTop: firstRow ? Math.round(firstRow.top + scrollY) : null,
      items: items.length,
      shown: shown.length,
      maxRowHeight: Math.max(0, ...rowHeights),
      rowHeights,
      small,
      firstImg: img ? { loading: img.loading, fetchpriority: img.getAttribute('fetchpriority'), w: Math.round(img.getBoundingClientRect().width), src: img.currentSrc.split('/').pop() } : null,
    };
  }, vw);
}

for (const vw of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vw < 640 ? 780 : 900 }, deviceScaleFactor: vw < 640 ? 2 : 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  for (const [name, route] of Object.entries(ROUTES)) {
    console.log(`${name} @${vw}`);
    await page.goto(ORIGIN + route, { waitUntil: 'load' });
    const m = await measure(page, vw);
    results[`${name}@${vw}`] = m;
    if (m.overflow > 1) fail(`${name}@${vw}: horizontal overflow ${m.overflow}px`);
    if (vw < 1024) {
      if (!m.picker) fail(`${name}@${vw}: commodity block missing`);
      else {
        if (m.firstRowTop !== null && m.picker.top > m.firstRowTop) fail(`${name}@${vw}: commodity block after the list`);
        if (Math.abs(m.picker.width - m.picker.contentWidth) > 1) fail(`${name}@${vw}: commodity block ${m.picker.width}px != content ${m.picker.contentWidth}px`);
      }
      if (m.aside) fail(`${name}@${vw}: aside visible below 1024px`);
      if (m.maxRowHeight > 140) fail(`${name}@${vw}: row height ${m.maxRowHeight}px > 140`);
    } else {
      if (m.picker) fail(`${name}@${vw}: commodity block visible at >=1024px`);
      if (!m.aside || m.aside.position !== 'sticky') fail(`${name}@${vw}: aside not sticky (${JSON.stringify(m.aside)})`);
    }
    if (m.small.length) fail(`${name}@${vw}: small tap targets ${JSON.stringify(m.small)}`);

    // Mobile commodity disclosure opens the full grid.
    if (vw < 1024) {
      const summary = page.locator('nav[aria-labelledby="komoditas-picker-heading"] summary');
      if (await summary.count()) {
        const before = await page.locator('nav[aria-labelledby="komoditas-picker-heading"] li:visible').count();
        await summary.click();
        const after = await page.locator('nav[aria-labelledby="komoditas-picker-heading"] li:visible').count();
        results[`${name}@${vw}`].commodityDisclosure = { before, after };
        if (after <= before) fail(`${name}@${vw}: "Semua komoditas" did not open (${before} -> ${after})`);
        await summary.click();
      }
    }

    // Load more (JS on): one click reveals one more batch.
    const btn = page.locator('.btn-load-more').first();
    if (await btn.isVisible()) {
      const before = m.shown;
      await btn.click();
      const after = await page.locator('.article-item-wrapper:visible').count();
      results[`${name}@${vw}`].loadMore = { before, after };
      if (after <= before) fail(`${name}@${vw}: load more did not reveal rows (${before} -> ${after})`);
      await page.reload({ waitUntil: 'load' });
    }

    // Screenshots: scroll first so lazy images load.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 30));
      }
      scrollTo(0, 0);
    });
    await page.waitForLoadState('networkidle').catch(() => {});
    await sharp(await page.screenshot({ fullPage: true })).webp({ quality: 70 }).toFile(path.join(OUT, `${name}-${vw}.webp`));
    await sharp(await page.screenshot()).webp({ quality: 75 }).toFile(path.join(OUT, `${name}-${vw}-fold.webp`));
  }
  if (errors.length) fail(`console errors @${vw}: ${errors.join(' | ')}`);
  await ctx.close();
}

// JS disabled: every row visible and load-more controls hidden; archive pages 1..N list every article exactly once.
const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 360, height: 780 } });
const np = await nojs.newPage();
for (const [name, route] of Object.entries(ROUTES)) {
  await np.goto(ORIGIN + route);
  const r = await np.evaluate(() => {
    const items = [...document.querySelectorAll('.article-item-wrapper')];
    return {
      total: items.length,
      visible: items.filter((e) => getComputedStyle(e).display !== 'none').length,
      loadMoreVisible: [...document.querySelectorAll('.load-more-container')].some((e) => getComputedStyle(e).display !== 'none'),
    };
  });
  results[`${name}@nojs`] = r;
  if (r.visible !== r.total || r.loadMoreVisible) fail(`${name} no-JS: ${r.visible}/${r.total} visible, load-more shown=${r.loadMoreVisible}`);
}
const seen = [];
const pages = [];
let pageUrl = '/jurnal/';
while (pageUrl) {
  await np.goto(ORIGIN + pageUrl);
  pages.push(pageUrl);
  seen.push(...(await np.$$eval('.article-item-wrapper article h2 a', (as) => as.map((a) => a.getAttribute('href')))));
  pageUrl = await np.$eval('a[rel="next"]', (a) => a.getAttribute('href')).catch(() => null);
}
const unique = new Set(seen);
results.archive = { pages: pages.length, rows: seen.length, unique: unique.size };
if (unique.size !== seen.length) fail(`archive: ${seen.length - unique.size} duplicated articles`);
console.log('archive', results.archive);
await nojs.close();
await browser.close();

fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify({ origin: ORIGIN, failures, results }, null, 2));
console.log(failures.length ? `\n${failures.length} failure(s)` : '\nALL CHECKS PASSED');
process.exit(failures.length ? 1 : 0);
