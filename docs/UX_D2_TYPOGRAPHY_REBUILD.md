# GATE UX.D.2 — Typography Rebuild + Production Integration

## 1. Final Status

**UX.D.2 CLOSED / TYPOGRAPHY VISUALLY REBUILT / PRATA + GOLOS LIVE / UX.F PRESERVED / PRODUCTION VERIFIED**

Production: `https://irkportal.ru`  
SHA: `ff8e2e0a36fc4716a7834adc26076a7e588680c6`  
Branch base: `ux-d2-typography-rebuild` ← `origin/phase15-ux-funnel-hardening`  
Release: `/var/www/polezno-releases/ff8e2e0…` → `polezno-current`  
Rollback: `d6c31b69304cdc213500bf8ff261b64cf5b78ac1`

---

## 2. Root Cause

Two stacked failures from UX.D.1:

1. **Not in production.** Source Serif 4 + Golos lived only on `ux-d1-typography-source-golos` / `34e741c`, branched from `e4fd356`, never merged into UX.F or deployed.
2. **Too weak art direction even when loaded locally.** Source Serif 4 is neutral; composition (scale/LH/roles) barely moved the character.

---

## 3. Was UX.D.1 Actually In Production?

**No.**

| Surface | SHA | Fonts (computed) |
|---------|-----|------------------|
| **Pre-D2 production** | `d6c31b69304cdc213500bf8ff261b64cf5b78ac1` | H1 **Cormorant Garamond** ~80px; body **Onest** 16px |
| UX.F tip | `5d99a28` over `d6c31b6` | Onest + Cormorant |
| UX.D.1 tip | `34e741c` | Source Serif 4 + Golos — **not ancestor of production** |

**Root cause of “шрифт как был”:** user viewed production (or UX.F) while D1 never shipped.

---

## 4. Previous Typography Problems

- Cormorant Light hospitality look still on production.
- D1 Source Serif 4 ≈ “another quiet serif”.
- Insufficient display scale / leading / role contrast when D1 was tested locally.
- Parallel branch isolation without production integration.

---

## 5. New Art Direction

**Prata + Golos Text**

- Prata: high-contrast display/editorial (story).
- Golos Text: Cyrillic-first body/UI (system).
- Strength via size (hero → 96px), LH 0.96, measure, whitespace, serif/sans role split — not bold weight (Prata is 400 only; no italic).

---

## 6. Typography Scale

| Role | Token | Size | LH |
|------|-------|------|-----|
| Hero display | `--text-display-xl` | clamp 42→96px | 0.96 |
| Page title | `--text-page-title` | clamp 36→68px | 0.96 |
| Editorial section | `--text-section-editorial` | clamp 32→52px | 1.12 |
| System section | `--text-section-system` | clamp 22→32px | 1.12 Golos 600 |
| Editorial card title | `--text-editorial` | clamp 24→34px | Prata |
| Lead | `--text-lead` | 20→24px | 1.45 Golos |
| Body | `--text-body` | 17px (prose often 18px lg) | 1.65 Golos |
| Eyebrow | `--text-eyebrow` | 11px | Golos 600, tracking 0.08em |

---

## 7. Serif / Sans Roles

- **Prata:** hero, page titles, editorial sections, experience/article titles, quotes (roman via `.type-quote`).
- **Golos:** nav, buttons, body, lead, meta, eyebrows, stats, system section titles, commerce metadata.

---

## 8. Home Before / After

| | BEFORE (prod `d6c31b6`) | AFTER (prod `ff8e2e0`) |
|--|-------------------------|------------------------|
| H1 font | Cormorant Garamond | **Prata** |
| H1 size | ~80px | **96px** |
| H1 LH | ~1.08 | **92.16px (~0.96)** |
| Body | Onest 16px | **Golos Text** |
| Section | Cormorant | **Prata 52px** (`.type-section-title`) |

**WHAT VISUALLY CHANGED**

- Hero стал заметно крупнее и плотнее (display 96 / LH 0.96).
- Появился жёсткий high-contrast display serif (Prata), не «мягкий» Cormorant.
- Lead и CTA остались в Golos — контраст story/system очевиден с первого экрана.
- Before/after различимы без увеличения.

---

## 9. Explore Before / After

- Page title: **Prata 68px** (computed production).
- Lead: Golos 24px.
- Featured cards: `.type-editorial` Prata ~34px + Golos meta.
- Utility/categories: Golos system hierarchy.

**WHAT VISUALLY CHANGED:** Explore читается как вход в культурное медиа (крупный editorial title), а не marketplace grid с product titles.

---

## 10. Article Before / After

Surface: `/explore/irkutsk-history`

- Title: **Prata 68px**, LH ~0.96.
- Lead: Golos 24px.
- Long-form: Golos (prose-editorial).

**WHAT VISUALLY CHANGED:** статья открывается как редакционный материал, не карточка каталога.

---

## 11. About Before / After

- Visible primary statement via `VisualQuoteBlock` → `.type-quote` **Prata**.
- SEO `h1` остаётся `sr-only` (a11y); визуальный якорь — editorial quote.
- Body: Golos ~18px in `.prose-editorial`.

