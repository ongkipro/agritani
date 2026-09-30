// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Pre-build article and page lastmod lookup and draft filter (DESIGN §4.4.8)
const lastmodMap = new Map();
const draftSet = new Set();
try {
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
        }
        const pubMatch = content.match(/^pubDate:\s*['"]?([0-9T:.-]+)['"]?/m);
        const updMatch = content.match(/^updatedDate:\s*['"]?([0-9T:.-]+)['"]?/m);
        const d = updMatch ? updMatch[1] : (pubMatch ? pubMatch[1] : null);
        if (d) {
          lastmodMap.set(`/jurnal/${slug}/`, new Date(d));
        }
      }
    }
  }
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
  },
  integrations: [
    sitemap({
      filter: (page) => {
        try {
          const url = new URL(page);
          const p = url.pathname;
          // Filter out noindex pages: /cari/, /404, /spesimen/, and drafts (DESIGN §4.4.8)
          // Tag archives stay out of the sitemap; thin ones are noindex (<3 articles), the rest are found via links.
          if (p.includes('/cari') || p.includes('/404') || p.includes('/spesimen') || p.startsWith('/jurnal/tag/') || draftSet.has(p)) {
            return false;
          }
          return true;
        } catch {
          return true;
        }
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
        },
      },
    },
  ],
  vite: {
    plugins: [tailwindcss()],
    server: {
      host: true,
      allowedHosts: true,
    },
    build: {
      assetsInlineLimit: 0,
    },
  },
});
