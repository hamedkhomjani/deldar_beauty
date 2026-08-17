/**
 * Booking modal: Jalali calendar + time slots + details form.
 * On submit, the request is delivered to the salon via Telegram.
 */
import { SALON } from '../config';
import { showToast } from './toast';

function $<T extends Element>(sel: string): T | null {
  return document.querySelector<T>(sel);
}

// --- Jalali (Persian) calendar conversion ---
const J_DAYS_IN_MONTH = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
const J_MONTH_NAMES = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];

function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const gDm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    gDm[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  jy += Math.floor((days - 1) / 365);
  if (days > 365) days = (days - 1) % 365;
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return [jy, jm, jd];
}

function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  let gy = jy <= 979 ? 621 : 1600;
  jy -= jy <= 979 ? 0 : 979;
  let days =
    365 * jy +
    Math.floor(jy / 33) * 8 +
    Math.floor(((jy % 33) + 3) / 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  gy += 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  gy += Math.floor((days - 1) / 365);
  if (days > 365) days = (days - 1) % 365;
  let gd = days + 1;
  const sal = [0, 31, (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  for (; gm < 13; gm++) {
    if (gd <= sal[gm]) break;
    gd -= sal[gm];
  }
  return [gy, gm, gd];
}

function isLeapYear(jy: number): boolean {
  return (((((jy - (jy > 0 ? 474 : 473)) % 2820) + 474) + 38) * 682) % 2816 < 682;
}

// --- Calendar state ---
const now = new Date();
const [todayJY, todayJM, todayJD] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
let viewDate = { year: todayJY, month: todayJM };
let selectedDate: string | null = null;
let selectedTime: string | null = null;

function renderCalendar(): void {
  const calendarDays = $('#calendar-days');
  const monthLabel = $('.current-month');
  if (!calendarDays || !monthLabel) return;

  calendarDays.innerHTML = '';
  monthLabel.textContent = `${J_MONTH_NAMES[viewDate.month - 1]} ${viewDate.year}`;

  // First weekday of the month (0=Sunday) → shift to Saturday-based Persian week
  const [gY, gM, gD] = jalaliToGregorian(viewDate.year, viewDate.month, 1);
  const startDay = new Date(gY, gM - 1, gD).getDay();
  const jalaliStartDay = (startDay + 1) % 7;

  const totalDays = J_DAYS_IN_MONTH[viewDate.month - 1] + (viewDate.month === 12 && isLeapYear(viewDate.year) ? 1 : 0);

  for (let i = 0; i < jalaliStartDay; i++) {
    calendarDays.appendChild(Object.assign(document.createElement('span'), { className: 'muted' }));
  }

  for (let i = 1; i <= totalDays; i++) {
    const span = document.createElement('span');
    span.textContent = String(i);

    const isPast =
      viewDate.year < todayJY ||
      (viewDate.year === todayJY && viewDate.month < todayJM) ||
      (viewDate.year === todayJY && viewDate.month === todayJM && i < todayJD);

    if (isPast) span.classList.add('past');
    if (viewDate.year === todayJY && viewDate.month === todayJM && i === todayJD) {
      span.classList.add('today');
    }
    if ((i + jalaliStartDay) % 7 === 0) span.classList.add('holiday');

    if (!isPast) {
      span.addEventListener('click', () => {
        selectDate(i, viewDate.month, viewDate.year);
      });
    }

    calendarDays.appendChild(span);
  }
}

function selectDate(day: number, month: number, year: number): void {
  selectedDate = `${day} ${J_MONTH_NAMES[month - 1]} ${year}`;
  document.querySelectorAll('.days-grid span').forEach((s) => s.classList.remove('active'));
  document.querySelectorAll('.days-grid span').forEach((s) => {
    if (s.textContent === String(day)) s.classList.add('active');
  });
  clearFormMessage();
  updateSummary();
}

function selectToday(): void {
  if (!selectedDate) selectDate(todayJD, todayJM, todayJY);
}

function updateSummary(): void {
  const el = $('#booking-summary');
  if (!el) return;
  const parts: string[] = [];
  if (selectedDate) parts.push(`📅 ${selectedDate}`);
  if (selectedTime) parts.push(`🕒 ${selectedTime}`);
  el.textContent = parts.length ? parts.join('  •  ') : 'روز و ساعت مورد نظرت رو انتخاب کن';
}

function showFormMessage(msg: string): void {
  const el = $('#booking-form-msg');
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle('show', msg.length > 0);
}

function clearFormMessage(): void {
  showFormMessage('');
}

// --- Modal open/close/reset ---
function openBooking(): void {
  const modal = $('#booking-modal');
  if (!modal) return;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  if (!selectedTime) {
    // Keep the visually-selected slot in sync after a reset
    selectedTime = $('.time-slot.active')?.textContent?.trim() ?? null;
  }
  renderCalendar();
  selectToday();
  updateSummary();
}

function closeBooking(): void {
  const modal = $('#booking-modal') as HTMLElement | null;
  if (!modal) return;
  modal.classList.remove('active');
  modal.style.display = '';
  document.body.style.overflow = 'auto';
  resetBooking();
}

function resetBooking(): void {
  $('#booking-step-1')?.classList.remove('hidden');
  $('#booking-step-2')?.classList.add('hidden');
  ($('#booking-form') as HTMLFormElement | null)?.reset();
  selectedDate = null;
  selectedTime = null;
  clearFormMessage();
  updateSummary();
}

document.addEventListener('DOMContentLoaded', () => {
  // Standalone booking page: render the calendar on load and show an inline
  // success panel after submit (the modal variants are no-ops on that page).
  const standalonePage = $('#booking-page');
  if (standalonePage) {
    renderCalendar();
    selectToday();
    updateSummary();
  }

  // Escape closes the booking modal
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') closeBooking();
  });

  // Service cards open the modal. CTAs and the mobile dock link to the
  // booking page and are ignored here.
  document
    .querySelectorAll('.btn-premium:not(.btn-checkout, .btn-checkout-final, .go-booking), .service-card')
    .forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        openBooking();
      });
    });

  $('#close-booking')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeBooking();
  });

  $('#btn-return-home')?.addEventListener('click', () => {
    const modal = $('#booking-modal');
    modal?.classList.remove('active');
    document.body.style.overflow = 'auto';
    resetBooking();
  });

  // Month navigation
  $('.prev-month')?.addEventListener('click', () => {
    viewDate.month--;
    if (viewDate.month < 1) {
      viewDate.month = 12;
      viewDate.year--;
    }
    renderCalendar();
  });

  $('.next-month')?.addEventListener('click', () => {
    viewDate.month++;
    if (viewDate.month > 12) {
      viewDate.month = 1;
      viewDate.year++;
    }
    renderCalendar();
  });

  // Quick pick: today / tomorrow
  document.querySelectorAll('.quick-day').forEach((btn) => {
    btn.addEventListener('click', () => {
      const offset = Number((btn as HTMLButtonElement).dataset.offset ?? 0);
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
      const [y, m, day] = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
      viewDate = { year: y, month: m };
      renderCalendar();
      selectDate(day, m, y);
    });
  });

  // Time slots
  const timeSlots = document.querySelectorAll('.time-slot');
  timeSlots.forEach((slot) => {
    slot.addEventListener('click', () => {
      if (!(slot as HTMLButtonElement).disabled) {
        timeSlots.forEach((s) => s.classList.remove('active'));
        slot.classList.add('active');
        selectedTime = slot.textContent?.trim() ?? null;
        clearFormMessage();
        updateSummary();
      }
    });
  });
