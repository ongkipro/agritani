// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import fs from 'node:fs';
import path from 'node:path';

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
  build: {
    format: 'directory',
    inlineStylesheets: 'never',
  },
  integrations: [
    sitemap({
      filter: (page) => {
        try {
          const url = new URL(page);
          const p = url.pathname;
          // Filter out noindex pages: /cari/, /404, /spesimen/, and drafts (DESIGN §4.4.8)
          if (p.includes('/cari') || p.includes('/404') || p.includes('/spesimen') || draftSet.has(p)) {
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
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
