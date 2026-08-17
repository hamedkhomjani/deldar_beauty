/**
 * Shopping cart — drawer, quantity controls, badge, checkout redirect.
 * State persists in localStorage under `deldar_cart`.
 */
import { showToast } from './toast';
export {};

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

type StoredItem = Partial<CartItem> & { name?: string; price?: number };

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? (JSON.parse(raw) as StoredItem[]) : [];
    return parsed.filter(
      (item): item is CartItem => typeof item.name === 'string' && typeof item.price === 'number',
    );
  } catch {
    return [];
  }
}

let cart: CartItem[] = loadCart();

const cartToggle = $('#cart-toggle');
const closeCart = $('#close-cart');
const cartDrawer = $('#cart-drawer');
const cartOverlay = $('#cart-overlay');
const cartItemsContainer = $('#cart-items');
const cartTotalAmount = $('#cart-total-amount');
const cartCountBadge = $('.cart-count');

function faNumber(n: number): string {
  return n.toLocaleString('fa-IR');
}

function updateCart(): void {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
}

function renderCart(): void {
  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<div class="cart-empty-msg">سبد خرید شما فعلاً خالی است.</div>';
    if (cartTotalAmount) cartTotalAmount.textContent = '۰ تومان';
    if (cartCountBadge) cartCountBadge.textContent = '۰';
    return;
  }

  let total = 0;
  let count = 0;

  cartItemsContainer.innerHTML = '';
  cart.forEach((item, index) => {
    total += item.price * item.quantity;
    count += item.quantity;

    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
        <div class="cart-item-img">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p class="price">${faNumber(item.price)} تومان</p>
          <div class="cart-item-controls">
            <div class="qty-controls">
              <button class="qty-btn minus" data-index="${index}" aria-label="کم کردن">&minus;</button>
              <span>${faNumber(item.quantity)}</span>
              <button class="qty-btn plus" data-index="${index}" aria-label="زیاد کردن">&plus;</button>
            </div>
            <button class="remove-item" data-index="${index}" aria-label="حذف از سبد">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
    cartItemsContainer.appendChild(itemEl);
  });

  if (cartTotalAmount) cartTotalAmount.textContent = `${faNumber(total)} تومان`;
  if (cartCountBadge) cartCountBadge.textContent = faNumber(count);
}

function openCart(): void {
  cartDrawer?.classList.add('active');
  cartOverlay?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function toggleCart(): void {
  const isActive = cartDrawer?.classList.toggle('active') ?? false;
  cartOverlay?.classList.toggle('active', isActive);
  document.body.style.overflow = isActive ? 'hidden' : 'auto';
}

function addToCart(product: { name: string; price: number; image: string }): void {
  const existingItem = cart.find((item) => item.name === product.name);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  updateCart();
  openCart();
}

/** Persian (۰-۹) digits → English (0-9) */
function persianToEnglish(str: string): string {
  const pChars = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[۰-۹]/g, (c) => pChars.indexOf(c).toString());
}

document.addEventListener('DOMContentLoaded', () => {
  cartToggle?.addEventListener('click', toggleCart);
  closeCart?.addEventListener('click', toggleCart);
  cartOverlay?.addEventListener('click', toggleCart);

  // Escape closes the cart drawer
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (cartDrawer?.classList.contains('active')) toggleCart();
  });

  // Qty +/- and remove (event delegation)
  cartItemsContainer?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const index = Number(target.dataset.index);
    if (!Number.isInteger(index) || cart[index] === undefined) return;

    if (target.classList.contains('plus')) {
      cart[index].quantity += 1;
      updateCart();
    } else if (target.classList.contains('minus')) {
      if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
      } else {
        cart.splice(index, 1);
      }
      updateCart();
    } else if (target.classList.contains('remove-item')) {
      cart.splice(index, 1);
      updateCart();
    }
  });

  // Add-to-cart buttons (shop page) — reads the card DOM, like before
  document.querySelectorAll<HTMLButtonElement>('.btn-add-cart').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      if (!card || !cartItemsContainer) return;

      const priceText = card.querySelector('.product-price')?.textContent ?? '';
      const cleanPrice = persianToEnglish(priceText).replace(/[^\d]/g, '');

      addToCart({
        name: card.querySelector('.product-title')?.textContent?.trim() ?? 'محصول',
        price: parseInt(cleanPrice, 10) || 0,
        image: (card.querySelector('.product-image img') as HTMLImageElement | null)?.src ?? '',
      });

      // Button feedback: flip to "✓ اضافه شد" briefly
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = '✓ اضافه شد';
      window.setTimeout(() => {
        if (btn.isConnected) {
          btn.disabled = false;
          btn.textContent = original;
        }
      }, 1200);
    });
  });

  // Checkout redirect
  const checkoutBtn = document.querySelector('.btn-checkout');
  checkoutBtn?.addEventListener('click', () => {
    if (cart.length > 0) {
      const base = import.meta.env.BASE_URL.replace(/\/$/, '');
      window.location.href = `${base}/checkout/`;
    } else {
      showToast('سبد خرید شما خالی است');
    }
  });

  renderCart();
});