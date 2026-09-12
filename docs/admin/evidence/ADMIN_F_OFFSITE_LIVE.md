# ADMIN.F — Offsite LIVE evidence

## Verdict

**OWNER INFRA ACTION REQUIRED — OFFSITE NOT LIVE**

No independent S3-compatible bucket / SCP destination credentials were available on:

- production VPS (`/etc/polezno/offsite.env` missing)
- operator workstation (`OFFSITE_*` / `AWS_*` unset; no `~/.aws`)

Per gate contract: **do not invent** a provider or fake remote objects.

## What is ready in code/ops

| Capability | Status |
|---|---|
| `scripts/backup-offsite-copy.sh` | READY (verify via head-object) |
| Daily pipeline optional offsite step | READY (sources `/etc/polezno/offsite.env` when present) |
| Health `offsite.db` / `offsite.media` | READY (separate HEALTHY classification when LIVE) |
| Failure exits without credentials | PROVEN (ADMIN.E.1 + ADMIN.F health exit 2) |

## Required owner actions (names only)

1. Create private S3-compatible bucket (public access OFF, TLS).
2. Prefixes `db/` and `media/`.
3. Lifecycle ≈ 14 days on both prefixes.
4. Install host secrets at `/etc/polezno/offsite.env` mode `600` owner root:
   - `OFFSITE_MODE=s3`
   - `OFFSITE_S3_BUCKET`
   - optional `OFFSITE_S3_ENDPOINT`
   - `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`
5. Install `aws` CLI on VPS.
6. Re-run daily pipeline / `backup-offsite-copy.sh` and prove remote objects size > 0.
7. Prove anonymous public read fails; retention rule exists.
8. Download smoke to disposable path + `pg_restore --list` / media tar list.

Until then:

- `DB OFFSITE = NOT_LIVE`
- `MEDIA OFFSITE = NOT_LIVE`
- Disaster independence incomplete (GitHub + on-host only)

## Privacy / retention / restore

Not provable until destination exists. Contracts documented in `docs/offsite-backup.md`.
