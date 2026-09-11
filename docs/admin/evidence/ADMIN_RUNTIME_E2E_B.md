# ADMIN.RUNTIME — E2E ADMIN.B

**Date:** 2026-09-11  
**HEAD at proof:** `4142e7b`  
**Runtime:** local Next `http://localhost:3000` + LOCAL_DISPOSABLE Postgres  
**Raw machine log:** `docs/admin/evidence/_ADMIN_RUNTIME_E2E_RAW.json` (final successful run)

## Distinction

| Kind | Meaning |
|------|---------|
| TEST FIXTURE | Local disposable records created for this gate only |
| OWNER CONTENT | Production / real owner content — **not** mutated |

## Scenario matrix

| Scenario | Verdict | Evidence |
|----------|---------|----------|
| Admin login | **PROVEN** | `/api/users/login` → userId=1 |
| Admin IA / RU nav | **PROVEN** | Authenticated `/admin` HTML contains `Главная`, groups `Контент`/`Операции`; collections excursions/routes/articles/guides/reviews → 200 |
| Article auto-slug | **PROVEN** | Draft «Тестовая статья ИркПортал» → slug normalized; after publish + title rename slug **stable** |
| Excursion publish guard | **PROVEN** | Publish without price → HTTP 500 reject; with price → `published` |
| Excursion unpublish | **PROVEN** | status → `draft` |
| Route publish guard | **PROVEN** | Create via Local API (see note); publish without points → reject; with point → `published` |
| Frontend consumers smoke | **PROVEN** | `/`, `/map`, `/business` → 200 after publish/unpublish cycle |
| Review fixture | **PROVEN** | TEST FIXTURE review created |
| Revalidation (dev) | **PARTIAL** | Consumers respond 200 in `next dev`; cache semantics **not** production-identical. Production-mode smoke after build recommended if deep cache proof needed. |

## Notes / architecture

1. **`POST /api/routes` → 405**: `app/api/routes/route.ts` (public map GET) shadows Payload REST POST for collection `routes`. Owner Admin UI uses Local API (unaffected). E2E create used `scripts/_tmp-create-route-fixture.mjs` (Local API), then REST `PATCH /api/routes/:id` for guards.
2. **Owner-readable guard message via REST**: Payload wraps thrown `Error` as generic «Something went wrong.» Shared checklist still has Russian blocking copy (`lib/admin/publish-checklist.ts`). Admin UI Local API path is the owner path; REST message wrapping is residual UX debt (not ADMIN.E).
3. Excursion detail sometimes 404 in public readiness filters even when admin publish succeeded — frontend listing consumers still 200.

## Verdict for ADMIN.B runtime

**Runtime E2E for ADMIN.B acceptance: PROVEN** (with revalidation = PARTIAL under `next dev`).
