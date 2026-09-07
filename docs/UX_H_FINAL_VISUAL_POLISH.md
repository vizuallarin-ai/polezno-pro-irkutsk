# GATE UX.H — Final Visual Polish / Responsive QA / Typography Cleanup

## 1. Final Status

```text
GATE UX.H CLOSED / FINAL VISUAL POLISH COMPLETE / TYPOGRAPHY NORMALIZED / RESPONSIVE QA PASSED / 143/143 LAYOUT SMOKE PASSED / PUBLIC UI ENGINEERING READY / OWNER CONTENT STILL BLOCKED
```

Pass date: **2026-09-07** (engineering closeout after BitLocker recovery).  
Evidence review closeout: **2026-09-07** (post-commit `21ef5c1` visual screenshot QA).

This gate is **cosmetic + responsive + typography cleanup** only. It does **not** publish owner content, merge to `master`, or deploy.

---

## 2. Starting Baseline

| Item | Value |
|------|-------|
| Branch | `phase15-ux-funnel-hardening` |
| Starting HEAD | `b0e00488f895db1c82a6210dbea16bee47730cf3` |
| UX.H commit | `21ef5c1fc50fb32ae878b0912e2ba42ed0c7d27c` |
| Prior gate | UX.G ENGINEERING READY / OWNER CONTENT BLOCKED |
| Fonts | Prata + Golos Text (`app/(site)/layout.tsx`) |
| Tokens | `app/globals.css` (`type-*`, CTA surfaces) |
| Scope | Public UI polish only — no redesign, no new product features |

Production SHA was **not re-verified** in this gate; do not treat branch tip as live production.

---

## 3. Typography findings

| Finding | Action |
|---------|--------|
| Decorative public `italic` | Removed from public UI (comments may still say “don’t use italic”) |
| Mixed heading classes | Normalized to `type-*` (display / title / body / brand) |
| Cramped mobile display | Softened display clamps (e.g. display-xl floor ~36→96) |
| Font pairing | Prata (display) + Golos (UI/body) retained from UX.D.2 |

**Closeout visual QA:** H1/H2 composition checked on `/`, `/explore`, `/business`, `/about`, `/contact` at 320–1440 — hierarchy readable; no decorative italic in `main`.

---

## 4. Wrapping findings

| Finding | Action |
|---------|--------|
| CTA / button clipping on narrow | `whitespace-normal` / adaptive height; `.cta-label` can wrap on small |
| Excessive nowrap on brand | Brand keeps `whitespace-nowrap` + `shrink-0` (must not wrap mid-word) |
| Long H1 lines | Soft wraps (e.g. «Иркутск без / штампов») without overflow |

---

## 5. Header / layout collision findings (P0)

**Root cause:** `.cta-primary { display: inline-flex }` outside `@layer` overrode Tailwind `hidden` → desktop CTA leaked onto mobile → brand compressed/clipped.

**Fix:** CTA styles moved into `@layer components` in `app/globals.css` so utilities win; brand `shrink-0` in `components/layout/header.tsx`.

**Result (smoke + screenshots):**

| Width band | Desktop CTA | Logo | Burger | Overflow |
|------------|-------------|------|--------|----------|
| ≤820 | hidden | intact | visible | none |
| ≥1024 | visible | intact | hidden | none |

Contextual CTA: `/business` (and `/program` → `/business`) shows «Обсудить программу».

**Landmarks:** nested `<main>` removed; only `app/(site)/layout.tsx` owns `<main id="main-content">`.

**Intentional decorative layer (not a defect):** hero watermark «КАРТА ИРКУТСКА» behind home H1 — design layer, not clipping/overflow failure.

---

## 6. Viewport matrix (final)

Sources: overflow smoke (all routes) + visual screenshot QA (key routes).

| Width | Header | Typography | Wrapping | Overflow | Overlap | Result |
| ----- | ------ | ---------- | -------- | -------- | ------- | ------ |
| 320   | PASS (CTA hidden, logo OK, burger OK) | PASS | PASS | PASS | PASS* | PASS |
| 360   | PASS | PASS | PASS | PASS | PASS | PASS |
| 375   | PASS | PASS | PASS | PASS | PASS | PASS |
| 390   | PASS | PASS | PASS | PASS | PASS | PASS |
| 414   | PASS | PASS | PASS | PASS | PASS | PASS |
| 480   | PASS | PASS | PASS | PASS | PASS | PASS |
| 768   | PASS (still mobile header: CTA hidden) | PASS | PASS | PASS | PASS | PASS |
| 820   | PASS (CTA hidden) | PASS | PASS | PASS | PASS | PASS |
| 1024  | PASS (desktop CTA visible) | PASS | PASS | PASS | PASS | PASS |
| 1280  | PASS | PASS | PASS | PASS | PASS | PASS |
| 1440  | PASS | PASS | PASS | PASS | PASS | PASS |

