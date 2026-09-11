# ADMIN.E — Backup/restore evidence

```json
{
  "at": "2026-09-11T12:39:07.448Z",
  "gate": "ADMIN.E",
  "sourceDb": "polezno_irkutsk",
  "host": "localhost",
  "dumpPath": "D:\\AI_WORKSPACE\\Projects\\PoleznoProIrkutsk\\.tmp-admin-e-backup\\polezno_local_2026-09-11T12-39-07-446Z.dump",
  "tempDb": "restore_probe_1789130347447",
  "backupCreated": true,
  "restoreProven": true,
  "tools": {
    "pgDump": true,
    "pgRestore": true,
    "psql": true
  },
  "dumpBytes": 347818,
  "restoredPublicTables": 63,
  "pgRestoreStatus": 0,
  "status": "BACKUP_CREATED_AND_RESTORE_PROVEN"
}
```

## Verdicts

| Check | Result |
|---|---|
| DB BACKUP CREATED | YES (local disposable) |
| DB RESTORE PROVEN | YES (temp `restore_probe_*`, 63 public tables) |
| APP AGAINST RESTORED DB | NOT RUN (schema/count smoke only; avoid long app bind) |
| LOCAL MEDIA ARCHIVE/RESTORE | YES (`tar` round-trip, archiveBytes≈567 on sparse local media) |
| PRODUCTION MEDIA RESTORE | NOT EXECUTED (read-only prod) |
| OFFSITE COPY | NOT LIVE (owner infra blocked) |

Canonical VPS scripts: `scripts/backup-db.sh`, `scripts/backup-restore-dry-run.sh`, `scripts/backup-media.sh`, `scripts/backup-offsite-copy.sh`.
