#!/usr/bin/env node
/**
 * scripts/check-owner-rules.mjs
 * Post-build guard for owner decisions that are easy to regress (DEC-016, DEC-017, DEC-019, DESIGN §2.8, §3.3).
 * Runs on every `npm run build`; fails the build on the first violation list.
 *
 * - Forbidden text anywhere in a page: legal-entity name that does not exist, price source site, professor title.
 * - WhatsApp: no WhatsApp link inside <main> on pages without a CTA; at most one `data-cta="whatsapp"` block elsewhere
 *   (Tentang Kami has one sales CTA since DEC-021).
 * - Inside <main>: no `shadow-*` or `uppercase` utility classes (footer and header are outside <main>).
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const FORBIDDEN = [
  { re: /PT\.? Agritani Internasional/i, why: 'nama PT tidak dipakai (DEC-017)' },
  { re: /petanisejahtera/i, why: 'situs sumber harga tidak disebut (DEC-019c)' },
  { re: /\bProf\.\s*Arif|\bProfesor\b/i, why: 'Arif Prabowo bukan profesor (DEC-016)' },
];

// Routes with no WhatsApp CTA in <main> (DESIGN §2.8, DEC-019d).
const NO_WA = [
  /^\/$/,
  /^\/produk\//,
  /^\/jurnal\/$/,
  /^\/jurnal\/(halaman|topik|komoditas|tag)\//,
  /^\/alat\/$/,
  /^\/kebijakan-privasi\/$/,
  /^\/cari\/$/,
  /^\/404\.html$/,
];

/** Returns a list of violation strings for one rendered page. */
export function checkPage(html, route) {
  const out = [];
  for (const f of FORBIDDEN) if (f.re.test(html)) out.push(`${f.why}: "${html.match(f.re)[0]}"`);

  const main = html.match(/<main[\s>][\s\S]*?<\/main>/)?.[0] ?? '';
  const ctas = (main.match(/data-cta="whatsapp"/g) || []).length;
  const waLinks = (main.match(/href="https:\/\/wa\.me\//g) || []).length;
  if (NO_WA.some((re) => re.test(route))) {
    if (ctas || waLinks) out.push(`ajakan WhatsApp di halaman tanpa CTA (${ctas} blok, ${waLinks} tautan)`);
  } else if (ctas > 1) {
    out.push(`${ctas} blok ajakan WhatsApp (maks 1, DESIGN §2.8)`);
  }

  if (!main && route !== '/404.html') out.push('tidak ada <main> (kerangka global DESIGN §4.2.1)');

  for (const cls of main.match(/class="[^"]*"/g) || []) {
    // shadow, shadow-*, inset-/drop-shadow-*, with variants and "!" (shadow-none is a reset and allowed); uppercase.
    const bad = cls.match(/(?:^|[\s"])((?:[a-z-]+:)*!?(?:(?:inset-|drop-)?shadow(?:-(?!none(?=[\s"]))[\w\[\]\/.-]+)?|uppercase))(?=[\s"])/);
    if (bad) {
      out.push(`kelas "${bad[1]}" di dalam <main> (tanpa bayangan/label kapital, DESIGN §3.3)`);
      break;
    }
  }
  return out;
}

function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === 'pagefind' || e.name === '_astro' ? [] : htmlFiles(p);
    return e.name.endsWith('.html') ? [p] : [];
  });
}

function routeOf(file, dist) {
  const rel = '/' + path.relative(dist, file).split(path.sep).join('/');
  return rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dist = path.resolve('dist');
  if (!fs.existsSync(dist)) {
    console.error('check-owner-rules: dist not found; run astro build first.');
    process.exit(1);
  }
  let failures = 0;
  const files = htmlFiles(dist);
  for (const file of files) {
    const route = routeOf(file, dist);
    for (const v of checkPage(fs.readFileSync(file, 'utf8'), route)) {
      console.error(`✗ ${route}: ${v}`);
      failures++;
    }
  }
  if (failures) {
    console.error(`check-owner-rules: ${failures} pelanggaran di ${files.length} halaman.`);
    process.exit(1);
  }
  console.log(`✓ check-owner-rules: ${files.length} halaman lolos (DEC-016/017/019, DESIGN §2.8, §3.3).`);
}
