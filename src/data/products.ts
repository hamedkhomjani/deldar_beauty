/**
 * Product catalog — single source of truth.
 * Used by: shop page cards, cart, Product JSON-LD (schema.ts).
 * Prices are in TOMAN (displayed on site); converted to IRR for schema.org.
 */

export interface Product {
  id: string;
  name: string;
  category: string;
  /** Price in TOMAN */
  price: number;
  image: string;
  alt: string;
  description: string;
  badge?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 'hair-oil',
    name: 'روغن موی اکسیر طلایی',
    category: 'مراقبت از مو',
    price: 1_280_000,
    image: '/assets/images/product-hair-oil.png',
    alt: 'اکسیر موی طلایی',
    description: 'روغن موی گیاهی احیاکننده برای درخشش و تقویت موهای آسیب‌دیده.',
    badge: 'پرفروش',
  },
  {
    id: 'skin-serum',
    name: 'سرم جوان‌ساز رادیانس',
    category: 'مراقبت از پوست',
    price: 2_450_000,
    image: '/assets/images/product-skin-serum.png',
    alt: 'سرم جوان‌ساز صورت',
    description: 'سرم مراقبت از پوست برای شفافیت و جوان‌سازی پوست صورت.',
  },
  {
    id: 'biotin-mask',
    name: 'ماسک احیاکننده بیوتین',
    category: 'مراقبت تخصصی',
    price: 950_000,
    image: '/assets/images/hair_tools_hands.webp',
    alt: 'ماسک موی پروتئین',
    description: 'ماسک موی پروتئینی حاوی بیوتین برای ترمیم و نرمی مو.',
    badge: 'جدید',
  },
  {
    id: 'luxury-gift-set',
    name: 'مجموعه لوکس مراقبتی',
    category: 'پکیج هدیه',
    price: 4_800_000,
    image: '/assets/images/consultation.webp',
    alt: 'پک محصولات مراقبتی',
    description: 'پک هدیه لوکس محصولات مراقبت از پوست و مو برای هدیه‌ای خاص.',
  },
] as const;

/** schema.org requires IRR; 1 Toman = 10 Rial */
export function tomanToRial(toman: number): number {
  return toman * 10;
}
