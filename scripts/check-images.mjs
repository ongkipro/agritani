#!/usr/bin/env node
/**
 * scripts/check-images.mjs
 * Image rule (owner 2026-10-01, AGENTS.md "Images", DESIGN §3.5.1): every page image is WebP (SVG for icons)
 * and carries a descriptive ALT with the page's keyword. Runs in `npm run build` (and `npm run check:images`).
 *
 * - Source files: every raster image under src/assets and public is .webp, except social/OS images that
 *   platforms require as PNG (public/og/*.png, public/apple-touch-icon.png).
 * - Built HTML: every <img> has alt of 10–125 characters that is not a generic word, and its src is .webp or .svg.
 *   Images added at runtime by scripts (BMKG weather icons) are covered in their component, not here.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const RASTER = /\.(png|jpe?g|gif|avif|bmp|tiff?)$/i;
const ALLOWED_NON_WEBP = [/^public\/og\/[^/]+\.png$/, /^public\/apple-touch-icon\.png$/];
const GENERIC_ALT = /^(gambar|foto|image|img|picture|ilustrasi|thumbnail|logo|icon|ikon)\.?$/i;

const decode = (t) => t.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

/** Problems for one rendered page. */
export function checkImagesInHtml(html) {
  const out = [];
  for (const tag of html.match(/<img\b[^>]*>/g) || []) {
    const altMatch = tag.match(/\balt="([^"]*)"/);
    const alt = altMatch ? decode(altMatch[1]).trim() : '';
    const src = (tag.match(/\bsrc="([^"]*)"/) || [])[1] || '';
    const file = src.split(/[?#]/)[0];
    if (!alt) out.push(`ALT kosong: ${file}`);
    else if (alt.length < 10 || alt.length > 125) out.push(`ALT ${alt.length} karakter (harus 10–125): "${alt}"`);
    else if (GENERIC_ALT.test(alt)) out.push(`ALT generik: "${alt}"`);
    if (file && !/\.(webp|svg)$/i.test(file)) out.push(`gambar bukan WebP/SVG: ${file}`);
  }
  return out;
}

/** Raster source files that are not WebP (repo-relative paths). */
export function nonWebpSources(files) {
  return files.filter((f) => RASTER.test(f) && !ALLOWED_NON_WEBP.some((re) => re.test(f)));
}

function walk(dir, skip = []) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return skip.includes(e.name) ? [] : walk(p, skip);
    return [p];
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  let failures = 0;
  const sources = [...walk('src/assets'), ...walk('public')].map((p) => p.split(path.sep).join('/'));
  for (const f of nonWebpSources(sources)) {
    console.error(`✗ ${f}: sumber gambar wajib .webp (konversi dengan scripts/to-webp.mjs)`);
    failures++;
  }
  const html = walk('dist', ['pagefind', '_astro']).filter((f) => f.endsWith('.html'));
  let images = 0;
  for (const file of html) {
    const text = fs.readFileSync(file, 'utf8');
    images += (text.match(/<img\b/g) || []).length;
    for (const p of checkImagesInHtml(text)) {
      console.error(`✗ ${path.relative('dist', file)}: ${p}`);
      failures++;
    }
  }
  if (failures) {
    console.error(`check-images: ${failures} masalah. Aturan: AGENTS.md "Images".`);
    process.exit(1);
  }
  console.log(`✓ check-images: ${images} gambar di ${html.length} halaman ber-ALT dan WebP/SVG; sumber gambar WebP.`);
}
