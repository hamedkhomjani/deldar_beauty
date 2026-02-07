// Custom Cursor Logic
const dot = document.querySelector('.cursor-dot');
const outline = document.querySelector('.cursor-outline');

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    dot.style.left = `${posX}px`;
    dot.style.top = `${posY}px`;

    // outline.style.left = `${posX}px`;
    // outline.style.top = `${posY}px`;

    outline.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, { duration: 500, fill: "forwards" });
});

// Hover effect for interactive elements
const interactables = document.querySelectorAll('a, button, .service-card, .product-card');
interactables.forEach(item => {
    item.addEventListener('mouseenter', () => {
        outline.style.transform = 'translate(-50%, -50%) scale(1.5)';
        outline.style.backgroundColor = 'rgba(197, 160, 89, 0.1)';
        outline.style.borderColor = 'transparent';
    });
    item.addEventListener('mouseleave', () => {
        outline.style.transform = 'translate(-50%, -50%) scale(1)';
        outline.style.backgroundColor = 'transparent';
        outline.style.borderColor = 'var(--accent-gold)';
    });
});

// Prevent browser from restoring scroll position IMMEDIATELY
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Aggressive Scroll to Top on Load
window.addEventListener('load', () => {
    // Small timeout to bypass browser's internal scroll handling
    setTimeout(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'auto' // Use 'auto' to skip smooth scroll during reset
        });
    }, 0);
});

