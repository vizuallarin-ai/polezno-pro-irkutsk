# UX.D.1 — Typography Art Direction

**Final Status:** `UX.D.1 CLOSED / TYPOGRAPHY ART DIRECTION ESTABLISHED`

**Branch:** `ux-d1-typography-art-direction`  
**Baseline HEAD:** `e4fd356` (`feat: refine premium visual direction`)  
**Parallel safety:** does not merge `phase15-ux-funnel-hardening` (UX.F); UX.F tip remains `cec2718`.

---

## 1. Final Status

ИркПортал получил устойчивую роль-based типографическую систему:

- **Display / story:** Source Serif 4  
- **UI / body / system:** Golos Text  

Направление: современное культурное издание об Иркутске и Байкале — не hotel / restaurant / luxury travel cliché.

---

## 2. Baseline

| Item | Value |
|------|--------|
| Branch created from | `e4fd356` |
| Prior fonts | Onest + Cormorant Garamond (`next/font/google`) |
| Prior tokens | `--font-sans` / `--font-serif` + `.type-*` scale (Cormorant weight 300 display) |
| Worktree at start | clean of tracked changes; untracked scripts/PDFs ignored |

---

## 3. Current Typography Audit (pre-change)

### What worked
- Central `.type-*` helpers already existed.
- Onest = solid Cyrillic UI sans.
- Display/body split partially formalized.

### Problems
| Issue | Evidence |
|-------|----------|
| Generic premium / hospitality | Cormorant Light 300 + wide tracking eyebrows |
| Weak hierarchy | Many pages used ad-hoc `text-5xl font-light` instead of tokens |
| Serif misuse | Italic serif accents on random words («бизнеса», «гулять?», contact titles) |
| Marketplace feeling | Card titles as plain medium sans; stats in display serif |
| Inconsistent sizes | Local `tracking-[0.3em]`, `text-[10px]`, mixed leads |
| Long-form risk | No measure/prose system for Explore articles |
| CLS / loading | Acceptable via next/font; Cormorant weight set heavier than needed for “luxury light” |

### Serif used correctly
- Hero `.type-display-xl`
- Selected section displays

### Serif used incorrectly
- Decorative italic spans inside UI/sans titles
- Stats / numbers
- Meta / labels

---

## 4. Font Pair Comparison

Scores 1–5 (higher = better for IrkPortal).

| Criterion | A Prata + Golos Text | B Literata + Onest | C Source Serif 4 + Golos Text |
|-----------|---------------------|--------------------|------------------------------|
| 1. Cyrillic quality | 4 | 5 | **5** |
| 2. Editorial character | 4 | 4 | **5** |
| 3. Historical/cultural relevance | 3 | 4 | **5** |
| 4. Contemporary feeling | 3 | 4 | **5** |
| 5. Premium perception | 4 (luxury risk) | 3 | **4** (editorial) |
| 6. Readability | 3 (display-only serif) | **5** | **5** |
| 7. Long-form suitability | 2 | **5** | **5** |
| 8. UI suitability | **5** (Golos) | 4 (Onest) | **5** (Golos) |
| 9. Mobile rendering | 3 | **5** | **5** |
| 10. Font loading / perf | 4 (Prata 1 weight) | 4 | **4** |
| 11. Weight availability | 2 (Prata 400 only) | **5** | **5** |
| 12. Licensing / production | **5** (Google Fonts) | **5** | **5** |
| 13. Risk of visual cliché | 2 (fashion/luxury) | 3 | **4** |
| 14. Layout compatibility | 4 | **5** | **5** |

Lab: `/dev/typography` (noindex) — identical layout samples for Home / Explore / Route / About copy.

---

## 5. Selected Direction

**C — Source Serif 4 + Golos Text**

### Design verdict
Prata даёт драму, но одно начертание и luxury/fashion риск. Literata + Onest сильны для reading, но слабее как «голос издания» и оставляют Onest без смены системного характера. Source Serif 4 держит editorial display и long-form; Golos Text даёт современный русский product UI без Inter/Manrope generic.

---

## 6. Why This Pair Fits IrkPortal

- Сибирский / городской / интеллигентный тон без hotel-serif.
- Контраст: story (serif) vs system (grotesk).
- Golos (Paratype) — кириллица-first, тихий digital product.
- Source Serif 4 — Adobe transitional, пригоден для заголовков и цитат, не wedding/Cormorant cliché.
- Готов к будущим longreads (UX.E Explore).

