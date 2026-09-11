# ADMIN.B — Implementation report

**Status:** `GATE ADMIN.B PARTIAL` (code + tests proven; local owner E2E / staging publish smoke NOT PROVEN; production unchanged)

**Date:** 2026-09-11

## Summary

ADMIN.B превратил плоское developer-меню Payload в grouped owner IA, добавил auto-slug, publish guards для экскурсий/маршрутов, починил revalidate экскурсий, вернул Отзывы/Гиды в workflow с безопасным public read, спрятал orphan/system сущности и мёртвые поля без destructive migrations.

## Deliverables

- `docs/admin/ADMIN_B_INFORMATION_ARCHITECTURE.md`
- `docs/admin/ADMIN_B_IMPLEMENTATION_REPORT.md` (this file)
- `docs/admin/evidence/ADMIN_B_BASELINE.md`
- `docs/admin/evidence/ADMIN_B_REVALIDATION_MATRIX.md`
- `docs/admin/evidence/ADMIN_B_FIELD_CONSUMER_AUDIT.md`
- `docs/admin/evidence/ADMIN_B_E2E.md`
- Issue mapping in `docs/admin/ADMIN_A_ISSUE_REGISTER.md` (ADMIN.B resolutions section)

## Key code modules

| Module | Role |
|--------|------|
| `payload/admin-groups.ts` | Group labels |
| `lib/slug.ts` | Cyrillic slugify |
| `payload/hooks/auto-slug.ts` | beforeValidate auto-slug (no overwrite of existing) |
| `payload/hooks/publish-guards.ts` | Excursion/route/guide safety |
| `lib/revalidate-paths.ts` | Path/tag matrix |
| `app/api/revalidate/route.ts` | Uses matrix |
| `scripts/test-admin-b-cms.ts` | Unit verification |

## Schema note

- **New field:** `reviews.status` (default `draft`). Non-destructive; requires Payload schema sync on next deploy/env. Local `db.push` in non-production.
- **No destructive migrations.** No production DB writes in this gate.

## Guides placeholder `slug=Slug`

- Public REST: excluded by `guideReadAccess`
- Public UI: already fail-closed via content-readiness
- CMS: owner can open Guides and deactivate/replace
- **Not edited in production** (read-only policy)

## Quality gates run

| Command | Result |
|---------|--------|
| `npm run typecheck` | PASS |
| `npm run lint` | 0 errors (pre-existing warnings only) |
| `npm run test:admin-b` | PASS (9) |
| `npm run test:leads` | PASS |
| `npm run test:lead-privacy` | PASS |
| `npm run test:content-intake` | PASS |
| `npm run test:readiness` | PASS |

## Out of scope (kept)

ADMIN.C dashboard, ADMIN.D CRM fields, ADMIN.E versions/RBAC/backup, CONTENT.1 owner pack, `/api/routes` rename.