document.addEventListener('DOMContentLoaded', () => {
    // Handle URL hash specifically
    if (window.location.hash) {
        // Scroll to top first
        window.scrollTo(0, 0);
        // Remove hash without refreshing
        history.replaceState('', document.title, window.location.pathname + window.location.search);
    }

    // Hide Preloader
    window.addEventListener('load', () => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            setTimeout(() => {
                preloader.classList.add('hidden');
            }, 1000);
        }
    });

    // Mobile Dock Booking
    const dockBookingBtn = document.getElementById('dock-booking-btn');
    if (dockBookingBtn) {
        dockBookingBtn.addEventListener('click', () => {
            const bookingModal = document.getElementById('booking-modal');
            if (bookingModal) {
                bookingModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        });
    }

    // Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Check for saved theme in localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-theme');

            // Save theme preference
            if (body.classList.contains('dark-theme')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
        });
    }

    console.log('Premium Beauty Salon UI Initialized with Theme Support');

    // Header Scroll Effect
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const menuClose = document.getElementById('menu-close');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (menuClose && mobileMenu) {
        menuClose.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }

    // Scroll Reveal Animation
    const revealElements = document.querySelectorAll('[data-reveal]');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- Real Persian (Jalali) Calendar Logic ---
    const JalaliDate = {
        g_days_in_month: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        j_days_in_month: [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29],
        j_month_names: ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"],

        gregorianToJalali: function (gy, gm, gd) {
            let g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
            let jy = (gy <= 1600) ? 0 : 979;
            gy -= (gy <= 1600) ? 621 : 1600;
            let gy2 = (gm > 2) ? (gy + 1) : gy;
            let days = (365 * gy) + (parseInt((gy2 + 3) / 4)) - (parseInt((gy2 + 99) / 100)) + (parseInt((gy2 + 399) / 400)) - 80 + gd + g_d_m[gm - 1];
            jy += 33 * (parseInt(days / 12053));
            days %= 12053;
            jy += 4 * (parseInt(days / 1461));
            days %= 1461;
            jy += parseInt((days - 1) / 365);
            if (days > 365) days = (days - 1) % 365;
            let jm = (days < 186) ? 1 + parseInt(days / 31) : 7 + parseInt((days - 186) / 30);
            let jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
            return [jy, jm, jd];
        },

        jalaliToGregorian: function (jy, jm, jd) {
            let gy = (jy <= 979) ? 621 : 1600;
            jy -= (jy <= 979) ? 0 : 979;
            let days = (365 * jy) + (parseInt(jy / 33) * 8) + (parseInt((jy % 33 + 3) / 4)) + 78 + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
            gy += 400 * (parseInt(days / 146097));
            days %= 146097;
            if (days > 36524) {
                gy += 100 * (parseInt(--days / 36524));
                days %= 36524;
                if (days >= 365) days++;
            }
            gy += 4 * (parseInt(days / 1461));
            days %= 1461;
            gy += parseInt((days - 1) / 365);
            if (days > 365) days = (days - 1) % 365;
            let gd = days + 1;
            let sal = [0, 31, ((gy % 4 == 0 && gy % 100 != 0) || (gy % 400 == 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            let gm;
            for (gm = 0; gm < 13; gm++) {
                let v = sal[gm];
                if (gd <= v) break;
                gd -= v;
            }
            return [gy, gm, gd];
        }
    };

    let currentJalaliDate = JalaliDate.gregorianToJalali(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
    let viewDate = { year: currentJalaliDate[0], month: currentJalaliDate[1] };

    function initCalendar() {
        const calendarDays = document.getElementById('calendar-days');
        const monthLabel = document.querySelector('.current-month');
        if (!calendarDays || !monthLabel) return;

        calendarDays.innerHTML = '';

        monthLabel.textContent = `${JalaliDate.j_month_names[viewDate.month - 1]} ${viewDate.year}`;

        // Find the first day of the month
        const gFirstDay = JalaliDate.jalaliToGregorian(viewDate.year, viewDate.month, 1);
        const firstDayObj = new Date(gFirstDay[0], gFirstDay[1] - 1, gFirstDay[2]);
        let startDay = firstDayObj.getDay(); // 0 is Sunday

        // Adjust Sunday-based system to Saturday-based (Persian)
        // 0 (Sun) -> 1, 1 (Mon) -> 2, 2 (Tue) -> 3, 3 (Wed) -> 4, 4 (Thu) -> 5, 5 (Fri) -> 6, 6 (Sat) -> 0
        let jalaliStartDay = (startDay + 1) % 7;

        // Number of days in month
        let totalDays = JalaliDate.j_days_in_month[viewDate.month - 1];
        if (viewDate.month === 12 && isLeapYear(viewDate.year)) totalDays = 30;

        // Empty slots for previous month
        for (let i = 0; i < jalaliStartDay; i++) {
            const span = document.createElement('span');
            span.classList.add('muted');
            calendarDays.appendChild(span);
        }

        // Days of current month
        for (let i = 1; i <= totalDays; i++) {
            const span = document.createElement('span');
            span.textContent = i;

            // Check if date is in the past
            const isPast = (viewDate.year < currentJalaliDate[0]) ||
                (viewDate.year === currentJalaliDate[0] && viewDate.month < currentJalaliDate[1]) ||
                (viewDate.year === currentJalaliDate[0] && viewDate.month === currentJalaliDate[1] && i < currentJalaliDate[2]);

            if (isPast) {
                span.classList.add('past');
            }

            // Mark today
            if (viewDate.year === currentJalaliDate[0] && viewDate.month === currentJalaliDate[1] && i === currentJalaliDate[2]) {
                span.classList.add('today');
            }

            // Friday is holiday
            if ((i + jalaliStartDay) % 7 === 0) span.classList.add('holiday');

            if (!isPast) {
                span.addEventListener('click', () => {
                    document.querySelectorAll('.days-grid span').forEach(s => s.classList.remove('active'));
                    span.classList.add('active');
                });
            }

            calendarDays.appendChild(span);
        }
    }

    function isLeapYear(jy) {
        return (((((jy - ((jy > 0) ? 474 : 473)) % 2820) + 474) + 38) * 682) % 2816 < 682;
    }

    // Navigation
    const prevMonthBtn = document.querySelector('.prev-month');
    const nextMonthBtn = document.querySelector('.next-month');

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            viewDate.month--;
            if (viewDate.month < 1) {
                viewDate.month = 12;
                viewDate.year--;
            }
            initCalendar();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            viewDate.month++;
            if (viewDate.month > 12) {
                viewDate.month = 1;
                viewDate.year++;
            }
            initCalendar();
        });
    }

    // --- Booking System Logic ---
    const bookingModal = document.getElementById('booking-modal');
    const closeBooking = document.getElementById('close-booking');
    const bookingStep1 = document.getElementById('booking-step-1');
    const bookingStep2 = document.getElementById('booking-step-2');
    const bookingForm = document.getElementById('booking-form');
    const btnReturnHome = document.getElementById('btn-return-home');

    const bookButtons = document.querySelectorAll('.btn-premium, .service-card');
    bookButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (!bookingModal) return;
            e.preventDefault();
            bookingModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            initCalendar();
        });
    });

    if (closeBooking) {
        closeBooking.addEventListener('click', () => {
            bookingModal.classList.remove('active');
            document.body.style.overflow = 'auto';
            resetBooking();
        });
    }

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            bookingStep1.classList.add('hidden');
            bookingStep2.classList.remove('hidden');
        });
    }

    if (btnReturnHome) {
        btnReturnHome.addEventListener('click', () => {
            bookingModal.classList.remove('active');
            document.body.style.overflow = 'auto';
            resetBooking();
        });
    }

    function resetBooking() {
        bookingStep1.classList.remove('hidden');
        bookingStep2.classList.add('hidden');
        bookingForm.reset();
    }

    const timeSlots = document.querySelectorAll('.time-slot');
    timeSlots.forEach(slot => {
        slot.addEventListener('click', () => {
            if (!slot.disabled) {
                timeSlots.forEach(s => s.classList.remove('active'));
                slot.classList.add('active');
            }
        });
    });

    // --- Shopping Cart Logic ---
    let cart = JSON.parse(localStorage.getItem('deldar_cart')) || [];
    const cartToggle = document.getElementById('cart-toggle');
    const closeCart = document.getElementById('close-cart');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalAmount = document.getElementById('cart-total-amount');
    const cartCountBadge = document.querySelector('.cart-count');

    function updateCart() {
        localStorage.setItem('deldar_cart', JSON.stringify(cart));
        renderCart();
    }

    function renderCart() {
        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="cart-empty-msg">سبد خرید شما فعلاً خالی است.</div>';
            cartTotalAmount.textContent = '۰ تومان';
            cartCountBadge.textContent = '۰';
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
                    <p class="price">${item.price.toLocaleString('fa-IR')} تومان</p>
                    <div class="cart-item-controls">
                        <div class="qty-controls">
                            <button class="qty-btn minus" data-index="${index}">&minus;</button>
                            <span>${item.quantity.toLocaleString('fa-IR')}</span>
                            <button class="qty-btn plus" data-index="${index}">&plus;</button>
                        </div>
                        <button class="remove-item" data-index="${index}">حذف</button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(itemEl);
        });

        cartTotalAmount.textContent = `${total.toLocaleString('fa-IR')} تومان`;
        cartCountBadge.textContent = count.toLocaleString('fa-IR');
    }

    function addToCart(product) {
        const existingItem = cart.find(item => item.name === product.name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCart();
        openCart();
    }

    function openCart() {
        cartDrawer.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function toggleCart() {
        cartDrawer.classList.toggle('active');
        cartOverlay.classList.toggle('active');
        if (cartDrawer.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }

    if (cartToggle) cartToggle.addEventListener('click', toggleCart);
    if (closeCart) closeCart.addEventListener('click', toggleCart);
    if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);

    // Event Delegation for Cart Item Controls
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            const index = e.target.dataset.index;
            if (e.target.classList.contains('plus')) {
                cart[index].quantity += 1;
                updateCart();
            } else if (e.target.classList.contains('minus')) {
                if (cart[index].quantity > 1) {
                    cart[index].quantity -= 1;
                } else {
                    cart.splice(index, 1);
                }
                updateCart();
            } else if (e.target.classList.contains('remove-item')) {
                cart.splice(index, 1);
                updateCart();
            }
        });
    }

    // Add to Cart Buttons (Shop Page)
    const addCartBtns = document.querySelectorAll('.btn-add-cart');

    function persianToEnglish(str) {
        const pChars = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        const eChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        return str.replace(/[۰-۹]/g, c => eChars[pChars.indexOf(c)]);
    }

    addCartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.product-card');
            const priceText = card.querySelector('.product-price').textContent;
            const cleanPrice = persianToEnglish(priceText).replace(/[^\d]/g, '');

            const product = {
                name: card.querySelector('.product-title').textContent,
                price: parseInt(cleanPrice),
                image: card.querySelector('.product-image img').src
            };
            addToCart(product);
        });
    });

    // Initial render
    renderCart();
});
