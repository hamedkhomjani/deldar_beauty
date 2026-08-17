/**
 * Checkout page: order summary + form submission + success overlay.
 * Runs only on the checkout page (not via Layout).
 */
import { SALON, BANK } from '../config';

const CART_KEY = 'deldar_cart';

interface CartItem {
  name: string;
  price: number;
  image: string;
  quantity: number;
}

function $<T extends Element>(sel: string): T | null {
  return document.querySelector<T>(sel);
}

function faNumber(n: number): string {
  return n.toLocaleString('fa-IR');
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
    window.location.href = `${base}/shop/`;
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
            <span class="name">${item.name}</span>
            <span class="qty">(${faNumber(item.quantity)} عدد)</span>
          </div>
          <span class="price">${faNumber(item.price * item.quantity)} تومان</span>
        `;
      checkoutItemsList.appendChild(itemEl);
    });

    grandTotal = total;
    if (subtotalEl) subtotalEl.textContent = `${faNumber(total)} تومان`;
    if (finalTotalEl) finalTotalEl.textContent = `${faNumber(total)} تومان`;
  }

  checkoutForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const method = (document.getElementById('payment-method') as HTMLSelectElement | null)?.value ?? 'card';
    const orderCode = 'DL-' + Math.floor(100000 + Math.random() * 900000);

    const orderCodeEl = $('#success-order-code');
    const paymentNote = $('#payment-note');

    if (orderCodeEl) orderCodeEl.textContent = `کد پیگیری سفارش شما: ${orderCode}`;

    if (paymentNote) {
      if (method === 'card') {
        paymentNote.innerHTML = `لطفاً مبلغ <strong>${faNumber(grandTotal)} تومان</strong> را کارت به کارت کنید:<br>
          <div class="card-number">${BANK.card}</div>
          <span class="sheba">شبا: ${BANK.sheba}</span><br><br>
          سپس تصویر فیش واریز را در
          <a href="https://t.me/${SALON.telegram}" target="_blank" rel="noopener">تلگرام</a> یا
          <a href="https://wa.me/${SALON.whatsapp}" target="_blank" rel="noopener">واتس‌اپ</a> برای ما بفرستید تا سفارش شما ثبت و ارسال شود.`;
      } else if (method === 'cod') {
        paymentNote.innerHTML = 'هزینه سفارش را هنگام دریافت محصول (پرداخت در محل) بپردازید.';
      } else {
        paymentNote.innerHTML = 'پرداخت آنلاین از طریق درگاه بانکی به زودی فعال می‌شود.';
      }
      paymentNote.classList.remove('hidden');
    }

    localStorage.removeItem(CART_KEY);
    successOverlay?.classList.add('active');
  });

  renderCheckoutSummary();
});