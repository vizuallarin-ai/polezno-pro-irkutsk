# GATE UX.D.2 — Typography Rebuild + Production Integration

## 1. Final Status

**Working status (pre-deploy close):** engineering + local visual proof complete; production deploy follows this commit.

Target closed status after production font proof:

`UX.D.2 CLOSED / TYPOGRAPHY VISUALLY REBUILT / PRATA + GOLOS LIVE / UX.F PRESERVED / PRODUCTION VERIFIED`

If production proof section below still says PENDING, treat gate as **PARTIAL until deploy proof**.

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
| **Production** `https://irkportal.ru` `/api/health` | `d6c31b69304cdc213500bf8ff261b64cf5b78ac1` | H1 **Cormorant Garamond** 80px; body **Onest** 16px |
| UX.F tip `origin/phase15-ux-funnel-hardening` | `5d99a28` (docs) over `d6c31b6` | Onest + Cormorant in layout |
| UX.D.1 tip | `34e741c` | Source Serif 4 + Golos — **not ancestor of production** |

Production HTML classes: `onest_*` + `cormorant_garamond_*`.  
No `--font-golos`, `--font-source-serif`, or `--font-prata` on production.

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
| Body | `--text-body` | 17px | 1.65 Golos |
| Eyebrow | `--text-eyebrow` | 11px | Golos 600, tracking 0.08em |

---

## 7. Serif / Sans Roles

- **Prata:** hero, page titles, editorial sections, experience/article titles, quotes (roman).
- **Golos:** nav, buttons, body, lead, meta, eyebrows, stats, system section titles, commerce metadata.

---

## 8. Home Before / After

| | BEFORE (production) | AFTER (local D2) |
|--|---------------------|------------------|
| H1 font | Cormorant Garamond | **Prata** |
| H1 size | 80px | **96px** |
| H1 LH | 86.4px (~1.08) | **92.16px (~0.96)** |
| Body | Onest 16px | **Golos 17px** |
| Section | Cormorant display-l | **Prata 52px** section title |

**What visually changed:** hero reads as magazine display (tighter, larger, high-contrast Prata), not soft hospitality Cormorant; Golos UI quieter against it.

---

## 9. Explore Before / After

- Page title: Prata **68px** (`type-page-title`), not light sans split + italic.
- Lead: Golos `type-lead`.
- Featured / utility: `type-section-system` (Golos).
- Cards: `type-editorial` Prata titles + Golos meta.

---

## 10. Article Before / After

- Title: `type-page-title` Prata.
- Excerpt: `type-lead` Golos (no serif italic).
- Body: `prose-editorial` measure ~40rem.

---

## 11. About Before / After

- Eyebrow + `prose-editorial` manifesto.
- Quote via `type-quote` (Prata roman — no italic available).

---

## 12. Routes

- Index H1: `type-page-title` Prata.
- Experience card titles: `type-editorial` Prata.
- Meta / filters / CTAs: Golos only.

---

## 13. Mobile

Fluid clamps: hero ≥42px mobile; page titles ≥36px; lead ≥20px. Eyebrow tracking moderated (0.08em).

---

## 14. Font Loading

```ts
Golos_Text({ weight: ["400","500","600"], subsets: cyrillic|ext|latin|ext, display: "swap", adjustFontFallback: true })
Prata({ weight: "400", subsets: cyrillic|ext|latin, display: "swap", adjustFontFallback: true })
```

No Source Serif. No Cormorant. No Onest. No unused italic faces.

---

## 15. Production Integration

- Branch: `ux-d2-typography-rebuild` from `origin/phase15-ux-funnel-hardening` (`5d99a28` / UX.F preserved).
- Diff is typography-scoped classNames + `layout.tsx` + `globals.css`.
- Deploy: immutable release on VPS (same topology as UX.F).

---

## 16. Production Font Proof

| Check | Result |
|-------|--------|
| Pre-D2 production H1 | Cormorant — **proven** |
| Local D2 H1 | Prata 96px — **proven** |
| Post-deploy `/api/health` SHA | _fill after deploy_ |
| Post-deploy computed H1 | _must be Prata_ |
| Post-deploy body | _must be Golos Text_ |

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

- `npm run typecheck` — PASS
- `npm run lint` — 0 errors (17 pre-existing warnings)
- Production build — on VPS release

---

## 19. Production Smoke

_Fill after deploy:_ `/`, `/explore`, article, `/about`, `/map`, `/contact`, `/api/health`.

---

## 20. Remaining Risks

- Local home may error without Postgres — typography still loads under error boundary.
- Prata has no italic — quotes are roman display.
- Some secondary pages may still use ad-hoc sizes.
- Disk pressure on VPS releases (~85%).

---

## 21. Definition of Done Evidence

| # | Status |
|---|--------|
| 1 Production D1 audit | DONE §3 |
| 2 Source Serif removed | DONE |
| 3–4 Prata/Golos roles | DONE local proof |
| 5–7 Hero/titles/roles | DONE local (96/68/52) |
| 8–12 Explore/Routes/About/Mobile | DONE composition |
| 13 Loading | DONE next/font |
| 14 Before/after | DONE §8–11 |
| 15 UX.F preserved | DONE base `5d99a28` |
| 16–17 Production | PENDING deploy proof |
| 18 Build/tests | typecheck/lint DONE |

**Gate:** ENGINEERING CLOSED for typography rebuild; **PRODUCTION VERIFIED** only after §16 post-deploy fill.
