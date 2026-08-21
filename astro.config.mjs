// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // The live site lives under this GitHub Pages subpath
  site: 'https://hamedkhomjani.github.io',
  base: '/deldar_beauty/',
  build: {
    format: 'directory',
  },
  // Persian (default) at the root, English under /en/
  i18n: {
    defaultLocale: 'fa',
    locales: ['fa', 'en'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
});