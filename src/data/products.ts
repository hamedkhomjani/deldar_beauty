/**
 * Product catalog — single source of truth.
 * Used by: shop page cards, cart, Product JSON-LD (schema.ts).
 * Prices are in TOMAN (displayed on site); converted to IRR for schema.org.
 * Text fields are bilingual ({ fa, en }) — see src/i18n/index.ts.
 */
import type { Localized } from '../i18n';

export interface Product {
  id: string;
  name: Localized;
  category: Localized;
  /** Price in TOMAN */
  price: number;
  image: string;
  alt: Localized;
  description: Localized;
  badge?: Localized;
}

export const PRODUCTS: Product[] = [
  {
    id: 'hair-oil',
    name: { fa: 'روغن موی اکسیر طلایی', en: 'Golden Elixir Hair Oil' },
    category: { fa: 'مراقبت از مو', en: 'Hair Care' },
    price: 1_280_000,
    image: '/assets/images/product-hair-oil.png',
    alt: { fa: 'اکسیر موی طلایی', en: 'Golden hair elixir' },
    description: {
      fa: 'روغن موی گیاهی احیاکننده برای درخشش و تقویت موهای آسیب‌دیده.',
      en: 'Restoring herbal hair oil for shine and strengthening of damaged hair.',
    },
    badge: { fa: 'پرفروش', en: 'Bestseller' },
  },
  {
    id: 'skin-serum',
    name: { fa: 'سرم جوان‌ساز رادیانس', en: 'Radiance Anti-Aging Serum' },
    category: { fa: 'مراقبت از پوست', en: 'Skin Care' },
    price: 2_450_000,
    image: '/assets/images/product-skin-serum.png',
    alt: { fa: 'سرم جوان‌ساز صورت', en: 'Anti-aging face serum' },
    description: {
      fa: 'سرم مراقبت از پوست برای شفافیت و جوان‌سازی پوست صورت.',
      en: 'Skin-care serum for clarity and rejuvenation of facial skin.',
    },
  },
  {
    id: 'biotin-mask',
    name: { fa: 'ماسک احیاکننده بیوتین', en: 'Biotin Repair Mask' },
    category: { fa: 'مراقبت تخصصی', en: 'Specialized Care' },
    price: 950_000,
    image: '/assets/images/hair_tools_hands.webp',
    alt: { fa: 'ماسک موی پروتئین', en: 'Protein hair mask' },
    description: {
      fa: 'ماسک موی پروتئینی حاوی بیوتین برای ترمیم و نرمی مو.',
      en: 'Protein hair mask with biotin for repair and softness.',
    },
    badge: { fa: 'جدید', en: 'New' },
  },
  {
    id: 'luxury-gift-set',
    name: { fa: 'مجموعه لوکس مراقبتی', en: 'Luxury Care Set' },
    category: { fa: 'پکیج هدیه', en: 'Gift Set' },
    price: 4_800_000,
    image: '/assets/images/consultation.webp',
    alt: { fa: 'پک محصولات مراقبتی', en: 'Care products set' },
    description: {
      fa: 'پک هدیه لوکس محصولات مراقبت از پوست و مو برای هدیه‌ای خاص.',
      en: 'A luxury gift set of skin and hair care products for a special present.',
    },
  },
] as const;

/** schema.org requires IRR; 1 Toman = 10 Rial */
export function tomanToRial(toman: number): number {
  return toman * 10;
}
