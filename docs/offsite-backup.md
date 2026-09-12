# Offsite disaster-recovery backup (contract)

Same-host VPS dumps are a recovery layer, **not** full independent disaster recovery.

## Status

**OFFSITE CONTRACT = READY-BUT-NOT-CONNECTED**

**LIVE OFFSITE = DEFERRED TO ADMIN.F BY OWNER DECISION**

Do not claim OFFSITE LIVE or FULL DISASTER RECOVERY until ADMIN.F proves remote objects.

## On-host layer (ADMIN.E — operational)

1. Daily pipeline: `scripts/backup-daily-onhost.sh`
   - DB: `scripts/backup-db.sh` → `/var/backups/polezno/polezno_*.dump`
   - Media: `scripts/backup-media.sh` (`MEDIA_DIR=/var/www/polezno-shared/media`)
   - Health: `node scripts/backup-health-check.mjs` with `REQUIRE_MEDIA_BACKUP=1`
2. Schedule: `/etc/cron.d/polezno-backup` at **03:15 UTC**
3. Retention: ~14 days on-host for DB and media archives
4. Scripts on VPS: `/var/www/polezno-shared/ops/scripts/` (shared ops; independent of release SHA)

Absence of S3 does **not** block local DB/media backup.

## Offsite contract (ready; not connected)

3. Offsite copy + verify: `scripts/backup-offsite-copy.sh` (`OFFSITE_MODE=s3|scp`)
4. Health: exit **2** when mode unset (deferred / NOT LIVE); exit **0** only after live verify when configured

Failure exits already proven (ADMIN.E.1): missing mode=2; bad/missing deps=non-zero. Silent success on failed S3 upload is not possible (`head-object` size > 0 required).

## Minimum live procedure (ADMIN.F)

```bash
DUMP=/var/backups/polezno/polezno_YYYYMMDDT….dump \
MEDIA_ARCHIVE=/var/backups/polezno/polezno_media_….tar.gz \
OFFSITE_MODE=s3 \
OFFSITE_S3_BUCKET=… \
OFFSITE_S3_ENDPOINT=… \
AWS_ACCESS_KEY_ID=… \
AWS_SECRET_ACCESS_KEY=… \
bash scripts/backup-offsite-copy.sh
```

## Retention

- On-host: `RETENTION_DAYS` / `MEDIA_RETENTION_DAYS` default 14
- Offsite: `OFFSITE_RETENTION_DAYS` default 14 — configure **S3 lifecycle** on `db/` and `media/`

## Security

- Private storage only
- Transport TLS / SSH
- Never commit credentials
- Leads/PII inside DB dumps → treat offsite as confidential

## Definition of Done (LIVE) — ADMIN.F

- [ ] Dump exists outside production host
- [ ] Authenticated remote object size > 0 proven
- [ ] Media remote object proven
- [ ] Lifecycle/retention configured
- [ ] Remote health exit 0 path proven
