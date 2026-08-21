/**
 * Shared UI behaviour: preloader, theme toggle, header scroll, mobile menu,
 * scroll-to-top on load, scroll reveal, and the mobile booking dock.
 */
export {};

function $<T extends Element>(sel: string): T | null {
  return document.querySelector<T>(sel);
}

// Prevent browser from restoring scroll position immediately
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

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

  if (localStorage.getItem('theme') === 'dark') {
    rootEl.classList.add('dark-theme');
  }

  themeToggle?.addEventListener('click', () => {
    rootEl.classList.toggle('dark-theme');
    localStorage.setItem('theme', rootEl.classList.contains('dark-theme') ? 'dark' : 'light');
  });

  // Header scroll effect
  const header = $('#main-header');
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Mobile menu
  const menuToggle = $('#menu-toggle');
  const menuClose = $('#menu-close');
  const mobileMenu = $('#mobile-menu');

  const closeMenu = (): void => {
    mobileMenu?.classList.remove('active');
    document.body.style.overflow = 'auto';
    (menuToggle as HTMLElement | null)?.focus();
  };

  menuToggle?.addEventListener('click', () => {
    mobileMenu?.classList.add('active');
    document.body.style.overflow = 'hidden';
    (menuClose as HTMLElement | null)?.focus();
  });

  menuClose?.addEventListener('click', closeMenu);

  // Any nav link closes the menu too
  mobileMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Escape closes the mobile menu
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (mobileMenu?.classList.contains('active')) closeMenu();
  });

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