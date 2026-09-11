# Offsite disaster-recovery backup (ADMIN.E / ADMIN.E.1)

Same-host VPS dumps (`scripts/backup-db.sh`) are **not** enough for disaster recovery.

## Status

**OFFSITE BACKUP NOT LIVE** — ADMIN.E.FINAL production discovery: all `OFFSITE_*` / `AWS_*` destination variables **missing**, `aws` CLI **missing**, no dedicated offsite env file. Owner infrastructure still required.

Prepared contract (do not invent a second subsystem):

1. On-host dump: `scripts/backup-db.sh` → `/var/backups/polezno/polezno_*.dump` (cron daily 03:15 UTC)
2. Media archive: `scripts/backup-media.sh` (`MEDIA_DIR` → shared media; not yet in production cron)
3. Offsite copy + verify: `scripts/backup-offsite-copy.sh` (`OFFSITE_MODE=s3|scp`)
4. Health: `node scripts/backup-health-check.mjs` (exit 2 = offsite not configured)

ADMIN.E.1 proved **failure exits** (missing mode=2, bad/missing deps=non-zero). ADMIN.E.FINAL reconfirmed destination absence on VPS — no fake LIVE claim.

## Minimum live procedure (when credentials exist)

```bash
DUMP=/var/backups/polezno/polezno_YYYYMMDDT….dump \
OFFSITE_MODE=s3 \
OFFSITE_S3_BUCKET=… \
OFFSITE_S3_ENDPOINT=… \
AWS_ACCESS_KEY_ID=… \
AWS_SECRET_ACCESS_KEY=… \
bash scripts/backup-offsite-copy.sh
```

Script exits 0 only after authenticated size verification for S3.

## Retention

- On-host: `RETENTION_DAYS` default 14 (`backup-db.sh`)
- Offsite: `OFFSITE_RETENTION_DAYS` default 14 — configure **S3 lifecycle** on `db/` and `media/` (do not allow unbounded growth)

## Security

- Private storage only
- Transport TLS / SSH
- Never commit credentials or put `.env` secrets into dump archives
- Leads/PII inside DB dumps → treat offsite as confidential

## Definition of Done (LIVE)

- [ ] Dump exists outside production host
- [ ] Authenticated remote object size > 0 proven
- [ ] Restore dry-run on scratch DB
- [ ] Media recovery contract exercised or explicitly deferred with owner approval
- [ ] Lifecycle/retention configured
