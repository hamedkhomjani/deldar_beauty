/**
 * Runtime locale detection + user-facing strings for client scripts.
 * The page language is read from <html lang> (set by Layout.astro).
 */

export type Lang = 'fa' | 'en';

export function getLang(): Lang {
  return document.documentElement.lang === 'en' ? 'en' : 'fa';
}

export const LANG = getLang();

/** Locale-aware number formatting (Persian digits for fa) */
export function fmt(n: number): string {
  return n.toLocaleString(LANG === 'en' ? 'en-US' : 'fa-IR');
}

/** Strings used by cart.ts */
export const CART_STRINGS = {
  fa: {
    currency: 'تومان',
    emptyMsg: 'سبد خرید شما فعلاً خالی است.',
    viewShop: 'مشاهده فروشگاه',
    zero: '۰ تومان',
    minusAria: 'کم کردن',
    plusAria: 'زیاد کردن',
    removeAria: 'حذف از سبد',
    addedFeedback: '✓ اضافه شد',
    emptyToast: 'سبد خرید شما خالی است',
    fallbackProduct: 'محصول',
  },
  en: {
    currency: 'Toman',
    emptyMsg: 'Your cart is currently empty.',
    viewShop: 'View Shop',
    zero: '0 Toman',
    minusAria: 'Decrease quantity',
    plusAria: 'Increase quantity',
    removeAria: 'Remove from cart',
    addedFeedback: '✓ Added',
    emptyToast: 'Your cart is empty',
    fallbackProduct: 'Product',
  },
} as const;

/** Strings used by checkout.ts */
export const CHECKOUT_STRINGS = {
  fa: {
    currency: 'تومان',
    qtySuffix: 'عدد',
    orderCodePrefix: 'کد پیگیری سفارش شما:',
    shebaLabel: 'شبا:',
    cardNoteIntro: 'لطفاً مبلغ',
    cardNoteOutro:
      'را کارت به کارت کنید:<br> سپس تصویر فیش واریز را در تلگرام یا واتس‌اپ برای ما بفرستید تا سفارش شما ثبت و ارسال شود.',
    codNote: 'هزینه سفارش را هنگام دریافت محصول (پرداخت در محل) بپردازید.',
    gatewayNote: 'پرداخت آنلاین از طریق درگاه بانکی به زودی فعال می‌شود.',
  },
  en: {
    currency: 'Toman',
    qtySuffix: 'pcs',
    orderCodePrefix: 'Your order tracking code:',
    shebaLabel: 'IBAN:',
    cardNoteIntro: 'Please transfer',
    cardNoteOutro:
      'to the following card:<br> Then send a photo of the transfer receipt via Telegram or WhatsApp so we can process and ship your order.',
    codNote: 'Pay in cash when you receive the products (cash on delivery).',
    gatewayNote: 'Online payment via the bank gateway will be available soon.',
  },
} as const;

/** Strings used by booking.ts */
export const BOOKING_STRINGS = {
  fa: {
    summaryDateLabel: 'تاریخ:',
    summaryTimeLabel: 'ساعت:',
    summaryPlaceholder: 'روز و ساعت مورد نظرت رو انتخاب کن',
    errPickDay: 'لطفاً ابتدا روز مورد نظر را از تقویم انتخاب کنید.',
    errPickDayToast: 'لطفاً روز مورد نظر را انتخاب کنید',
    errPickTime: 'لطفاً ساعت مورد نظر را انتخاب کنید.',
    errPickTimeToast: 'لطفاً ساعت مورد نظر را انتخاب کنید',
    errPhone: 'شماره تماس باید با ۰۹ شروع شود و ۱۱ رقم باشد.',
    errPhoneToast: 'شماره تماس معتبر نیست',
    tgTitle: 'رزرو نوبت - سالن زیبایی دلدار',
    tgName: '👤 نام:',
    tgPhone: '📞 تماس:',
    tgEmail: '📧 ایمیل:',
    tgService: '💇 خدمت:',
    tgDate: '📅 تاریخ:',
    tgTime: '🕒 ساعت:',
  },
  en: {
    summaryDateLabel: 'Date:',
    summaryTimeLabel: 'Time:',
    summaryPlaceholder: 'Pick your preferred day and time',
    errPickDay: 'Please pick a day from the calendar first.',
    errPickDayToast: 'Please pick a day',
    errPickTime: 'Please pick a time slot.',
    errPickTimeToast: 'Please pick a time slot',
    errPhone: 'The phone number must start with 09 and have 11 digits.',
    errPhoneToast: 'Invalid phone number',
    tgTitle: 'Booking Request - Deldar Beauty Salon',
    tgName: '👤 Name:',
    tgPhone: '📞 Phone:',
    tgEmail: '📧 Email:',
    tgService: '💇 Service:',
    tgDate: '📅 Date:',
    tgTime: '🕒 Time:',
  },
} as const;

/** Gregorian month names for the English calendar */
export const G_MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Transliterated Jalali month names (shown as the secondary line in EN mode) */
export const J_MONTH_NAMES_EN = [
  'Farvardin', 'Ordibehesht', 'Khordad', 'Tir', 'Mordad', 'Shahrivar',
  'Mehr', 'Aban', 'Azar', 'Dey', 'Bahman', 'Esfand',
];
