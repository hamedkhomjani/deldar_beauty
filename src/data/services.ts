/**
 * Salon services — single source of truth.
 * Used by: service cards, booking form select, OfferCatalog JSON-LD.
 * Text fields are bilingual ({ fa, en }) — see src/i18n/index.ts.
 */
import type { Localized } from '../i18n';

export interface Service {
  name: Localized;
  description: Localized;
  /** icon key for the <svg> map in ServiceIcon.astro */
  icon: string;
}

export const SERVICES: Service[] = [
  {
    name: { fa: 'کوتاهی و استایل مو', en: 'Haircut & Styling' },
    description: {
      fa: 'خلق فرم‌های مدرن و کلاسیک متناسب با چهره شما توسط اساتید مجرب.',
      en: 'Modern and classic cuts tailored to your face, created by experienced stylists.',
    },
    icon: 'scissors',
  },
  {
    name: { fa: 'براشینگ و شینیون', en: 'Blow-dry & Updo' },
    description: {
      fa: 'استایل‌های ماندگار و جذاب برای درخشش شما در مهمانی‌ها و مراسم‌های خاص.',
      en: 'Long-lasting, glamorous styles to make you shine at parties and special occasions.',
    },
    icon: 'brush',
  },
  {
    name: { fa: 'مراقبت‌های تخصصی', en: 'Specialized Treatments' },
    description: {
      fa: 'درمان‌های کراتینه، پروتئین‌تراپی و پکیج‌های احیای سلامت مو.',
      en: 'Keratin treatments, protein therapy and hair-health restoration packages.',
    },
    icon: 'care',
  },
  {
    name: { fa: 'رنگ و لایت', en: 'Color & Highlights' },
    description: {
      fa: 'انواع رنگ، مش، بالیاژ و لایت‌های مدرن با فرمول‌های برندهای معتبر جهانی و رنگ‌شناسان حرفه‌ای.',
      en: 'All kinds of color, highlights, balayage and modern looks using world-renowned brands and professional colorists.',
    },
    icon: 'color',
  },
  {
    name: { fa: 'کاشت ناخن', en: 'Nail Extensions' },
    description: {
      fa: 'کاشت ژلیش و پودر، طراحی‌های مینیمال و فانتزی با دوام بالا و رعایت کامل بهداشت.',
      en: 'Gel and powder extensions, minimal and fantasy nail art with long durability and full hygiene.',
    },
    icon: 'nails',
  },
  {
    name: { fa: 'میکاپ و آرایش عروس', en: 'Makeup & Bridal' },
    description: {
      fa: 'آرایش حرفه‌ای عروس و مهمانی با جدیدترین تکنیک‌های روز و تریال قبل از مراسم.',
      en: 'Professional bridal and party makeup with the latest techniques and a trial session before the event.',
    },
    icon: 'makeup',
  },
] as const;

/** Options shown in the booking form select, per language */
export function bookingServiceNames(lang: 'fa' | 'en'): string[] {
  return SERVICES.map((s) => s.name[lang]);
}
