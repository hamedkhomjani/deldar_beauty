/**
 * Shared UI behaviour: preloader, theme toggle, header scroll, mobile menu,
 * scroll-to-top on load, scroll reveal, and the mobile booking dock.
 */
import { trapTab } from './focusTrap';

export {};

function $<T extends Element>(sel: string): T | null {
  return document.querySelector<T>(sel);
}

// Prevent browser from restoring scroll position immediately
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Signal that JS is active so scroll-reveal styling can hide elements safely
// (see `html.js [data-reveal]` in global.css). Without this, content stays visible.
document.documentElement.classList.add('js');

// Aggressive scroll-to-top on load
window.addEventListener('load', () => {
  setTimeout(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, 0);
});

document.addEventListener('DOMContentLoaded', () => {
  // Remove URL hash without refreshing (keeps anchor pages at the top)
  if (window.location.hash) {
    window.scrollTo(0, 0);
    history.replaceState('', document.title, window.location.pathname + window.location.search);
  }

  // Preloader (homepage only): quick 250ms brand moment on the first page of
  // the session; repeated visits get straight to content.
  window.addEventListener('load', () => {
    const preloader = $('#preloader');
    if (!preloader) return;
    if (sessionStorage.getItem('deldar_preloader_done')) {
      preloader.classList.add('hidden');
    } else {
      sessionStorage.setItem('deldar_preloader_done', '1');
      setTimeout(() => preloader.classList.add('hidden'), 250);
    }
  });

  // Theme toggle (persisted in localStorage)
  const themeToggle = $('#theme-toggle');
  const rootEl = document.documentElement;

  function applyThemeColor(dark: boolean): void {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta) meta.content = dark ? '#050505' : '#fdfaf5';
  }

  if (localStorage.getItem('theme') === 'dark') {
    rootEl.classList.add('dark-theme');
  }
  applyThemeColor(rootEl.classList.contains('dark-theme'));

  themeToggle?.addEventListener('click', () => {
    rootEl.classList.toggle('dark-theme');
    localStorage.setItem('theme', rootEl.classList.contains('dark-theme') ? 'dark' : 'light');
    applyThemeColor(rootEl.classList.contains('dark-theme'));
  });

  // Header scroll effect
  const header = $('#main-header');
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Mobile menu
  const menuToggle = $('#menu-toggle');
  const menuClose = $('#menu-close');
  const mobileMenu = $('#mobile-menu') as HTMLElement | null;
  const openLabel = menuToggle?.getAttribute('aria-label') ?? '';
  const closeLabel = menuClose?.getAttribute('aria-label') ?? openLabel;

  const setMenuState = (open: boolean): void => {
    if (!mobileMenu) return;
    if (open) {
      mobileMenu.classList.add('active');
      mobileMenu.removeAttribute('inert');
    } else {
      mobileMenu.classList.remove('active');
      mobileMenu.setAttribute('inert', '');
    }
    menuToggle?.setAttribute('aria-expanded', String(open));
    menuToggle?.setAttribute('aria-label', open ? closeLabel : openLabel);
    document.body.style.overflow = open ? 'hidden' : 'auto';
    if (open) (menuClose as HTMLElement | null)?.focus();
    else (menuToggle as HTMLElement | null)?.focus();
  };

  const closeMenu = (): void => setMenuState(false);

  menuToggle?.addEventListener('click', () => setMenuState(true));
  menuClose?.addEventListener('click', closeMenu);

  // Any nav link closes the menu too
  mobileMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Escape closes the mobile menu; Tab is trapped inside the open menu
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (mobileMenu?.classList.contains('active')) closeMenu();
  });
  mobileMenu?.addEventListener('keydown', (e) => trapTab(e, mobileMenu));

  // Scroll reveal animation (skipped for reduced-motion users)
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = document.querySelectorAll('[data-reveal]');

  if (reducedMotion) {
    revealEls.forEach((el) => el.classList.add('visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.15 },
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  }
});