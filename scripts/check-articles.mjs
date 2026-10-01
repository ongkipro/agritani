#!/usr/bin/env node
/**
 * scripts/check-articles.mjs
 * Intake gate for Jurnal Tani manuscripts (docs/content/ARTICLE-INTAKE.md, DEC-020, DEC-022).
 * Runs first in `npm run build` (and `npm run check:articles`) so a new article written by an AI agent
 * or dropped in as a .md file fails fast with a readable message instead of shipping inconsistent SEO.
 *
 * Checked for every published article (`draft: false`); drafts only need a valid slug and frontmatter.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ARTICLES_DIR = path.resolve('docs/content/articles');
const TOPICS = ['proteksi-tanaman', 'tanah-nutrisi', 'budidaya', 'air-irigasi', 'pascapanen-agribisnis', 'sains-tanaman'];
// metaTitle + " - Agritani" (11 chars) must land in 55–70 → metaTitle 44–59 (DEC-022).
const META_TITLE = { min: 44, max: 59 };
const DESCRIPTION = { min: 120, max: 155 };
const HYPE = /100\s*%|\brahasia\b|\bampuh\b|\btuntas\b|\bjurus\b|\bajaib\b|\bkeajaiban\b|\bdijamin\b|\bmenjamin\b|\bpasti\b|\bselangit\b|\bcuan\b|\bsukses\b|\bsuper\b|\bterbukti\b/i;
const FORBIDDEN = [
  { re: /PT\.? Agritani Internasional/i, why: 'nama PT tidak dipakai (DEC-017)' },
  { re: /petanisejahtera/i, why: 'situs sumber harga tidak disebut (DEC-019)' },
  { re: /\bProf\.\s*Arif|\bProfesor Arif/i, why: 'Arif Prabowo bukan profesor (DEC-016)' },
  { re: /TODO\(|menyusul - OQ/, why: 'placeholder belum diisi' },
];

/** Minimal frontmatter reader for this repo's flat, quoted YAML (same approach as check-commodities.mjs). */
export function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return null;
  const raw = m[1];
  const get = (key) => {
    const v = raw.match(new RegExp(`^${key}:[ \\t]*(.*)$`, 'm'));
    if (!v) return undefined;
    return v[1].trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
  };
  const list = (key) => {
    const block = raw.match(new RegExp(`^${key}:[ \\t]*\\r?\\n((?:[ \\t]+-.*\\r?\\n?)*)`, 'm'));
    return block ? Array.from(block[1].matchAll(/^[ \t]+-[ \t]*"?([^"\n]+?)"?[ \t]*$/gm)).map((x) => x[1]) : [];
  };
  const refsBlock = raw.match(/^references:[ \t]*\r?\n((?:[ \t]+.*\r?\n?)*)/m)?.[1] ?? '';
  const references = refsBlock
    .split(/^[ \t]+-[ \t]+/m)
    .slice(1)
    .map((entry) => ({ title: /(^|\n)\s*title:/.test(`\n${entry}`), link: /(^|\n)\s*(doi|url):/.test(`\n${entry}`) }));
  return {
    title: get('title'),
    metaTitle: get('metaTitle'),
    description: get('description'),
    slug: get('slug'),
    pubDate: get('pubDate'),
    updatedDate: get('updatedDate'),
    author: get('author'),
    topic: get('topic'),
    draft: get('draft') !== 'false',
    tags: list('tags'),
    references,
    body: m[2],
  };
}

/** Returns human-readable problems for one manuscript. */
export function checkArticle(text) {
  const fm = parseFrontmatter(text);
  if (!fm) return ['frontmatter tidak ditemukan (harus diawali dan diakhiri ---)'];
  const out = [];
  if (!fm.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fm.slug)) out.push(`slug "${fm.slug ?? ''}" harus huruf kecil-angka dengan tanda hubung`);
  if (fm.draft) return out;

  for (const key of ['title', 'metaTitle', 'description', 'pubDate', 'author', 'topic']) {
    if (!fm[key]) out.push(`${key} wajib diisi untuk artikel terbit`);
  }
  if (fm.topic && !TOPICS.includes(fm.topic)) out.push(`topic "${fm.topic}" bukan salah satu dari: ${TOPICS.join(', ')}`);
  if (fm.pubDate && !/^\d{4}-\d{2}-\d{2}$/.test(fm.pubDate)) out.push(`pubDate "${fm.pubDate}" harus YYYY-MM-DD`);
  if (fm.updatedDate) {
    // updatedDate = last substantive revision; it feeds dateModified and the sitemap lastmod (ARTICLE-INTAKE.md).
    const today = new Date().toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fm.updatedDate)) out.push(`updatedDate "${fm.updatedDate}" harus YYYY-MM-DD`);
    else if (fm.pubDate && fm.updatedDate < fm.pubDate) out.push(`updatedDate ${fm.updatedDate} sebelum pubDate ${fm.pubDate}`);
    else if (fm.updatedDate > today) out.push(`updatedDate ${fm.updatedDate} di masa depan`);
  }
  if (fm.tags.length === 0) out.push('tags minimal 1');
  if (fm.metaTitle) {
    const n = fm.metaTitle.length;
    if (n < META_TITLE.min || n > META_TITLE.max) out.push(`metaTitle ${n} karakter; harus ${META_TITLE.min}–${META_TITLE.max} (jadi 55–70 dengan " - Agritani")`);
    if (/[|—]/.test(fm.metaTitle)) out.push('metaTitle memakai "|" atau "—"; pakai " - " atau ":"');
  }
  if (fm.description) {
    const n = fm.description.length;
    if (n < DESCRIPTION.min || n > DESCRIPTION.max) out.push(`description ${n} karakter; harus ${DESCRIPTION.min}–${DESCRIPTION.max}`);
  }
  for (const key of ['title', 'metaTitle', 'description']) {
    const hit = fm[key]?.match(HYPE);
    if (hit) out.push(`${key} memuat kata klaim berlebihan "${hit[0]}" (DESIGN §1.3)`);
  }
  fm.references.forEach((r, i) => {
    if (!r.title || !r.link) out.push(`references[${i + 1}] perlu title dan doi atau url (jangan mengarang rujukan)`);
  });
  for (const f of FORBIDDEN) if (f.re.test(text)) out.push(f.why);
  return out;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const files = fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.md'));
  const slugs = new Map();
  let failures = 0;
  let published = 0;
  for (const file of files) {
    const text = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf8');
    const fm = parseFrontmatter(text);
    if (fm && !fm.draft) published++;
    const problems = checkArticle(text);
    if (fm?.slug) {
      if (slugs.has(fm.slug)) problems.push(`slug "${fm.slug}" sama dengan ${slugs.get(fm.slug)}`);
      else slugs.set(fm.slug, file);
    }
    for (const p of problems) {
      console.error(`✗ ${file}: ${p}`);
      failures++;
    }
  }
  if (failures) {
    console.error(`check-articles: ${failures} masalah. Panduan: docs/content/ARTICLE-INTAKE.md`);
    process.exit(1);
  }
  console.log(`✓ check-articles: ${files.length} naskah (${published} terbit) lolos aturan intake.`);
}
