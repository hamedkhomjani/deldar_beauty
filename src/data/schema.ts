/**
 * Structured data (schema.org) builders.
 * Every function returns a plain object that pages inject as JSON-LD.
 */
import { SITE, SALON } from '../config';
import type { Product } from './products';
import { tomanToRial } from './products';
import type { Service } from './services';
import type { Faq } from './faq';

export function abs(url: string): string {
  return url.startsWith('http') ? url : SITE.url.replace(/\/$/, '') + url;
}

/** LocalBusiness (BeautySalon) — homepage */
export function beautySalonSchema(services: Service[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    '@id': `${SITE.url}#salon`,
    name: SITE.name,
    alternateName: SITE.nameEn,
    description:
      'سالن زیبایی زنانه در تهران با خدمات آرایش عروس، رنگ و لایت، کاشت ناخن و مراقبت از پوست و مو.',
    image: abs('/assets/images/og-image.png'),
    url: SITE.url,
    telephone: SALON.schemaPhone,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'خیابان ظفر، پلاک ۱۲۳، واحد ۵',
      addressLocality: 'تهران',
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
      name: 'خدمات سالن زیبایی دلدار',
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.name },
      })),
    },
  };
}

export function webSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}#website`,
    url: SITE.url,
    name: SITE.name,
    inLanguage: 'fa-IR',
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

export function faqSchema(faqs: Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function productListSchema(products: Product[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'محصولات فروشگاه سالن زیبایی دلدار',
    url: abs('/shop'),
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        image: abs(p.image),
        description: p.description,
        brand: { '@type': 'Brand', name: 'دلدار' },
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

export function aboutPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${SITE.url}/about#page`,
    name: 'درباره ما | ' + SITE.name,
    url: SITE.url + 'about',
    description: 'داستان، اهداف و تیم متخصص ' + SITE.name + ' در تهران.',
    mainEntity: { '@type': 'BeautySalon', '@id': `${SITE.url}#salon`, name: SITE.name },
    breadcrumb: breadcrumbSchema([
      { name: 'خانه', item: '/' },
      { name: 'درباره ما', item: '/about' },
    ]),
  };
}
