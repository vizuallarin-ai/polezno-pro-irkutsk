# Offsite disaster-recovery backup (contract)

Same-host VPS dumps are a recovery layer, **not** full independent disaster recovery.

## Status (ADMIN.F)

**OFFSITE CONTRACT = READY**  
**LIVE OFFSITE = NOT LIVE — OWNER INFRA ACTION REQUIRED**

Do not claim OFFSITE LIVE or FULL DISASTER RECOVERY until remote objects are proven.

## On-host layer (operational)

1. Daily pipeline: `scripts/backup-daily-onhost.sh`
   - DB → Media → optional Offsite → Health
2. Schedule: `/etc/cron.d/polezno-backup` at **03:15 UTC**
3. Retention: ~14 days on-host
4. Scripts: `/var/www/polezno-shared/ops/scripts/`

When `OFFSITE_MODE` unset, health exits **2** (local OK / offsite not live). Pipeline treats exit 2 as success for the on-host layer.

## Owner infra to go LIVE

1. Private S3-compatible bucket (or approved SCP host ≠ production VPS)
2. Public access OFF; TLS; lifecycle 14d on `db/` + `media/`
3. Host file `/etc/polezno/offsite.env` mode `600`:
   - `OFFSITE_MODE=s3|scp`
   - `OFFSITE_S3_BUCKET` / optional `OFFSITE_S3_ENDPOINT`
   - `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` **or** `OFFSITE_SCP_TARGET`
4. `aws` CLI on VPS for S3 mode
5. Prove authenticated remote size > 0 for DB + media
6. Prove health exit **0** with `offsite.db=HEALTHY` and `offsite.media=HEALTHY`
7. Disposable download/`pg_restore --list` + media tar list

Never commit credentials.

## RPO / RTO (honest)

| Layer | RPO | Notes |
|---|---|---|
| On-host daily | ≤ ~24h | 03:15 UTC cadence |
| Offsite (when LIVE) | ≤ ~24h | same pipeline after local archives |
| RTO | hours-scale | fresh VPS + GitHub + restore runbook; not an enterprise SLA |

## Definition of Done (LIVE)

- [ ] Dump exists outside production host
- [ ] Authenticated remote DB object size > 0
- [ ] Authenticated remote media object size > 0
- [ ] Lifecycle/retention configured
- [ ] Remote health exit 0
- [ ] Download smoke on disposable target
