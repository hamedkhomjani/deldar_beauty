# Deldar Beauty Salon 💄

وب‌سایت سالن زیبایی دلدار — یک وب‌سایت لوکس ساخته‌شده با **Astro** (Static Site Generation)، شامل سامانه رزرو نوبت آنلاین (تقویم جلالی)، فروشگاه محصولات و سبد خرید.

## ✨ امکانات

- **طراحی لوکس:** زیبایی‌شناسی سرمقاله‌ای با اکسنت طلایی و حالت تاریک/روشن
- **ریسپانسیو:** بهینه برای موبایل، تبلت و دسکتاپ
- **رزرو آنلاین نوبت:** تقویم واقعی جلالی، انتخاب ساعت و ارسال درخواست به تلگرام سالن
- **فروشگاه محصولات:** سبد خرید با ذخیره‌سازی در localStorage و صفحه پرداخت (کارت به کارت / پرداخت در محل)
- **اکسنت میکرو:** کرسر سفارشی، انیمیشن‌های reveal و افکت دانه فیلم (grain)
- **SEO کامل:** JSON-LD (BeautySalon, WebSite, FAQ, Product, Breadcrumb)، Open Graph، sitemap و robots
- **استقرار خودکار:** GitHub Actions → GitHub Pages (زیرمسیر `/deldar_beauty/`)

## 🛠️ انباره‌ی فناوری

- [Astro 5](https://astro.build) — Static Site Generation + TypeScript
- CSS خالص با Custom Properties (بدون فریم‌ورک)
- فونت‌های self-hosted: Vazirmatn (فارسی)، Playfair Display و Outfit (لاتین)

## 🚀 اجرا در محیط توسعه

```bash
npm install
npm run dev        # http://localhost:4321
```

## 📦 بیلد و پیش‌نمایش

```bash
npm run build      # خروجی در dist/
npm run preview    # پیش‌نمایش خروجی نهایی
npm run check      # بررسی تایپ‌اسکریپت (astro check)
```

## 🗂️ ساختار پروژه

```
src/
├── pages/          # ۴ صفحه: index، about، shop، checkout
├── components/     # Layout، Header، Footer، BookingModal، CartDrawer و ...
├── scripts/        # cursor، ui، booking، cart، checkout
├── data/           # services، products، faq، schema (JSON-LD)
├── styles/         # global.css (همه استایل‌ها)
└── assets/fonts/   # فونت‌های self-hosted
public/             # تصاویر، robots.txt، sitemap.xml
```

## ⚙️ اطلاعات کسب‌وکار

همه داده‌های قابل تغییر (شماره تماس، آدرس، هندل تلگرام/اینستاگرام، شماره کارت و…) در یک فایل متمرکز شده‌اند:

- `src/config.ts` — اطلاعات سالن و لینک‌ها
- `src/data/products.ts` — قیمت‌ها (به تومان) و محصولات

## ☁️ استقرار

با هر `push` به شاخه `main`، GitHub Actions بیلد را انجام داده و خروجی را روی GitHub Pages منتشر می‌کند:

<https://hamedkhomjani.github.io/deldar_beauty/>