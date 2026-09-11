# ADMIN.E.1 — Offsite backup evidence

## Live copy

**OFFSITE BACKUP NOT LIVE**

- Provider class: S3-compatible or scp (script-ready)
- Destination: not configured in this environment
- DB remote object: NOT PROVEN
- Media remote object: NOT PROVEN
- Private access: N/A until destination exists

## Failure handling

Controlled disposable invocations prove non-zero exit when offsite cannot succeed:

```json
{
  "at": "2026-09-11T13:15:57.889Z",
  "gate": "ADMIN.E.1",
  "status": "OFFSITE_FAILURE_SIGNAL_PROVEN",
  "liveCopy": "NOT_LIVE",
  "note": "No OFFSITE_*/AWS_* credentials available; cannot prove remote object existence.",
  "cases": [
    {
      "name": "missing_OFFSITE_MODE",
      "status": 2,
      "ok": true,
      "snippet": "OFFSITE BACKUP NOT LIVE\nSet OFFSITE_MODE=s3|scp and destination env (see script header).\nexit=2"
    },
    {
      "name": "s3_without_aws_cli",
      "status": 1,
      "ok": true,
      "snippet": "ABORT: aws CLI required for OFFSITE_MODE=s3"
    },
    {
      "name": "missing_dump_file",
      "status": 1,
      "ok": true,
      "snippet": "__EC:1\nABORT: dump not found: .tmp-admin-e1-restore/nope.dump\n"
    }
  ]
}
```

## Retention contract (when LIVE)

- Frequency: after daily on-host dump
- Retention: `OFFSITE_RETENTION_DAYS` default 14
- S3: bucket lifecycle on `db/` + `media/` prefixes required
- Cleanup: lifecycle (S3) / destination host find (scp)
- Failure: script exits non-zero; must not be treated as success by cron
