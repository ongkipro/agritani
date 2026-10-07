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
  // Dates come only from data (DESIGN §4.4.8): article updatedDate/pubDate; hubs, home and author page = newest article
  // in them; products = the price check date shown on those pages. Pages without a meaningful change date get no lastmod.
  /** @type {Date | null} */
  let maxArticleDate = null;
  /** @type {Map<string, Date>} */
  const topicLatest = new Map();
  /** @type {Map<string, Date>} */
  const commodityLatest = new Map();
  /** @param {Map<string, Date>} map @param {string} key @param {Date} d */
  const later = (map, key, d) => {
    const prev = map.get(key);
    if (!prev || d > prev) map.set(key, d);
  };

  const articlesDir = path.resolve('docs/content/articles');
  if (fs.existsSync(articlesDir)) {
    for (const f of fs.readdirSync(articlesDir)) {
      if (!f.endsWith('.md')) continue;
      const content = fs.readFileSync(path.join(articlesDir, f), 'utf-8');
      const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
      const slug = fm.match(/^slug:\s*['"]?([a-z0-9-]+)['"]?/m)?.[1] ?? f.replace(/\.md$/, '');
      if (/^draft:\s*true/m.test(fm)) {
        draftSet.add(`/jurnal/${slug}/`);
        continue;
      }
      const dStr = fm.match(/^updatedDate:\s*['"]?([0-9T:.-]+)['"]?/m)?.[1] ?? fm.match(/^pubDate:\s*['"]?([0-9T:.-]+)['"]?/m)?.[1];
      if (!dStr) continue;
      const d = new Date(dStr);
      lastmodMap.set(`/jurnal/${slug}/`, d);
      if (!maxArticleDate || d > maxArticleDate) maxArticleDate = d;

      const topic = fm.match(/^topic:\s*['"]?([a-z0-9-]+)['"]?/m)?.[1];
      if (topic) later(topicLatest, topic, d);

      // commodities: inline `[a, b]` or a YAML block list (`- a` lines)
      const inline = fm.match(/^commodities:\s*\[(.*?)\]/m)?.[1];
      const block = fm.match(/^commodities:\s*\r?\n((?:[ \t]+-[^\n]*\r?\n?)+)/m)?.[1];
      const comms = inline !== undefined ? inline.split(',') : (block ?? '').split('\n').map((l) => l.replace(/^\s*-\s*/, ''));
      for (const c of comms.map((x) => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)) later(commodityLatest, c, d);
    }
  }

  if (maxArticleDate) {
    for (const p of ['/', '/jurnal/', '/penulis/arif-prabowo/']) lastmodMap.set(p, maxArticleDate);
    for (let i = 2; i <= 20; i++) lastmodMap.set(`/jurnal/halaman/${i}/`, maxArticleDate);
  }
  for (const [t, d] of topicLatest) lastmodMap.set(`/jurnal/topik/${t}/`, d);
  for (const [c, d] of commodityLatest) lastmodMap.set(`/jurnal/komoditas/${c}/`, d);

  // Products: price check date printed on /produk/ and each product page ("Harga per 30 September 2026")
  const priceChecked = new Date('2026-09-30');
  lastmodMap.set('/produk/', priceChecked);
  for (const p of ['aussie', 'bensu', 'kojien', 'saratoga']) lastmodMap.set(`/produk/${p}/`, priceChecked);
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
