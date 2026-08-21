/**
 * Booking modal: calendar + time slots + details form.
 * On submit, the request is delivered to the salon via Telegram.
 *
 * Calendar per locale (from <html lang>):
 * - fa: pure Jalali (Persian) calendar, Saturday-first week.
 * - en: Gregorian calendar, Sunday-first week, with the equivalent
 *   Jalali month/date shown underneath (`.month-sub` / summary).
 */
import { SALON } from '../config';
import { showToast } from './toast';
import { BOOKING_STRINGS, G_MONTH_NAMES_EN, J_MONTH_NAMES_EN, LANG } from './lang';

const S = BOOKING_STRINGS[LANG];

function $<T extends Element>(sel: string): T | null {
  return document.querySelector<T>(sel);
}

// --- Jalali (Persian) calendar conversion ---
const J_DAYS_IN_MONTH = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
const J_MONTH_NAMES_FA = [
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
// viewDate holds Jalali year/month in fa mode, Gregorian year/month in en mode.
const now = new Date();
let viewDate =
  LANG === 'fa'
    ? (() => {
        const [jy, jm] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
        return { year: jy, month: jm };
      })()
    : { year: now.getFullYear(), month: now.getMonth() + 1 };
let selectedDate: Date | null = null;
let selectedTime: string | null = null;

/** Format the selected date for the summary line */
function formatSelectedDate(d: Date): string {
  const [jy, jm, jd] = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  if (LANG === 'fa') {
    return `${jd} ${J_MONTH_NAMES_FA[jm - 1]} ${jy}`;
  }
  const gregorian = d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  // Jalali equivalent shown underneath/beside the Gregorian date
  return `${gregorian} (${jd} ${J_MONTH_NAMES_EN[jm - 1]} ${jy})`;
}

function renderCalendar(): void {
  const calendarDays = $('#calendar-days');
  const monthLabel = $('.current-month');
  if (!calendarDays || !monthLabel) return;

  calendarDays.innerHTML = '';

  let startOffset: number; // empty cells before day 1
  let totalDays: number;

  if (LANG === 'fa') {
    monthLabel.textContent = `${J_MONTH_NAMES_FA[viewDate.month - 1]} ${viewDate.year}`;

    // First weekday of the month (0=Sunday) → shift to Saturday-based Persian week
    const [gY, gM, gD] = jalaliToGregorian(viewDate.year, viewDate.month, 1);
    const startDay = new Date(gY, gM - 1, gD).getDay();
    startOffset = (startDay + 1) % 7;

    totalDays =
      J_DAYS_IN_MONTH[viewDate.month - 1] +
      (viewDate.month === 12 && isLeapYear(viewDate.year) ? 1 : 0);
  } else {
    // Jalali months spanned by this Gregorian month (secondary line)
    const lastDay = new Date(viewDate.year, viewDate.month, 0).getDate();
    const [jy1, jm1] = gregorianToJalali(viewDate.year, viewDate.month, 1);
    const [jy2, jm2] = gregorianToJalali(viewDate.year, viewDate.month, lastDay);
    const jalaliRange =
      jm1 === jm2
        ? `${J_MONTH_NAMES_EN[jm1 - 1]} ${jy1}`
        : `${J_MONTH_NAMES_EN[jm1 - 1]} – ${J_MONTH_NAMES_EN[jm2 - 1]} ${jy2}`;
    monthLabel.innerHTML = `${G_MONTH_NAMES_EN[viewDate.month - 1]} ${viewDate.year}<span class="month-sub">${jalaliRange}</span>`;

    startOffset = new Date(viewDate.year, viewDate.month - 1, 1).getDay(); // Sunday-first
    totalDays = lastDay;
  }

  /** Day-of-month → grid column index */
  const columnOf = (day: number): number => (startOffset + day - 1) % 7;

  for (let i = 0; i < startOffset; i++) {
    calendarDays.appendChild(Object.assign(document.createElement('span'), { className: 'muted' }));
  }

  for (let i = 1; i <= totalDays; i++) {
    const span = document.createElement('span');
    span.textContent = String(i);

    const cellDate =
      LANG === 'fa'
        ? (() => {
            const [gY, gM, gD] = jalaliToGregorian(viewDate.year, viewDate.month, i);
            return new Date(gY, gM - 1, gD);
          })()
        : new Date(viewDate.year, viewDate.month - 1, i);

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isPast = cellDate < todayStart;
    const isToday = cellDate.getTime() === todayStart.getTime();

    if (isPast) span.classList.add('past');
    if (isToday) span.classList.add('today');

    // Holiday (red) column: Friday in the Persian week, Sunday in the English week
    const holidayColumn = LANG === 'fa' ? 6 : 0;
    if (columnOf(i) === holidayColumn) span.classList.add('holiday');

    if (!isPast) {
      span.addEventListener('click', () => {
        selectDate(cellDate, i);
      });
    }

    calendarDays.appendChild(span);
  }
}

function selectDate(date: Date, dayNumber: number): void {
  selectedDate = date;
  document.querySelectorAll('.days-grid span').forEach((s) => s.classList.remove('active'));
  document.querySelectorAll('.days-grid span').forEach((s) => {
    if (s.textContent === String(dayNumber)) s.classList.add('active');
  });
  refreshTimeSlots();
  clearFormMessage();
  updateSummary();
}

function todayInfo(): { date: Date; dayNumber: number } {
  if (LANG === 'fa') {
    const [, , jd] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
    return { date: now, dayNumber: jd };
  }
  return { date: now, dayNumber: now.getDate() };
}

function selectToday(): void {
  if (!selectedDate) {
    const { date, dayNumber } = todayInfo();
    selectDate(date, dayNumber);
  }
}

function updateSummary(): void {
  const el = $('#booking-summary');
  if (!el) return;
  const parts: string[] = [];
  if (selectedDate) parts.push(`${S.summaryDateLabel} ${formatSelectedDate(selectedDate)}`);
  if (selectedTime) parts.push(`${S.summaryTimeLabel} ${selectedTime}`);
  el.textContent = parts.length ? parts.join('  •  ') : S.summaryPlaceholder;
}

// --- Past-slot disabling (salon local time = Asia/Tehran) ---

/** Minutes since midnight right now in Tehran, regardless of visitor timezone */
function tehranMinutesNow(): number {
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tehran',
    hourCycle: 'h23',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());
  const [h, m] = formatted.split(':').map(Number);
  return h * 60 + m;
}

