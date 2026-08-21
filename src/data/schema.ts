/**
 * Structured data (schema.org) builders.
 * Every function returns a plain object that pages inject as JSON-LD.
 * Builders take a `lang` so text matches the page locale.
 */
import { SITE, SALON } from '../config';
import type { Lang } from '../i18n';
import type { Product } from './products';
import { tomanToRial } from './products';
import type { Service } from './services';
import type { Faq } from './faq';

export function abs(url: string): string {
  return url.startsWith('http') ? url : SITE.url.replace(/\/$/, '') + url;
}

/** Absolute URL of a site-relative path in the given language */
function langUrl(path: string, lang: Lang): string {
  return abs(lang === 'en' ? `/en${path === '/' ? '/' : path}` : path);
}

const COPY = {
  salonDescription: {
    fa: 'سالن زیبایی زنانه در تهران با خدمات آرایش عروس، رنگ و لایت، کاشت ناخن و مراقبت از پوست و مو.',
    en: "A women's beauty salon in Tehran offering bridal makeup, coloring and highlights, nail extensions and skin & hair care.",
  },
  streetAddress: {
    fa: 'خیابان ظفر، پلاک ۱۲۳، واحد ۵',
    en: 'Zafar St., No. 123, Unit 5',
  },
  addressLocality: { fa: 'تهران', en: 'Tehran' },
  catalogName: { fa: 'خدمات سالن زیبایی دلدار', en: 'Deldar Beauty Salon Services' },
  brandName: { fa: 'دلدار', en: 'Deldar' },
  productListName: { fa: 'محصولات فروشگاه سالن زیبایی دلدار', en: 'Deldar Beauty Salon Shop Products' },
  aboutName: { fa: 'درباره ما', en: 'About Us' },
  aboutDescription: {
    fa: 'داستان، اهداف و تیم متخصص سالن زیبایی دلدار در تهران.',
    en: 'The story, goals and expert team of Deldar Beauty Salon in Tehran.',
  },
  home: { fa: 'خانه', en: 'Home' },
} as const;

/** LocalBusiness (BeautySalon) — homepage */
export function beautySalonSchema(services: Service[], lang: Lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    '@id': `${SITE.url}#salon`,
    name: SITE.name,
    alternateName: SITE.nameEn,
    description: COPY.salonDescription[lang],
    image: abs('/assets/images/og-image.png'),
    url: langUrl('/', lang),
    telephone: SALON.schemaPhone,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: COPY.streetAddress[lang],
      addressLocality: COPY.addressLocality[lang],
      postalCode: '1234567890',
      addressCountry: 'IR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 35.7812, longitude: 51.412 },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        opens: '10:00',
        closes: '19:00',
      },
    ],
    sameAs: [
      `https://instagram.com/${SALON.instagram}`,
      `https://t.me/${SALON.telegram}`,
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: COPY.catalogName[lang],
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.name[lang] },
      })),
    },
  };
}

export function webSiteSchema(lang: Lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}#website`,
    url: langUrl('/', lang),
    name: SITE.name,
    inLanguage: lang === 'en' ? 'en-US' : 'fa-IR',
    publisher: { '@id': `${SITE.url}#salon` },
  };
}

export function breadcrumbSchema(items: { name: string; item: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: abs(item.item),
    })),
  };
}

export function faqSchema(faqs: Faq[], lang: Lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question[lang],
      acceptedAnswer: { '@type': 'Answer', text: f.answer[lang] },
    })),
  };
}

export function productListSchema(products: Product[], lang: Lang, path = '/shop') {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: COPY.productListName[lang],
    url: langUrl(path, lang),
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.name[lang],
        image: abs(p.image),
        description: p.description[lang],
        brand: { '@type': 'Brand', name: COPY.brandName[lang] },
        offers: {
          '@type': 'Offer',
          price: tomanToRial(p.price),
          priceCurrency: 'IRR',
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  };
}

export function aboutPageSchema(lang: Lang) {
  const path = '/about';
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${langUrl(path, lang)}#page`,
    name: `${COPY.aboutName[lang]} | ${SITE.name}`,
    url: langUrl(path, lang),
    description: COPY.aboutDescription[lang],
    mainEntity: { '@type': 'BeautySalon', '@id': `${SITE.url}#salon`, name: SITE.name },
    breadcrumb: breadcrumbSchema([
      { name: COPY.home[lang], item: lang === 'en' ? '/en/' : '/' },
      { name: COPY.aboutName[lang], item: lang === 'en' ? '/en/about' : '/about' },
    ]),
  };
}
