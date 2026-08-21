/**
 * i18n core — locales, bilingual field helpers, URL helpers and UI dictionaries.
 * Persian (fa) is the default locale at the root; English (en) lives under /en/.
 */

export type Lang = 'fa' | 'en';

export const LANGS: Lang[] = ['fa', 'en'];

/** A piece of content that exists in both languages */
export interface Localized {
  fa: string;
  en: string;
}

/** Pick the string for a language from a bilingual field */
export function pick(field: Localized, lang: Lang): string {
  return field[lang];
}

/** BCP47 / og:locale tags */
export const LOCALE_TAGS: Record<Lang, string> = {
  fa: 'fa_IR',
  en: 'en_US',
};

/**
 * Build a base-aware URL for an internal logical path in the given language.
 * Usage: localizedPath('/about', 'en') → "/deldar_beauty/en/about"
 *        localizedPath('/#services', 'fa') → "/deldar_beauty/#services"
 */
export function localizedPath(path: string, lang: Lang): string {
  const base = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  if (p === '/') return lang === 'en' ? `${base}/en/` : `${base}/`;
  return lang === 'en' ? `${base}/en${p}` : `${base}${p}`;
}

/**
 * Given a site-relative pathname (e.g. "/", "/about/", "/en/shop/"),
 * return the same page in the target language.
 */
export function altLangPath(path: string, target: Lang): string {
  const base = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
  let p = path.replace(/^\/en(?=\/|$)/, '');
  if (!p.startsWith('/')) p = `/${p}`;
  if (target === 'en') return p === '/' ? `${base}/en/` : `${base}/en${p}`;
  return p === '/' ? `${base}/` : `${base}${p}`;
}