/** Slot label ("09:00 صبح" / "01:00 PM") → start-of-slot minutes since midnight */
function slotStartMinutes(label: string): number | null {
  const normalized = label
    .replace(/[۰-۹]/g, (c) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)))
    .toLowerCase();
  const match = /(\d{1,2}):(\d{2})/.exec(normalized);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const isPm = normalized.includes('pm') || normalized.includes('بعد از ظهر');
  const isAm = normalized.includes('am') || normalized.includes('صبح');
  if (isPm && hours < 12) hours += 12;
  if (isAm && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

/** On today's date, disable slots that have already started */
function refreshTimeSlots(): void {
  const slots = document.querySelectorAll<HTMLButtonElement>('.time-slot');
  if (!slots.length || !selectedDate) return;

  const isToday =
    selectedDate.getFullYear() === now.getFullYear() &&
    selectedDate.getMonth() === now.getMonth() &&
    selectedDate.getDate() === now.getDate();

  if (!isToday) {
    slots.forEach((s) => {
      s.disabled = false;
    });
    return;
  }

  const minutesNow = tehranMinutesNow();
  slots.forEach((s) => {
    const start = slotStartMinutes(s.textContent ?? '');
    s.disabled = start !== null && start <= minutesNow;
  });

  // Drop the selection if it landed on an already-passed slot
  const active = document.querySelector<HTMLButtonElement>('.time-slot.active');
  if (active?.disabled) {
    active.classList.remove('active');
    selectedTime = null;
  }
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
    if (e.key !== 'Escape') return;
    closeBooking();
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
      if (LANG === 'fa') {
        const [jy, jm, jd] = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
        viewDate = { year: jy, month: jm };
        renderCalendar();
        selectDate(d, jd);
      } else {
        viewDate = { year: d.getFullYear(), month: d.getMonth() + 1 };
        renderCalendar();
        selectDate(d, d.getDate());
      }
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
      showFormMessage(S.errPickDay);
      showToast(S.errPickDayToast);
      return;
    }
    if (!selectedTime) {
      showFormMessage(S.errPickTime);
      showToast(S.errPickTimeToast);
      return;
    }

    const phoneInput = $('#booking-phone') as HTMLInputElement | null;
    const phoneNormalized = (phoneInput?.value ?? '')
      .replace(/\s/g, '')
      .replace(/[۰-۹]/g, (c) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)));
    if (phoneNormalized && !/^09\d{9}$/.test(phoneNormalized)) {
      showFormMessage(S.errPhone);
      showToast(S.errPhoneToast);
      phoneInput?.focus();
      return;
    }

    const name = $('#booking-name') as HTMLInputElement | null;
    const phone = $('#booking-phone') as HTMLInputElement | null;
    const email = $('#booking-email') as HTMLInputElement | null;
    const service = $('#booking-service') as HTMLSelectElement | null;

    const msg = [
      S.tgTitle,
      `${S.tgName} ${name?.value.trim() ?? ''}`,
      `${S.tgPhone} ${phone?.value.trim() ?? ''}`,
      email?.value.trim() ? `${S.tgEmail} ${email.value.trim()}` : '',
      `${S.tgService} ${service?.value ?? ''}`,
      `${S.tgDate} ${formatSelectedDate(selectedDate)}`,
      `${S.tgTime} ${selectedTime}`,
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
