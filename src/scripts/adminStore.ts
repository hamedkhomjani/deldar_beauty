/**
 * Admin Store & Data Persistence Layer
 * Dual backend: Supabase when configured (PUBLIC_SUPABASE_URL / _ANON_KEY),
 * otherwise browser localStorage (single-device draft mode).
 * The synced product catalog is always mirrored into localStorage so the
 * synchronous cart/checkout name lookup keeps working without async plumbing.
 */
import { PRODUCTS } from '../data/products';
import { REVIEWS } from '../data/reviews';
import { supabase, supabaseConfigured } from './supabase';

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

export const INITIAL_ADMIN_REVIEWS: AdminReview[] = REVIEWS.map((r, i) => ({
  id: `rev_init_${i + 1}`,
  name: r.name.fa,
  service: r.service.fa,
  rating: r.rating,
  text: r.text.fa,
  date: '۱۴۰۳/۰۶/۱۵',
  status: 'approved',
}));

// ── Row <-> entity mapping (Supabase tables) ─────────────────────────────
function rowToProduct(row: any): AdminProduct {
  return {
    id: row.id,
    name: { fa: row.name_fa ?? '', en: row.name_en ?? '' },
    category: { fa: row.category_fa ?? '', en: row.category_en ?? '' },
    price: Number(row.price ?? 0),
    image: row.image ?? '',
    alt: { fa: row.alt_fa ?? '', en: row.alt_en ?? '' },
    description: { fa: row.description_fa ?? '', en: row.description_en ?? '' },
    ...(row.badge_fa || row.badge_en ? { badge: { fa: row.badge_fa ?? '', en: row.badge_en ?? '' } } : {}),
    inStock: row.in_stock ?? true,
  };
}

function productToRow(p: AdminProduct) {
  return {
    id: p.id,
    name_fa: p.name.fa,
    name_en: p.name.en,
    category_fa: p.category.fa,
    category_en: p.category.en,
    price: p.price,
    image: p.image || null,
    alt_fa: p.alt.fa,
    alt_en: p.alt.en,
    description_fa: p.description.fa,
    description_en: p.description.en,
    badge_fa: p.badge?.fa ?? null,
    badge_en: p.badge?.en ?? null,
    in_stock: p.inStock ?? true,
  };
}

function rowToReview(row: any): AdminReview {
  return {
    id: row.id,
    name: row.name ?? '',
    service: row.service ?? '',
    rating: Number(row.rating ?? 5),
    text: row.text ?? '',
    date: row.date ?? '',
    status: (row.status as AdminReview['status']) ?? 'pending',
  };
}

function rowToOrder(row: any): CustomerOrder {
  const items = Array.isArray(row.items)
    ? row.items.map((i: any) => ({
        id: String(i.id ?? ''),
        name: String(i.name ?? ''),
        qty: Number(i.qty ?? 1),
        price: Number(i.price ?? 0),
      }))
    : [];
  return {
    id: row.order_no ?? String(row.id),
    date: row.date ?? '',
    customerName: row.customer_name ?? '',
    phone: row.phone ?? '',
    address: row.address ?? '',
    items,
    totalPrice: Number(row.total_price ?? 0),
    status: (row.status as CustomerOrder['status']) ?? 'pending',
  };
}

/**
 * Mirror a catalog into localStorage so sync readers (cart/checkout name
 * lookup) always see the latest products from any backend.
 */
export function syncProductsToLocal(products: AdminProduct[]): void {
  if (typeof window === 'undefined' || products.length === 0) return;
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Error caching products locally:', e);
  }
}

// ── Local (localStorage) primitives ───────────────────────────────────────
async function readLocalProducts(): Promise<AdminProduct[]> {
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

async function writeLocalProducts(products: AdminProduct[]): Promise<void> {
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
}

async function readLocalOrders(): Promise<CustomerOrder[]> {
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

async function readLocalReviews(): Promise<AdminReview[]> {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (raw) {
      const parsed: AdminReview[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const existingIds = new Set(parsed.map((r) => r.id));
        const missingInitial = INITIAL_ADMIN_REVIEWS.filter((initRev) => !existingIds.has(initRev.id));
        if (missingInitial.length > 0) {
          const merged = [...parsed, ...missingInitial];
          localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading reviews:', e);
  }
  return INITIAL_ADMIN_REVIEWS;
}

// ── Products ──────────────────────────────────────────────────────────────
/** Retrieve products from Supabase (if configured) or localStorage/static catalog. */
export async function getAdminProducts(): Promise<AdminProduct[]> {
  if (supabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) {
        const products = data.map(rowToProduct);
        syncProductsToLocal(products);
        return products;
      }
      // Empty table → static catalog so the shop never appears empty.
      return [...PRODUCTS].map((p) => ({ ...p, inStock: true }));
    } catch (e) {
      console.error('Error fetching products from Supabase:', e);
    }
  }
  return readLocalProducts();
}

/** Add a new product. */
export async function addProduct(newProduct: Omit<AdminProduct, 'id'>): Promise<AdminProduct> {
  const id = 'prod_' + Date.now();
  const product: AdminProduct = { ...newProduct, id, inStock: newProduct.inStock ?? true };

  if (supabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('products').insert(productToRow(product));
      if (error) throw error;
      return product;
    } catch (e) {
      console.error('Error adding product to Supabase:', e);
    }
  }

  const products = await readLocalProducts();
  products.unshift(product);
  await writeLocalProducts(products);
  return product;
}

/** Update an existing product. */
export async function updateProduct(id: string, updatedFields: Partial<AdminProduct>): Promise<boolean> {
  const products = await readLocalProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return false;

  products[index] = { ...products[index], ...updatedFields };
  await writeLocalProducts(products);

  if (supabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('products').update(productToRow(products[index])).eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.error('Error updating product on Supabase:', e);
    }
  }
  return true;
}

