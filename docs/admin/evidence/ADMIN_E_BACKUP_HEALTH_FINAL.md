# ADMIN.E — Backup health final evidence

## Command (production shared ops)

```bash
BACKUP_DIR=/var/backups/polezno REQUIRE_MEDIA_BACKUP=1 \
  node /var/www/polezno-shared/ops/scripts/backup-health-check.mjs
```

## Observed result (after media archive + pipeline smoke)

```json
{
  "gate": "ADMIN.E",
  "requireMediaBackup": true,
  "local": {
    "db": { "status": "PASS" },
    "media": { "status": "PASS" }
  },
  "offsite": {
    "configured": false,
    "contract": "READY",
    "live": "DEFERRED_TO_ADMIN_F",
    "status": "NOT_LIVE"
  }
}
```

**Exit code: 2** — local DB + media healthy; LIVE offsite deferred to ADMIN.F (owner decision).

## Semantics (retained)

| Exit | Meaning |
|---|---|
| 0 | Local OK + offsite LIVE verified |
| 2 | Local OK; offsite NOT LIVE / deferred |
| 1 | Local required layer missing/stale/critical, or configured offsite verify failed |

`REQUIRE_MEDIA_BACKUP=1` (production cron) makes missing media a hard failure.

Without that flag (dev/CI), media is reported but does not fail the check.

## On-host pipeline

`scripts/backup-daily-onhost.sh` treats health exit `0` or `2` as success; exit `1` aborts the pipeline.

## Not claimed

- OFFSITE LIVE
- FULL DISASTER RECOVERY PROVEN
