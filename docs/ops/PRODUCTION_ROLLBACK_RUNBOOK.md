# Production rollback runbook — IrkPortal

Companion to `PRODUCTION_ROLLOUT_RUNBOOK.md`.  
**Do not invent a code-only rollback if schema was migrated.**

## Identities

| Layer | Value |
|---|---|
| Old application SHA (current production before ADMIN.B–F rollout) | `b3a51ba8500bb03b5f1124feab567bee3a313824` |
| New application SHA | `TARGET_RELEASE_SHA` (frozen at ADMIN.F close) |
| DB | PostgreSQL `polezno_irkutsk` |
| Media | `/var/www/polezno-shared/media` (shared; usually unchanged) |

## Compatibility verdict (ADMIN.F)

**Contract:** `CONDITIONAL — ADDITIVE SCHEMA / DB RESTORE IF NEW ENUM VALUES WRITTEN`

Evidence basis:

- ADMIN.F SQL is additive: new enum values, nullable columns, indexes, `reviews.status`
- Old application (`b3a51ba`) does not reference `booked`/`declined`/`developer` / CRM columns
- Unused new columns generally allow old code to boot
- If production wrote `booked`/`declined` or `role=developer` after cutover, rolling code back without DB restore leaves values the old UI/schema may not understand
- Payload version tables added by schema sync are similarly additive; dropping them is not part of fast rollback

## Decision tree

### A) Deploy failed before migration

1. Keep DB untouched
2. Switch release symlink / PM2 back to previous release directory for `b3a51ba…`
3. Health must show old SHA
4. Media unchanged

### B) Migration applied, new app unhealthy, **no** new enum values written

1. Preferred: restore application to `b3a51ba…` without DB restore
2. Confirm `/api/health` + admin login
3. Leave additive columns in place (harmless) **or** restore DB dump if uncertainty

### C) Migration applied and CRM/role new values used / schema sync uncertain

1. **DB RESTORE REQUIRED** from pre-migration dump
2. Restore application to `b3a51ba…`
3. Media: do not overwrite from archive unless media deploy corrupted files
4. Expected downtime: restore duration + app restart (measure in rehearsal; typically tens of minutes on this VPS size)

## DB restore (high level)

1. Stop or drain app writes (`pm2 stop polezno` if needed)
2. `pg_restore` pre-migration dump into `polezno_irkutsk` using the project recovery runbook
3. Start app on rollback SHA
4. Verify health + spot-check articles slugs still resolve
5. Preserve the failed-release dump for forensics

See also: `docs/ops/ADMIN_RECOVERY_RUNBOOK.md`

## Media

Media path is shared across releases. Rollback of application code does not require media restore unless a release mutated files incorrectly.

## Offsite

If on-host dump is damaged, use offsite object (when LIVE) → disposable restore → promote only after verification.  
If offsite is NOT LIVE, on-host dump + GitHub are the only recovery layers.

## STOP

Never `DROP` enum values to “undo” migration.  
Never force-push git history as a substitute for DB restore.
