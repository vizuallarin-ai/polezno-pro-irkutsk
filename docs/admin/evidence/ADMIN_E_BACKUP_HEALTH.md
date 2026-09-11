# ADMIN.E.FINAL — Backup health evidence

## Local health check (operator host)

```bash
node scripts/backup-health-check.mjs
```

Expected while offsite unconfigured: **exit 2** (`offsite.status = NOT_LIVE`) if a local dump is detectable; **exit 1** if no canonical local dump.

Canonical dump names only: `polezno_*.dump` / `source_*.dump` (probe stubs ignored — ADMIN.E.1 invariant retained).

## Production on-host freshness (metadata only)

| Check | Result |
|---|---|
| Latest DB dump class | present under `/var/backups/polezno/` |
| Size | > 0 (~480KB class) |
| Cadence | daily cron 03:15 UTC |
| Media archive on-host | not observed (`polezno_media_*.tar.gz` missing) |
| Remote DB object | **NOT PROVEN** (offsite not configured) |
| Remote media object | **NOT PROVEN** |
| Freshness verdict | Local DB dumps current for on-host RPO; **disaster offsite freshness = N/A / BLOCKED** |

## Failure signal (unchanged from ADMIN.E.1)

Still proven: missing `OFFSITE_MODE` → exit 2; missing CLI/dump → non-zero. Silent success on failed remote upload is **not** possible for S3 path (requires `head-object` size > 0).
