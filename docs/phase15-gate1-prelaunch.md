# Gate 1 — Content readiness, preview, CTA

**Date:** 2026-09-03  
**Status:** Gate 1 local implementation

## Owner product decisions (reconciled)

1. Section architecture retained (map, explore, business, souvenirs, AR, photos, guides).
2. All directions CMS-ready for Payload fill.
3. Public site never presents demo/mock as real commercial inventory.
4. Empty catalogs use honest prelaunch states; published-ready content auto-replaces without code change.
5. B2C and B2B paths separated (`/contact` vs `/business`).
6. Quiz: **NO QUIZ**.
7. Sitemap classification: `CURRENT 200 / HISTORICAL INCIDENT / REGRESSION COVERED / OBSERVABILITY GAP`.

## Content readiness

Canonical module: `lib/content-readiness.ts`

States: `published-ready` | `draft-preview` | `demo` | `incomplete` | `empty`

Public listings, detail pages, sitemap, and related blocks use `isPublicPublishedReady` / `isSitemapEligible` / `mayRenderPublicDetail`. Demo markers (slug/title/seed) fail-closed.

## Preview verdict

**READY DESIGN / EXTERNAL CONFIG REQUIRED**

- Payload `admin.preview` live URLs already exist for articles, events, excursions, products, photos, makers, AR.
- Next.js Draft Mode / signed preview cookies are **not** implemented in Gate 1 (would need owner-supplied production preview secret and fail-closed wiring).
- Public prelaunch shell is not blocked by preview absence: drafts stay out of public queries via `status` / `_status` filters.
- Do not enable public `?preview=1`.

## CTA map

| Surface | Label | Href |
|---------|-------|------|
| B2C primary | Подобрать прогулку | `/contact` |
| B2B primary | Обсудить программу для бизнеса | `/business` |
| Explore fallback | Подобрать прогулку | `/contact?article=…` |
| Route detail | Запросить маршрут | `/contact?productType=route&slug=…` |
| Excursion detail | Запросить дату | `/contact?productType=excursion&slug=…` |
| Souvenir prelaunch | Написать о коллекции | `/contact` (no «Купить»/«Предзаказать») |

Helpers: `lib/cta-constants.ts`

## Analytics

Typed helper: `lib/analytics-events.ts` → CustomEvent + dataLayer + optional `ym reachGoal`.

Events: hero_cta_click, excursion_view, route_view, map_interaction, explore_to_commercial_click, business_cta_click, lead_form_start/submit/success/error, phone_click, messenger_click (+ legacy lead_*).

**CODE READY / EXTERNAL VERIFICATION PENDING** — Metrika cabinet goals not created here; no PII in payloads.
