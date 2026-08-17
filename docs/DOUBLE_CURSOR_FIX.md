# رفع مشکل نمایش همزمان دو کرسر (Double Cursor Fix)

## مشکل
در سبد خرید، **هم کرسر سیستم عامل و هم کرسر سفارشی وبسایت** نمایش داده می‌شد.

## علت
قانون `cursor: none` فقط روی `body` بود و روی المنت‌های دیگر (مثل سبد خرید، modal، دکمه‌ها) override می‌شد.

## راه‌حل پیاده‌سازی شده ✅

### 1. مخفی کردن کرسر سیستم در کل صفحه
```css
/* Hide default cursor for custom cursor */
body,
body * {
    cursor: none !important;
}
```

### 2. نمایش کرسر سیستم در سبد خرید و Modal
```css
/* Show default cursor in cart drawer for better UX */
.cart-drawer,
.cart-drawer * {
    cursor: auto !important;
}

/* Pointer cursor for interactive elements in cart */
.cart-drawer button,
.cart-drawer a,
.cart-drawer .qty-btn,
.cart-drawer .remove-item {
    cursor: pointer !important;
}

/* Show default cursor in modals */
.modal,
.modal * {
    cursor: auto !important;
}

/* Pointer cursor for interactive elements in modals */
.modal button,
.modal a {
    cursor: pointer !important;
}

.modal input,
.modal textarea {
    cursor: text !important;
}
```

### 3. مخفی کردن کرسر سفارشی در سبد خرید
```javascript
// Function to hide/show custom cursor
function hideCustomCursor() {
    if (dot && outline) {
        dot.style.opacity = '0';
        outline.style.opacity = '0';
    }
}

function showCustomCursor() {
    if (dot && outline) {
        dot.style.opacity = '1';
        outline.style.opacity = '1';
    }
}

// Hide cursor when mouse enters cart or modal
const cartDrawer = document.getElementById('cart-drawer');
if (cartDrawer) {
    cartDrawer.addEventListener('mouseenter', hideCustomCursor);
    cartDrawer.addEventListener('mouseleave', showCustomCursor);
}
```

### 4. بازگرداندن کرسر سیستم در موبایل
```css
@media (max-width: 1024px) {
    /* Restore default cursor on mobile/tablet */
    body,
    body * {
        cursor: auto !important;
    }

    /* Hide custom cursor elements */
    .cursor-dot,
    .cursor-outline {
        display: none;
    }
}
```

## نتیجه نهایی 🎯

| محل | کرسر سیستم | کرسر سفارشی |
|-----|------------|-------------|
| صفحه اصلی | ❌ مخفی | ✅ نمایش |
| سبد خرید | ✅ نمایش | ❌ مخفی |
| Modal | ✅ نمایش | ❌ مخفی |
| موبایل/تبلت | ✅ نمایش | ❌ مخفی |

## مزایای این روش

1. **تجربه کاربری بهتر**: در سبد خرید که کاربر باید روی دکمه‌های کوچک کلیک کند، کرسر سیستم دقیق‌تر است
2. **عملکرد بهتر**: کرسر سفارشی فقط جایی که لازم است نمایش داده می‌شود
3. **سازگاری با موبایل**: در دستگاه‌های لمسی، کرسر سفارشی غیرفعال است
4. **انیمیشن نرم**: با `opacity transition` مخفی شدن کرسر نرم است

## فایل‌های تغییر یافته

1. **`style.css`**
   - خطوط 76-107: قوانین cursor جدید
   - خطوط 119: اضافه کردن opacity transition
   - خطوط 144-156: بهبود media query موبایل

2. **`scripts/main.js`**
   - خطوط 34-63: توابع hide/show کرسر سفارشی

---

**تاریخ:** 2026-02-07  
**وضعیت:** ✅ حل شده