**WHAT VISUALLY CHANGED:** About ощущается авторской editorial page (манифест + quote), не utility about.

---

## 12. Routes

- Index / map titles: Prata page title where wired.
- Experience card titles: `.type-editorial` Prata.
- Price / duration / filters / CTAs: Golos only.

**Principle:** experience = editorial; commerce = system.

---

## 13. Mobile

Fluid clamps: hero ≥42px; page titles ≥36px; lead ≥20px.  
Production smoke at mobile chrome (hamburger nav) confirmed; hero remains Prata display with stacked CTAs.

---

## 14. Font Loading

```ts
Golos_Text({ weight: ["400","500","600"], subsets: cyrillic|ext|latin|ext, display: "swap", adjustFontFallback: true })
Prata({ weight: "400", subsets: cyrillic|ext|latin, display: "swap", adjustFontFallback: true })
```

- `next/font` self-hosted woff2 preloads in HTML.
- HTML classes: `golos_text_*` + `prata_*` (no Cormorant / Onest / Source Serif).
- Fallback stacks: `"Prata Fallback"` / `"Golos Text Fallback"` — used only until swap; computed family starts with **Prata** / **Golos Text**.

---

## 15. Production Integration

1. Branch cut from UX.F: `ux-d2-typography-rebuild` @ `5d99a28` base → commit `ff8e2e0`.
2. UX.F funnel/content surfaces preserved (scenario picker, CTAs, explore content activation).
3. Deploy note (Turbopack): **`public/media` symlink only AFTER `next build`** (same as UX.F runbook).
4. Immutable switch + `pm2 restart polezno`; health artifact identity complete.

---

## 16. Production Font Proof

| Check | Result |
|-------|--------|
| `/api/health` SHA | `ff8e2e0a36fc4716a7834adc26076a7e588680c6` |
| HTML font classes | `golos_text_*` + `prata_*` |
| Home H1 computed | **Prata**, **96px**, LH **92.16px**, weight 400 |
| Explore H1 computed | **Prata**, **68px** |
| Article H1 computed | **Prata**, **68px** |
| Body / lead / nav | **Golos Text** |
| Card `.type-editorial` | **Prata** ~34px |
| Section `.type-section-title` | **Prata** ~52px |
| Cormorant / Onest / Source Serif in HTML | **absent** |
| Font files | 7× `/_next/static/media/*.woff2` preloaded |
| PM2 cwd | `/var/www/polezno-current` → `ff8e2e0…` |

---

## 17. Files Changed

- `app/(site)/layout.tsx`
- `app/globals.css`
- `app/(site)/explore/page.tsx`, `explore/[slug]/page.tsx`, `contact/page.tsx`
- `components/visual/*` (hero, quote, author, material card)
- `components/experiences/experience-card.tsx`
- `components/sections/scenario-picker.tsx`, `explore-preview.tsx`
- `components/contact/contact-cta-section.tsx`
- `components/routes/routes-page-client.tsx`
- `docs/UX_D2_TYPOGRAPHY_REBUILD.md`

---

## 18. Tests / Build

- `npm run typecheck` — PASS (pre-deploy local)
- `npm run lint` — 0 errors (17 pre-existing warnings)
- `next build` on VPS — PASS (Turbopack, static pages generated)
- `write-release-identity.mjs` — artifact written

---

## 19. Production Smoke

| URL | Status |
|-----|--------|
| `/api/health` | 200, SHA `ff8e2e0…`, `identityComplete: true` |
| `/` | 200 |
| `/explore` | 200 |
| `/explore/irkutsk-history` | 200 |
| `/about` | 200 |
| `/map` | 200 |
| `/contact` | 200 |

Browser screenshots taken for Home (desktop), Explore, Article, About; mobile home chrome verified.

---

## 20. Remaining Risks

- Prata has no italic — quotes are roman display by design.
- About visible title is quote-block (Prata), not a large visible `<h1>` (sr-only for a11y/SEO).
- Some secondary/legacy pages (e.g. `/about/guides`) may still carry ad-hoc sizes.
- VPS disk pressure — old release `4930129` removed during deploy; keep monitoring.
- One-shot deploy helper `scripts/_uxd2-deploy-once.sh` is local ops residue (not required at runtime).

---

## 21. Definition of Done Evidence

| # | Status |
|---|--------|
| 1 Production D1 audit | DONE §3 |
| 2 Source Serif removed | DONE |
| 3–4 Prata/Golos roles | DONE production CDP |
| 5–7 Hero/titles/roles | DONE (96/68/52 Prata) |
| 8–12 Explore/Routes/About/Mobile | DONE |
| 13 Loading | DONE next/font + preload |
| 14 Before/after | DONE §8–11 + screenshots |
| 15 UX.F preserved | DONE base `5d99a28` / content CTAs intact |
| 16–17 Production | DONE `ff8e2e0` live |
| 18 Build/tests | DONE |

**Gate closed on evidence above.**