const fa = {
  dir: 'rtl',
  // Header
  logoAlt: 'لوگوی سالن زیبایی دلدار',
  logoAria: 'صفحه اصلی سالن زیبایی دلدار',
  cartAria: 'باز کردن سبد خرید',
  themeAria: 'تغییر حالت روشن و تاریک',
  menuOpenAria: 'باز کردن منو',
  langSwitchTo: 'EN',
  langSwitchAria: 'Switch to English',
  // Footer
  footerBrand:
    'سالن زیبایی دلدار، جایی که هنر و زیبایی به هم می‌پیوندند. ما تجربه‌ای لوکس و منحصر به فرد را برای شما خلق می‌کنیم.',
  footerQuickTitle: 'دسترسی سریع',
  footerFollowTitle: 'ما را دنبال کنید',
  copyright: '© ۲۰۲۴ تمامی حقوق برای سالن زیبایی دلدار محفوظ است.',
  // Mobile menu / dock
  mobileMenuAria: 'منوی سایت',
  menuCloseAria: 'بستن منو',
  dockCta: 'رزرو نوبت آنلاین',
  arrowForwardD: 'M19 12H5M12 19l-7-7 7-7',
  // Cart drawer
  cartDrawerAria: 'سبد خرید',
  cartTitle: 'سبد خرید',
  cartCloseAria: 'بستن سبد خرید',
  cartEmpty: 'سبد خرید شما فعلاً خالی است.',
  cartTotalLabel: 'جمع کل:',
  cartZero: '۰ تومان',
  cartCheckoutBtn: 'تایید و پرداخت نهایی',
  // Booking modal
  bookingDialogAria: 'رزرو نوبت آنلاین',
  bookingCloseAria: 'بستن',
  bookingModalHeading: 'زمانت مورد نظرت رو از روی تقویم زیر انتخاب کن!',
  chooseDay: 'انتخاب روز',
  chooseTime: 'انتخاب ساعت',
  prevMonthAria: 'ماه قبل',
  nextMonthAria: 'ماه بعد',
  weekdays: ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'],
  today: 'امروز',
  tomorrow: 'فردا',
  timeSlots: [
    '09:00 صبح',
    '10:00 صبح',
    '11:00 صبح',
    '12:00 ظهر',
    '01:00 بعد از ظهر',
    '02:00 بعد از ظهر',
    '03:00 بعد از ظهر',
    '04:00 بعد از ظهر',
    '05:00 بعد از ظهر',
  ],
  reservedLegend: 'رزرو شده',
  availableLegend: 'در دسترس',
  summaryPlaceholder: 'روز و ساعت مورد نظرت رو انتخاب کن',
  detailsHeading: 'مشخصاتت رو وارد کن!',
  servicePlaceholder: 'خدمت مورد نظر را انتخاب کنید *',
  freeConsultOption: 'مشاوره رایگان',
  namePlaceholder: 'نام و نام خانوادگی',
  phonePlaceholder: 'شماره تماس',
  emailPlaceholder: 'ایمیل',
  bookingSubmitBtn: 'تایید و ارسال درخواست',
  bookingSuccessHeading: 'وقتت با موفقیت ثبت شد!',
  bookingSuccessText:
    'درخواست رزرو شما از طریق پیام‌رسان تلگرام برای ما ارسال شد. همکاران ما در سریع‌ترین زمان ممکن برای تایید نهایی با شما تماس می‌گیرند.',
  bookingBackBtn: 'بازگشت',
  sharePrompt: 'در مورد انتخاب منحصر به فرد خودت به دوستات بگو!',
  shareText: 'سالن زیبایی دلدار',
  // Home page
  homeTitle: 'سالن زیبایی زنانه دلدار در تهران | رزرو آنلاین نوبت، رنگ و لایت، کاشت ناخن',
  homeDescription:
    'سالن زیبایی زنانه دلدار در تهران؛ خدمات تخصصی آرایش عروس، رنگ و لایت حرفه‌ای، کاشت ناخن و مراقبت از پوست و مو در محیطی لوکس. رزرو آنلاین نوبت همین حالا.',
  heroH1a: 'درخشش و زیبایی شما،',
  heroH1b: 'اولویت اول ماست',
  heroP: 'در سالن زیبایی دلدار، ما هنر زیبایی را با علم روز ترکیب کرده‌ایم تا تجربه‌ای بی‌نظیر و ماندگار برای شما خلق کنیم.',
  heroCtaBooking: 'رزرو نوبت آنلاین',
  heroCtaServices: 'مشاهده خدمات',
  heroImgAlt: 'مدل زیبایی دلدار',
  floatCard1Label: 'مشتری راضی',
  floatCard2Label: 'خدمات وی‌آی‌پی',
  servicesH2: 'خدمات تخصصی ما',
  servicesSub: 'انتخابی هوشمندانه برای درخشش در هر لحظه',
  lookbookTagline: 'هنر و تخصص',
  lookbookH2: 'لوک‌بوک و روایت‌های دلدار',
  lookbookSub: 'داستانِ درخشش مشتریان ما از زبانِ خودشان',
  testimonials: [
    {
      text: '"تجربه استایلینگ در دلدار برای من فراتر از یک تغییر ظاهر بود. حس اعتماد به نفسی که گرفتم بی‌نظیر است."',
      name: '— سارا احمدی',
      imgAlt: 'نمونه کار رنگ و مش و شینیون حرفه‌ای سالن دلدار',
    },
    {
      text: '"بهترین مراقبت مویی که تا به حال داشتم."',
      name: '— نیلوفر م.',
      imgAlt: 'خدمات تخصصی مراقبت از مو و روغن‌های گیاهی',
    },
    {
      text: '"دقت در جزئیات واقعا در این مجموعه حرف اول را می‌زند."',
      name: '— مریم راد',
      imgAlt: 'تجهیزات مدرن و محیط بهداشتی سالن زیبایی',
    },
  ],
  consultH2a: 'زیبایی، یک سفر شخصی است.',
  consultH2b: 'با ما مشورت کنید.',
  consultP: 'تیم متخصص ما آماده است تا بهترین راهکارهای زیبایی را متناسب با نیازهای منحصر به فرد شما ارائه دهد.',
  consultBtn: 'دریافت وقت مشاوره رایگان',
  consultImgAlt: 'مشاوره زیبایی دلدار',
  faqTagline: 'سوالات پرتکرار',
  faqH2: 'پاسخ سوال‌های شما',
  faqSub: 'هر آنچه قبل از رزرو نوبت و خرید محصولات باید بدانید',
  contactH2: 'راه‌های ارتباطی',
  contactSub: 'منتظر شنیدن صدای گرم شما هستیم',
  contactAddrTitle: 'آدرس مجموعه',
  contactPhoneTitle: 'شماره‌های تماس',
  contactHoursTitle: 'ساعات پذیرش',
  mapIframeTitle: 'موقعیت سالن زیبایی دلدار روی نقشه',
  mapBtn: 'مسیریابی در گوگل مپ',
  // About page
  aboutTitle: 'درباره ما | داستان و تیم سالن زیبایی دلدار در تهران',
  aboutDescription:
    'با تیم متخصص و هنرمند سالن زیبایی دلدار در تهران آشنا شوید؛ سالنی لوکس با تخصص در آرایش عروس، رنگ و لایت، کاشت ناخن و مراقبت از پوست و مو.',
  aboutH1: 'کمی درباره ما',
  aboutP1: 'در سالن زیبایی دلدار، ما معتقدیم که هر فردی دارای زیبایی منحصر به فردی است که شایسته درخشش است. از زمان تأسیس، هدف ما ارائه خدماتی فراتر از یک تغییر ظاهر ساده بوده است؛ ما به دنبال خلق تجربه‌ای هستیم که در آن شما احساس آرامش، اعتماد به نفس و تجدید قوا کنید. تیم متخصص و هنرمند ما با بهره‌گیری از آخرین تکنیک‌های جهانی و بهترین محصولات باکیفیت، آماده است تا آنچه را که در ذهن دارید به واقعیت تبدیل کند.',
  aboutP2: 'تعهد ما به کیفیت و رضایت مشتری، سنگ بنای فعالیت‌های ماست. محیطی لوکس، آرام و بهداشتی فراهم آورده‌ایم تا دقایقی که در کنار ما هستید، از دغدغه‌های روزمره دور باشید.',
  aboutImgAlt: 'تجهیزات و ابزار مدرن سالن زیبایی دلدار',
  // Shop page
  shopTitle: 'فروشگاه محصولات زیبایی | خرید آنلاین مراقبت از پوست و مو - سالن زیبایی دلدار',
  shopDescription:
    'خرید آنلاین روغن موی اکسیر طلایی، سرم جوان‌ساز صورت، ماسک احیاکننده بیوتین و پک‌های هدیه لوکس از فروشگاه اختصاصی سالن زیبایی دلدار با ارسال به سراسر تهران.',
  shopTagline: 'مجموعه اختصاصی دلدار',
  shopH1a: 'فروشگاه محصولات',
  shopH1b: 'زیبایی و مراقبتی',
  shopSub: 'بهترین محصولات جهانی برای درخشش ابدی شما، دست‌چین شده توسط متخصصین ما.',
  addToCart: 'افزودن به سبد خرید',
  currency: 'تومان',
  // Booking page
  bookingPageTitle: 'رزرو نوبت آنلاین | سالن زیبایی دلدار',
  bookingPageDescription:
    'روز و ساعت مورد نظر خود را از تقویم انتخاب کنید و درخواست رزرو خود را برای سالن زیبایی دلدار ثبت کنید.',
  bookingPageH1: 'رزرو نوبت آنلاین',
  bookingPageSub: 'از روی تقویم روز مورد نظرت رو انتخاب کن، ساعت مناسب رو مشخص کن و مشخصاتت رو وارد کن.',
  bookingBackHome: 'بازگشت به خانه',
  // Checkout page
  checkoutTitle: 'تکمیل سفارش | سالن زیبایی دلدار',
  checkoutDescription: 'تکمیل سفارش و پرداخت نهایی محصولات زیبایی و مراقبتی سالن دلدار.',
  checkoutH1: 'اطلاعات ارسال و پرداخت',
  labelFullName: 'نام و نام خانوادگی',
  phFullName: 'مثال: سارا احمدی',
  labelPhone: 'شماره تماس',
  phPhone: '۰۹۱۲۰۰۰۰۰۰۰',
  labelEmail: 'ایمیل (اختیاری)',
  labelAddress: 'آدرس دقیق پستی',
  phAddress: 'استان، شهر، خیابان...',
  labelPostalCode: 'کد پستی',
  phPostalCode: '۱۲۳۴۵۶۷۸۹۰',
  labelPaymentMethod: 'روش پرداخت',
  payCard: 'کارت به کارت',
  payCod: 'پرداخت در محل',
  payGateway: 'درگاه آنلاین بانکی',
  checkoutSubmitBtn: 'ثبت و پرداخت نهایی',
  summaryTitle: 'خلاصه سفارش',
  summarySubtotal: 'قیمت محصولات:',
  summaryShipping: 'هزینه ارسال:',
  free: 'رایگان',
  summaryTotal: 'جمع کل نهایی:',
  checkoutSuccessHeading: 'سفارش شما با موفقیت ثبت شد!',
};

