/**
 * Admin Store & Data Persistence Layer
 * Handles localStorage sync for products, custom additions, stock toggles, and order logs.
 */
import { PRODUCTS } from '../data/products';

export interface AdminProduct {
  id: string;
  name: { fa: string; en: string };
  category: { fa: string; en: string };
  price: number;
  image: string;
  alt: { fa: string; en: string };
  description: { fa: string; en: string };
  badge?: { fa: string; en: string };
  inStock?: boolean;
}

export interface CustomerOrder {
  id: string;
  date: string;
  customerName: string;
  phone: string;
  address: string;
  items: { id: string; name: string; qty: number; price: number }[];
  totalPrice: number;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface AdminReview {
  id: string;
  name: string;
  service: string;
  rating: number;
  text: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

const PRODUCTS_STORAGE_KEY = 'deldar_custom_products';
const ORDERS_STORAGE_KEY = 'deldar_customer_orders';
const REVIEWS_STORAGE_KEY = 'deldar_customer_reviews';
const ADMIN_PIN_KEY = 'deldar_admin_pin';

/** Retrieve products from localStorage or fall back to static catalog */
export function getAdminProducts(): AdminProduct[] {
  if (typeof window === 'undefined') return [...PRODUCTS];
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading custom products:', e);
  }
  return [...PRODUCTS].map((p) => ({ ...p, inStock: true }));
}

/** Save updated products to localStorage */
export function saveAdminProducts(products: AdminProduct[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
}

/** Add a new product */
export function addProduct(newProduct: Omit<AdminProduct, 'id'>): AdminProduct {
  const products = getAdminProducts();
  const id = 'prod_' + Date.now();
  const product: AdminProduct = { ...newProduct, id, inStock: newProduct.inStock ?? true };
  products.unshift(product);
  saveAdminProducts(products);
  return product;
}

/** Update an existing product */
export function updateProduct(id: string, updatedFields: Partial<AdminProduct>): boolean {
  const products = getAdminProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return false;

  products[index] = { ...products[index], ...updatedFields };
  saveAdminProducts(products);
  return true;
}

/** Delete a product */
export function deleteProduct(id: string): boolean {
  let products = getAdminProducts();
  const initialLen = products.length;
  products = products.filter((p) => p.id !== id);
  if (products.length === initialLen) return false;

  saveAdminProducts(products);
  return true;
}

/** Toggle inStock status */
export function toggleStock(id: string): boolean {
  const products = getAdminProducts();
  const product = products.find((p) => p.id === id);
  if (!product) return false;

  product.inStock = !(product.inStock ?? true);
  saveAdminProducts(products);
  return true;
}

/** Retrieve recorded customer orders */
export function getCustomerOrders(): CustomerOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading orders:', e);
  }
  return [];
}

/** Save a new customer order */
export function recordCustomerOrder(order: Omit<CustomerOrder, 'id' | 'date' | 'status'>): CustomerOrder {
  const orders = getCustomerOrders();
  const newOrder: CustomerOrder = {
    ...order,
    id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    date: new Date().toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    status: 'pending',
  };
  orders.unshift(newOrder);
  if (typeof window !== 'undefined') {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }
  return newOrder;
}

/** Check admin PIN */
export function verifyAdminPin(pin: string): boolean {
  const savedPin = (typeof window !== 'undefined' && localStorage.getItem(ADMIN_PIN_KEY)) || '1234';
  return pin.trim() === savedPin;
}

/** Change admin PIN */
export function updateAdminPin(newPin: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ADMIN_PIN_KEY, newPin.trim());
  }
}

/** Export TypeScript code for src/data/products.ts */
export function generateProductsTypeScript(products: AdminProduct[]): string {
  const formatted = products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    image: p.image,
    alt: p.alt,
    description: p.description,
    ...(p.badge ? { badge: p.badge } : {}),
  }));

  return `import type { Localized } from '../i18n';

export interface Product {
  id: string;
  name: Localized;
  category: Localized;
  /** Price in TOMAN */
  price: number;
  image: string;
  alt: Localized;
  description: Localized;
  badge?: Localized;
}

export const PRODUCTS: Product[] = ${JSON.stringify(formatted, null, 2)} as const;

export function tomanToRial(toman: number): number {
  return toman * 10;
}
`;
}

/** Get all reviews (customer submitted reviews) */
export function getAdminReviews(): AdminReview[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading reviews:', e);
  }
  return [];
}

/** Submit a new review from the website form */
export function submitCustomerReview(review: Omit<AdminReview, 'id' | 'date' | 'status'>): AdminReview {
  const reviews = getAdminReviews();
  const newReview: AdminReview = {
    ...review,
    id: 'rev_' + Date.now(),
    date: new Date().toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }),
    status: 'pending',
  };
  reviews.unshift(newReview);
  if (typeof window !== 'undefined') {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  }
  return newReview;
}

/** Update review status (approve or reject) */
export function updateReviewStatus(id: string, status: 'approved' | 'rejected'): boolean {
  const reviews = getAdminReviews();
  const review = reviews.find((r) => r.id === id);
  if (!review) return false;

  review.status = status;
  if (typeof window !== 'undefined') {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  }
  return true;
}

/** Delete a review */
export function deleteReview(id: string): boolean {
  let reviews = getAdminReviews();
  const initialLen = reviews.length;
  reviews = reviews.filter((r) => r.id !== id);
  if (reviews.length === initialLen) return false;

  if (typeof window !== 'undefined') {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  }
  return true;
}
