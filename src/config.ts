/**
 * Single source of truth for all salon business data.
 * EDIT THIS FILE when phone/address/handles/bank details change.
 */

export const SITE = {
  name: 'سالن زیبایی دلدار',
  nameEn: 'Deldar Beauty Salon',
  base: import.meta.env.BASE_URL ?? '/',
  /** Absolute URL of the live site */
  url: 'https://hamedkhomjani.github.io/deldar_beauty/',
  locale: 'fa_IR',
  themeColor: '#fdfaf5',
};

export const SALON = {
  /** WhatsApp number in international format (no +) */
  whatsapp: '989123456789',
  telegram: 'deldar_beauty',
  instagram: 'deldar_beauty',
  phoneDisplay: '۰۲۱-۱۲۳۴۵۶۷۸ | ۰۹۱۲-۳۴۵۶۷۸۹',
  address: 'تهران، خیابان ظفر، پلاک ۱۲۳، واحد ۵',
  /** Keep the phone field of schema.org in sync with whatsapp */
  schemaPhone: '+989123456789',
  /** Hours shown on the site */
  hoursDisplay: 'شنبه تا پنجشنبه: ۱۰:۰۰ الی ۱۹:۰۰',
};

export const BANK = {
  /** Card-to-card payment details (placeholder – replace with real numbers) */
  card: '۶۰۳۷-۷۵۷۲-۱۲۳۴-۵۶۷۸',
  sheba: 'IR۱۲-۰۱۵۰-۰۰۰۰-۰۰۰۰-۰۰۰۰-۰۰۰۰-۰۱',
};

export const NAV_LINKS = [
  { href: '/', label: 'خانه' },
  { href: '/about', label: 'درباره ما' },
  { href: '/shop', label: 'فروشگاه' },
  { href: '/#services', label: 'خدمات ما' },
  { href: '/#consultation', label: 'مشاوره تخصصی' },
  { href: '/#contact', label: 'تماس با ما' },
] as const;

/** Icon key matches the <svg> map in Footer.astro */
export const SOCIAL_LINKS = [
  { label: 'Instagram', icon: 'instagram', href: `https://instagram.com/${SALON.instagram}` },
  { label: 'Telegram', icon: 'telegram', href: `https://t.me/${SALON.telegram}` },
  { label: 'WhatsApp', icon: 'whatsapp', href: `https://wa.me/${SALON.whatsapp}` },
] as const;

/**
 * Build a site-relative URL that works under the GitHub Pages subpath.
 * Usage: asset('assets/images/logo.webp') → "/deldar_beauty/assets/images/logo.webp"
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
