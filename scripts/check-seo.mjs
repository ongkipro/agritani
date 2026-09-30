#!/usr/bin/env node
/**
 * scripts/check-seo.mjs
 * Post-build dynamic SEO and schema integrity verifier (DESIGN §4.4.1 & §4.4.2)
 * Ensures:
 * - Exactly one <title>, <h1>, and canonical <link> per page
 * - Canonical is absolute https://agritani.com{path} with trailing slash and no query
 * - Unique titles and descriptions across indexed pages
 * - Valid and parseable JSON-LD @graph schema with stable @id
 * - No noindex pages in the sitemap (/sitemap.xml index and its chunks)
 * - Robots.txt references sitemap and disallows /cari/
 * - Apple touch icon and static OG images exist (< 150 KB)
 */

import fs from 'node:fs';

/** Decode the HTML entities Astro emits in <title> and meta content so lengths count visible characters. */
const decodeEntities = (t) =>
  t.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
import path from 'node:path';

const DIST_DIR = path.resolve('dist');

if (!fs.existsSync(DIST_DIR)) {
  console.error('Error: dist directory not found. Run astro build first.');
  process.exit(1);
}

let errors = [];
let warnings = [];

// 1. Check robots.txt
console.log('🔍 Checking robots.txt...');
const robotsPath = path.join(DIST_DIR, 'robots.txt');
if (!fs.existsSync(robotsPath)) {
  errors.push('dist/robots.txt does not exist.');
} else {
  const robotsContent = fs.readFileSync(robotsPath, 'utf-8');
  if (!robotsContent.includes('Sitemap: https://agritani.com/sitemap.xml')) {
    errors.push('dist/robots.txt must reference https://agritani.com/sitemap.xml');
  }
  if (!robotsContent.includes('Disallow: /cari/')) {
    errors.push('dist/robots.txt must contain Disallow: /cari/');
  }
}

// 2. Check apple-touch-icon.png and static OG images
console.log('🔍 Checking static SEO assets...');
const appleIconPath = path.join(DIST_DIR, 'apple-touch-icon.png');
if (!fs.existsSync(appleIconPath)) {
  errors.push('dist/apple-touch-icon.png is missing.');
} else {
  const stat = fs.statSync(appleIconPath);
  if (stat.size > 150 * 1024) {
    errors.push(`apple-touch-icon.png exceeds 150 KB (${Math.round(stat.size / 1024)} KB).`);
  }
}

const requiredOgImages = [
  'default.png',
  'jurnal.png',
  'topik-proteksi-tanaman.png',
  'topik-tanah-nutrisi.png',
  'topik-budidaya.png',
  'topik-air-irigasi.png',
  'topik-pascapanen-agribisnis.png',
  'topik-sains-tanaman.png',
  'komoditas.png',
  'alat-diagnosa-gejala.png',
  'alat-kalender-tanam.png',
  'alat-cuaca-tani.png',
  'alat-kalkulator-dosis.png',
  'produk.png',
];

for (const ogFile of requiredOgImages) {
  const ogPath = path.join(DIST_DIR, 'og', ogFile);
  if (!fs.existsSync(ogPath)) {
    errors.push(`Required OG image dist/og/${ogFile} is missing.`);
  } else {
    const stat = fs.statSync(ogPath);
    if (stat.size > 150 * 1024) {
      errors.push(`OG image ${ogFile} exceeds 150 KB limit (${Math.round(stat.size / 1024)} KB).`);
    }
  }
}

// 3. Load Sitemap URLs
console.log('🔍 Loading sitemap files...');
const sitemapUrls = new Set();
const sitemapIndexPath = path.join(DIST_DIR, 'sitemap.xml');

