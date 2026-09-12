# Production rollout runbook — IrkPortal

**Gate:** PROD.ROLLOUT (after ADMIN.F GO)  
**Do not execute from ADMIN.F.** This document is the checklist only.

## Identity

| Item | Value |
|---|---|
| Repo | `vizuallarin-ai/polezno-pro-irkutsk` |
| Feature branch (source) | `phase15-ux-funnel-hardening` |
| **TARGET_RELEASE_SHA** | `fee5618ad139e6e5c9593bcad552cefeade25089` (frozen; do not chase later docs-only tips) |
| Application rollback SHA | `b3a51ba8500bb03b5f1124feab567bee3a313824` (pre-ADMIN.B–F production) |
| Production host | Beget VPS / `irkportal.ru` |

Never deploy “latest branch”. Deploy the frozen SHA only.

## STOP conditions (abort immediately)

- Fresh on-host DB dump missing / size 0 / age critical
- Fresh media archive missing when `REQUIRE_MEDIA_BACKUP=1`
- Offsite verification fails while offsite is in the GO criteria
- Migration rehearsal not PASS for this SHA
- `npm run build` / release build FAIL for TARGET_RELEASE_SHA
- `/api/health` pre-deploy SHA unexpected (not current known production)
- Required secret MISSING (`DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, …)
- Owner content launch depends on CONTENT READY and content is blocked (commercial launch only)

## PRE-DEPLOY

1. `curl -sS https://irkportal.ru/api/health` → expect `status=ok`, `database=up`, record `commitSha`
2. Confirm TARGET_RELEASE_SHA is pushed to origin and matches local tag/note
3. Disk free ≥ critical threshold (see ops disk policy)
4. `MEDIA_DIR=/var/www/polezno-shared/media BACKUP_DIR=/var/backups/polezno REQUIRE_MEDIA_BACKUP=1 bash /var/www/polezno-shared/ops/scripts/backup-daily-onhost.sh`
5. Confirm new dump + media archive size > 0
6. If offsite LIVE: health exit 0 with `offsite.db=HEALTHY` and `offsite.media=HEALTHY`
7. Confirm `/etc/polezno/offsite.env` mode 600 if used (do not print values)
8. Confirm PM2 `polezno` online

## MIGRATION

1. Keep maintenance window short; prefer read-only public site if needed
2. Re-take DB dump immediately before DDL
3. Apply `scripts/migrations/admin-f-prod-to-target.sql` with `psql -v ON_ERROR_STOP=1`
4. On disposable rehearsal twin first if not already proven for this SHA
5. Controlled Payload schema sync for version tables (`_excursions_v`, `_routes_v`, …) — never invent DDL by hand
6. Verify:
   - `enum_users_role` contains `developer`
   - `enum_leads_status` contains `booked`,`declined` and legacy values
   - `leads.next_contact_at` / `last_contact_at` / `closed_reason*` exist
   - `reviews.status` exists
   - existing `users.role=admin` rows still present
7. STOP if verification fails → follow rollback runbook (DB restore)

## DEPLOY

1. Materialize immutable release for TARGET_RELEASE_SHA (project deploy script / OPS.1)
2. Link shared `.env.production` + media path (no secrets in release tree)
3. Switch symlink / PM2 cwd to new release
4. `pm2 restart polezno` (or project-safe restart)
5. Do **not** `db:push` on production start (`push: false` when `NODE_ENV=production`)

## POST-DEPLOY

1. `curl -sS https://irkportal.ru/api/health` → `commitSha=TARGET_RELEASE_SHA`, `database=up`
2. Public smoke: `/`, `/map`, `/explore`, `/contact`, `/admin`
3. Admin login (owner) → Главная loads
4. Leads list loads (no mutation required)
5. Schema smoke: create is not required; read existing articles/leads
6. Check PM2 logs for boot errors (no secret printing)
7. Backup health still PASS/exit 0|2 as configured
8. GO / rollback decision within the window

## Content / commercial launch

SYSTEM deploy GO ≠ CONTENT READY.  
If flagship excursion / route / photos / guide profile remain blocked, public commercial launch stays NO-GO even if application SHA is updated.
