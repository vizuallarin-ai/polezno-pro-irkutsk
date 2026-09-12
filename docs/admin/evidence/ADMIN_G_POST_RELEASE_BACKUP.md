# ADMIN.G — Post-release backup evidence

**Gate:** ADMIN.G  
**Captured:** 2026-09-12T07:41:24Z UTC  
**After:** deploy + owner login/mobile smoke

## Artifacts

| Item | Value |
|---|---|
| POST_ADMIN_G_DB_BACKUP | `polezno_20260912T074124Z.dump` |
| DB size | 715575 |
| POST_ADMIN_G_MEDIA_BACKUP | `polezno_media_20260912T074124Z.tar.gz` |
| Media size | 413803 |
| Host marker | `/var/backups/polezno/POST_ADMIN_G_STATE.txt` |
| Deployed SHA recorded | `fee5618ad139e6e5c9593bcad552cefeade25089` |

## Validation

| Check | Result |
|---|---|
| Pipeline exit | 0 (health exit 2 = on-host OK) |
| `pg_restore --list` | exit 0 |
| media `tar -tzf` | exit 0 |
| Timestamp after deployment | YES |

## Offsite

OFFSITE BACKUP = DEFERRED BY OWNER  
ON-HOST BACKUP RISK = ACCEPTED BY OWNER  
No S3/bucket provisioning performed in ADMIN.G.