if (fs.existsSync(sitemapIndexPath)) {
  const indexContent = fs.readFileSync(sitemapIndexPath, 'utf-8');
  const sitemapMatches = indexContent.matchAll(/<loc>(.*?)<\/loc>/g);
  for (const m of sitemapMatches) {
    const subSitemapUrl = m[1];
    const subFilename = path.basename(new URL(subSitemapUrl).pathname);
    const subPath = path.join(DIST_DIR, subFilename);
    if (fs.existsSync(subPath)) {
      const subContent = fs.readFileSync(subPath, 'utf-8');
      const pageMatches = subContent.matchAll(/<loc>(.*?)<\/loc>/g);
      for (const p of pageMatches) {
        sitemapUrls.add(p[1]);
      }
    }
  }
} else {
  // If single sitemap-0.xml or sitemap.xml exists
  const altSitemap = path.join(DIST_DIR, 'sitemap-0.xml');
  if (fs.existsSync(altSitemap)) {
    const content = fs.readFileSync(altSitemap, 'utf-8');
    const matches = content.matchAll(/<loc>(.*?)<\/loc>/g);
    for (const m of matches) {
      sitemapUrls.add(m[1]);
    }
  }
}

// 4. Crawl all HTML files
console.log('🔍 Auditing HTML pages...');
function getAllHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllHtmlFiles(filePath));
    } else if (file.endsWith('.html')) {
      results.push(filePath);
    }
  }
  return results;
}

const htmlFiles = getAllHtmlFiles(DIST_DIR);
console.log(`Found ${htmlFiles.length} HTML files to verify.`);

const seenTitles = new Map();
const seenDescriptions = new Map();

