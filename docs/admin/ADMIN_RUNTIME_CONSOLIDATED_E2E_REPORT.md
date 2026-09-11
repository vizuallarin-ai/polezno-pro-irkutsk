# GATE ADMIN.RUNTIME — Consolidated E2E Report

**Status:** `GATE ADMIN.RUNTIME CLOSED`  
**Date:** 2026-09-11  
**Branch:** `phase15-ux-funnel-hardening`  
**Start SHA:** `4142e7b3853472d86b346f4e992af39e98cd86cc`  
**End SHA:** `a2fa0e465cf8c038747b55b80e455eac20e62047`  
**Production SHA (unchanged):** `b3a51ba8500bb03b5f1124feab567bee3a313824`

## Principle

No new product features. No ADMIN.E. Restore local DB → sync schema → prove ADMIN.B/C/D runtime → full build → clean baseline.

## A. Final status

**GATE ADMIN.RUNTIME CLOSED** — local/disposable Postgres working; schema synced; owner workflows B/C/D runtime-proven; security E2E proven; production build PASS; production unchanged.

Residual non-blockers documented below (REST route shadowing; mobile pixel smoke; prod status histogram).

## B. Baseline

| Item | Value |
|------|-------|
| Repo | `polezno-pro-irkutsk` (`https://github.com/vizuallarin-ai/polezno-pro-irkutsk.git`) |
| Branch | `phase15-ux-funnel-hardening` |
| Start SHA | `4142e7b` |
| Production SHA before/after | `b3a51ba…` / `b3a51ba…` (match) |
| Worktree | Tracked clean at start; pre-existing untracked leftovers preserved |

See: `docs/admin/evidence/ADMIN_RUNTIME_BASELINE.md`

## C. Postgres root cause

At ADMIN.B/C/D time port `127.0.0.1:5432` was closed.  
At RUNTIME: Windows service `postgresql-x64-16` **Running**, TCP 5432 listening. Docker not used.  
**Root cause:** native PostgreSQL service previously unavailable; now recovered.

## D. Local DB

| Field | Value |
|-------|-------|
| Host | `localhost` |
| Port | `5432` |
| Database | `polezno_irkutsk` |
| Classification | **LOCAL_DISPOSABLE** |
| Engine | PostgreSQL 16.15 |

Secrets not recorded. See `ADMIN_RUNTIME_DB_SETUP.md`.

## E. Schema sync

`npm run db:push` → `DB_SCHEMA_PUSH_OK` after safety proof.  
Verified: `reviews.status`; leads `next_contact_at`, `last_contact_at`, `closed_reason`, `closed_reason_note`; indexes `leads_status_idx`, `leads_next_contact_at_idx`.

## F. ADMIN.B E2E

| Scenario | Verdict |
|----------|---------|
| IA / RU nav | PROVEN |
| Article auto-slug + stable after rename | PROVEN |
| Excursion publish guard | PROVEN |
| Route publish guard | PROVEN |
| Frontend consumers `/` `/map` `/business` | PROVEN |
| Revalidation (dev cache) | PARTIAL (dev semantics) |

Detail: `ADMIN_RUNTIME_E2E_B.md`

## G. ADMIN.C E2E

| Scenario | Verdict |
|----------|---------|
| `/admin` = Главная | PROVEN |
| Attention / Readiness / Leads / Content / Drafts / Open site | PROVEN |
| CTA collection pages | PROVEN |
| Checklists excursion/route create | PROVEN |
| Guide placeholder | PROVEN |
| Readiness DB reaction | PROVEN |
| Dashboard query runtime | PROVEN (server Local API; no client storm) |
| Mobile 390×844 visual | PARTIAL (automation blank; HTML proven) |

Detail: `ADMIN_RUNTIME_E2E_C.md`

## H. ADMIN.D E2E

| Scenario | Verdict |
|----------|---------|
| Public ingestion → status `new` | PROVEN |
| CRM lifecycle + overdue/today/upcoming/unscheduled/terminal | PROVEN |
| Security injection + anon 403 | PROVEN |
| Leads fields / admin list UI | PROVEN |
| Prod status histogram | NOT PROVEN (read-only safe limit) |

