# ADMIN.E — Migration dry-run (local)

## Goal

Prove how ADMIN.B/D/E schema reaches a disposable DB without touching production.

## Strategy (canonical)

1. **Local / disposable:** `npm run db:push` (Payload postgres adapter push) after backup of disposable DB.
2. **Production rollout (future gate):**  
   - pre-backup (`scripts/backup-db.sh`)  
   - apply explicit SQL where needed (`scripts/migrations/admin-e-add-developer-role.sql`)  
   - then controlled schema sync / generated migrations  
   - validate  
   - rollback = restore dump  

ADMIN.E does **not** run production migration.

## Role enum

```sql
ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'developer';
```

Local proof (2026-09-11):

```text
enum_users_role= [ 'admin', 'editor', 'developer' ]
```

Existing owners keep machine value `admin` (Owner label only) — no login break on deploy if enum extended first.

## Compatibility

| Existing | Target | Action |
|---|---|---|
| `admin` | Owner | Keep value; RU label |
| `editor` | Content Editor | Keep; enable real access |
| _(new)_ `developer` | Developer | Add enum value before deploy |

## Dry-run result

- Local DB already contains developer enum + ADMIN.D CRM columns from prior RUNTIME push.
- Version restore + role E2E exercised against that schema successfully.
- Production schema delta remains **NOT APPLIED** (PROD-NOT-PROVEN).

## Rollback

Restore `pg_dump -Fc` taken immediately before migration.
