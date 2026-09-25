-- ═══════════════════════════════════════════════════════════════
--  Deldar Beauty — Supabase setup (پیکربندی دیتابیس)
--  ═══════════════════════════════════════════════════════════════
--  نحوه استفاده:
--   1) در supabase.com حساب بسازید → New project (نام دلخواه،
--      کشور نزدیک‌تر به «فرانکفورت/آلمان» را انتخاب کنید).
--   2) منوی چپ ⇐ SQL Editor ⇐ New Query ⇐ کل این فایل را کپی و
--      «Run» کنید (یک‌بار اجرا کافی است).
--   3) منوی چپ ⇐ Authentication ⇐ Providers ⇐ مطمئن شوید
--      «Email» روشن است.
--   4) منوی چپ ⇐ Authentication ⇐ Users ⇐ «Add user» → ایمیل و
--      رمز مدیر را بسازید.
--   5) Project Settings ⇐ API ⇐ Project URL و anon public key را
--      بردارید و در فایل src/config.ts (یا .env) قرار دهید.
--
--  همین! محصولات و نظرات اولیه خودکار بارگذاری می‌شوند.
-- ═══════════════════════════════════════════════════════════════

-- ── محصولات ────────────────────────────────────────────────────
create table if not exists public.products (
  id text primary key,
  name_fa text not null default '',
  name_en text not null default '',
  category_fa text not null default '',
  category_en text not null default '',
  price bigint not null default 0,
  image text,
  alt_fa text,
  alt_en text,
  description_fa text,
  description_en text,
  badge_fa text,
  badge_en text,
  in_stock boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── سفارشات ────────────────────────────────────────────────────
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  order_no text,
  customer_name text not null default '',
  phone text not null default '',
  address text not null default '',
  items jsonb not null default '[]'::jsonb,
  total_price bigint not null default 0,
  status text not null default 'pending',
  date text,
  created_at timestamptz not null default now()
);

