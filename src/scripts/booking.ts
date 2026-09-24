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
import { trapTab } from './focusTrap';
import { BOOKING_STRINGS, G_MONTH_NAMES_EN, J_MONTH_NAMES_EN, LANG, fmtDigits, toLatinDigits } from './lang';

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
/** Pure-Jalali date string (used in the Persian message sent to the salon) */
function jalaliDateString(d: Date): string {
  const [jy, jm, jd] = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return `${fmtDigits(jd)} ${J_MONTH_NAMES_FA[jm - 1]} ${fmtDigits(jy)}`;
}

function formatSelectedDate(d: Date): string {
  if (LANG === 'fa') {
    return jalaliDateString(d);
  }
  const gregorian = d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  // Jalali equivalent shown underneath/beside the Gregorian date
  const [jy, jm, jd] = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
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
    monthLabel.textContent = `${J_MONTH_NAMES_FA[viewDate.month - 1]} ${fmtDigits(viewDate.year)}`;

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
    span.textContent = fmtDigits(i);

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
      span.setAttribute('tabindex', '0');
      span.setAttribute('role', 'button');
      span.setAttribute('aria-label', `${formatSelectedDate(cellDate)}`);
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
    if (s.textContent === fmtDigits(dayNumber)) s.classList.add('active');
  });
  refreshTimeSlots();
  clearFormMessage();
  updateSummary();
  updateBookingSteps();
  saveCurrentDraft();
}

// Keyboard-calendar helper state
let cursorDay = 0; // 1-based day within viewDate month; 0 = none

// Whether we've already auto-scrolled to the details form for this session
let autoAdvanced = false;

function advanceToDetails(): void {
  const nameInput = $('#booking-name') as HTMLInputElement | null;
  const form = $('#booking-form');
  if (!form || !nameInput) return;
  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  // Gently focus the first field so the user can start typing straight away.
  if (document.activeElement !== nameInput) {
    const select = $('#booking-service') as HTMLSelectElement | null;
    (select && !select.value ? select : nameInput).focus({ preventScroll: true });
  }
}

function dateForDay(day: number): Date {
  if (LANG === 'fa') {
    const [gY, gM, gD] = jalaliToGregorian(viewDate.year, viewDate.month, day);
    return new Date(gY, gM - 1, gD);
  }
  return new Date(viewDate.year, viewDate.month - 1, day);
}

function daysInViewMonth(): number {
  if (LANG === 'fa') {
    return (
      J_DAYS_IN_MONTH[viewDate.month - 1] +
      (viewDate.month === 12 && isLeapYear(viewDate.year) ? 1 : 0)
    );
  }
  return new Date(viewDate.year, viewDate.month, 0).getDate();
}

function isPastDay(day: number): boolean {
  const d = dateForDay(day);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return d < todayStart;
}

function focusCalDay(day: number): void {
  cursorDay = day;
  const cells = document.querySelectorAll<HTMLElement>('.days-grid span');
  cells.forEach((c) => {
    if (c.textContent === fmtDigits(day)) c.focus();
  });
}

