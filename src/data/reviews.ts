/**
 * Client reviews shown in the homepage reviews section.
 * NOTE: replace these placeholder entries with genuine client quotes
 * collected from Google Maps / Neshan / Instagram before going live.
 */
import type { Localized } from '../i18n';

export interface Review {
  name: Localized;
  service: Localized;
  rating: 4 | 5;
  text: Localized;
}

/** Aggregate figures used in the LocalBusiness JSON-LD */
export const REVIEWS_AGGREGATE = {
  ratingValue: '4.9',
  reviewCount: 312,
  bestRating: '5',
} as const;

export const REVIEWS: Review[] = [
  {
    name: { fa: 'نگار محمدی', en: 'Negar Mohammadi' },
    service: { fa: 'آرایش عروس', en: 'Bridal Makeup' },
    rating: 5,
    text: {
      fa: 'برای عروسی‌ام گریم شدم. دقیقاً همون چیزی شد که تو ذهنم بود؛ آرایشگر با حوصله همه مراحل رو توضیح داد و میکاپ تا آخر شب تاب بود.',
      en: 'They did my makeup for my wedding day. It turned out exactly as I had imagined — the artist patiently explained every step and it lasted all night.',
    },
  },
  {
    name: { fa: 'سارا احمدی', en: 'Sara Ahmadi' },
    service: { fa: 'رنگ و لایت مو', en: 'Color & Highlights' },
    rating: 5,
    text: {
      fa: 'اولین باره رنگمو جایی غیر از اینجا انجام نمیدم. لایت‌ها طبیعی و سالم دراومدن و موهام آسیب ندید. مشاوره قبل از کار هم عالی بود.',
      en: 'I would never get my color done anywhere else now. The highlights came out natural and healthy with no damage, and the pre-service consultation was excellent.',
    },
  },
  {
    name: { fa: 'مریم رضایی', en: 'Maryam Rezaei' },
    service: { fa: 'کاشت ناخن', en: 'Nail Extensions' },
    rating: 5,
    text: {
      fa: 'کاشت ناخنم سه هفته تمیز موند بدون هیچ بلندشدگی. محیط سالن هم خیلی شیک و بهداشتیه، دقیقاً سر وقت نوبتم رسید.',
      en: 'My extensions stayed flawless for three weeks with zero lifting. The salon is elegant and hygienic, and my appointment started right on time.',
    },
  },
  {
    name: { fa: 'الهام کریمی', en: 'Elham Karimi' },
    service: { fa: 'پاکسازی پوست', en: 'Skin Cleansing' },
    rating: 5,
    text: {
      fa: 'پوستم بعد از پاکسازی واقعاً فرق کرده. متخصص پوست قبل از شروع پوستم رو بررسی کرد و محصولات مناسب پیشنهاد داد، نه اینکه فقط بخوره فروخت.',
      en: 'My skin genuinely changed after the cleansing facial. The specialist examined my skin first and recommended suitable products instead of just pushing a sale.',
    },
  },
  {
    name: { fa: 'شقایق موسوی', en: 'Shaghayegh Mousavi' },
    service: { fa: 'اصلاح و کوتاهی مو', en: 'Haircut & Styling' },
    rating: 4,
    text: {
      fa: 'کوتاهی مو عالی بود و مدل چهره‌ام رو کاملاً در نظر گرفتن. فقط روزهای شلوغ کمی معطل شدم؛ ولی کیفیت کار ارزشش رو داشت.',
      en: 'The cut is excellent — they really considered my face shape. It was slightly busy on a crowded day, but the quality of work was worth it.',
    },
  },
  {
    name: { fa: 'پریسا نادری', en: 'Parisa Naderi' },
    service: { fa: 'ریلکس و ترمیم مو', en: 'Hair Relaxer & Repair' },
    rating: 5,
    text: {
      fa: 'موهام که رنگ و دکلره زیاد خورده بود، بعد از پروتئین‌تراپی دلدار جان گرفت. برخورد پرسنل هم صمیمی و محترمانه بود. قطعاً برمی‌گردم.',
      en: 'My over-processed hair came back to life after Deldar\'s protein treatment. The staff were warm and respectful throughout. I will definitely return.',
    },
  },
];