-- ── نظرات ──────────────────────────────────────────────────────
create table if not exists public.reviews (
  id text primary key,
  name text not null default '',
  service text not null default '',
  rating integer not null default 5 check (rating between 1 and 5),
  text text not null default '',
  date text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- ── دسترسی‌ها (RLS) ────────────────────────────────────────────
-- هر بازدیدکننده فقط می‌تواند «بخواند»؛ تغییر و حذف فقط برای مدیرِ
-- واردشده مجاز است. سفارش و نظر ثبت (insert) برای عموم باز است.

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "products_public_select" on public.products;
create policy "products_public_select" on public.products
  for select using (true);
drop policy if exists "products_admin_insert" on public.products;
create policy "products_admin_insert" on public.products
  for insert with check (auth.uid() is not null);
drop policy if exists "products_admin_update" on public.products;
create policy "products_admin_update" on public.products
  for update using (auth.uid() is not null);
drop policy if exists "products_admin_delete" on public.products;
create policy "products_admin_delete" on public.products
  for delete using (auth.uid() is not null);

drop policy if exists "orders_public_insert" on public.orders;
create policy "orders_public_insert" on public.orders
  for insert with check (true);
drop policy if exists "orders_admin_select" on public.orders;
create policy "orders_admin_select" on public.orders
  for select using (auth.uid() is not null);
drop policy if exists "orders_admin_delete" on public.orders;
create policy "orders_admin_delete" on public.orders
  for delete using (auth.uid() is not null);

drop policy if exists "reviews_public_insert" on public.reviews;
create policy "reviews_public_insert" on public.reviews
  for insert with check (true);
drop policy if exists "reviews_public_select" on public.reviews;
create policy "reviews_public_select" on public.reviews
  for select using (true);
drop policy if exists "reviews_admin_update" on public.reviews;
create policy "reviews_admin_update" on public.reviews
  for update using (auth.uid() is not null);
drop policy if exists "reviews_admin_delete" on public.reviews;
create policy "reviews_admin_delete" on public.reviews
  for delete using (auth.uid() is not null);

-- ── ذخیره‌سازی تصاویر ──────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read" on storage.objects
  for select using (bucket_id = 'product-images');
drop policy if exists "product_images_admin_write" on storage.objects;
create policy "product_images_admin_write" on storage.objects
  for insert with check (bucket_id = 'product-images' and auth.uid() is not null);
drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete" on storage.objects
  for delete using (bucket_id = 'product-images' and auth.uid() is not null);

-- ── محصولات اولیه ──────────────────────────────────────────────
insert into public.products (id, name_fa, name_en, category_fa, category_en, price, image, alt_fa, alt_en, description_fa, description_en, badge_fa, badge_en, in_stock) values
('hair-oil', 'روغن موی اکسیر طلایی', 'Golden Elixir Hair Oil', 'مراقبت از مو', 'Hair Care', 1280000, 'assets/images/product-hair-oil.png', 'اکسیر موی طلایی', 'Golden hair elixir', 'روغن موی گیاهی احیاکننده برای درخشش و تقویت موهای آسیب‌دیده.', 'Restoring herbal hair oil for shine and strengthening of damaged hair.', 'پرفروش', 'Bestseller', true),
('skin-serum', 'سرم جوان‌ساز رادیانس', 'Radiance Anti-Aging Serum', 'مراقبت از پوست', 'Skin Care', 2450000, 'assets/images/product-skin-serum.png', 'سرم جوان‌ساز صورت', 'Anti-aging face serum', 'سرم مراقبت از پوست برای شفافیت و جوان‌سازی پوست صورت.', 'Skin-care serum for clarity and rejuvenation of facial skin.', null, null, true),
('biotin-mask', 'ماسک احیاکننده بیوتین', 'Biotin Repair Mask', 'مراقبت تخصصی', 'Specialized Care', 950000, 'assets/images/hair_tools_hands.webp', 'ماسک موی پروتئین', 'Protein hair mask', 'ماسک موی پروتئینی حاوی بیوتین برای ترمیم و نرمی مو.', 'Protein hair mask with biotin for repair and softness.', 'جدید', 'New', true),
('luxury-gift-set', 'مجموعه لوکس مراقبتی', 'Luxury Care Set', 'پکیج هدیه', 'Gift Set', 4800000, 'assets/images/consultation.webp', 'پک محصولات مراقبتی', 'Care products set', 'پک هدیه لوکس محصولات مراقبت از پوست و مو برای هدیه‌ای خاص.', 'A luxury gift set of skin and hair care products for a special present.', null, null, true)
on conflict (id) do nothing;

-- ── نظرات اولیه ────────────────────────────────────────────────
insert into public.reviews (id, name, service, rating, text, date, status) values
('rev_init_1', 'نگار محمدی', 'آرایش عروس', 5, 'برای عروسی‌ام گریم شدم. دقیقاً همون چیزی شد که تو ذهنم بود؛ آرایشگر با حوصله همه مراحل رو توضیح داد و میکاپ تا آخر شب تاب بود.', '۱۴۰۳/۰۶/۱۵', 'approved'),
('rev_init_2', 'سارا احمدی', 'رنگ و لایت مو', 5, 'اولین باره رنگمو جایی غیر از اینجا انجام نمیدم. لایت‌ها طبیعی و سالم دراومدن و موهام آسیب ندید. مشاوره قبل از کار هم عالی بود.', '۱۴۰۳/۰۶/۱۵', 'approved'),
('rev_init_3', 'مریم رضایی', 'کاشت ناخن', 5, 'کاشت ناخنم سه هفته تمیز موند بدون هیچ بلندشدگی. محیط سالن هم خیلی شیک و بهداشتیه، دقیقاً سر وقت نوبتم رسید.', '۱۴۰۳/۰۶/۱۵', 'approved'),
('rev_init_4', 'الهام کریمی', 'پاکسازی پوست', 5, 'پوستم بعد از پاکسازی واقعاً فرق کرده. متخصص پوست قبل از شروع پوستم رو بررسی کرد و محصولات مناسب پیشنهاد داد، نه اینکه فقط بخوره فروخت.', '۱۴۰۳/۰۶/۱۵', 'approved'),
('rev_init_5', 'شقایق موسوی', 'اصلاح و کوتاهی مو', 4, 'کوتاهی مو عالی بود و مدل چهره‌ام رو کاملاً در نظر گرفتن. فقط روزهای شلوغ کمی معطل شدم؛ ولی کیفیت کار ارزشش رو داشت.', '۱۴۰۳/۰۶/۱۵', 'approved'),
('rev_init_6', 'پریسا نادری', 'ریلکس و ترمیم مو', 5, 'موهام که رنگ و دکلره زیاد خورده بود، بعد از پروتئین‌تراپی دلدار جان گرفت. برخورد پرسنل هم صمیمی و محترمانه بود. قطعاً برمی‌گردم.', '۱۴۰۳/۰۶/۱۵', 'approved')
on conflict (id) do nothing;