---

## 7. Typography Role System

| Role | Family | Weight | Desktop | Mobile | LH | Tracking | Casing | Max-width |
|------|--------|--------|---------|--------|-----|----------|--------|-----------|
| DISPLAY | serif | 400 | 56–80 (`display-xl`) | 40–48 | 1.02 | -0.02em | as written | ~16–18ch hero |
| PAGE TITLE | serif | 400 | 44–64 | 36+ | 1.02 | -0.02em | as written | — |
| SECTION TITLE | serif | 400 | 32–44 | 28+ | 1.15 | -0.015em | as written | — |
| EDITORIAL TITLE | serif | 400 | 28–36 | 24+ | 1.15 | -0.015em | as written | — |
| QUOTE | serif italic | 400 | 20–26 | 20 | 1.45 | -0.01em | as written | ~38rem |
| LEAD | sans | 400 | 18–22 | 18 | 1.5 | 0 | as written | ~md |
| BODY LARGE | sans | 400 | 18 | 18 | 1.65–1.7 | 0 | as written | 42rem prose |
| BODY | sans | 400 | 17 | 17 | 1.65 | 0 | as written | 42rem |
| SMALL | sans | 400 | 14 | 14 | 1.65 | 0 | as written | — |
| META | sans | 500 | 12 | 12 | 1.4 | 0.04em | optional upper | — |
| EYEBROW | sans | 500 | 11 | 11 | 1.4 | 0.1em | UPPER | — |
| NAV | sans | 500 | 14 | 14 | 1.4 | 0.015em | as written | — |
| BUTTON | sans | 500 | 14 | 14 | 1.25 | 0.01em | as written | — |
| FORM LABEL | sans (`type-ui-label`) | 500 | 13 | 13 | 1.4 | 0.01em | as written | — |
| CAPTION | sans | 400 | 12 | 12 | 1.4 | 0.04em | as written | — |
| STAT | sans | 500 | display-l | — | 1.02 | heading | tabular | — |

**Rule:** serif = meaning/story; sans = system/nav/info/action. Uppercase только на eyebrow/brand, tracking умеренный.

---

## 8. Tokens

Centralized in `app/globals.css` `:root`:

- `--font-display`, `--font-body` (+ aliases `--font-serif` / `--font-sans`)
- `--text-display-xl|l`, `--text-page-title`, `--text-section-title`, `--text-editorial`, `--text-lead`, body scale, `--text-eyebrow`
- `--leading-*`, `--tracking-*`, `--measure-prose`
- Semantic classes: `.type-display-xl`, `.type-page-title`, `.type-section-title`, `.type-editorial`, `.type-quote`, `.type-lead`, `.type-stat`, `.type-eyebrow`, `.prose-editorial`, …

---

## 9. Font Loading

```ts
Golos_Text({ subsets: cyrillic|cyrillic-ext|latin|latin-ext, weight: 400|500|600, display: "swap", adjustFontFallback: true })
Source_Serif_4({ subsets: cyrillic|cyrillic-ext|latin|latin-ext, weight: 400|600, style: normal|italic, display: "swap", adjustFontFallback: true })
```

- Mechanism: `next/font/google` (self-hosted at build)
- No runtime CDN dependency
- Minimal weights
- Fallback metrics via `adjustFontFallback`

---

## 10–13. Screen Validation

| Screen | Checks |
|--------|--------|
| **Home** | Hero display serif + Golos lead; scenario section titles; CTAs sans; stats sans; no italic gimmicks |
| **Explore** | Page title serif role; cards editorial titles; meta sans; density preserved |
| **Route** (`/map`) | Page title / lead tokens; catalog chrome sans |
| **About** | Quote serif italic only for manifesto pull; body `prose-editorial` measure |

Lab A/B/C compared on identical samples before selection.

---

## 14. Long-form Readability

- `.prose-editorial`: ~42rem measure (~65–72ch), lh 1.7, paragraph spacing, baikal links, serif italic blockquotes
- Applied on Explore article body + About manifesto

---

## 15. Mobile Acceptance

Fluid `clamp()` on display/page/section/editorial/lead. Eyebrow tracking reduced (0.1em vs 0.22–0.3em). Hero max-width ch constraints retained. CTA wrap utility unchanged.