\*Decorative hero watermark only — not element collision / clip.

---

## 7. Route / screenshot QA

### Automated overflow + header smoke

| Metric | Value |
|--------|-------|
| Checks | **143** |
| Passed | **143** |
| Failed | **0** |
| Evidence | `.deploy-artifacts/ux-h/overflow-smoke.json` (`finishedAt: 2026-09-07T11:42:59.849Z`) |
| Viewports | 320, 360, 375, 390, 414, 480, 768, 820, 1024, 1280, 1440 |
| Routes | `/`, `/map`, `/explore`, `/business`, `/contact`, `/about`, `/about/guides`, `/souvenirs`, `/ar-postcards`, `/events`, `/explore/photos`, `/privacy`, `/program` |

### Visual screenshot review (post-commit closeout)

Performed **2026-09-07** against local server `http://127.0.0.1:3000` (commit `21ef5c1`).

| Routes | `/`, `/explore`, `/business`, `/about`, `/contact` |
|--------|-----------------------------------------------------|
| Viewports | 320×568, 390×844, 414×896, 768×1024, 1024×768, 1440×900 |
| Artifacts (not in git) | `.deploy-artifacts/ux-h/visual-closeout/qa_*.png` + `qa-manifest.json` |
| Note | Entrance animations forced visible (`opacity:1`) for headless capture — real browsers animate in |

**Checked visually:** typography, wraps, H1/H2, header/CTA, clipping, overlap, whitespace, section rhythm, cards, mobile stacking. No UX.H engineering blocker found. Empty/placeholder media (e.g. about «ПОРТРЕТ») = owner content, not UX.H failure.

---

## 8. Verification

| Check | Result | Evidence |
|-------|--------|----------|
| Overflow + header smoke | **PASS** 143/143 | `overflow-smoke.json` |
| Visual screenshot QA | **PASS** (30 first-viewport shots + review) | `visual-closeout/` |
| `npm run lint` | **PASS** (0 errors; pre-existing warnings) | local 2026-09-07 |
| `npx tsc --noEmit` | **PASS** | local 2026-09-07 |
| `npm run build` | **PASS** (empty `DATABASE_URL` + `ALLOW_DEMO_FALLBACK=true`) | `.deploy-artifacts/ux-h/build.log` |
| Fake DB `127.0.0.1:1` build | **FAIL (expected)** | not a regression |
| `test:deploy-immutable` | **PASS** (16) | local |
| `test:lead-privacy` | **PASS** (7) | local |
| `test:readiness` | **PASS** (13) | local |
| `test:leads` | **PASS** (8) | local |

### Build / DB explanation

1. **Why fake DB was tried:** quick fail-fast probe so Payload would not hang on a dead local Postgres during prerender.
2. **Why that failure is expected:** with a truthy `DATABASE_URL`, Payload **must** connect; `ECONNREFUSED` on port 1 is correct fail-fast, not an UX.H regression.
3. **Why empty `DATABASE_URL` is a valid local build path:** project code short-circuits CMS (`if (!process.env.DATABASE_URL) return …`) and `allowDemoFallback()` is true without DB — same as local-without-DB development. Closeout `next build` completed with route table emitted.
4. **What it does *not* prove:** it does not replace `npm run build:release:isolated` (disposable Postgres) or production release build with linked `.env.production`.
5. **How production gets DB:** VPS release links `/var/www/polezno-shared/.env.production` (contains production `DATABASE_URL`) into the release; media symlinked **after** build (OPS.1 runbook). UX.H did not touch production env or DB.

---

## 9. Known blockers (outside UX.H engineering)

| Item | Status |
|------|--------|
| Owner content pack / CMS commercial entities | **Still blocked** (UX.G) |
| Fake experience / seed-as-prod | **Rejected** |
| Merge to `master` / production deploy | **Not done** (out of scope) |
| Production SHA live re-check | **Not done this gate** |
| Release build vs disposable Postgres | Required before next VPS switch — **not** UX.H scope |

---

## 10. Git / ship state

| Item | Value |
|------|-------|
| Branch | `phase15-ux-funnel-hardening` |
| UX.H code commit | `21ef5c1` (pushed) |
| Docs closeout | this file updated after visual evidence review |
| Merge / deploy | **No** |

Untracked junk **not** committed: `####/`, PDFs, `Alena.jpg`, `scripts/phase15-*.ps1/sh`, `scripts/visual-acceptance-probe.mjs`, local `.deploy-artifacts/`.

---

## 11. Gate conclusion

```text
PUBLIC UI ENGINEERING READY
OWNER CONTENT STILL BLOCKED
NO SITE READY FOR FULL PUBLIC LAUNCH CLAIM
```
