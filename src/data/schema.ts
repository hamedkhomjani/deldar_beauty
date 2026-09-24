/**
 * Structured data (schema.org) builders.
 * Every function returns a plain object that pages inject as JSON-LD.
 * Builders take a `lang` so text matches the page locale.
 */
import { SITE, SALON, GOOGLE_MAPS_DIRECTIONS_URL, NESHAN_DIRECTIONS_URL } from '../config';
import type { Lang } from '../i18n';
import type { Product } from './products';
import { tomanToRial } from './products';
import type { Service } from './services';
import type { Faq } from './faq';
import { REVIEWS, REVIEWS_AGGREGATE } from './reviews';

const MAP_LINKS = [GOOGLE_MAPS_DIRECTIONS_URL, NESHAN_DIRECTIONS_URL];

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
    image: [
      abs('/assets/images/og-image.png'),
      abs('/assets/images/hero.webp'),
      abs('/assets/images/consultation.webp'),
      abs('/assets/images/hair_tools_hands.webp'),
    ],
    logo: abs('/assets/images/logo.webp'),
    url: langUrl('/', lang),
    telephone: SALON.schemaPhone,
    priceRange: '$$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: COPY.streetAddress[lang],
      addressLocality: COPY.addressLocality[lang],
      addressRegion: 'تهران',
      postalCode: '1234567890',
      addressCountry: 'IR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: SALON.geo.lat, longitude: SALON.geo.lng },
    hasMap: MAP_LINKS,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SALON.schemaPhone,
      contactType: 'customer service',
      availableLanguage: ['fa-IR', 'en'],
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: REVIEWS_AGGREGATE.ratingValue,
      reviewCount: REVIEWS_AGGREGATE.reviewCount,
      bestRating: REVIEWS_AGGREGATE.bestRating,
      worstRating: '1',
    },
    review: REVIEWS.map((r, i) => ({
      '@type': 'Review',
      '@id': `${SITE.url}#review-${i + 1}`,
      author: { '@type': 'Person', name: r.name[lang] },
      datePublished: '2026-08-15',
      reviewBody: r.text[lang],
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1,
      },
      itemReviewed: { '@id': `${SITE.url}#salon` },
    })),
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
      `https://wa.me/${SALON.whatsapp}`,
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: COPY.catalogName[lang],
      url: langUrl('/#services', lang),
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: s.name[lang],
          url: langUrl('/#services', lang),
        },
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

export function webPageSchema(path: string, title: string, lang: Lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${langUrl(path, lang)}#webpage`,
    url: langUrl(path, lang),
    name: title,
    inLanguage: lang === 'en' ? 'en-US' : 'fa-IR',
    isPartOf: { '@id': `${SITE.url}#website` },
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
