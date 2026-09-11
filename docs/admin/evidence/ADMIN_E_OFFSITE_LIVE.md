# ADMIN.E.FINAL — Offsite LIVE evidence

## Verdict

**OFFSITE BACKUP = BLOCKED BY OWNER INFRA**

Live remote DB/media objects were **not** created. No simulation.

## Destination discovery (production VPS, presence-only)

Checked without printing credential values:

| Variable / capability | Status |
|---|---|
| `OFFSITE_MODE` | missing |
| `OFFSITE_S3_BUCKET` | missing |
| `OFFSITE_S3_ENDPOINT` | missing |
| `OFFSITE_SCP_TARGET` | missing |
| `OFFSITE_RETENTION_DAYS` | missing |
| `AWS_ACCESS_KEY_ID` | missing |
| `AWS_SECRET_ACCESS_KEY` | missing |
| `AWS_DEFAULT_REGION` / `AWS_PROFILE` | missing |
| Dedicated offsite env file (`/etc/polezno/offsite.env` etc.) | missing |
| `aws` CLI | missing |

Operator workstation: same `OFFSITE_*` / `AWS_*` names → **missing**.

## On-host backups (not offsite)

Daily cron `/etc/cron.d/polezno-backup` runs `scripts/backup-db.sh` at 03:15 UTC.

Observed recent same-host DB dumps under `/var/backups/polezno/` (size ~480KB, daily). Media source exists (`/var/www/polezno-shared/media`, file count 8). **No** `polezno_media_*.tar.gz` archives observed in backup dir; cron currently schedules **DB only**.

## Contract ready (not LIVE)

- Copy + verify: `scripts/backup-offsite-copy.sh` (`OFFSITE_MODE=s3|scp`)
- Media archive: `scripts/backup-media.sh`
- Health: `node scripts/backup-health-check.mjs` (exit 2 = NOT LIVE when mode unset)
- Layout when LIVE: `s3://$OFFSITE_S3_BUCKET/db/` and `.../media/`
- Retention contract: `OFFSITE_RETENTION_DAYS` default 14 (S3 lifecycle required)

## What was NOT done

- No fake bucket
- No localhost / same-VPS path as “offsite”
- No fabricated remote object evidence
- No production app deploy / DB mutation
