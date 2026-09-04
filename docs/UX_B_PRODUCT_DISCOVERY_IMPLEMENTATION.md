# GATE UX.B — Product Discovery + Typography + Interface Hierarchy

**Gate:** UX.B
**Date:** 2026-09-04
**Branch:** `phase15-ux-funnel-hardening` (local only; not pushed)
**Baseline (UX.A docs):** `0ba27ad728ac0c0d658fdbb484a3ff2f63ce564d`
**Audit TARGET:** `a79365047dceb9475f885868779440eaa03ac49c`
**Production tip (unchanged):** `493012926cf833bc3a6cfefc91f5356efd20e8ed`

---

## 1. Baseline

- Started from clean UX branch after UX.A documentation commit.
- Tracked worktree clean at preflight (known untracked disposables only).
- No checkout/merge/push of `master`.
- No production / deploy mutations.

## 2. Product discovery changes

Home funnel model:

```text
Кто мы → Что можно сделать → Какой сценарий → Что посмотреть → Доверие → Действие
```

- Hero primary no longer jumps cold B2C users into the form.
- Scenario picker kept (4 life situations); CTAs aligned to discovery / B2B vocabulary.
- `/map` remains in navigation and is the discovery layer even when catalog is empty.
- Final CTA and route index CTA promote browse + assisted choice, not B2B leakage.

## 3. Hero changes

| Before | After |
| --- | --- |
| Primary «Подобрать прогулку» → `/contact` | Primary **Смотреть маршруты** → `/map` |
| Secondary «Для бизнеса» → `/business` | Secondary **Подобрать мне прогулку** → `/contact` (intent=walk) |
| Badge generic | Badge includes Иркпортал · Алёна |
| Dead `<br>` branch for «штампов» | Italic accent without forced break; `text-wrap: balance` |

B2B remains reachable via nav «Для бизнеса» and scenario «Для команды».

## 4. Route catalog architecture

- Empty `/map`: editorial H1 «Маршруты по Иркутску» + full `PrelaunchState` (formats chips + CTAs) + live city map shell + assisted CTA band.
- Populated catalog unchanged in data model; card supports image, title, promise, duration, distance, format (Самостоятельно / С Алёной), priceLabel, badges, dual CTAs.
- Filters already include self-guided / guided / duration / themes — label «С гидом» → «С Алёной». No new DB filters invented.
- No fake route fixtures.

## 5. Prelaunch strategy

Future sections stay visible. Shared `PrelaunchState` surfaces:

`map` · `excursions` · `photos` · `ar` · `souvenirs` · `guides` · `events` · `club`

Each has: title, value sentence, upcoming format hints, next step, no developer empty wording.

Events empty page now uses `PrelaunchState` instead of dashed tech empty.

## 6. CTA system

| Intent | Canonical CTA | Destination |
| --- | --- | --- |
| Discovery | Смотреть маршруты | `/map` |
| Assisted choice | Подобрать мне прогулку | `/contact?intent=walk…` |
| High intent | Пройти с Алёной | route/excursion-aware `/contact` |
| B2B | Обсудить программу | `/business` |
| Explore bridge | Исследовать Иркутск | `/explore` |
| Contact chrome | Связаться | dropdown / `/contact` |

Central module: `lib/cta-constants.ts`.
`resolvePublicMainCta` remaps legacy CMS `/business` and contact-first main CTA → discovery `/map`.

## 7. Typography comparison

| Candidate | Cyrillic | Nav 14–15px | vs Cormorant | Notes |
| --- | --- | --- | --- | --- |
| **Onest** | Excellent (designed with Cyrillic) | Strong | Soft humanistic, no clash | Chosen |
| Manrope | Good | Good | Slightly geometric | Runner-up |
| Inter | Good | Excellent | Generic SaaS risk | Rejected for brand |

Geist was loaded without Cyrillic subset → Arial fallback for RU UI. Geist Mono unused → removed.

## 8. Selected font pair

- **UI:** Onest via `next/font/google` (`cyrillic`, `cyrillic-ext`, `latin`, `latin-ext`), variable `--font-onest`, `display: swap`.
- **Editorial:** Cormorant Garamond kept (`--font-cormorant`) for display / accents only.
- Mono removed from layout and theme.

