# ADMIN.G — Pre-deploy backup evidence

**Gate:** ADMIN.G  
**Captured:** 2026-09-12T06:44:01Z–06:44:02Z UTC

## Recovery point

| Item | Value |
|---|---|
| OLD_APPLICATION_SHA | `b3a51ba8500bb03b5f1124feab567bee3a313824` |
| PRE_ADMIN_G_DB_BACKUP | `polezno_20260912T064401Z.dump` |
| PRE_ADMIN_G_DB_SIZE | 493971 |
| PRE_ADMIN_G_MEDIA_BACKUP | `polezno_media_20260912T064402Z.tar.gz` |
| PRE_ADMIN_G_MEDIA_SIZE | 413803 |
| Host marker | `/var/backups/polezno/PRE_ADMIN_G_RECOVERY_POINT.txt` |

## Validation

| Check | Result |
|---|---|
| backup-daily-onhost exit | 0 (health exit 2 = on-host OK / offsite deferred) |
| `pg_restore --list` | exit 0 |
| `tar -tzf` media | exit 0 |
| Freshness | immediate pre-migration |

## Offsite

OFFSITE BACKUP = DEFERRED BY OWNER  
ON-HOST BACKUP RISK = ACCEPTED BY OWNER
