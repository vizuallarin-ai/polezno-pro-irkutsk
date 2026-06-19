# Release Phase 14 — Final Stabilization (irkportal.ru)

**Date:** 2026-06-19  
**Scope:** QA, SEO, performance, security audit after phases 1–13. No new features or architecture changes.

---

## 1. What was checked

| Area | Result |
|------|--------|
| `npm run build` | ✅ Passes (TypeScript clean after `.next` cache clear) |
| Navigation (header/footer) | ✅ All primary & «Ещё» links resolve 200 |
| Redirects (`next.config.ts`) | ⚠️ **Fixed:** `/shop/success` was caught by `/shop/:slug` → 404 |
| Production URL curl audit | ✅ Key routes 200; redirects 308 as expected |
| `robots.txt` | ✅ `Host: irkportal.ru`, `Sitemap: https://irkportal.ru/sitemap.xml` |
| `sitemap.ts` | ✅ Uses `PUBLISHED_WHERE` / `ARTICLE_PUBLISHED_WHERE` / `PHOTO_PUBLISHED_WHERE` for CMS |
| CMS public filters | ✅ `lib/cms-filters.ts` applied in data loaders & sitemap |
| Leads API (`/api/leads`) | ✅ sourceType tracking, honeypot, rate limit, consent fields |
| Forms | ✅ LeadForm, business, souvenir, AR preorder schemas wired |
| Яндекс.Метрика | ✅ Counter `109995467` in site layout |
| Security grep (client code) | ✅ No hardcoded secrets in components |
| Admin access | ✅ `adminPanelAccess` — admin role only; leads read = admin |
| `.env.example` | ✅ DATABASE_URL, Payload, maps, Metrika, Stripe, Resend, revalidate |
| «Фото скоро» in UI | ✅ Not used; `VisualEmptyState` / editorial placeholders in place |
| Mobile layout (code review) | ✅ Header mobile menu, map sidebar, responsive grids — no obvious breaks |
| `/excursions` | ✅ Redirects to `/map?filter=guided` (307 → 200) |

### Production URL check (pre-deploy)

| URL | Status |
|-----|--------|
| `/` | 200 |
| `/map`, `/explore`, `/explore/photos` | 200 |
| `/events`, `/souvenirs`, `/ar-postcards` | 200 |
| `/business`, `/contact`, `/about` | 200 |
| `/excursions` | 307 → `/map?filter=guided` |
| `/shop`, `/program`, `/for-companies` | 308 → correct targets |
| `/robots.txt`, `/sitemap.xml` | 200 |
| `/admin` | 200 (login UI) |
| `/shop/success` | ❌ **404** (broken redirect — fixed in this release) |

---

## 2. What was fixed

### P1 — Stripe checkout success page (404)

**Problem:** Redirect rule `/shop/:slug` matched `success` before `/shop/success`, sending users to `/souvenirs/success` (404) after payment.

**Fix:**
- `next.config.ts` — reorder redirects; `/shop/success` → `/souvenirs/success` **before** `/shop/:slug`
- `app/(site)/souvenirs/success/page.tsx` — new thank-you page (moved from `/shop/success`)
- `app/api/checkout/route.ts` — Stripe `success_url` / `cancel_url` → `/souvenirs/*`
- Removed obsolete `app/(site)/shop/success/page.tsx`

### P2 — Stale internal `/shop` links

- `components/sections/shop-preview.tsx` — CTA → `/souvenirs`
- `components/map/route-sidebar.tsx` — paid route buy link → `/souvenirs/:slug`

---

## 3. What remains for future

| Priority | Item |
|----------|------|
| P3 | Install `sharp` on VPS for Payload image resizing (build warns without it) |
| P3 | Stripe webhook handler for order fulfillment (currently checkout-only) |
| P4 | Legacy `/shop/*` route files — kept for redirect compatibility; can deprecate after analytics confirm zero traffic |
| P4 | `/excursions/[slug]` pages — still exist; list redirects to map; consider consolidating |
| P5 | E2E tests for lead forms and checkout flow |
| P5 | Core Web Vitals measurement in production (LCP on hero images) |

---

## 4. Key URLs

| Page | URL |
|------|-----|
| Homepage | https://irkportal.ru/ |
| Map / routes | https://irkportal.ru/map |
| Explore | https://irkportal.ru/explore |
| Photos | https://irkportal.ru/explore/photos |
| Business | https://irkportal.ru/business |
| Souvenirs | https://irkportal.ru/souvenirs |
| AR postcards | https://irkportal.ru/ar-postcards |
| Events | https://irkportal.ru/events |
| Contact | https://irkportal.ru/contact |
| Admin | https://irkportal.ru/admin |
| Sitemap | https://irkportal.ru/sitemap.xml |
| Robots | https://irkportal.ru/robots.txt |

---

## 5. Required env vars

See `.env.example`. Production minimum:

```env
DATABASE_URL=postgresql://...
PAYLOAD_SECRET=...          # min 32 chars
NEXT_PUBLIC_SERVER_URL=https://irkportal.ru
NEXT_PUBLIC_YANDEX_MAPS_API_KEY=...
NEXT_PUBLIC_YANDEX_METRIKA_ID=109995467
REVALIDATE_SECRET=...
RESEND_API_KEY=...          # optional — email notifications
EMAIL_FROM=...
EMAIL_TO=...
STRIPE_SECRET_KEY=...       # optional — paid checkout
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
YANDEX_ROUTER_API_KEY=...   # optional — server-side routing
```

---

## 6. Remaining risks

1. **Corrupt `.next` on VPS** — if some pages 500 while home works: `rm -rf .next && npm run build && pm2 restart polezno`
2. **Maps API key** — without `NEXT_PUBLIC_YANDEX_MAPS_API_KEY`, map shows fallback message (not a crash)
3. **Demo fallback data** — if `DATABASE_URL` missing at build/runtime, demo routes/articles served_ (prod has DB)_
4. **Instagram link** — Meta disclaimer shown when Instagram URL configured in CMS
5. **AR media** — placeholder players until client provides `.mp4` / `.glb` assets

---

## 7. What client needs to provide

| Category | Details |
|----------|---------|
| **Photos** | Hero, route covers, explore articles, photo gallery — high-res with rights |
| **Contacts** | Telegram, MAX, email — verify in CMS Site Settings |
| **Prices** | Paid routes, souvenirs, excursions — update in CMS products/routes |
| **Rights** | Photo author credits, model releases for gallery submissions |
| **AR media** | Video/3D files for AR postcards, marker images |
| **Reviews** | Real testimonials for SocialProof block (currently CMS/demo) |
| **Business content** | Corporate formats, case studies, partner logos |
| **Legal** | Privacy policy text if differs from template |

---

## Deploy notes

```bash
git push origin master
ssh root@90.156.170.182 "cd /var/www/polezno && git pull && rm -rf .next && npm run build && pm2 restart polezno"
```

No schema changes in this release — `db:push` not required.