Viewports considered: 375 / 390 / 430 / 768 / 1440 (via fluid tokens + existing responsive layout).

---

## 16. Accessibility

- Body ≥ 17px; UI controls ≥ 14px; touch targets unchanged (44px CTAs)
- Italic limited to quotes
- Uppercase limited to eyebrows/brand
- Focus-visible preserved
- Contrast: existing muted/ink tokens unchanged

---

## 17. Performance Impact

- Two families, limited weights (Golos 3 + Source Serif 2×2 styles)
- Replaces Onest (variable-ish) + Cormorant (3 weights × 2 styles)
- Expected similar or slightly lower font payload vs prior Cormorant set
- `display: swap` + size adjust mitigates CLS

---

## 18. Files Changed

- `app/(site)/layout.tsx`
- `app/globals.css`
- `app/(site)/dev/typography/page.tsx` *(new, noindex lab)*
- `app/(site)/about/page.tsx`
- `app/(site)/contact/page.tsx`
- `app/(site)/events/page.tsx`
- `app/(site)/explore/page.tsx`
- `app/(site)/explore/[slug]/page.tsx`
- `components/contact/contact-cta-section.tsx`
- `components/explore/explore-routes-preview.tsx`
- `components/explore/explore-sections.tsx`
- `components/layout/header.tsx`
- `components/routes/routes-page-client.tsx`
- `components/sections/business-preview.tsx`
- `components/sections/final-cta.tsx`
- `components/sections/photos-preview.tsx`
- `components/sections/scenario-picker.tsx`
- `components/sections/social-proof.tsx`
- `components/sections/souvenirs-preview.tsx`
- `components/visual/author-visual-block.tsx`
- `components/visual/city-detail-card.tsx`
- `components/visual/city-hero-visual.tsx`
- `components/visual/material-visual-card.tsx`
- `components/visual/visual-quote-block.tsx`
- `docs/UX_D1_TYPOGRAPHY_ART_DIRECTION.md` *(this file)*

---

## 19. Tests / Build

| Check | Result |
|-------|--------|
| `npm run typecheck` | PASS (exit 0) |
| `npm run lint` | PASS — 0 errors (17 pre-existing warnings) |
| `npm run build` compile | PASS (`✓ Compiled`) |
| `npm run build` prerender | FAIL — `ECONNREFUSED` Postgres `:5432` (environment; not typography). Same class of failure as any CMS-dependent build without DB. |
| Typography unit tests | Not in repo |

Engineering acceptance for typography: typecheck + lint green; Next compile accepts font modules; prerender blocked by local DB absence, not by font/CSS changes.

---

## 20. Conflicts / Parallel Safety

- Branch isolated from UX.F (`phase15-ux-funnel-hardening` @ `cec2718`)
- No merge of UX.F content graph / CMS / CTA props
- Cherry-pick friendly: mostly `globals.css` + `layout.tsx` + className migrations
- If conflict: typography tokens win in CSS; page content from UX.F wins in TSX copy/hrefs

---

## 21. Remaining Risks

- Some secondary surfaces (souvenirs makers, business long page, AR postcards) still have local `font-light` / occasional serif accents — out of acceptance matrix; migrate opportunistically.
- Lab page `/dev/typography` should stay noindex (already) or be removed before public crawl emphasis.
- Visual matrix on real CMS longreads still depends on content length.

---

## 22. Definition of Done Evidence

| # | Criterion | Evidence |
|---|-----------|----------|
| 1 | Audit | §3 |
| 2 | ≥3 pairs | §4 A/B/C |
| 3 | One direction | §5 C |
| 4 | Cyrillic on real pages | lab + Home/Explore/Route/About |
| 5 | Serif/sans roles | §7 |
| 6 | Semantic hierarchy | `.type-*` |
| 7 | Tokens centralized | `globals.css` |
| 8 | Font loading safe | `next/font` §9 |
| 9 | Long-form ready | `.prose-editorial` |
| 10 | Mobile | fluid clamps §15 |
| 11 | A11y | §16 |
| 12 | Visual acceptance screens | §10–13 |
| 13 | Build/tests | §19 |
| 14 | No UX.F/content/business | §20 |
| 15 | Diff typography-scoped | §18 |

**Verdict:** UX.D.1 CLOSED / TYPOGRAPHY ART DIRECTION ESTABLISHED
