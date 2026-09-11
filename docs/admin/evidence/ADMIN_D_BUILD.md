# ADMIN.D — Build evidence

**Date:** 2026-09-11

## Commands

1. First `npm run build` after CRM edits → **type regression** in `fetch-owner-dashboard.ts` (`CrmLeadDoc[]` vs `Record<string, unknown>[]`). Fixed by explicit map.
2. Second `npm run build` after fix:

| Phase | Result |
|-------|--------|
| Compile (Turbopack) | PASS (reached SSG; no compile error in log tail) |
| TypeScript (next build) | PASS (no type error after fix) |
| SSG / prerender `/` | **FAIL** — Payload cannot connect to Postgres |

## Error signature (SSG)

```
Error: cannot connect to Postgres
aggregateErrors:
  - connect EACCES ::1:5432
  - connect ECONNREFUSED 127.0.0.1:5432
Error occurred prerendering page "/"
payloadInitError: true
```

## Comparison to ADMIN.C

ADMIN.C report: full `next build` blocked by PRE-EXISTING local Postgres (`ECONNREFUSED 127.0.0.1:5432`).  
ADMIN.D: same blocker class after successful compile+typecheck. **Not** an ADMIN.D schema/UI regression at SSG stage.

## Local DB

Port 5432 closed at gate time → no schema sync / E2E against local Postgres.