// Submit → compose message + open Telegram
  $('#booking-form')?.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!selectedDate) {
      showFormMessage('لطفاً ابتدا روز مورد نظر را از تقویم انتخاب کنید.');
      showToast('لطفاً روز مورد نظر را انتخاب کنید');
      return;
    }
    if (!selectedTime) {
      showFormMessage('لطفاً ساعت مورد نظر را انتخاب کنید.');
      showToast('لطفاً ساعت مورد نظر را انتخاب کنید');
      return;
    }

    const phoneInput = $('#booking-phone') as HTMLInputElement | null;
    const phoneDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const phoneNormalized = (phoneInput?.value ?? '')
      .replace(/\s/g, '')
      .replace(/[۰-۹]/g, (c) => String(phoneDigits.indexOf(c)));
    if (phoneNormalized && !/^09\d{9}$/.test(phoneNormalized)) {
      showFormMessage('شماره تماس باید با ۰۹ شروع شود و ۱۱ رقم باشد.');
      showToast('شماره تماس معتبر نیست');
      phoneInput?.focus();
      return;
    }

    const name = $('#booking-name') as HTMLInputElement | null;
    const phone = $('#booking-phone') as HTMLInputElement | null;
    const email = $('#booking-email') as HTMLInputElement | null;
    const service = $('#booking-service') as HTMLSelectElement | null;

    const msg = [
      'رزرو نوبت - سالن زیبایی دلدار',
      `👤 نام: ${name?.value.trim() ?? ''}`,
      `📞 تماس: ${phone?.value.trim() ?? ''}`,
      email?.value.trim() ? `📧 ایمیل: ${email.value.trim()}` : '',
      `💇 خدمت: ${service?.value ?? ''}`,
      `📅 تاریخ: ${selectedDate}`,
      `🕒 ساعت: ${selectedTime}`,
    ]
      .filter(Boolean)
      .join('\n');

    window.open(`https://t.me/${SALON.telegram}?text=${encodeURIComponent(msg)}`, '_blank');

    $('#booking-step-1')?.classList.add('hidden');
    $('#booking-step-2')?.classList.remove('hidden');
  });

  // Standalone booking page: reveal the inline success panel after submit
  if (standalonePage) {
    $('#booking-form')?.addEventListener('submit', () => {
      const success = $('#booking-success');
      if (!success) return;
      success.classList.remove('hidden');
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      $('#booking-form')?.classList.add('hidden');
    });
  }
});