function moveToMonth(delta: number, anchorDay: number): void {
  viewDate.month += delta;
  if (viewDate.month < 1) {
    viewDate.month = 12;
    viewDate.year--;
  } else if (viewDate.month > 12) {
    viewDate.month = 1;
    viewDate.year++;
  }
  // find nearest non-past day in the new month
  const max = daysInViewMonth();
  let target = Math.min(anchorDay, max);
  while (target >= 1 && isPastDay(target)) target--;
  if (target < 1) target = 1;
  renderCalendar();
  cursorDay = target;
  focusCalDay(cursorDay);
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

// --- Progress indicator + inline validation ---
function updateBookingSteps(): void {
  const steps = document.querySelectorAll('.booking-steps .step');
  if (!steps.length) return;
  const service = ($('#booking-service') as HTMLSelectElement | null)?.value.trim() ?? '';
  const name = ($('#booking-name') as HTMLInputElement | null)?.value.trim() ?? '';
  const phone = ($('#booking-phone') as HTMLInputElement | null)?.value.trim() ?? '';
  const pickDone = !!(selectedDate && selectedTime);
  const detailsFilled = !!(service && name && phone);
  const confirmDone = pickDone && detailsFilled;

  steps.forEach((step) => {
    const n = Number((step as HTMLElement).dataset.step);
    const done =
      (n === 1 && pickDone) || (n === 2 && detailsFilled) || (n === 3 && confirmDone);
    const isActive =
      (n === 1 && !pickDone) ||
      (n === 2 && pickDone && !detailsFilled);
    step.classList.toggle('done', done);
    step.classList.toggle('active', isActive && !done);
  });

  // Pulse the confirm button once every step is satisfied.
  document.querySelector('.btn-confirm')?.classList.toggle('ready', confirmDone);

  // Auto-advance focus to the details form the moment day+time are chosen.
  if (pickDone && !autoAdvanced) {
    autoAdvanced = true;
    advanceToDetails();
  }
}

function setFieldError(group: string, message: string): void {
  const g = $(`[data-field-group="${group}"]`);
  if (!g) return;
  g.classList.add('invalid');
  const msg = g.querySelector<HTMLElement>(`[data-error-for="${group}"]`);
  if (msg) msg.textContent = message;
}

function clearFieldErrors(...groups: string[]): void {
  (groups.length ? groups : ['service', 'name', 'phone']).forEach((group) => {
    const g = $(`[data-field-group="${group}"]`);
    g?.classList.remove('invalid');
  });
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

  const dateKey = isoLocal(selectedDate);

  const isToday =
    selectedDate.getFullYear() === now.getFullYear() &&
    selectedDate.getMonth() === now.getMonth() &&
    selectedDate.getDate() === now.getDate();

  const minutesNow = isToday ? tehranMinutesNow() : -1;
  slots.forEach((s) => {
    const label = s.textContent?.trim() ?? '';
    const start = slotStartMinutes(label);
    const past = isToday && start !== null && start <= minutesNow;
    const booked = isSlotBooked(dateKey, label);
    s.disabled = past || booked;
    s.classList.toggle('reserved', booked && !past);
  });

  // Drop the selection if it landed on an already-passed or booked slot
  const active = document.querySelector<HTMLButtonElement>('.time-slot.active');
  if (active && active.disabled) {
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
const DRAFT_KEY = 'deldar_booking_draft';
function loadDraft(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}') || {};
  } catch {
    return {};
  }
}
function saveDraft(data: Record<string, string>): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable */
  }
}
function restoreDraftFields(): void {
  const d = loadDraft();
  const nameInput = $('#booking-name') as HTMLInputElement | null;
  const phoneInput = $('#booking-phone') as HTMLInputElement | null;
  const emailInput = $('#booking-email') as HTMLInputElement | null;
  const serviceSelect = $('#booking-service') as HTMLSelectElement | null;
  if (nameInput && d.name) nameInput.value = d.name;
  if (phoneInput && d.phone) phoneInput.value = d.phone;
  if (emailInput && d.email) emailInput.value = d.email;
  if (serviceSelect && d.service) serviceSelect.value = d.service;
}

/** Local (no timezone shift) ISO date string for a Date, e.g. "2026-09-02" */
function isoLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function currentDraft(): Record<string, string> {
  return {
    name: ($('#booking-name') as HTMLInputElement | null)?.value ?? '',
    phone: ($('#booking-phone') as HTMLInputElement | null)?.value ?? '',
    email: ($('#booking-email') as HTMLInputElement | null)?.value ?? '',
    service: ($('#booking-service') as HTMLSelectElement | null)?.value ?? '',
    date: selectedDate ? isoLocal(selectedDate) : '',
    time: selectedTime ?? '',
  };
}

function saveCurrentDraft(data: Record<string, string> | undefined = undefined): void {
  saveDraft(data ?? currentDraft());
}

// --- Local double-booking guard (same-browser only) ---
const BOOKED_KEY = 'deldar_booked_slots';
function bookedSlots(): Array<{ date: string; time: string }> {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(BOOKED_KEY) || '[]');
    return Array.isArray(raw) ? (raw as Array<{ date: string; time: string }>) : [];
  } catch {
    return [];
  }
}
function isSlotBooked(date: string, time: string): boolean {
  return bookedSlots().some((b) => b.date === date && b.time === time);
}
function markSlotBooked(date: string, time: string): void {
  const list = bookedSlots();
  if (!list.some((b) => b.date === date && b.time === time)) {
    list.push({ date, time });
    try {
      localStorage.setItem(BOOKED_KEY, JSON.stringify(list));
    } catch {
      /* storage unavailable */
    }
  }
}