## 9. Typography tokens

Semantic classes in `app/globals.css`:

`type-display-xl` · `type-display-l` · `type-h1` · `type-h2` · `type-h3` · `type-body-lg` · `type-body` · `type-body-sm` · `type-caption` · `type-ui-label` · `type-button` · `type-nav` · `type-nav-secondary` · `type-meta`

Plus wrap utilities: `text-balance`, `text-pretty`, `cta-label`, `cta-label-wrap-sm`.

## 10. Wrapping rules

- Large headings: `text-wrap: balance` (token classes).
- Body: `text-wrap: pretty` where token applied.
- Nav / short CTA: `nowrap`; very narrow mobile may use `cta-label-wrap-sm`.
- Header descriptor: no hostile `truncate`; xl full line, md–lg compact one-liner, sm+ hidden with sr-only full text.
- Forced `<br>`: removed from hero/final-cta/contact titles where CSS balance is safer; intentional editorial breaks not required.

## 11. Header decisions

| Before | After |
| --- | --- |
| Primary + Контакты + messengers + Связаться + CTA | Primary (без Контакты) + Ещё + Связаться + 1 primary CTA |
| Descriptor truncate max-w 220 | Responsive compact / full; no truncate |
| Flat mobile list mixing all links | Mobile: Главное → Ещё → Contact → Primary CTA → Assist link |
| Same B2C CTA on `/business` | Contextual: business → Обсудить программу; route detail → Пройти с Алёной |
| Header CTA = contact | Header CTA = Смотреть маршруты (CMS remapped) |

Secondary «Ещё»: События, Фото, AR, Клуб, Сувениры, **Гайды**.

## 12. Mobile decisions

- Menu hierarchy grouped; no duplicate messenger stack next to dropdown list.
- CTA full-width on small screens with controlled wrap.
- Descriptor hidden below md (sr-only keeps meaning).
- Target widths: 360 / 390 / 430 / 768 / 1280 / 1440 — validated via CSS tokens + hierarchy (browser smoke recommended on preview).

## 13. Changed components (summary)

- `app/(site)/layout.tsx` — Onest + Cormorant
- `app/globals.css` — tokens, wrap, drop mono
- `lib/cta-constants.ts`, `lib/navigation-constants.ts`, `lib/site-settings.ts`, `lib/brand-constants.ts`, `lib/data/experiences.ts`, `lib/visual-assets.ts`
- `components/layout/header.tsx`
- `components/visual/city-hero-visual.tsx`, `visual-empty-state.tsx`, `route-visual-card.tsx`
- `components/sections/scenario-picker.tsx`, `final-cta.tsx`
- `components/prelaunch/prelaunch-state.tsx`
- `components/experiences/experience-card.tsx`
- `components/routes/routes-page-client.tsx`, `route-cta-block.tsx`, `route-detail-client.tsx`
- `components/ui/button.tsx`
- `app/(site)/page.tsx`, `contact/page.tsx`, `events/page.tsx`
- `payload/globals/SiteSettings.ts`, `payload/collections/Routes.ts`
- `scripts/phase15-checks.ts`

## 14. Validation

- `npm run typecheck`
- `npm run lint`
- `git diff --check`
- Build: run if safe in environment; otherwise note not run

## 15. Remaining UX.C scope

- B2C form friction / field reduction
- Progressive disclosure on leads
- Contextual lead capture on route detail (embedded form)
- Conversion path polish B2C + B2B
- Success experience
- Funnel telemetry / acceptance where relevant
- Full sitewide CTA synonym cleanup leftovers (footer/about copy)

## 16. Deferred

- Publishing real routes/photos/events content (owner gate)
- Brand legacy «Полезно про Иркутск» cleanup
- Push / merge / deploy of UX branch
- Analytics event rename (labels change; event names preserved)
- DB schema for new filter dimensions beyond existing chips

## Mutation ledger

- public UI changed: **YES**
- production mutated: **NO**
- master mutated: **NO**
- UX branch changed: **YES**
- UX branch pushed: **NO**
- deploy: **NO**

