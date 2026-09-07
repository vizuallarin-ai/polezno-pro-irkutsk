# GATE UX.H — Final Visual Polish / Responsive QA / Typography Cleanup

## 1. Final Status

**GATE UX.H PUBLIC UI ENGINEERING READY / OWNER CONTENT STILL BLOCKED / NO MERGE TO MASTER / NO DEPLOY**

Pass date: **2026-09-07** (continuation after BitLocker interruptions; verification completed locally).

This gate is **cosmetic + responsive + typography cleanup** only. It does **not** publish owner content, does **not** invent commercial entities, and does **not** promote the site to production.

---

## 2. Starting Baseline

| Item | Value |
|------|-------|
| Branch | `phase15-ux-funnel-hardening` |
| Starting HEAD | `b0e00488f895db1c82a6210dbea16bee47730cf3` |
| Prior gate | UX.G ENGINEERING READY / OWNER CONTENT BLOCKED |
| Fonts | Prata + Golos Text (`app/(site)/layout.tsx`) |
| Scope | Public UI polish only — no redesign, no new product features |

Production SHA was **not re-verified** in this closeout run; do not treat git tip as live production.

---

## 3. What Was Fixed

### Typography
- Headings normalized to project `type-*` tokens (display / title / body).
- Decorative public `italic` removed from UI surfaces (comments may still mention italic as a don’t).
- Softened mobile display clamps (e.g. display-xl floor raised toward ~36→96px range) to reduce cramped hero type.

### Header / CTA (P0)
- `.cta-primary { display: inline-flex }` outside layers overrode Tailwind `hidden` → desktop CTA leaked onto mobile and clipped the brand.
- Fix: wrap CTA component styles in `@layer components` in `app/globals.css` so utilities win.
- Brand link: `shrink-0` + `whitespace-nowrap` in `components/layout/header.tsx`.
- Contextual CTA: `/business` (and `/program` → redirect to `/business`) uses «Обсудить программу» via `resolveContextualCta`.

### Buttons / wrapping
- Adaptive CTA height / `whitespace-normal` where needed.
- `.cta-label` can wrap on narrow; desktop nav CTA stays compact from `lg`.

### Landmarks
- Nested `<main>` removed from site pages; single `<main id="main-content">` remains in `app/(site)/layout.tsx`.

### Other polish
- Business / explore / souvenirs / events / about / contact / privacy / error / not-found surfaces aligned to type tokens and layout consistency.
- Overflow smoke harness: `scripts/ux-h-overflow-smoke.mjs`.

---

## 4. Verification Matrix

| Check | Result | Evidence |
|-------|--------|----------|
| Overflow + header smoke | **PASS** (`failCount: 0`, `total: 143`) | `.deploy-artifacts/ux-h/overflow-smoke.json` (`finishedAt: 2026-09-07T11:42:59.849Z`) |
| Viewports | 320, 360, 375, 390, 414, 480, 768, 820, 1024, 1280, 1440 | smoke script |
| Routes | `/`, `/map`, `/explore`, `/business`, `/contact`, `/about`, `/about/guides`, `/souvenirs`, `/ar-postcards`, `/events`, `/explore/photos`, `/privacy`, `/program` | smoke script |
| Nested `main` count | **1** on all smoke routes | smoke JSON `nestedMainCount` |
| Mobile header | brand + burger; desktop CTA hidden | smoke: `headerCtaVisible=false`, `burgerVisible=true` at ≤480 |
| Desktop header CTA | visible; business/program contextual label | smoke at ≥1024 |
| `npm run lint` | **PASS** (0 errors; pre-existing warnings) | local run 2026-09-07 |
| `npx tsc --noEmit` | **PASS** | local run 2026-09-07 |
| `npm run build` | **PASS** | empty `DATABASE_URL` + `ALLOW_DEMO_FALLBACK=true` (no live Postgres on this machine); log `.deploy-artifacts/ux-h/build.log` |
| `test:deploy-immutable` | **PASS** (16) | local |
| `test:lead-privacy` | **PASS** (7) | local |
| `test:readiness` | **PASS** (13) | local |
| `test:leads` | **PASS** (8) | local |

**Build note:** A prior attempt with a fail-fast fake `DATABASE_URL` (`127.0.0.1:1`) correctly refused prerender. Closeout build uses **unset/empty** `DATABASE_URL` so Payload is not initialized and demo/empty paths work — same pattern as local-without-DB development. Release/isolated production builds still require disposable Postgres (`build:release:isolated`).

---

## 5. Explicit Non-Goals / Still Blocked

| Item | Status |
|------|--------|
| Owner content pack / CMS commercial entities | **Still blocked** (UX.G) |
| Fake experience / synthetic reviews / seed-as-prod | **Rejected** |
| Merge to `master` | **Not done** |
| Production deploy | **Not done** |
| Production SHA live re-check | **Not done this run** |
| Full pixel visual matrix screenshots archive | Optional; overflow/header smoke is the gate evidence |

---

## 6. Git / Ship State

| Item | Value |
|------|-------|
| Branch | `phase15-ux-funnel-hardening` |
| Commit | See git tip after UX.H commit (this doc lands in the same commit) |
| Push | Current branch only |
| Merge / deploy | **No** |

Untracked junk **not** committed: `####/`, PDFs, `public/images/Alena.jpg`, `scripts/phase15-*.ps1/sh`, `scripts/visual-acceptance-probe.mjs`.

---

## 7. Residual Risks

1. **BitLocker on `I:`** can interrupt mid-session; always re-check drive before write/commit.
2. **Build without Postgres** proves compile/prerender with empty DB path — not a substitute for `build:release:isolated` against disposable DB before VPS switch.
3. **Owner content** remains empty; public UI can look “ready” while commercial funnel content is still missing.
4. **Dev server cold compile** on BitLocker volumes is slow; smoke used long goto timeouts (300s).

---

## 8. Manual Spot-Check Checklist

- [ ] Mobile 390: header = «Иркпортал» + burger; no desktop CTA.
- [ ] Desktop 1280: CTA visible; `/business` = «Обсудить программу».
- [ ] No horizontal scroll on home / map / explore / business.
- [ ] No decorative italic on public marketing copy.
- [ ] Only one landmark `main` in accessibility tree.
- [ ] Buttons wrap instead of clipping on 320–375.

---

## 9. Verdict

```text
GATE UX.H PUBLIC UI ENGINEERING READY
OWNER CONTENT STILL BLOCKED (UX.G)
NO PRODUCTION PUBLICATION FROM THIS GATE
```
