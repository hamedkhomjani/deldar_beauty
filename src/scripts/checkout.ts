/**
 * Checkout page: order summary + form submission + success overlay.
 * Runs only on the checkout page (not via Layout).
 */
import { SALON, BANK } from '../config';
import { PRODUCTS } from '../data/products';
import { CHECKOUT_STRINGS, LANG, fmt } from './lang';

const S = CHECKOUT_STRINGS[LANG];

const CART_KEY = 'deldar_cart';

interface CartItem {
  id?: string;
  name?: string;
  price: number;
  image: string;
  quantity: number;
}

function $<T extends Element>(sel: string): T | null {
  return document.querySelector<T>(sel);
}

function itemName(item: CartItem): string {
  if (item.id) {
    const product = PRODUCTS.find((p) => p.id === item.id);
    if (product) return product.name[LANG];
  }
  return item.name ?? '';
}

document.addEventListener('DOMContentLoaded', () => {
  // Guard: only run on the actual checkout page.
  // Astro bundles all <script> tags globally, so this script executes on every
  // page even though Layout.astro conditionally renders it. Without this guard
  // the empty-cart redirect below fires on /shop/ and causes an infinite loop.
  if (!document.body.classList.contains('checkout-page-body')) return;

  const checkoutItemsList = $('#checkout-items-list');
  const subtotalEl = $('#subtotal');
  const finalTotalEl = $('#final-total');
  const checkoutForm = $('#checkout-form') as HTMLFormElement | null;
  const successOverlay = $('#success-overlay');

  let cart: CartItem[] = [];
  try {
    cart = JSON.parse(localStorage.getItem(CART_KEY) ?? '[]') as CartItem[];
  } catch {
    cart = [];
  }

  if (cart.length === 0) {
    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    window.location.href = `${base}${LANG === 'en' ? '/en' : ''}/shop/`;
    return;
  }

  let grandTotal = 0;

  function renderCheckoutSummary(): void {
    if (!checkoutItemsList) return;
    let total = 0;
    checkoutItemsList.innerHTML = '';

    cart.forEach((item) => {
      total += item.price * item.quantity;
      const itemEl = document.createElement('div');
      itemEl.className = 'summary-item';
      itemEl.innerHTML = `
          <div class="item-info">
            <span class="name">${itemName(item)}</span>
            <span class="qty">(${fmt(item.quantity)} ${S.qtySuffix})</span>
          </div>
          <span class="price">${fmt(item.price * item.quantity)} ${S.currency}</span>
        `;
      checkoutItemsList.appendChild(itemEl);
    });

    grandTotal = total;
    if (subtotalEl) subtotalEl.textContent = `${fmt(total)} ${S.currency}`;
    if (finalTotalEl) finalTotalEl.textContent = `${fmt(total)} ${S.currency}`;
  }

  checkoutForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const method = (document.getElementById('payment-method') as HTMLSelectElement | null)?.value ?? 'card';
    const orderCode = 'DL-' + Math.floor(100000 + Math.random() * 900000);

    const orderCodeEl = $('#success-order-code');
    const paymentNote = $('#payment-note');

    if (orderCodeEl) orderCodeEl.textContent = `${S.orderCodePrefix} ${orderCode}`;

    if (paymentNote) {
      if (method === 'card') {
        paymentNote.innerHTML = `${S.cardNoteIntro} <strong>${fmt(grandTotal)} ${S.currency}</strong> ${S.cardNoteOutro}<br>
          <div class="card-number">${BANK.card[LANG]}</div>
          <span class="sheba">${S.shebaLabel} ${BANK.sheba[LANG]}</span><br><br>
          <a href="https://t.me/${SALON.telegram}" target="_blank" rel="noopener">Telegram</a> ·
          <a href="https://wa.me/${SALON.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>`;
      } else if (method === 'cod') {
        paymentNote.innerHTML = S.codNote;
      } else {
        paymentNote.innerHTML = S.gatewayNote;
      }
      paymentNote.classList.remove('hidden');
    }

    localStorage.removeItem(CART_KEY);
    successOverlay?.classList.add('active');
  });

  renderCheckoutSummary();
});
