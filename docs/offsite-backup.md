# Offsite disaster-recovery backup (ADMIN.E / OPS)

Same-host VPS dumps (`scripts/backup-db.sh`) are **not** enough for disaster recovery.

## Status (ADMIN.E)

**OFFSITE BACKUP NOT LIVE** — blocked on owner infrastructure decision (bucket / second host / credentials).

Prepared contract (code-ready, credentials not committed):

1. On-host dump: `scripts/backup-db.sh` → `/var/backups/polezno/polezno_*.dump`
2. Optional media archive: `scripts/backup-media.sh`
3. Offsite copy: `scripts/backup-offsite-copy.sh` with `OFFSITE_MODE=s3|scp`

## Minimum live procedure (when credentials exist)

```bash
# on VPS after daily dump
DUMP=/var/backups/polezno/polezno_YYYYMMDDT….dump \
OFFSITE_MODE=s3 \
OFFSITE_S3_BUCKET=… \
OFFSITE_S3_ENDPOINT=… \
AWS_ACCESS_KEY_ID=… \
AWS_SECRET_ACCESS_KEY=… \
bash scripts/backup-offsite-copy.sh
```

Or:

```bash
DUMP=… OFFSITE_MODE=scp OFFSITE_SCP_TARGET=user@offsite-host:/backups/polezno/ \
bash scripts/backup-offsite-copy.sh
```

## Security

- Private storage only (no public buckets)
- Transport TLS / SSH
- Do **not** put `.env` secret values into the dump archive
- Leads/PII are inside DB dumps — treat offsite as confidential

## Definition of Done (offsite LIVE)

- [ ] Dump exists outside the production host
- [ ] Restore dry-run tested once on a scratch DB
- [ ] Media recovery contract documented and exercised where applicable
- [ ] Owner knows who to call if restore is needed

Until checkboxes are done: **ADMIN.E offsite = READY-BUT-NOT-CONNECTED**.
