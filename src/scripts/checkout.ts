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

    try {
      const raw = localStorage.getItem('deldar_custom_products');
      if (raw) {
        const customProds = JSON.parse(raw);
        const custom = customProds.find((p: { id: string; name?: Record<string, string> }) => p.id === item.id);
        if (custom?.name) return custom.name[LANG] || custom.name.fa || item.name || '';
      }
    } catch {}
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

  checkoutForm?.addEventListener('submit', async (e) => {
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

    // Record the order (Supabase when configured, else localStorage) so the admin can view it
    try {
      const customerName = (document.getElementById('full-name') as HTMLInputElement | null)?.value
        ?? (document.getElementById('first-name') as HTMLInputElement | null)?.value ?? 'مشتری';
      const phone = (document.getElementById('phone') as HTMLInputElement | null)?.value ?? '';
      const address = (document.getElementById('address') as HTMLInputElement | null)?.value ?? '';

      const orderItems = cart.map((item) => ({
        id: item.id ?? '',
        name: itemName(item),
        qty: item.quantity,
        price: item.price,
      }));

      const { recordCustomerOrder } = await import('./adminStore');
      await recordCustomerOrder({
        customerName,
        phone,
        address,
        items: orderItems,
        totalPrice: grandTotal,
      });
    } catch {
      // Non-critical — order logging failure should not block checkout success
    }

    localStorage.removeItem(CART_KEY);
    successOverlay?.classList.add('active');
    (successOverlay as HTMLElement | null)?.focus({ preventScroll: true });
  });

  renderCheckoutSummary();
});

