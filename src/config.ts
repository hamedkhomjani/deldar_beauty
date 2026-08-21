/**
 * Single source of truth for all salon business data.
 * EDIT THIS FILE when phone/address/handles/bank details change.
 * User-facing strings are bilingual ({ fa, en }) — see src/i18n/index.ts.
 */
import type { Localized } from './i18n';

export const SITE = {
  name: 'سالن زیبایی دلدار',
  nameEn: 'Deldar Beauty Salon',
  base: import.meta.env.BASE_URL ?? '/',
  /** Absolute URL of the live site */
  url: 'https://hamedkhomjani.github.io/deldar_beauty/',
  themeColor: '#fdfaf5',
};

export const SALON = {
  /** WhatsApp number in international format (no +) */
  whatsapp: '989123456789',
  telegram: 'deldar_beauty',
  instagram: 'deldarhaircutt',
  phoneDisplay: {
    fa: '۰۲۱-۱۲۳۴۵۶۷۸ | ۰۹۱۲-۳۴۵۶۷۸۹',
    en: '021-12345678 | 0912-3456789',
  } satisfies Localized,
  address: {
    fa: 'تهران، خیابان ظفر، پلاک ۱۲۳، واحد ۵',
    en: 'Tehran, Zafar St., No. 123, Unit 5',
  } satisfies Localized,
  /** Keep the phone field of schema.org in sync with whatsapp */
  schemaPhone: '+989123456789',
  /** Hours shown on the site */
  hoursDisplay: {
    fa: 'شنبه تا پنجشنبه: ۱۰:۰۰ الی ۱۹:۰۰',
    en: 'Saturday to Thursday: 10:00 – 19:00',
  } satisfies Localized,
};

export const BANK = {
  /** Card-to-card payment details (placeholder – replace with real numbers) */
  card: {
    fa: '۶۰۳۷-۷۵۷۲-۱۲۳۴-۵۶۷۸',
    en: '6037-7572-1234-5678',
  } satisfies Localized,
  sheba: {
    fa: 'IR۱۲-۰۱۵۰-۰۰۰۰-۰۰۰۰-۰۰۰۰-۰۰۰۰-۰۱',
    en: 'IR12-0150-0000-0000-0000-0000-01',
  } satisfies Localized,
};

export const NAV_LINKS = [
  { href: '/', label: { fa: 'خانه', en: 'Home' } },
  { href: '/about', label: { fa: 'درباره ما', en: 'About Us' } },
  { href: '/shop', label: { fa: 'فروشگاه', en: 'Shop' } },
  { href: '/#services', label: { fa: 'خدمات ما', en: 'Our Services' } },
  { href: '/#consultation', label: { fa: 'مشاوره تخصصی', en: 'Consultation' } },
  { href: '/#contact', label: { fa: 'تماس با ما', en: 'Contact Us' } },
] as const satisfies readonly { href: string; label: Localized }[];

/** Icon key matches the <svg> map in Footer.astro */
export const SOCIAL_LINKS = [
  { label: 'Instagram', icon: 'instagram', href: `https://instagram.com/${SALON.instagram}` },
  { label: 'Telegram', icon: 'telegram', href: `https://t.me/${SALON.telegram}` },
  { label: 'WhatsApp', icon: 'whatsapp', href: `https://wa.me/${SALON.whatsapp}` },
] as const;

/**
 * Build a site-relative URL that works under the GitHub Pages subpath.
 * Usage: asset('assets/images/logo.svg') → "/deldar_beauty/assets/images/logo.svg"
 */
export function asset(path: string): string {
  const base = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}

/**
 * Build a link to an internal page (or home-page anchor), base-aware.
 * Usage: pageUrl('/about'), pageUrl('/#services'), pageUrl('/')
 */
export function pageUrl(path: string): string {
  const base = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}