export type Dictionary = typeof fa;

const en: Dictionary = {
  dir: 'ltr',
  // Header
  logoAlt: 'Deldar Beauty Salon logo',
  logoAria: 'Deldar Beauty Salon home page',
  cartAria: 'Open shopping cart',
  themeAria: 'Toggle light and dark mode',
  menuOpenAria: 'Open menu',
  langSwitchTo: 'FA',
  langSwitchAria: 'تغییر به فارسی',
  // Footer
  footerBrand:
    'Deldar Beauty Salon, where art and beauty meet. We create a luxurious, one-of-a-kind experience just for you.',
  footerQuickTitle: 'Quick Links',
  footerFollowTitle: 'Follow Us',
  copyright: '© 2024 Deldar Beauty Salon. All rights reserved.',
  // Mobile menu / dock
  mobileMenuAria: 'Site menu',
  menuCloseAria: 'Close menu',
  dockCta: 'Book Online',
  arrowForwardD: 'M5 12h14M12 5l7 7-7 7',
  // Cart drawer
  cartDrawerAria: 'Shopping cart',
  cartTitle: 'Shopping Cart',
  cartCloseAria: 'Close cart',
  cartEmpty: 'Your cart is currently empty.',
  cartTotalLabel: 'Total:',
  cartZero: '0 Toman',
  cartCheckoutBtn: 'Proceed to Checkout',
  // Booking modal
  bookingDialogAria: 'Book an appointment online',
  bookingCloseAria: 'Close',
  bookingModalHeading: 'Pick your preferred time from the calendar below!',
  chooseDay: 'Choose a Day',
  chooseTime: 'Choose a Time',
  prevMonthAria: 'Previous month',
  nextMonthAria: 'Next month',
  weekdays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  today: 'Today',
  tomorrow: 'Tomorrow',
  timeSlots: [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
  ],
  reservedLegend: 'Reserved',
  availableLegend: 'Available',
  summaryPlaceholder: 'Pick your preferred day and time',
  detailsHeading: 'Enter your details!',
  servicePlaceholder: 'Select a service *',
  freeConsultOption: 'Free consultation',
  namePlaceholder: 'Full name',
  phonePlaceholder: 'Phone number',
  emailPlaceholder: 'Email',
  bookingSubmitBtn: 'Confirm & Send Request',
  bookingSuccessHeading: 'Your appointment has been booked!',
  bookingSuccessText:
    'Your booking request was sent to us via Telegram. Our team will contact you as soon as possible to confirm your appointment.',
  bookingBackBtn: 'Back',
  sharePrompt: 'Tell your friends about your unique choice!',
  shareText: 'Deldar Beauty Salon',
  // Home page
  homeTitle: 'Deldar Beauty Salon in Tehran | Online Booking, Coloring & Highlights, Nail Extensions',
  homeDescription:
    "Deldar women's beauty salon in Tehran; expert bridal makeup, professional coloring and highlights, nail extensions and skin & hair care in a luxurious setting. Book your appointment online now.",
  heroH1a: 'Your radiance and beauty',
  heroH1b: 'is our first priority',
  heroP: 'At Deldar Beauty Salon we blend the art of beauty with modern science to create a truly unique and lasting experience for you.',
  heroCtaBooking: 'Book an Appointment',
  heroCtaServices: 'Explore Services',
  heroImgAlt: 'Deldar beauty model',
  floatCard1Label: 'Happy Clients',
  floatCard2Label: 'VIP Services',
  servicesH2: 'Our Specialized Services',
  servicesSub: 'A smart choice to shine at every moment',
  lookbookTagline: 'Art & Expertise',
  lookbookH2: 'Lookbook & Deldar Stories',
  lookbookSub: 'Our clients’ shining stories, in their own words',
  testimonials: [
    {
      text: '"My styling experience at Deldar was far beyond a simple makeover. The confidence it gave me is incredible."',
      name: '— Sara Ahmadi',
      imgAlt: 'Professional color, highlights and updo by Deldar Salon',
    },
    {
      text: '"The best hair care I have ever had."',
      name: '— Niloofar M.',
      imgAlt: 'Specialized hair care services and herbal oils',
    },
    {
      text: '"Attention to detail truly speaks first at this salon."',
      name: '— Maryam Rad',
      imgAlt: 'Modern equipment and hygienic environment of the beauty salon',
    },
  ],
  consultH2a: 'Beauty is a personal journey.',
  consultH2b: 'Consult with us.',
  consultP: 'Our expert team is ready to offer the best beauty solutions tailored to your unique needs.',
  consultBtn: 'Get a Free Consultation',
  consultImgAlt: 'Deldar beauty consultation',
  faqTagline: 'FAQ',
  faqH2: 'Answers to Your Questions',
  faqSub: 'Everything you need to know before booking and shopping',
  contactH2: 'Get in Touch',
  contactSub: 'We look forward to hearing from you',
  contactAddrTitle: 'Our Address',
  contactPhoneTitle: 'Phone Numbers',
  contactHoursTitle: 'Opening Hours',
  mapIframeTitle: 'Deldar Beauty Salon location on the map',
  mapBtn: 'Directions on Google Maps',
  // About page
  aboutTitle: 'About Us | The Story & Team of Deldar Beauty Salon in Tehran',
  aboutDescription:
    'Meet the expert and artistic team of Deldar Beauty Salon in Tehran; a luxurious salon specializing in bridal makeup, coloring and highlights, nail extensions and skin & hair care.',
  aboutH1: 'A Little About Us',
  aboutP1: 'At Deldar Beauty Salon, we believe every person carries a unique beauty worthy of shining. Since our founding, our goal has been to offer far more than a simple makeover; we strive to create an experience where you feel relaxed, confident and re-energized. Our expert and artistic team, using the latest global techniques and the finest quality products, is ready to turn what you envision into reality.',
  aboutP2: 'Our commitment to quality and customer satisfaction is the cornerstone of everything we do. We have created a luxurious, calm and hygienic environment so the moments you spend with us are far removed from everyday worries.',
  aboutImgAlt: 'Modern equipment and tools of Deldar Beauty Salon',
  // Shop page
  shopTitle: 'Beauty Products Shop | Buy Skin & Hair Care Online - Deldar Beauty Salon',
  shopDescription:
    'Shop online for Golden Elixir hair oil, anti-aging face serum, biotin repair mask and luxury gift sets from Deldar Beauty Salon’s exclusive store, with delivery across Tehran.',
  shopTagline: 'The Exclusive Deldar Collection',
  shopH1a: 'Shop Beauty &',
  shopH1b: 'Care Products',
  shopSub: 'The world’s finest products for your eternal glow, hand-picked by our experts.',
  addToCart: 'Add to Cart',
  currency: 'Toman',
  // Booking page
  bookingPageTitle: 'Book an Appointment Online | Deldar Beauty Salon',
  bookingPageDescription:
    'Choose your preferred day and time from the calendar and submit your booking request to Deldar Beauty Salon.',
  bookingPageH1: 'Book an Appointment Online',
  bookingPageSub: 'Pick a day from the calendar, choose a suitable time slot and enter your details.',
  bookingBackHome: 'Back to Home',
  // Checkout page
  checkoutTitle: 'Complete Your Order | Deldar Beauty Salon',
  checkoutDescription: 'Complete your order and final payment for Deldar Salon beauty and care products.',
  checkoutH1: 'Shipping & Payment Details',
  labelFullName: 'Full name',
  phFullName: 'e.g. Sara Ahmadi',
  labelPhone: 'Phone number',
  phPhone: '09120000000',
  labelEmail: 'Email (optional)',
  labelAddress: 'Full postal address',
  phAddress: 'Province, city, street...',
  labelPostalCode: 'Postal code',
  phPostalCode: '1234567890',
  labelPaymentMethod: 'Payment method',
  payCard: 'Card-to-card transfer',
  payCod: 'Cash on delivery',
  payGateway: 'Online bank gateway',
  checkoutSubmitBtn: 'Place Order & Pay',
  summaryTitle: 'Order Summary',
  summarySubtotal: 'Products:',
  summaryShipping: 'Shipping:',
  free: 'Free',
  summaryTotal: 'Grand Total:',
  checkoutSuccessHeading: 'Your order has been placed successfully!',
};

export const UI: Record<Lang, Dictionary> = { fa, en };

/** Get the dictionary for a language */
export function t(lang: Lang): Dictionary {
  return UI[lang];
}
