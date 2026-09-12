# ADMIN.F handoff — Owner Acceptance & Production Readiness (offsite)

ADMIN.E is **CLOSED** for on-host recovery. LIVE independent offsite remains the next gate by **owner decision**.

## Status entering ADMIN.F

| Layer | Status |
|---|---|
| Code recovery (GitHub) | PROVEN on feature branch |
| On-host DB backup/restore | OPERATIONAL / PROVEN |
| On-host media backup/restore (local) | OPERATIONAL / PROVEN |
| Offsite contract (`backup-offsite-copy.sh`) | READY-BUT-NOT-CONNECTED |
| LIVE offsite DB/media objects | **NOT LIVE** |

## ADMIN.F must execute

1. Choose independent S3-compatible provider **or** dedicated SCP destination (not the production VPS as “offsite”).
2. Create private bucket/storage; **public access OFF**; TLS.
3. Prefixes: `db/` and `media/` (canonical for `scripts/backup-offsite-copy.sh`).
4. Install production secrets only on host (e.g. `/etc/polezno/offsite.env` mode `600`) — never in git/chat.
5. Required env (names only): `OFFSITE_MODE`, `OFFSITE_S3_BUCKET`, optional `OFFSITE_S3_ENDPOINT`, `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` **or** `OFFSITE_SCP_TARGET`.
6. Install `aws` CLI if using S3 mode.
7. Connect DB offsite upload after daily dump.
8. Connect media offsite upload (`MEDIA_ARCHIVE=…`).
9. Prove remote objects exist with authenticated size > 0.
10. Prove freshness/size against policy.
11. Configure lifecycle ≈ **14 days** on `db/` + `media/`.
12. Prove remote backup health (`backup-health-check.mjs` exit 0 path).
13. Optional: remote-download restore smoke on disposable host.
14. Recalculate disaster RPO/RTO with offsite LIVE.

## Must not claim until done

- OFFSITE LIVE
- FULL DISASTER RECOVERY PROVEN
- Fresh-VPS restore solely from GitHub + S3 without on-host copies

## Entry points already prepared

- `scripts/backup-offsite-copy.sh`
- `docs/offsite-backup.md`
- `docs/ops/ADMIN_RECOVERY_RUNBOOK.md`
- Daily on-host pipeline: `scripts/backup-daily-onhost.sh` (add offsite step in ADMIN.F without redesigning local layer)