/** Restore a previously saved date+time (session slot persistence). */
function restoreDraftAppointment(): void {
  const d = loadDraft();
  if (!d.date) return;
  const [y, m, day] = d.date.split('-').map(Number);
  if (!y || !m || !day) return;
  const restored = new Date(y, m - 1, day);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (isNaN(restored.getTime()) || restored < todayStart) return;

  if (LANG === 'fa') {
    const [jy, jm] = gregorianToJalali(y, m, day);
    viewDate = { year: jy, month: jm };
  } else {
    viewDate = { year: y, month: m };
  }
  renderCalendar();
  selectDate(restored, day);

  if (d.time) {
    const slot = Array.from(document.querySelectorAll<HTMLButtonElement>('.time-slot')).find(
      (s) => s.textContent?.trim() === d.time,
    );
    if (slot && !slot.disabled) {
      document.querySelectorAll('.time-slot').forEach((s) => {
        s.classList.remove('active');
        s.setAttribute('aria-pressed', 'false');
      });
      slot.classList.add('active');
      slot.setAttribute('aria-pressed', 'true');
      selectedTime = d.time;
      updateSummary();
    }
  }
  saveCurrentDraft();
}

let lastModalTrigger: HTMLElement | null = null;

function openBooking(): void {
  const modal = $('#booking-modal');
  if (!modal) return;
  lastModalTrigger = document.activeElement as HTMLElement | null;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  if (!selectedTime) {
    // Keep the visually-selected slot in sync after a reset
    selectedTime = $('.time-slot.active')?.textContent?.trim() ?? null;
  }
  renderCalendar();
  selectToday();
  updateSummary();
  restoreDraftFields();
  restoreDraftAppointment();
  requestAnimationFrame(() => {
    ($('#close-booking') as HTMLElement | null)?.focus();
  });
}

function closeBooking(): void {
  const modal = $('#booking-modal') as HTMLElement | null;
  if (!modal) return;
  modal.classList.remove('active');
  modal.style.display = '';
  document.body.style.overflow = 'auto';
  resetBooking();
  if (lastModalTrigger && document.contains(lastModalTrigger)) {
    lastModalTrigger.focus();
  }
}

function resetBooking(): void {
  $('#booking-step-1')?.classList.remove('hidden');
  $('#booking-step-2')?.classList.add('hidden');
  ($('#booking-form') as HTMLFormElement | null)?.reset();
  selectedDate = null;
  selectedTime = null;
  clearFormMessage();
  updateSummary();
  restoreDraftFields();
}

