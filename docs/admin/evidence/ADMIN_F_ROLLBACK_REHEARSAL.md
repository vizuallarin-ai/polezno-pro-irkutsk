# ADMIN.F — Rollback rehearsal evidence

## Verdict

**CONDITIONAL — ADDITIVE SCHEMA / DB RESTORE IF NEW ENUM VALUES WRITTEN**

## What was proven

- Migration SQL is additive (no DROP COLUMN/TABLE).
- After migrate on disposable, legacy lead statuses and `admin` role remain readable.
- Old application SHA `b3a51ba…` does not depend on new CRM columns.

## What was not fully boot-proven

Full boot of old release binary against post-migration disposable DB was not re-executed in ADMIN.F (topology cost). Contract is therefore **conditional**, not absolute BACKWARD COMPATIBLE.

## Practical rollback

| Situation | Action |
|---|---|
| Failed before DDL | code rollback only |
| DDL applied, no new enum values written | code rollback usually OK; columns unused |
| New statuses/roles written (`booked`/`declined`/`developer`) | **DB restore required** from pre-migration dump |

See `docs/ops/PRODUCTION_ROLLBACK_RUNBOOK.md`.
