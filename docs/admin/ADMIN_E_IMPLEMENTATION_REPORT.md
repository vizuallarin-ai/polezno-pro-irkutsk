# GATE ADMIN.E — Implementation report

**Status: PARTIAL / OWNER OFFSITE BACKUP BLOCKED**  
(Code + local proofs complete; offsite copy not live; remote git recovery point still missing until push.)

## Baseline

| Item | Value |
|---|---|
| Repo | vizuallarin-ai/polezno-pro-irkutsk |
| Branch | phase15-ux-funnel-hardening |
| Start SHA | `5a15e68` |
| Remote branch SHA | `95ba8d0` (local **ahead 9** at start) |
| Production SHA | `b3a51ba…` (health ok, unchanged) |
| Payload / Next | ^3.85.0 / 16.2.6 |
| REMOTE RECOVERY POINT | **MISSING** until authorized push |

## What changed

### Roles & access

- Canonical roles: `admin` (Owner), `editor` (Content Editor), `developer` (Developer) — `payload/roles.ts`
- Canonical access helpers — `payload/access.ts`
- Server guards: delete, leads, media, users lockout/escalation — `payload/hooks/delete-guards.ts`
- Dashboard hides leads for editor — `OwnerDashboardView`

### Versions & Articles

- Versions on Excursions, Routes, Reviews, Guides, Photos, Site Settings (+ Articles retained)
- Retention finite (`payload/versioning.ts`)
- Articles: custom `status` canonical; `_status` synced (`article-status-sync.ts`)

### API

- Public leads → `/api/public/leads`
- Public map routes → `/api/public/routes` (Payload REST no longer shadowed)
- Revalidate hardened (secret required, size/type checks)

### Backup / ops

- Offsite copy contract script (not live without credentials)
- Media backup script
- Local DB dump→restore proven
- Owner guide + recovery runbook

## Evidence index

- `docs/admin/evidence/ADMIN_E_BASELINE.md`
- `docs/admin/evidence/ADMIN_E_ROLE_E2E.md`
- `docs/admin/evidence/ADMIN_E_VERSION_RESTORE.md`
- `docs/admin/evidence/ADMIN_E_BACKUP_RESTORE.md`
- `docs/admin/evidence/ADMIN_E_API_SECURITY.md`
- `docs/admin/evidence/ADMIN_E_MIGRATION_DRY_RUN.md`
- `docs/admin/evidence/ADMIN_E_BUILD.md` (after build)
- Matrix / policies: `ADMIN_E_ACCESS_MATRIX.md`, `ADMIN_E_VERSIONING_POLICY.md`, `ADMIN_E_DELETE_SAFETY.md`
- `docs/admin/OWNER_ADMIN_GUIDE.ru.md`
- `docs/ops/ADMIN_RECOVERY_RUNBOOK.md`

## Production

Read-only. No deploy. No production migration. No production restore.

## Remaining for full CLOSED

1. Owner chooses offsite destination + credentials → run `backup-offsite-copy.sh` → prove remote object exists.
2. Authorized `git push` so remote recovery includes ADMIN.E commits.
3. Future rollout gate: production enum migration + schema sync with backup.
