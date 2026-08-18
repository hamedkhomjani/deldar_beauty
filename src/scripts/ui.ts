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
  const body = document.body;

  if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-theme');
  }

  themeToggle?.addEventListener('click', () => {
    body.classList.toggle('dark-theme');
    localStorage.setItem('theme', body.classList.contains('dark-theme') ? 'dark' : 'light');
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

  menuToggle?.addEventListener('click', () => {
    mobileMenu?.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  menuClose?.addEventListener('click', () => {
    mobileMenu?.classList.remove('active');
    document.body.style.overflow = 'auto';
  });

  // Escape closes the mobile menu
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (mobileMenu?.classList.contains('active')) {
      mobileMenu.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });

  // Scroll reveal animation
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    },
    { threshold: 0.15 },
  );

  document.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el));
});