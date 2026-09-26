// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Logical routes excluded from the sitemap (they are robots noindex too).
// Matching strips the base path and the optional /en/ language prefix.
const NOINDEX_ROUTES = ['/admin', '/checkout', '/booking/success'];

/**
 * Deployment target, so one source tree builds for both hosts:
 *   - SITE_BASE → `base` config → import.meta.env.BASE_URL, used by
 *     asset()/pageUrl() in src/config.ts. Netlify serves from the domain root,
 *     GitHub Pages from a /deldar_beauty/ subpath.
 *   - SITE_URL / URL → `site` config (origin only, no base). Netlify exposes the
 *     site domain as $URL automatically, so Netlify needs no extra setup.
 * PUBLIC_SITE_URL is then derived for src/config.ts, where absolute URLs must
 * include the base (SITE.url + '/en/about').
 */
const BASE = process.env.SITE_BASE ?? '/deldar_beauty/';
const ORIGIN = (process.env.SITE_URL ?? process.env.URL ?? 'https://hamedkhomjani.github.io').replace(/\/$/, '');
process.env.PUBLIC_SITE_URL ??= `${ORIGIN}${BASE === '/' ? '' : BASE}`;

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
  site: ORIGIN,
  base: BASE,
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