/** Delete a product. */
export async function deleteProduct(id: string): Promise<boolean> {
  if (supabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      const products = await readLocalProducts();
      await writeLocalProducts(products.filter((p) => p.id !== id));
      return true;
    } catch (e) {
      console.error('Error deleting product on Supabase:', e);
    }
  }

  const products = await readLocalProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  await writeLocalProducts(filtered);
  return true;
}

/** Toggle inStock status. */
export async function toggleStock(id: string): Promise<boolean> {
  const products = await readLocalProducts();
  const product = products.find((p) => p.id === id);
  if (!product) return false;

  product.inStock = !(product.inStock ?? true);
  await writeLocalProducts(products);

  if (supabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('products').update({ in_stock: product.inStock }).eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.error('Error toggling stock on Supabase:', e);
    }
  }
  return true;
}

// ── Orders ────────────────────────────────────────────────────────────────
/** Retrieve recorded customer orders (admin only). */
export async function getCustomerOrders(): Promise<CustomerOrder[]> {
  if (supabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) return data.map(rowToOrder);
    } catch (e) {
      console.error('Error fetching orders from Supabase:', e);
    }
  }
  return readLocalOrders();
}

/** Save a new customer order (from checkout page). */
export async function recordCustomerOrder(order: Omit<CustomerOrder, 'id' | 'date' | 'status'>): Promise<CustomerOrder> {
  const newOrder: CustomerOrder = {
    ...order,
    id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    date: new Date().toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    status: 'pending',
  };

  if (supabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('orders').insert({
        order_no: newOrder.id,
        customer_name: newOrder.customerName,
        phone: newOrder.phone,
        address: newOrder.address,
        items: newOrder.items,
        total_price: newOrder.totalPrice,
        status: newOrder.status,
      });
      if (error) throw error;
      return newOrder;
    } catch (e) {
      console.error('Error recording order on Supabase:', e);
    }
  }

  const orders = await readLocalOrders();
  orders.unshift(newOrder);
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  return newOrder;
}

/** Clear all orders (admin action). */
export async function clearCustomerOrders(): Promise<void> {
  if (supabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('orders').delete().neq('id', 0);
      if (error) throw error;
    } catch (e) {
      console.error('Error clearing orders on Supabase:', e);
    }
  }
  localStorage.removeItem(ORDERS_STORAGE_KEY);
}

/** Check admin PIN (local fallback auth only). */
export function verifyAdminPin(pin: string): boolean {
  const savedPin = (typeof window !== 'undefined' && localStorage.getItem(ADMIN_PIN_KEY)) || '1234';
  return pin.trim() === savedPin;
}

/** Change admin PIN (local fallback auth only). */
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

// ── Reviews ───────────────────────────────────────────────────────────────
/** Get all reviews (admin moderation + approved display). */
export async function getAdminReviews(): Promise<AdminReview[]> {
  if (supabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) return data.map(rowToReview);
    } catch (e) {
      console.error('Error fetching reviews from Supabase:', e);
    }
  }
  return readLocalReviews();
}

/** Submit a new review from the website form. */
export async function submitCustomerReview(review: Omit<AdminReview, 'id' | 'date' | 'status'>): Promise<AdminReview> {
  const newReview: AdminReview = {
    ...review,
    id: 'rev_' + Date.now(),
    date: new Date().toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }),
    status: 'pending',
  };

  if (supabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('reviews').insert({
        id: newReview.id,
        name: newReview.name,
        service: newReview.service,
        rating: newReview.rating,
        text: newReview.text,
        date: newReview.date,
        status: newReview.status,
      });
      if (error) throw error;
      return newReview;
    } catch (e) {
      console.error('Error submitting review to Supabase:', e);
    }
  }

  const reviews = await readLocalReviews();
  reviews.unshift(newReview);
  localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  return newReview;
}

/** Update review status (approve or reject). */
export async function updateReviewStatus(id: string, status: 'approved' | 'rejected'): Promise<boolean> {
  if (supabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('reviews').update({ status }).eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Error updating review on Supabase:', e);
    }
  }

  const reviews = await readLocalReviews();
  const review = reviews.find((r) => r.id === id);
  if (!review) return false;
  review.status = status;
  localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  return true;
}

/** Delete a review. */
export async function deleteReview(id: string): Promise<boolean> {
  if (supabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Error deleting review on Supabase:', e);
    }
  }

  const reviews = await readLocalReviews();
  const filtered = reviews.filter((r) => r.id !== id);
  if (filtered.length === reviews.length) return false;
  localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(filtered));
  return true;
}