// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

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
    sitemap(),
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
