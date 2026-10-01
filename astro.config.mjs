// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Pre-build article and page lastmod lookup and draft filter (DESIGN §4.4.8, DEC-023, DEC-025)
const lastmodMap = new Map();
const draftSet = new Set();
try {
  let maxArticleDate = new Date('2026-09-30');
  const topicLatest = new Map();
  const commodityLatest = new Map();

  /** @type {Record<string, string>} */
  const catToTopic = {
    'Hama & Proteksi Tanaman': 'proteksi-tanaman',
    'Perkebunan & Patologi Tanaman': 'proteksi-tanaman',
    'Patologi Tanaman & Hortikultura': 'proteksi-tanaman',
    'Ilmu Tanah & Kesuburan Lahan': 'tanah-nutrisi',
    'Nutrisi Tanaman, Pupuk & Biostimulan': 'tanah-nutrisi',
    'Cairan Nutrisi Organik': 'tanah-nutrisi',
    'Teknik Budidaya & Manajemen Lahan': 'budidaya',
    'Tanaman Pangan & Budidaya Padi': 'budidaya',
    'Urban Farming & Hidroponik': 'budidaya',
    'Fisiologi & Anatomi Tumbuhan': 'sains-tanaman',
    'Fisiologi Tanaman & Perawatan': 'sains-tanaman',
  };

  const articlesDir = path.resolve('docs/content/articles');
  if (fs.existsSync(articlesDir)) {
    for (const f of fs.readdirSync(articlesDir)) {
      if (f.endsWith('.md')) {
        const content = fs.readFileSync(path.join(articlesDir, f), 'utf-8');
        const slugMatch = content.match(/^slug:\s*['"]?([a-z0-9-]+)['"]?/m);
        const slug = slugMatch ? slugMatch[1] : f.replace(/\.md$/, '');
        const isDraft = /^draft:\s*true/m.test(content);
        if (isDraft) {
          draftSet.add(`/jurnal/${slug}/`);
          continue;
        }
        const pubMatch = content.match(/^pubDate:\s*['"]?([0-9T:.-]+)['"]?/m);
        const updMatch = content.match(/^updatedDate:\s*['"]?([0-9T:.-]+)['"]?/m);
        const catMatch = content.match(/^category:\s*['"]?(.*?)['"]?$/m);
        const commMatch = content.match(/^commodities:\s*\[(.*?)\]/m);

        const dStr = updMatch ? updMatch[1] : (pubMatch ? pubMatch[1] : null);
        if (dStr) {
          const d = new Date(dStr);
          lastmodMap.set(`/jurnal/${slug}/`, d);
          if (d > maxArticleDate) maxArticleDate = d;

          if (catMatch && catToTopic[catMatch[1].trim()]) {
            const t = catToTopic[catMatch[1].trim()];
            if (!topicLatest.has(t) || d > topicLatest.get(t)) topicLatest.set(t, d);
          }

          if (commMatch) {
            const comms = commMatch[1].split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, ''));
            for (const c of comms) {
              if (c && (!commodityLatest.has(c) || d > commodityLatest.get(c))) {
                commodityLatest.set(c, d);
              }
            }
          }
        }
      }
    }
  }

  // Jurnal hub & pagination
  lastmodMap.set('/jurnal/', maxArticleDate);
  for (let i = 2; i <= 20; i++) {
    lastmodMap.set(`/jurnal/halaman/${i}/`, maxArticleDate);
  }

  // Topics
  for (const t of ['air-irigasi', 'budidaya', 'pascapanen-agribisnis', 'proteksi-tanaman', 'sains-tanaman', 'tanah-nutrisi']) {
    lastmodMap.set(`/jurnal/topik/${t}/`, topicLatest.get(t) || maxArticleDate);
  }

  // Commodities
  const commFile = path.resolve('src/data/commodities.json');
  if (fs.existsSync(commFile)) {
    const comms = JSON.parse(fs.readFileSync(commFile, 'utf8'));
    for (const c of comms) {
      lastmodMap.set(`/jurnal/komoditas/${c.id}/`, commodityLatest.get(c.id) || maxArticleDate);
    }
  }

  // Products (verified 2026-09-30)
  lastmodMap.set('/produk/', new Date('2026-09-30'));
  for (const p of ['aussie', 'bensu', 'kojien', 'saratoga']) {
    lastmodMap.set(`/produk/${p}/`, new Date('2026-09-30'));
  }

  // Tools (reviewed 2026-09-30)
  lastmodMap.set('/alat/', new Date('2026-09-30'));
  for (const a of ['cuaca-tani', 'diagnosa-gejala', 'kalender-tanam', 'kalkulator-dosis']) {
    lastmodMap.set(`/alat/${a}/`, new Date('2026-09-30'));
  }

  // Pages
  lastmodMap.set('/', new Date('2026-10-01'));
  lastmodMap.set('/tentang-kami/', new Date('2026-10-01'));
  lastmodMap.set('/kemitraan-distributor/', new Date('2026-09-30'));
  lastmodMap.set('/konsultasi/', new Date('2026-09-30'));
  lastmodMap.set('/kebijakan-privasi/', new Date('2026-09-30'));
  lastmodMap.set('/penulis/arif-prabowo/', new Date('2026-09-30'));
} catch {
  // Silent fallback
}

// https://astro.build/config
export default defineConfig({
  site: 'https://agritani.com',
  trailingSlash: 'always',
  devToolbar: {
    enabled: false,
  },
  server: {
    host: true,
    port: 4321,
  },
  build: {
    format: 'directory',
    inlineStylesheets: 'never',
  },
  markdown: {
    syntaxHighlight: false,
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [[rehypeKatex, { output: 'mathml' }]],
    }),
  },
  integrations: [
    sitemap({
      filter: (page) => {
        try {
          const url = new URL(page);
          const p = url.pathname;
          // Dev specimens and drafts never ship. Everything else is listed exactly when the built page is
          // indexable: /cari/, 404 and tag archives under TAG_INDEX_MIN carry noindex (DEC-023, DEC-025).
          if (p.includes('/cari') || p.includes('/404') || p.includes('/spesimen') || draftSet.has(p)) {
            return false;
          }
          const html = path.resolve('dist', `.${p}`, 'index.html');
          return !(fs.existsSync(html) && /<meta name="robots" content="noindex/.test(fs.readFileSync(html, 'utf-8')));
        } catch {
          return true;
        }
      },
      // One sitemap per page type (owner 2026-09-30): sitemap-{key}-0.xml; everything else lands in sitemap-pages-0.xml.
      chunks: {
        jurnal: (item) => (/^\/jurnal\/(?:$|halaman\/|(?!topik\/|komoditas\/|tag\/)[^/]+\/$)/.test(new URL(item.url).pathname) ? item : undefined),
        topik: (item) => (new URL(item.url).pathname.startsWith('/jurnal/topik/') ? item : undefined),
        komoditas: (item) => (new URL(item.url).pathname.startsWith('/jurnal/komoditas/') ? item : undefined),
        tag: (item) => (new URL(item.url).pathname.startsWith('/jurnal/tag/') ? item : undefined),
        produk: (item) => (new URL(item.url).pathname.startsWith('/produk/') ? item : undefined),
        alat: (item) => (new URL(item.url).pathname.startsWith('/alat/') ? item : undefined),
      },
      serialize: (item) => {
        // Remove priority & changefreq (ignored by modern search engines per Google docs)
        delete item.priority;
        delete item.changefreq;

        try {
          const url = new URL(item.url);
          const p = url.pathname;
          if (lastmodMap.has(p)) {
            item.lastmod = lastmodMap.get(p);
          } else {
            // Halaman tanpa tanggal perubahan bermakna tidak diberi lastmod (DESIGN §4.4.8)
            delete item.lastmod;
          }
        } catch {
          delete item.lastmod;
        }
        return item;
      },
    }),
    {
      name: 'dev-spesimen',
      hooks: {
        'astro:config:setup': ({ command, injectRoute }) => {
          if (command === 'dev') {
            injectRoute({
              pattern: '/spesimen',
              entrypoint: './src/dev/spesimen.astro',
            });
          }
        },
      },
    },
    {
      name: 'csp-table-align-converter',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          const distDir = fileURLToPath(dir);
          /** @param {string} current */
          function walkAndConvert(current) {
            if (!fs.existsSync(current)) return;
            for (const item of fs.readdirSync(current)) {
              const full = path.join(current, item);
              if (fs.statSync(full).isDirectory()) {
                walkAndConvert(full);
              } else if (full.endsWith('.html')) {
                let html = fs.readFileSync(full, 'utf8');
                let changed = false;
                if (html.includes('style=')) {
                  // Convert text-align inline styles on th/td from markdown tables to Tailwind classes (AGENTS.md, ARCHITECTURE §5)
                  html = html.replace(/<(th|td)\b([^>]*?)style=["']([^"']*?)["']([^>]*?)>/gi, (_match, tag, before, styleVal, after) => {
                    let alignClass = '';
                    if (/text-align:\s*left/i.test(styleVal)) alignClass = 'text-left';
                    else if (/text-align:\s*center/i.test(styleVal)) alignClass = 'text-center';
                    else if (/text-align:\s*right/i.test(styleVal)) alignClass = 'text-right';

                    const cleanedStyle = styleVal
                      .replace(/text-align:\s*(left|center|right);?/gi, '')
                      .trim();

                    let combinedAttrs = `${before} ${after}`.trim();
                    if (cleanedStyle) {
                      combinedAttrs += ` style="${cleanedStyle}"`;
                    }

                    if (alignClass) {
                      if (/class=["']([^"']*)["']/i.test(combinedAttrs)) {
                        combinedAttrs = combinedAttrs.replace(/class=["']([^"']*)["']/i, (_m, existing) => `class="${existing} ${alignClass}"`);
                      } else {
                        combinedAttrs = `class="${alignClass}" ${combinedAttrs}`.trim();
                      }
                    }

                    return `<${tag} ${combinedAttrs}>`.replace(/\s+/g, ' ').replace(' >', '>');
                  });

                  // Strip any remaining inline style attributes (e.g. from KaTeX error spans) to ensure strict CSP
                  html = html.replace(/\sstyle=["'][^"']*["']/gi, '');
                  changed = true;
                }

                // Convert markdown blockquote admonitions (> [!NOTE]) into editorial callout panels
                if (/\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i.test(html)) {
                  html = html.replace(/<blockquote>\s*<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*([\s\S]*?)<\/p>/gi, (_match, kind, title) => {
                    const k = kind.toLowerCase();
                    /** @type {Record<string, string>} */
                    const labelMap = {
                      note: 'Catatan Lapangan',
                      tip: 'Tips Agronomi',
                      important: 'Penting Diperhatikan',
                      warning: 'Peringatan Hama',
                      caution: 'Perhatian Khusus',
                    };
                    const label = labelMap[k] || 'Catatan Lapangan';
                    const titleHtml = title.trim() ? `<p class="callout-title font-semibold text-[var(--color-text)] mb-2">${title.trim()}</p>` : '';
                    return `<blockquote class="callout callout-${k}"><div class="callout-badge"><span class="callout-dot"></span><span>${label}</span></div>${titleHtml}`;
                  });
                  changed = true;
                }

                if (changed) {
                  fs.writeFileSync(full, html, 'utf8');
                }
              }
            }
          }
          walkAndConvert(distDir);

          // /sitemap.xml = the sitemap index (robots.txt points here); sitemap-index.xml stays for older references.
          const sitemapIndex = path.join(distDir, 'sitemap-index.xml');
          if (fs.existsSync(sitemapIndex)) fs.copyFileSync(sitemapIndex, path.join(distDir, 'sitemap.xml'));

          // Normalize and format all XML sitemaps to ensure pristine standard Google XML parsing
          const sitemapFiles = fs.readdirSync(distDir).filter((f) => f.startsWith('sitemap') && f.endsWith('.xml'));
          for (const sFile of sitemapFiles) {
            const xmlFilePath = path.join(distDir, sFile);
            const rawContent = fs.readFileSync(xmlFilePath, 'utf8');

            const isIndex = sFile === 'sitemap.xml' || sFile === 'sitemap-index.xml';
            let formattedXml = '';

            if (isIndex) {
              const sitemaps = [...rawContent.matchAll(/<sitemap>[\s\S]*?<\/sitemap>/g)].map((m) => {
                const loc = m[0].match(/<loc>(.*?)<\/loc>/)?.[1] || '';
                const lastmod = m[0].match(/<lastmod>(.*?)<\/lastmod>/)?.[1] || '';
                let block = `  <sitemap>\n    <loc>${loc}</loc>`;
                if (lastmod) block += `\n    <lastmod>${lastmod}</lastmod>`;
                block += `\n  </sitemap>`;
                return block;
              });
              formattedXml = [
                '<?xml version="1.0" encoding="UTF-8"?>',
                '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>',
                '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
                ...sitemaps,
                '</sitemapindex>',
                '',
              ].join('\n');
            } else {
              const rootOpen =
                rawContent.match(/<urlset[^>]*>/)?.[0] ||
                '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
              const urls = [...rawContent.matchAll(/<url>[\s\S]*?<\/url>/g)].map((m) => {
                const loc = m[0].match(/<loc>(.*?)<\/loc>/)?.[1] || '';
                const lastmod = m[0].match(/<lastmod>(.*?)<\/lastmod>/)?.[1] || '';
                let block = `  <url>\n    <loc>${loc}</loc>`;
                if (lastmod) block += `\n    <lastmod>${lastmod}</lastmod>`;
                block += `\n  </url>`;
                return block;
              });
              formattedXml = [
                '<?xml version="1.0" encoding="UTF-8"?>',
                '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>',
                rootOpen,
                ...urls,
                '</urlset>',
                '',
              ].join('\n');
            }

            fs.writeFileSync(xmlFilePath, formattedXml, 'utf8');
          }

          // Ensure /404/ directory index also exists alongside 404.html
          const html404 = path.join(distDir, '404.html');
          if (fs.existsSync(html404)) {
            const dir404 = path.join(distDir, '404');
            if (!fs.existsSync(dir404)) fs.mkdirSync(dir404, { recursive: true });
            fs.copyFileSync(html404, path.join(dir404, 'index.html'));
          }
        },
      },
    },
  ],
  vite: {
    plugins: [
      tailwindcss(),
      {
        name: 'vite-trailing-slash-redirect',
        /** @param {any} server */
        configureServer(server) {
          return () => {
            server.middlewares.stack.unshift({
              route: '',
              /**
               * @param {any} req
               * @param {any} res
               * @param {any} next
               */
              handle: (req, res, next) => {
                if (!req.url) return next();
                const [pathname, search] = req.url.split('?');

                // Serve sitemaps directly in dev mode from dist
                if (pathname.startsWith('/sitemap') && pathname.endsWith('.xml')) {
                  const xmlName = pathname.slice(1);
                  const distXml = path.join(process.cwd(), 'dist', xmlName);
                  if (fs.existsSync(distXml)) {
                    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
                    res.end(fs.readFileSync(distXml, 'utf8'));
                    return;
                  }
                }
                if (
                  pathname.startsWith('/@') ||
                  pathname.startsWith('/_astro') ||
                  pathname.startsWith('/node_modules') ||
                  pathname.startsWith('/favicon') ||
                  pathname.includes('.')
                ) {
                  return next();
                }
                if (!pathname.endsWith('/')) {
                  const target = `${pathname}/${search ? '?' + search : ''}`;
                  res.writeHead(302, { Location: target });
                  res.end();
                  return;
                }
                next();
              },
            });
          };
        },
      },
    ],
    server: {
      host: true,
      allowedHosts: true,
    },
    build: {
      assetsInlineLimit: 0,
    },
  },
});
