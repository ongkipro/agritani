// T-58B article features: related text cards, hub link, meta bar targets, mobile progress bar, JSON-LD, outline.
// Run: npx astro preview --port 4402, then node proof/ui/t58/article/verify.mjs proof/ui/t58/article
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('/home/ongki/Projects/tokophi/node_modules/playwright-core');
const sharp = require('../../../../node_modules/sharp');
const OUT = process.argv[2];
const B = 'http://localhost:4402';
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
const ARTICLES = [
  { slug: '5-kesalahan-petani-sawit-produktivitas', hub: true },
  { slug: 'revolusi-daun-tegak-blast-padi', hub: true },
  { slug: 'strategi-mencegah-resistensi-silang-pestisida', hub: false }, // no commodity
];
const shot = async (p, name) => {
  const png = await p.screenshot({ fullPage: true });
  await sharp(png).webp({ quality: 70 }).toFile(`${OUT}/${name}.webp`);
};
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
for (const w of [360, 1440]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 800 } });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  for (const { slug, hub } of ARTICLES) {
    await p.goto(`${B}/jurnal/${slug}/`);
    const tag = `${w} ${slug}`;
    ok(await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth <= 1), `${tag}: no horizontal overflow`);

    // Meta bar: 14px text, links >= 44px hit area (elementFromPoint 21px above/below centre), no dangling separator.
    const meta = await p.evaluate(() => {
      const list = document.querySelector('.meta-list');
      const fs = getComputedStyle(list).fontSize;
      const clipLeft = list.parentElement.getBoundingClientRect().left;
      const links = [...list.querySelectorAll('a')].map((a) => {
        const r = a.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const hit = (x, y) => a.contains(document.elementFromPoint(x, y));
        return { text: a.textContent.trim(), up: hit(cx, cy - 21), down: hit(cx, cy + 21), left: hit(cx - 21, cy), right: hit(cx + 21, cy) };
      });
      // A separator is visible when its li::before box starts inside the clip box.
      const lis = [...list.children].map((li) => Math.round(li.getBoundingClientRect().left - clipLeft));
      const rows = new Set([...list.children].map((li) => Math.round(li.getBoundingClientRect().top))).size;
      const firstOfRow = [...list.children].filter((li, i, arr) => i === 0 || Math.round(li.getBoundingClientRect().top) !== Math.round(arr[i - 1].getBoundingClientRect().top));
      const danglers = firstOfRow.filter((li) => li.getBoundingClientRect().left >= clipLeft - 0.5).length;
      return { fs, links, rows, danglers, lis };
    });
    ok(meta.fs === '14px', `${tag}: meta text ${meta.fs}`);
    ok(meta.links.length >= 1 && meta.links.every((l) => l.up && l.down && l.left && l.right), `${tag}: meta links hit area >=44x44 (probe +-21px) ${JSON.stringify(meta.links)}`);
    ok(meta.danglers === 0, `${tag}: no line starts with a visible "·" (${meta.rows} rows)`);

    // Related: up to 4 text cards, no images; hub link before topic link.
    const rel = await p.evaluate(() => {
      const nav = document.querySelector('nav[aria-labelledby="bacaan-terkait-heading"]');
      const cards = [...nav.querySelectorAll('a.related-card')];
      const links = [...nav.querySelectorAll('div a')].map((a) => a.textContent.trim());
      return {
        n: cards.length,
        imgs: nav.querySelectorAll('img').length,
        minH: Math.min(...cards.map((c) => c.getBoundingClientRect().height)),
        topic: cards.every((c) => c.querySelector('.topic-marker') && c.textContent.includes('menit baca')),
        links,
      };
    });
    ok(rel.n === 4 && rel.imgs === 0 && rel.minH >= 44 && rel.topic, `${tag}: 4 related text cards (n=${rel.n}, imgs=${rel.imgs}, minH=${Math.round(rel.minH)})`);
    const hubIdx = rel.links.findIndex((t) => /^Lihat \d+ artikel /.test(t));
    const topicIdx = rel.links.findIndex((t) => t.startsWith('Lihat semua artikel topik'));
    ok(hub ? hubIdx >= 0 && hubIdx < topicIdx : hubIdx === -1, `${tag}: hub link ${hub ? 'before topic link' : 'absent'} ${JSON.stringify(rel.links)}`);

    // Progress bar: visible and growing on mobile only.
    const prog = async () => p.evaluate(() => {
      const el = document.querySelector('.reading-progress');
      const cs = getComputedStyle(el);
      return { display: cs.display, width: el.getBoundingClientRect().width, h: cs.height, hidden: el.getAttribute('aria-hidden') };
    });
    const p0 = await prog();
    await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight / 2));
    await p.waitForFunction(() => document.querySelector('.reading-progress').getBoundingClientRect().width > 0 || getComputedStyle(document.querySelector('.reading-progress')).display === 'none');
    const p1 = await prog();
    await p.evaluate(() => window.scrollTo(0, 0));
    if (w < 1024) ok(p0.display === 'block' && p0.h === '3px' && p1.width > w * 0.3 && p1.width < w && p0.hidden === 'true', `${tag}: progress bar 3px, grows on scroll (${Math.round(p0.width)} -> ${Math.round(p1.width)})`);
    else ok(p0.display === 'none', `${tag}: progress bar hidden on desktop`);

    // Outline: no level skip in article body; TOC links resolve to headings.
    const outline = await p.evaluate(() => {
      const lv = [1, ...[...document.querySelectorAll('[data-pagefind-body] h2, [data-pagefind-body] h3, [data-pagefind-body] h4')].map((h) => +h.tagName[1])];
      const toc = [...document.querySelectorAll('.article-toc a[href^="#"]')].map((a) => a.getAttribute('href').slice(1));
      const tocSizes = [...new Set([...document.querySelectorAll('[data-toc-link]')].map((a) => getComputedStyle(a).fontSize))];
      return { skip: lv.some((l, i) => i > 0 && l > lv[i - 1] + 1), tocOk: toc.length > 0 && toc.every((id) => document.getElementById(id)), tocSizes, progressLabel: getComputedStyle(document.getElementById('toc-progress-text') || document.body).fontSize };
    });
    ok(!outline.skip && outline.tocOk, `${tag}: no heading skip, TOC targets resolve`);
    if (w === 1440) ok(outline.tocSizes.every((s) => s === '14px') && outline.progressLabel === '14px', `${tag}: TOC ${outline.tocSizes} / progress ${outline.progressLabel}`);

    // JSON-LD parses; Article has mainEntityOfPage but no mainEntity.
    const ld = await p.$$eval('script[type="application/ld+json"]', (s) => s.map((x) => x.textContent));
    const graph = ld.flatMap((t) => JSON.parse(t)['@graph'] ?? []);
    const art = graph.find((n) => n['@type'] === 'Article');
    ok(art && art.mainEntityOfPage && art.mainEntity === undefined, `${tag}: JSON-LD parses, Article.mainEntity removed`);

    // Two share buttons share one handler (clipboard fallback in headless).
    ok((await p.locator('[data-action="share"]').count()) === 2, `${tag}: two share actions`);
    await shot(p, `${slug}-${w}`);
  }

  // Author page JSON-LD.
  await p.goto(`${B}/penulis/arif-prabowo/`);
  ok(await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth <= 1), `${w} penulis: no horizontal overflow`);
  const ld = await p.$$eval('script[type="application/ld+json"]', (s) => s.map((x) => x.textContent));
  const graph = ld.flatMap((t) => JSON.parse(t)['@graph'] ?? []);
  const page = graph.find((n) => n['@type'] === 'ProfilePage');
  const person = graph.find((n) => n['@type'] === 'Person');
  ok(page?.mainEntity?.['@id'] === 'https://agritani.com/penulis/arif-prabowo/#person' && person?.['@id'] === page.mainEntity['@id'], `${w} penulis: ProfilePage.mainEntity -> Person`);
  ok(person?.name === 'Arif Prabowo' && person.jobTitle === 'Konsultan Pertanian Senior' && /^https:\/\/agritani\.com\/_astro\/.+\.webp$/.test(person.image) && person.description && person.url && !person.sameAs, `${w} penulis: Person ${JSON.stringify(person)}`);
  if (person?.image) {
    const res = await p.request.get(person.image.replace('https://agritani.com', B));
    ok(res.ok(), `${w} penulis: Person.image resolves locally (${res.status()})`);
  }
  await shot(p, `penulis-${w}`);
  ok(errors.length === 0, `${w}: no console/page errors ${JSON.stringify(errors)}`);
  await ctx.close();
}

// Reduced motion hides the bar.
const rm = await (await b.newContext({ viewport: { width: 360, height: 800 }, reducedMotion: 'reduce' })).newPage();
await rm.goto(`${B}/jurnal/${ARTICLES[0].slug}/`);
ok((await rm.evaluate(() => getComputedStyle(document.querySelector('.reading-progress')).display)) === 'none', '360 reduced-motion: progress bar hidden');
await b.close();
