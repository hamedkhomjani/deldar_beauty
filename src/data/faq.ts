/**
 * FAQ content — single source of truth.
 * Used by: FAQ section on the homepage + FAQPage JSON-LD (schema.ts).
 * Text fields are bilingual ({ fa, en }) — see src/i18n/index.ts.
 */
import type { Localized } from '../i18n';

export interface Faq {
  question: Localized;
  answer: Localized;
}

export const FAQS: Faq[] = [
  {
    question: { fa: 'چگونه در سالن زیبایی دلدار نوبت رزرو کنم؟', en: 'How do I book an appointment at Deldar Beauty Salon?' },
    answer: {
      fa: 'کافی است از دکمه «رزرو نوبت آنلاین» استفاده کنید، روز و ساعت دلخواه را از تقویم انتخاب کرده و فرم مشخصات را تکمیل کنید. درخواست شما از طریق پیام‌رسان تلگرام برای ما ارسال شده و همکاران ما برای تایید نهایی با شما تماس می‌گیرند.',
      en: 'Simply use the "Book Online" button, pick your preferred day and time from the calendar and fill in the details form. Your request is sent to us via Telegram and our team will call you to confirm.',
    },
  },
  {
    question: { fa: 'هزینه خدمات رنگ و لایت و کاشت ناخن چقدر است؟', en: 'How much do coloring, highlights and nail extensions cost?' },
    answer: {
      fa: 'تعرفه دقیق به نوع و طول مو یا ناخن شما بستگی دارد. قبل از شروع هر خدمت، در جلسه مشاوره رایگان هزینه نهایی با شفافیت کامل اعلام می‌شود.',
      en: 'The exact price depends on the type and length of your hair or nails. Before every service, the final price is transparently announced during a free consultation session.',
    },
  },
  {
    question: { fa: 'آیا آرایش عروس در محل برگزاری مراسم انجام می‌شود؟', en: 'Do you provide bridal makeup at the venue?' },
    answer: {
      fa: 'بله، تیم میکاپ دلدار امکان آرایش عروس در سالن یا محل برگزاری مراسم را دارد. توصیه می‌کنیم حداقل یک ماه قبل از مراسم، تریال آرایش را رزرو کنید.',
      en: 'Yes, the Deldar makeup team can do bridal makeup at the salon or at your event venue. We recommend booking your makeup trial at least one month before the event.',
    },
  },
  {
    question: { fa: 'ساعات کاری سالن زیبایی دلدار چگونه است؟', en: 'What are the opening hours of Deldar Beauty Salon?' },
    answer: {
      fa: 'سالن زیبایی دلدار همه‌روزه به جز جمعه‌ها از ساعت ۱۰ صبح تا ۷ شب پذیرای شماست.',
      en: 'Deldar Beauty Salon welcomes you every day except Fridays, from 10 AM to 7 PM.',
    },
  },
  {
    question: { fa: 'آیا خرید از فروشگاه دلدار با کارت به کارت یا پرداخت در محل امکان‌پذیر است؟', en: 'Can I pay by bank transfer or cash on delivery in the shop?' },
    answer: {
      fa: 'بله، در مرحله پرداخت می‌توانید «کارت به کارت» یا «پرداخت در محل» را انتخاب کنید. برای کارت به کارت، شماره کارت و شبا پس از ثبت سفارش نمایش داده می‌شود.',
      en: 'Yes, at checkout you can choose card-to-card transfer or cash on delivery. For card transfers, the card number and IBAN are shown after you place the order.',
    },
  },
  {
    question: { fa: 'آیا مشاوره رایگان قبل از خدمات ارائه می‌شود؟', en: 'Is a free consultation offered before services?' },
    answer: {
      fa: 'بله، تیم تخصصی دلدار پیش از هر خدمت، مشاوره رایگان ارائه می‌دهد تا مناسب‌ترین راهکار متناسب با نوع مو، پوست و سلیقه شما پیشنهاد شود.',
      en: 'Yes, the Deldar expert team offers a free consultation before every service to suggest the most suitable solution for your hair type, skin and taste.',
    },
  },
] as const;