for (const filePath of htmlFiles) {
  const relPath = path.relative(DIST_DIR, filePath);
  const content = fs.readFileSync(filePath, 'utf-8');

  // Skip dev spesimen if present
  if (relPath.includes('spesimen')) continue;

  const is404 = relPath === '404.html';

  // Check <html> lang attribute
  if (!/<html[^>]*\blang=["']id["']/i.test(content)) {
    errors.push(`[${relPath}] <html lang="id"> is missing.`);
  }

  // Check exactly one <title>
  const titleMatches = content.match(/<title[^>]*>(.*?)<\/title>/gis);
  if (!titleMatches || titleMatches.length === 0) {
    errors.push(`[${relPath}] Missing <title> tag.`);
  } else if (titleMatches.length > 1) {
    errors.push(`[${relPath}] Multiple (${titleMatches.length}) <title> tags found.`);
  } else {
    const titleText = decodeEntities(titleMatches[0].replace(/<[^>]+>/g, '').trim());
    if (!titleText) {
      errors.push(`[${relPath}] <title> is empty.`);
    } else {
      // Owner rule 2026-09-30: <title> 55–70 characters incl. spaces and " - Agritani"; separator "-", never "|" or "—".
      if (titleText.length < 55 || titleText.length > 70) {
        errors.push(`[${relPath}] <title> must be 55–70 chars (${titleText.length}): "${titleText}"`);
      }
      if (/[|—]/.test(titleText)) {
        errors.push(`[${relPath}] <title> must use " - " as separator, not "|" or "—": "${titleText}"`);
      }
    }

    // Check exactly one <h1> (except 404 can be evaluated normally)
    const h1Matches = content.match(/<h1\b[^>]*>(.*?)<\/h1>/gis);
    if (!h1Matches || h1Matches.length === 0) {
      errors.push(`[${relPath}] Missing <h1> element.`);
    } else if (h1Matches.length > 1) {
      errors.push(`[${relPath}] Multiple (${h1Matches.length}) <h1> elements found.`);
    }

    // Check exactly one canonical link
    const canonicalMatches = content.match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi);
    if (!canonicalMatches || canonicalMatches.length === 0) {
      errors.push(`[${relPath}] Missing canonical <link rel="canonical">.`);
    } else if (canonicalMatches.length > 1) {
      errors.push(`[${relPath}] Multiple (${canonicalMatches.length}) canonical links found.`);
    } else {
      const hrefMatch = canonicalMatches[0].match(/href=["'](.*?)["']/i);
      if (!hrefMatch || !hrefMatch[1]) {
        errors.push(`[${relPath}] Canonical tag missing href attribute.`);
      } else {
        const canonicalUrl = hrefMatch[1];
        if (!canonicalUrl.startsWith('https://agritani.com/')) {
          errors.push(`[${relPath}] Canonical URL must be absolute starting with https://agritani.com/ (got: ${canonicalUrl}).`);
        }
        if (!canonicalUrl.endsWith('/')) {
          errors.push(`[${relPath}] Canonical URL must end with trailing slash (got: ${canonicalUrl}).`);
        }
        if (canonicalUrl.includes('?') || canonicalUrl.includes('#')) {
          errors.push(`[${relPath}] Canonical URL must not contain query parameters or fragments (got: ${canonicalUrl}).`);
        }
      }
    }

    // Check meta description
    const descMatches = content.match(/<meta\b[^>]*\bname=["']description["'][^>]*>/gi);
    let descContent = '';
    if (!descMatches || descMatches.length === 0) {
      errors.push(`[${relPath}] Missing <meta name="description">.`);
    } else if (descMatches.length > 1) {
      errors.push(`[${relPath}] Multiple (${descMatches.length}) meta descriptions found.`);
    } else {
      const contentMatch = descMatches[0].match(/content=["'](.*?)["']/is);
      descContent = contentMatch ? decodeEntities(contentMatch[1].trim()) : '';
      if (!descContent) {
        errors.push(`[${relPath}] <meta name="description"> content is empty.`);
      } else if (descContent.length < 120 || descContent.length > 155) {
        // Owner rule 2026-09-30: meta description 120–155 characters incl. spaces.
        errors.push(`[${relPath}] Meta description must be 120–155 chars (${descContent.length}).`);
      }
    }

    // Check meta robots
    const robotsMatches = content.match(/<meta\b[^>]*\bname=["']robots["'][^>]*>/gi);
    let isNoindex = false;
    if (robotsMatches && robotsMatches.length > 0) {
      const rContent = robotsMatches[0].toLowerCase();
      if (rContent.includes('noindex')) {
        isNoindex = true;
      }
    }

    // Check og:image meta tag and verify asset existence on disk
    const ogImgMatches = content.match(/<meta\b[^>]*\bproperty=["']og:image["'][^>]*>/gi);
    if (ogImgMatches) {
      for (const m of ogImgMatches) {
        const cMatch = m.match(/content=["'](.*?)["']/is);
        if (cMatch && cMatch[1]) {
          const imgUrl = cMatch[1];
          if (imgUrl.startsWith('https://agritani.com/') || imgUrl.startsWith('/')) {
            const localPath = imgUrl.replace(/^https?:\/\/[^\/]+/, '');
            const distFilePath = path.join(DIST_DIR, localPath);
            const pubFilePath = path.join(path.resolve('public'), localPath);
            if (!fs.existsSync(distFilePath) && !fs.existsSync(pubFilePath)) {
              errors.push(`[${relPath}] og:image references non-existent file: ${imgUrl}`);
            }
          }
        }
      }
    }

    // Canonical link URL for sitemap matching
    const hrefMatch = canonicalMatches?.[0]?.match(/href=["'](.*?)["']/i);
    const pageCanonical = hrefMatch ? hrefMatch[1] : '';

    const isDraftPreview = process.env.PUBLIC_INCLUDE_DRAFTS === 'true';
    if (isNoindex) {
      // Must NOT be in sitemap on production build
      if (pageCanonical && sitemapUrls.has(pageCanonical)) {
        if (!isDraftPreview) {
          errors.push(`[${relPath}] Production error: Page is marked noindex but is present in sitemap: ${pageCanonical}`);
        } else {
          warnings.push(`[${relPath}] Draft preview note: Page is marked noindex but is present in sitemap: ${pageCanonical}`);
        }
      }
    } else {
      // Must be unique across indexable pages
      if (seenTitles.has(titleText)) {
        warnings.push(`[${relPath}] Duplicate <title> with [${seenTitles.get(titleText)}]: "${titleText}"`);
      } else {
        seenTitles.set(titleText, relPath);
      }

      if (descContent) {
        if (seenDescriptions.has(descContent)) {
          warnings.push(`[${relPath}] Duplicate description with [${seenDescriptions.get(descContent)}].`);
        } else {
          seenDescriptions.set(descContent, relPath);
        }
      }

      // Check sitemap inclusion
      if (pageCanonical && sitemapUrls.size > 0 && !sitemapUrls.has(pageCanonical)) {
        // Some generated sub-pages or draft preview may not be in production sitemap
        warnings.push(`[${relPath}] Canonical ${pageCanonical} not found in sitemap.`);
      }
    }

    // Check JSON-LD structured data
    const jsonLdMatches = content.match(/<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis);
    if (!jsonLdMatches || jsonLdMatches.length === 0) {
      if (!is404 && !isNoindex) {
        errors.push(`[${relPath}] Missing JSON-LD structured data.`);
      }
    } else {
      for (const match of jsonLdMatches) {
        const jsonText = match.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '').trim();
        try {
          const parsed = JSON.parse(jsonText);
          if (parsed['@context'] !== 'https://schema.org') {
            errors.push(`[${relPath}] JSON-LD @context must be "https://schema.org" (got: ${parsed['@context']}).`);
          }
          if (!Array.isArray(parsed['@graph'])) {
            errors.push(`[${relPath}] JSON-LD must contain an @graph array.`);
          } else {
            // Verify @id stability and @type presence
            for (const node of parsed['@graph']) {
              if (!node['@type']) {
                errors.push(`[${relPath}] JSON-LD @graph node missing @type.`);
              }
              if (!node['@id']) {
                errors.push(`[${relPath}] JSON-LD @graph node (${node['@type']}) missing stable @id.`);
              }

              // Verify any referenced images exist on disk
              if (node.image) {
                const images = Array.isArray(node.image) ? node.image : [node.image];
                for (const img of images) {
                  if (typeof img === 'string' && (img.startsWith('https://agritani.com/') || img.startsWith('/'))) {
                    const localPath = img.replace(/^https?:\/\/[^\/]+/, '');
                    const distFilePath = path.join(DIST_DIR, localPath);
                    const pubFilePath = path.join(path.resolve('public'), localPath);
                    if (!fs.existsSync(distFilePath) && !fs.existsSync(pubFilePath)) {
                      errors.push(`[${relPath}] JSON-LD ${node['@type']} image references non-existent file: ${img}`);
                    }
                  }
                }
              }
            }

            // If visible breadcrumb exists in DOM, verify BreadcrumbList exists in graph
            if (content.includes('aria-label="Breadcrumb"')) {
              const hasBreadcrumbList = parsed['@graph'].some((n) => n['@type'] === 'BreadcrumbList');
              if (!hasBreadcrumbList) {
                errors.push(`[${relPath}] Page has visible Breadcrumb navigation but missing BreadcrumbList in JSON-LD.`);
              }
            }
          }
        } catch (jsonErr) {
          errors.push(`[${relPath}] JSON-LD parsing failed: ${jsonErr.message}`);
        }
      }
    }
  }
}

console.log('\n--- SEO Audit Results ---');
console.log(`Audited: ${htmlFiles.length} HTML files`);
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);

if (warnings.length > 0) {
  console.log('\n⚠️ Warnings:');
  warnings.slice(0, 10).forEach((w) => console.log('  ' + w));
  if (warnings.length > 10) {
    console.log(`  ... and ${warnings.length - 10} more warnings.`);
  }
}

if (errors.length > 0) {
  console.error('\n❌ Failures:');
  errors.forEach((e) => console.error('  ' + e));
  process.exit(1);
} else {
  console.log('\n✅ All post-build SEO checks PASSED successfully!');
}
