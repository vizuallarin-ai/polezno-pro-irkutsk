# ADMIN.E — On-host media backup evidence

## Canonical media source

| Item | Value |
|---|---|
| Canonical path | `/var/www/polezno-shared/media` |
| Release link | `/var/www/polezno-current/public/media` → shared media |
| Source file count | 8 |
| Source size class | ~424K |

## Mechanism

Existing script (no parallel rewrite): `scripts/backup-media.sh`

Installed on VPS under shared ops (no app deploy):

`/var/www/polezno-shared/ops/scripts/backup-media.sh`

Properties:

- read-only archive of media
- does not mutate media files (mtime fingerprint unchanged)
- `tar.gz` size > 0
- retention `MEDIA_RETENTION_DAYS` default **14**
- missing `MEDIA_DIR` → non-zero exit
- does not include `.env` / credentials paths

## Manual production proof (2026-09-12)

| Check | Result |
|---|---|
| Exit | 0 |
| Artifact | `polezno_media_20260912T050243Z.tar.gz` under `/var/backups/polezno/` |
| Size | ~405K (> 0) |
| Listable | yes (`tar -tzf`) |
| Entries | 9 (dir + 8 files) |
| Secrets inside archive | none detected |
| Media source unchanged | yes (mtime fingerprint match) |
| Disposable extract round-trip | **PROVEN** (8 files restored under `/tmp/...`, then removed; production media not overwritten) |

## Schedule

Daily **03:15 UTC** via `/etc/cron.d/polezno-backup` → `backup-daily-onhost.sh`:

1. DB dump
2. Media archive
3. On-host health (`REQUIRE_MEDIA_BACKUP=1`)

Offsite upload is **not** part of this schedule (ADMIN.F).

## Artifact permissions

Backup directory mode **750**. New dumps/archives mode **640**. Not under public web root.
