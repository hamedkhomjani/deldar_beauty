# deldar_beauty — Astro project memory

## Project
Persian RTL salon website (beauty salon) built with Astro 5, deployed on GitHub Pages at
`https://hamedkhomjani.github.io/deldar_beauty/`. Pages are static, built to `dist/`.

## Commands (always use these)
- Install deps: `npm install`
- Dev server: `npm run dev` → http://localhost:4321/deldar_beauty/ (always test against this URL)
- Typecheck: `npx astro check` (must show 0 errors before finishing any task)
- Build: `npm run build` → outputs `dist/`
- Preview built site: `npm run preview`
- Verify routes headlessly: fetch `http://localhost:4321/<page>/` (e.g. `/deldar_beauty/shop/`)

## Critical gotchas
- `base: '/deldar_beauty/'` is set in astro.config.mjs. NEVER hardcode root-absolute
  paths (`href="/about"`, `src="/x"`). Use the `pageUrl()` / `asset()` helpers from
  `src/config.ts` everywhere and verify paths use the `/deldar_beauty/` prefix.
- Text is Persian (RTL). Don't add LTR-specific layout hacks unless verified.
- PowerShell 5.1 shell on Windows: no `&&` chaining — use `;` and `if ($?) {}`.
- `astro dev` on Windows may bind IPv6-only (`::1`); `http://127.0.0.1:PORT` can refuse
  connections. Test with `localhost`, not IP literals.
- Browser-side HMR reload loops have been seen on this machine when many tabs / stale
  dev servers are open — clean up stray node processes before diagnosing dev issues.
- Detect JS bugs by checking the served module (`/src/scripts/*.ts` returns 200).

## Architecture
- `src/pages/` — index (home), about/, shop/, booking/, checkout/ (all under base path)
- `src/components/` — Layout (shell, script wiring), Header, Footer, MobileMenu,
  CartDrawer, BookingModal, MobileDock, FloatingButton, ServiceIcon, Cursor, GrainOverlay
- `src/scripts/` — cursor.ts, ui.ts (shared UI + preloader), booking.ts (calendar + form,
  has standalone booking-page mode), cart.ts (drawer + qty + checkout redirect), toast.ts,
  checkout.ts
- `src/data/` — services.ts, products.ts, faq.ts, schema.ts (JSON-LD)
- `src/config.ts` — SALON/SOCIAL constants, NAV_LINKS, `asset()`, `pageUrl()` helpers
- `public/` — 404.html (meta-refresh to base), sitemap.xml, robots.txt
- Booking flow: hero CTAs + mobile dock link to `/booking/` page (standalone calendar).
  Service cards still open the BookingModal; links with class `go-booking` must NOT be
  intercepted by booking.ts modal opener.

## Conventions
- Use no new icon libraries; inline SVGs (Lucide-style paths).
- Fonts: Vazirmatn for everything (Playfair/Outfit were removed — do not reintroduce).
- Theme: gold/cream luxury palette (`--gold-gradient`, `--accent-gold`, `--dark-charcoal`),
  light + dark (`.dark-theme` on body).