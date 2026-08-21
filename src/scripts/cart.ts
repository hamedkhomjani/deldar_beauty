/**
 * Shopping cart — drawer, quantity controls, badge, checkout redirect.
 * State persists in localStorage under `deldar_cart`.
 * Product names are resolved from the bilingual catalog via product id,
 * so the drawer always renders in the current page language.
 */
import { showToast } from './toast';
import { PRODUCTS } from '../data/products';
import { CART_STRINGS, LANG, fmt } from './lang';

const S = CART_STRINGS[LANG];

const CART_KEY = 'deldar_cart';

interface CartItem {
  /** Product id from the catalog (preferred) */
  id?: string;
  /** Legacy/plain fallback name (carts saved before ids existed) */
  name?: string;
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
      (item): item is CartItem => typeof item.price === 'number' && (typeof item.name === 'string' || typeof item.id === 'string'),
    );
  } catch {
    return [];
  }
}

function productName(item: CartItem): string {
  if (item.id) {
    const product = PRODUCTS.find((p) => p.id === item.id);
    if (product) return product.name[LANG];
  }
  return item.name ?? S.fallbackProduct;
}

let cart: CartItem[] = loadCart();

const cartToggle = $('#cart-toggle');
const closeCart = $('#close-cart');
const cartDrawer = $('#cart-drawer');
const cartOverlay = $('#cart-overlay');
const cartItemsContainer = $('#cart-items');
const cartTotalAmount = $('#cart-total-amount');
const cartCountBadge = $('.cart-count');
const cartFooter = $('#cart-footer');

const basePath = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
const shopPath = `${basePath}${LANG === 'en' ? '/en' : ''}/shop/`;

function updateCart(): void {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
}

function renderCart(): void {
  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty-msg">
        <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        <p>${S.emptyMsg}</p>
        <a class="btn-empty-shop" href="${shopPath}">${S.viewShop}</a>
      </div>`;
    if (cartTotalAmount) cartTotalAmount.textContent = S.zero;
    if (cartCountBadge) cartCountBadge.textContent = LANG === 'en' ? '0' : '۰';
    cartFooter?.classList.add('hidden');
    return;
  }

  cartFooter?.classList.remove('hidden');

  let total = 0;
  let count = 0;

  cartItemsContainer.innerHTML = '';
  cart.forEach((item, index) => {
    total += item.price * item.quantity;
    count += item.quantity;

    const name = productName(item);

    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
        <div class="cart-item-img">
          <img src="${item.image}" alt="${name}">
        </div>
        <div class="cart-item-info">
          <h4>${name}</h4>
          <p class="price">${fmt(item.price)} ${S.currency}</p>
          <div class="cart-item-controls">
            <div class="qty-controls">
              <button class="qty-btn minus" data-index="${index}" aria-label="${S.minusAria}">&minus;</button>
              <span>${fmt(item.quantity)}</span>
              <button class="qty-btn plus" data-index="${index}" aria-label="${S.plusAria}">&plus;</button>
            </div>
            <button class="remove-item" data-index="${index}" aria-label="${S.removeAria}">
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

  if (cartTotalAmount) cartTotalAmount.textContent = `${fmt(total)} ${S.currency}`;
  if (cartCountBadge) cartCountBadge.textContent = fmt(count);
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

function addToCart(product: { id?: string; name?: string; price: number; image: string }): void {
  const existingItem = cart.find(
    (item) => (product.id && item.id === product.id) || (!product.id && item.name === product.name),
  );
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  updateCart();
  openCart();
}

/** Persian/Arabic digits → English (0-9), for legacy price parsing */
function persianToEnglish(str: string): string {
  const digits = '۰۱۲۳۴۵۶۷۸۹';
  return str.replace(/[۰-۹]/g, (c) => String(digits.indexOf(c)));
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

  // Add-to-cart buttons (shop page) — prefer data attributes, fall back to DOM text
  document.querySelectorAll<HTMLButtonElement>('.btn-add-cart').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card') as HTMLElement | null;
      if (!card || !cartItemsContainer) return;

      const id = card.dataset.productId;
      let price = Number(card.dataset.productPrice ?? NaN);

      if (!Number.isFinite(price)) {
        const priceText = card.querySelector('.product-price')?.textContent ?? '';
        const cleanPrice = persianToEnglish(priceText).replace(/[^\d]/g, '');
        price = parseInt(cleanPrice, 10) || 0;
      }

      addToCart({
        id,
        name: card.querySelector('.product-title')?.textContent?.trim() ?? undefined,
        price,
        image: (card.querySelector('.product-image img') as HTMLImageElement | null)?.src ?? '',
      });

      // Button feedback: flip to "added" briefly
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = S.addedFeedback;
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
      window.location.href = `${base}${LANG === 'en' ? '/en' : ''}/checkout/`;
    } else {
      showToast(S.emptyToast);
    }
  });

  renderCart();
});
