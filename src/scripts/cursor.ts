/**
 * Custom cursor — GPU-composited (transform only), runs only on fine pointers.
 */
export {};

function $<T extends Element>(sel: string): T {
  const el = document.querySelector<T>(sel);
  if (!el) throw new Error(`Missing element: ${sel}`);
  return el;
}

const dot = $<HTMLDivElement>('.cursor-dot');
const outline = $<HTMLDivElement>('.cursor-outline');

let cursorX = 0;
let cursorY = 0;
let outlineX = 0;
let outlineY = 0;
let hoverScale = 1;

window.addEventListener('mousemove', (e) => {
  cursorX = e.clientX;
  cursorY = e.clientY;
});

function animateCursor(): void {
  dot.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;

  outlineX += (cursorX - outlineX) * 0.15;
  outlineY += (cursorY - outlineY) * 0.15;
  outline.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0) translate(-50%, -50%) scale(${hoverScale})`;

  requestAnimationFrame(animateCursor);
}

function hideCustomCursor(): void {
  dot.style.opacity = '0';
  outline.style.opacity = '0';
}

function showCustomCursor(): void {
  dot.style.opacity = '1';
  outline.style.opacity = '1';
}

// Hover effect for interactive elements
document.querySelectorAll('a, button, .service-card, .product-card').forEach((item) => {
  item.addEventListener('mouseenter', () => {
    hoverScale = 1.5;
    outline.style.backgroundColor = 'rgba(197, 160, 89, 0.1)';
    outline.style.borderColor = 'transparent';
  });
  item.addEventListener('mouseleave', () => {
    hoverScale = 1;
    outline.style.backgroundColor = 'transparent';
    outline.style.borderColor = 'var(--accent-gold)';
  });
});

// Use the system cursor inside the cart drawer
const cartDrawer = document.getElementById('cart-drawer');
cartDrawer?.addEventListener('mouseenter', hideCustomCursor);
cartDrawer?.addEventListener('mouseleave', showCustomCursor);

// Only run the loop on devices with a fine pointer (skip mobile/touch)
if (window.matchMedia('(pointer: fine)').matches) {
  animateCursor();
}