Detail: `ADMIN_RUNTIME_E2E_D.md`

## I. Security E2E

Public POST attempted inject: `status`, `nextContactAt`, `lastContactAt`, `adminComment`, `closedReason`, `closedReasonNote`.  
Result: all ignored; status remained `new`. Anonymous GET-by-id → 403.

## J. Dashboard runtime

Owner dashboard HTML ~280KB single load; markers for attention/readiness/leads present. Aligns with ADMIN.C/D Local API audit (~21 calls). No infinite client fetch loop observed.

## K. Mobile smoke

Desktop admin routes PROVEN. Mobile viewport automation incomplete (Payload admin blank in MCP browser) → PARTIAL residual, not a product redesign gate.

## L. Build

Full `npm run build` **PASS** (exit 0) after icon static fix. See `ADMIN_RUNTIME_BUILD.md`.

## M. Regression tests

| Command | Result |
|---------|--------|
| `npm run typecheck` | PASS |
| `npm run lint` | 0 errors (pre-existing warnings only) |
| `npm run test:admin-b` | PASS |
| `npm run test:admin-c` | PASS |
| `npm run test:admin-d` | PASS |
| `npm run test:leads` | PASS |
| `npm run test:lead-privacy` | PASS |
| `npm run test:content-intake` | PASS |
| `npm run test:readiness` | PASS |

## N. Bugs found/fixed

| Gate | Bug | Root cause | Fix | Proof |
|------|-----|------------|-----|-------|
| RUNTIME / build | `next build` prerender `/icon` fails (vips colourspace) | Pre-existing `ImageResponse` icon + Windows sharp/vips; unmasked after Postgres restored | Static `app/icon.png` + `app/apple-icon.png`; remove `icon.tsx` / `apple-icon.tsx` | `npm run build` exit 0 |

Harness-only findings (not product bugs): `POST/GET /api/leads` and `POST /api/routes` shadowed by public App Router routes — Admin UI uses Local API; documented.

## O. Gate reclassification

| Gate | Before | After | Why |
|------|--------|-------|-----|
| ADMIN.B | PARTIAL | **CLOSED** | Runtime IA, slug, guards, consumers proven |
| ADMIN.C | PARTIAL | **CLOSED** | Owner Главная, checklist, readiness, CTAs proven |
| ADMIN.D | PARTIAL | **CLOSED** | Public intake, CRM lifecycle, security proven locally |

Historical ADMIN.* reports not rewritten as if E2E existed earlier.

## P. Production safety

| Check | Result |
|-------|--------|
| SHA before/after | `b3a51ba…` unchanged |
| Writes | none |
| Schema sync | local only |
| Deploy | none |
| Push | none |

## Q. Git

| Item | Value |
|------|-------|
| Fix commit | `d25f08a` — `fix(build): replace OG ImageResponse icons with static PNGs` |
| Evidence commit | `a2fa0e4` — `docs(admin): ADMIN.RUNTIME local DB restore and consolidated E2E evidence` |
| End SHA | `a2fa0e4` |
| Diff stat (2 commits) | 13 files, +739 / −56 |
| Push | **not pushed** |
| Pre-existing untracked leftovers | left untracked (`####/`, pdfs, `scripts/_tmp-*`, phase15 scripts) |

## R. Remaining risks

1. `GET /api/leads` list = 405 (public POST route shadows Payload REST) — Admin Local API OK.
2. `POST /api/routes` = 405 (public GET map route shadows REST POST) — Admin Local API OK.
3. REST publish-guard error text may wrap as «Something went wrong» (owner UI Local API is primary).
4. Mobile visual pixel smoke not fully automated.
5. Production lead status histogram still NOT PROVEN.
6. Local SSG may include TEST FIXTURE slugs — dispose/reset local DB when convenient.

## S. Recommended next gate

**ADMIN.E — Safety / Roles / Recovery**  
Do not start automatically.
