# ADMIN.C — E2E evidence

**Date:** 2026-09-11

| Check | Status | Notes |
|-------|--------|-------|
| Login → Главная | **NOT PROVEN** | Local Postgres unavailable in this environment (`ECONNREFUSED 127.0.0.1:5432`) |
| Attention from real DB | **NOT PROVEN** | Same |
| Quick actions navigate | **CODE-PROVEN** | `lib/admin/admin-routes.ts` + `test:admin-c` |
| Drafts → edit URLs | **CODE-PROVEN** | `adminEditPath` |
| Open site URL | **CODE-PROVEN** | `getSiteUrl()` / `DEFAULT_SITE_URL` |
| Publish checklist live | **CODE-PROVEN** | shared module + UI field wired; runtime form **NOT PROVEN** |
| Mobile 390×844 | **NOT PROVEN** | Layout uses flex-wrap; ADMIN.F |
| Production mutation | **none** | read-only health only |

## Verdict

Local owner E2E: **NOT PROVEN** (environment).  
Business logic: **TEST-PROVEN** via `npm run test:admin-c`.