document.addEventListener('DOMContentLoaded', () => {
  // Standalone booking page: render the calendar on load and show an inline
  // success panel after submit (the modal variants are no-ops on that page).
  const standalonePage = $('#booking-page');
  if (standalonePage) {
    renderCalendar();
    selectToday();
    updateSummary();
    restoreDraftAppointment();
  }

  // --- Remember & resume booking form ---
  const nameInput = $('#booking-name') as HTMLInputElement | null;
  const phoneInput = $('#booking-phone') as HTMLInputElement | null;
  const emailInput = $('#booking-email') as HTMLInputElement | null;
  const serviceSelect = $('#booking-service') as HTMLSelectElement | null;

  restoreDraftFields();
  if ((loadDraft().name || loadDraft().phone) && standalonePage) {
    showToast(S.draftRestored);
  }

  const persistDraft = () => {
    saveDraft({
      name: nameInput?.value ?? '',
      phone: phoneInput?.value ?? '',
      email: emailInput?.value ?? '',
      service: serviceSelect?.value ?? '',
    });
    updateBookingSteps();
  };
  nameInput?.addEventListener('input', () => {
    persistDraft();
    clearFieldErrors('name');
  });
  phoneInput?.addEventListener('input', () => {
    persistDraft();
    clearFieldErrors('phone');
  });
  emailInput?.addEventListener('input', persistDraft);
  serviceSelect?.addEventListener('change', () => {
    persistDraft();
    clearFieldErrors('service');
  });

  // Escape closes the booking modal; Tab is trapped inside while open
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeBooking();
  });
  ($('#booking-modal') as HTMLElement | null)?.addEventListener('keydown', (e: KeyboardEvent) => {
    trapTab(e, $('#booking-modal'));
  });

  // Service cards open the modal. CTAs and the mobile dock link to the
  // booking page and are ignored here. Card clicks pre-select the service.
  document
    .querySelectorAll('.btn-premium:not(.btn-checkout, .btn-checkout-final, .go-booking), .service-card')
    .forEach((el) => {
      el.addEventListener('click', (e) => {
        if (el.closest('.admin-portal, .admin-auth-overlay, .no-booking')) return;
        e.preventDefault();
        if (el.classList.contains('service-card')) {
          const cardName = (el.querySelector('h3')?.textContent ?? '').trim();
          if (cardName && serviceSelect) {
            Array.from(serviceSelect.options).forEach((opt) => {
              if (opt.text.trim() === cardName) opt.selected = true;
            });
            saveCurrentDraft();
            serviceSelect.dispatchEvent(new Event('change'));
          }
        }
        openBooking();
      });
    });

  $('#close-booking')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeBooking();
  });

  $('#btn-return-home')?.addEventListener('click', (e) => {
    e.preventDefault();
    closeBooking();
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

  // Keyboard navigation for the calendar grid
  ($('#calendar-days') as HTMLElement | null)?.addEventListener('keydown', (e) => {
    const active = document.activeElement as HTMLElement | null;
    const day = active && active.matches('.days-grid span') ? Number(toLatinDigits(active.textContent ?? '')) : NaN;
    if (isNaN(day)) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const d = dateForDay(day);
      if (!isPastDay(day)) {
        cursorDay = day;
        selectDate(d, day);
      }
      return;
    }

    const total = daysInViewMonth();
    let target: number;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') target = day + 1;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') target = day - 1;
    else return;

    e.preventDefault();
    if (target < 1 || target > total) {
      if (target < 1) {
        moveToMonth(-1, total);
      } else {
        moveToMonth(1, 1);
      }
      return;
    }
    cursorDay = target;
    selectDate(dateForDay(target), target);
    focusCalDay(target);
  });

  // Time slots
  const timeSlots = document.querySelectorAll('.time-slot');
  timeSlots.forEach((slot) => {
    slot.addEventListener('click', () => {
      if (!(slot as HTMLButtonElement).disabled) {
        timeSlots.forEach((s) => {
          s.classList.remove('active');
          s.setAttribute('aria-pressed', 'false');
        });
        slot.classList.add('active');
        slot.setAttribute('aria-pressed', 'true');
        selectedTime = slot.textContent?.trim() ?? null;
        clearFormMessage();
        updateSummary();
        updateBookingSteps();
        saveCurrentDraft();
      }
    });
  });

  // Submit → compose message + open Telegram
  $('#booking-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.querySelector<HTMLButtonElement>('.btn-confirm');
    const reEnable = () => {
      if (submitBtn) submitBtn.disabled = false;
    };
    // Guard against double-submits: disable the button while processing.
    if (submitBtn) submitBtn.disabled = true;

    const name = $('#booking-name') as HTMLInputElement | null;
    const phone = $('#booking-phone') as HTMLInputElement | null;
    const service = $('#booking-service') as HTMLSelectElement | null;

    clearFieldErrors();

    if (!selectedDate) {
      showFormMessage(S.errPickDay);
      showToast(S.errPickDayToast);
      reEnable();
      return;
    }
    if (!selectedTime) {
      showFormMessage(S.errPickTime);
      showToast(S.errPickTimeToast);
      reEnable();
      return;
    }

    const nameValue = name?.value.trim() ?? '';
    const phoneValue = (phone?.value ?? '')
      .trim()
      .replace(/\s/g, '')
      .replace(/[۰-۹]/g, (c) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)));
    const serviceValue = service?.value ?? '';

    if (!nameValue) {
      setFieldError('name', S.errName);
      name?.focus();
      reEnable();
      return;
    }
    if (!phoneValue || !/^09\d{9}$/.test(phoneValue)) {
      setFieldError('phone', S.errPhone);
      phone?.focus();
      reEnable();
      return;
    }
    if (!serviceValue) {
      setFieldError('service', S.errService);
      service?.focus();
      reEnable();
      return;
    }

    // Remember the customer's contact details for next time (pre-fill), but
    // clear the chosen service, date and time so a fresh booking starts clean.
    saveCurrentDraft({
      name: nameValue,
      phone: phoneValue,
      email: ($('#booking-email') as HTMLInputElement | null)?.value.trim() ?? '',
      service: '',
      date: '',
      time: '',
    });

    // Mark this date+time as booked so subsequent visitors on this browser
    // can't double-book the same slot (local-only guard).
    if (selectedDate && selectedTime) {
      markSlotBooked(isoLocal(selectedDate), selectedTime);
    }

    // Automatic delivery: CallMeBot → WhatsApp text, Web3Forms → email.
    // Both fire in the background when their key is configured; if neither
    // is set up yet, fall back to opening a prefilled WhatsApp chat that
    // the client sends manually so requests are never lost.
    const F = BOOKING_STRINGS.fa;
    const slotMinutes = selectedTime ? slotStartMinutes(selectedTime) : null;
    const time24 =
      slotMinutes !== null
        ? fmtDigits(`${String(Math.floor(slotMinutes / 60)).padStart(2, '0')}:${String(slotMinutes % 60).padStart(2, '0')}`)
        : (selectedTime ?? '');

    // Unique booking reference for follow-up (easy to remember, unique).
    let ref = `DLD-${String(Math.floor(10000 + Math.random() * 90000))}`;
    // Guard against accidental duplicates within this session.
    const usedRefs = new Set<string>(
      JSON.parse(sessionStorage.getItem('deldar_used_refs') ?? '[]') as string[],
    );
    while (usedRefs.has(ref)) {
      ref = `DLD-${String(Math.floor(10000 + Math.random() * 90000))}`;
    }
    usedRefs.add(ref);
    sessionStorage.setItem('deldar_used_refs', JSON.stringify([...usedRefs]));

    const emailValue = ($('#booking-email') as HTMLInputElement | null)?.value.trim() ?? '';

    const group = (label: string, value: string) => [label, value];

    const fieldSets: string[][] = [
      group(F.tgName, nameValue),
      group(F.tgPhone, phoneValue),
      ...(emailValue ? [group(F.tgEmail, emailValue)] : []),
      group(F.tgService, serviceValue),
      group(F.tgDate, jalaliDateString(selectedDate)),
      group(F.tgTime, time24),
    ];

    const msg = [
      `📅 *${F.tgTitle}*`,
      '',
      `🆔 *${F.tgRef}:* ${ref}`,
      '',
      ...fieldSets.flatMap((g) => [...g, '']),
    ]
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');

    let delivered = false;

    // Await delivery before navigating away. If we fire these in the
    // background and then immediately change window.location, the browser
    // cancels the in-flight requests — the salon would never receive the
    // booking. Awaiting (no-cors still resolves) lets the sends complete.
    const delivery: Promise<void>[] = [];

    if (SALON.callmebotKey) {
      const callmebotUrl = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(
        `+${SALON.whatsapp}`,
      )}&text=${encodeURIComponent(msg)}&apikey=${SALON.callmebotKey}`;
      delivery.push(fetch(callmebotUrl, { mode: 'no-cors' }).then(() => undefined).catch(() => undefined));
      delivered = true;
    }

    if (SALON.web3FormsKey) {
      delivery.push(
        fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: SALON.web3FormsKey,
            subject: F.tgTitle,
            message: msg,
          }),
        })
          .then(() => undefined)
          .catch(() => undefined),
      );
      delivered = true;
    }

    await Promise.all(delivery);

    if (!delivered) {
      window.open(`https://wa.me/${SALON.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
    }

    $('#booking-step-1')?.classList.add('hidden');
    $('#booking-step-2')?.classList.remove('hidden');

    // Standalone booking page: redirect to the success page
    if (standalonePage) {
      const base = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
      const isEn = document.documentElement.lang === 'en';
      const successPath = isEn ? `${base}/en/booking/success/` : `${base}/booking/success/`;
      const isoDate = selectedDate
        ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(
            selectedDate.getDate(),
          ).padStart(2, '0')}`
        : '';
      const params = new URLSearchParams({
        ref,
        service: serviceValue,
        name: nameValue,
        phone: phoneValue,
        date: jalaliDateString(selectedDate),
        time: time24,
        iso: isoDate,
      });
      window.location.href = `${successPath}?${params.toString()}`;
    }
  });
});
