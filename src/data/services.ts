/**
 * Salon services — single source of truth.
 * Used by: service cards, booking form select, OfferCatalog JSON-LD.
 */

export interface Service {
  name: string;
  description: string;
  /** icon key for the <svg> map in ServiceIcon.astro */
  icon: string;
}

export const SERVICES: Service[] = [
  {
    name: 'کوتاهی و استایل مو',
    description: 'خلق فرم‌های مدرن و کلاسیک متناسب با چهره شما توسط اساتید مجرب.',
    icon: 'scissors',
  },
  {
    name: 'براشینگ و شینیون',
    description: 'استایل‌های ماندگار و جذاب برای درخشش شما در مهمانی‌ها و مراسم‌های خاص.',
    icon: 'brush',
  },
  {
    name: 'مراقبت‌های تخصصی',
    description: 'درمان‌های کراتینه، پروتئین‌تراپی و پکیج‌های احیای سلامت مو.',
    icon: 'care',
  },
  {
    name: 'رنگ و لایت',
    description: 'انواع رنگ، مش، بالیاژ و لایت‌های مدرن با فرمول‌های برندهای معتبر جهانی و رنگ‌شناسان حرفه‌ای.',
    icon: 'color',
  },
  {
    name: 'کاشت ناخن',
    description: 'کاشت ژلیش و پودر، طراحی‌های مینیمال و فانتزی با دوام بالا و رعایت کامل بهداشت.',
    icon: 'nails',
  },
  {
    name: 'میکاپ و آرایش عروس',
    description: 'آرایش حرفه‌ای عروس و مهمانی با جدیدترین تکنیک‌های روز و تریال قبل از مراسم.',
    icon: 'makeup',
  },
] as const;

/** Options shown in the booking form select */
export const BOOKING_SERVICE_NAMES = SERVICES.map((s) => s.name);
