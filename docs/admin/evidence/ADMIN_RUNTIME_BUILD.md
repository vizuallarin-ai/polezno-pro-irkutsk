# ADMIN.RUNTIME — Build

**Date:** 2026-09-11  
**HEAD before icon fix:** `4142e7b`  
**Command:** `npm run build` (canonical `next build`)

## Result

| Phase | Result |
|-------|--------|
| Compile (Turbopack) | **PASS** (~2.3 min) |
| TypeScript (in next build) | **PASS** (~52s) |
| SSG / static generation | **PASS** (45/45 pages) |
| Overall exit code | **0** |

## Unmasked failure (first attempt after DB restore)

With Postgres available, build progressed past the historical `ECONNREFUSED 5432` blocker and failed on:

```text
Error occurred prerendering page "/icon"
Error: colourspace: parameter space not set
(GLib-GObject-CRITICAL … VipsInterpretation)
```

### Classification

| Class | Verdict |
|-------|---------|
| APPLICATION REGRESSION (ADMIN.B/C/D) | **No** — `/icon` used `next/og` `ImageResponse` before this gate |
| ENVIRONMENT ISSUE | **Yes** — Windows sharp/libvips colourspace during OG icon prerender |
| DATA ISSUE | No |
| PRE-EXISTING | **Yes** — previously masked by Postgres-down SSG failure |

### Fix applied (documented bugfix)

- Removed `app/icon.tsx` / `app/apple-icon.tsx` (`ImageResponse`)
- Added static `app/icon.png` / `app/apple-icon.png` (same brand colors `#0B3D5C` / `#FAF9F7`)
- Re-run `npm run build` → **PASS**

## Comparison to ADMIN.D build evidence

ADMIN.D: compile+tsc OK; SSG failed on Postgres.  
ADMIN.RUNTIME: Postgres restored → icon env issue exposed → fixed → **full build PASS**.

## Note on SSG content

Local disposable TEST FIXTURE excursions/routes may appear in `generateStaticParams` output during local build. These are **not** production content.
