// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Logical routes excluded from the sitemap (they are robots noindex too).
// Matching strips the base path and the optional /en/ language prefix.
const NOINDEX_ROUTES = ['/admin', '/checkout', '/booking/success'];

/**
 * @param {string} pathname
 */
function normalizedPath(pathname) {
  let p = pathname.replace(/^\/deldar_beauty/, '') || '/';
  p = p.replace(/^\/en(?=\/|$)/, '') || '/';
  p = p.replace(/\/$/, '') || '/';
  return p;
}

/** Build-time date — freshness signal for crawlers */
const BUILD_DATE = new Date().toISOString().split('T')[0];

/**
 * @param {string} path
 * @param {number} priority
 * @param {string} changefreq
 */
const SITEMAP_RULES = /** @type {Record<string, { priority: number; changefreq: string }>} */ ({
  '/': { priority: 1.0, changefreq: 'weekly' },
  '/shop': { priority: 0.9, changefreq: 'weekly' },
  '/booking': { priority: 0.9, changefreq: 'monthly' },
  '/about': { priority: 0.7, changefreq: 'monthly' },
  '/review': { priority: 0.6, changefreq: 'monthly' },
});

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
  integrations: [
    sitemap({
      filter: (page) => !NOINDEX_ROUTES.includes(normalizedPath(new URL(page).pathname)),
      i18n: {
        defaultLocale: 'fa',
        locales: {
          fa: 'fa-IR',
          en: 'en-US',
        },
      },
      serialize: (item) => {
        item.lastmod = BUILD_DATE;
        const rule = SITEMAP_RULES[normalizedPath(new URL(item.url).pathname)];
        if (rule) {
          item.changefreq = /** @type {any} */ (rule.changefreq);
          item.priority = rule.priority;
        }
        return item;
      },
    }),
  ],
});