# ADMIN.C — Implementation report

**Status:** `GATE ADMIN.C PARTIAL` (CODE/TEST-PROVEN; local owner E2E NOT PROVEN; build compile+tsc OK, full `next build` blocked by PRE-EXISTING local Postgres; production unchanged)

**Date:** 2026-09-11  
**Starting HEAD:** `d0e69d09351f9092fc969238a92ec9d949796499` (ADMIN.B)  
**Ending HEAD:** `a442077362577cc25ee097184637305b06a13740`

## Summary

ADMIN.C заменил developer-toned BeforeDashboard на owner landing **«Главная»**: attention list, CONTENT.0 readiness checklist, leads summary, content shelves, drafts, quick actions, «Открыть сайт». Publish checklist UI для экскурсий/маршрутов опирается на общий модуль с ADMIN.B server guards. Публичный readiness engine (`lib/content-readiness.ts`) не дублировался.

## Deliverables

- `docs/admin/ADMIN_C_IMPLEMENTATION_REPORT.md` (this file)
- `docs/admin/ADMIN_C_DASHBOARD_ARCHITECTURE.md`
- `docs/admin/evidence/ADMIN_C_BASELINE.md`
- `docs/admin/evidence/ADMIN_C_READINESS_MATRIX.md`
- `docs/admin/evidence/ADMIN_C_QUERY_AUDIT.md`
- `docs/admin/evidence/ADMIN_C_E2E.md`
- Issue mapping update in `ADMIN_A_ISSUE_REGISTER.md`

## Key code modules

| Module | Role |
|--------|------|
| `payload/components/OwnerDashboardView.tsx` | Custom `/admin` dashboard view |
| `payload/components/OwnerDashboardPanel.tsx` | Owner UI |
| `payload/dashboard/fetch-owner-dashboard.ts` | Parallel Local API fetch |
| `lib/admin/owner-launch-readiness.ts` | Checklist + attention |
| `lib/admin/publish-checklist.ts` | Shared publish rules |
| `lib/admin/admin-routes.ts` | Admin URL helpers |
| `payload/components/*PublishChecklist*` | Form UX hints |
| `scripts/test-admin-c-dashboard.ts` | Unit proof |

## Schema

**No new persisted fields.** UI-only `publishChecklist` fields on excursions/routes.  
`reviews.status` sync remains pending from ADMIN.B (not applied in prod by this gate).

## Quality gates

| Command | Result |
|---------|--------|
| `npm run typecheck` | PASS |
| `npm run lint` | 0 errors (pre-existing warnings) |
| `npm run test:admin-c` | PASS (11) |
| `npm run test:admin-b` | PASS (9) |
| `npm run test:leads` | PASS |
| `npm run test:lead-privacy` | PASS |
| `npm run test:content-intake` | PASS |
| `npm run test:readiness` | PASS (13) |
| `npm run build` | **PRE-EXISTING FAIL** — compile+tsc OK; SSG needs Postgres (`ECONNREFUSED 127.0.0.1:5432`) |

## Out of scope (kept)

ADMIN.D CRM (`nextContactAt`, overdue), ADMIN.E RBAC/versions/backup, CONTENT.1 ingest, ADMIN.F acceptance, `/api/routes` rename, fake content, production writes.
