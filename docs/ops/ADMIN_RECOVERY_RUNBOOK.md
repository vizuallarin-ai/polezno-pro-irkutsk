# ADMIN recovery runbook (IrkPortal)

No secrets in this file. Production mutations only with explicit owner approval outside ADMIN.E / ADMIN.E.1.

## Recovery sequence (end-to-end)

Incident → provision server → checkout known Git SHA → restore secrets → obtain DB backup from offsite → restore DB → obtain media from offsite → restore media → install/build/start app → health → frontend smoke → admin smoke.

1. **Code** — Git remote `vizuallarin-ai/polezno-pro-irkutsk`. ADMIN.E history is on `origin/phase15-ux-funnel-hardening` (**REMOTE RECOVERY POINT PROVEN** as of ADMIN.E.FINAL; pin exact SHA from `/api/health` or release artifact when recovering production).
2. **Secrets** — restore private ops store (`DATABASE_URL`, `PAYLOAD_SECRET`, `REVALIDATE_SECRET`, site URL, email/map keys). Never from git.
3. **Database** — prefer latest **offsite** `db/` object when LIVE; else on-host `/var/backups/polezno/polezno_*.dump`. Restore into a **new** DB name first; validate; then cut over.
4. **Media** — obtain `polezno_media_*.tar.gz` from offsite `media/` (or on-host archive) and restore into upload/media directory. DB dump alone is insufficient when media is on filesystem.
5. **Start app** — existing PM2 / `next start` contract on VPS (`npm ci` / build if bare host).
6. **Smoke** — `/api/health`, `/`, `/map`, `/business`, `/explore`, `/admin`, one content page.

Operator dry-run note (ADMIN.E.1): local disposable path `npm run test:admin-e1-restored-app` proves DB restore + app start + smoke without mutating production.

**Independence:** Git recovery ≠ data recovery. Offsite (or on-host) backups are required for DB/media.

## 1. Loss of application / bad deploy

1. Confirm current SHA: `GET /api/health` → `commitSha`.
2. Code recovery layer = Git remote.
3. Roll back via existing immutable release scripts (`release:rollback-dry-run`, `deploy:immutable`) when authorized.
4. Re-check `/api/health` and homepage smoke.

**Status (ADMIN.E.FINAL):** feature-branch remote recovery for ADMIN.B–E.1 history is **PROVEN** on `origin/phase15-ux-funnel-hardening`. Production release SHA is independent (`/api/health` → `commitSha`) and was not changed by this gate.

## 2. Loss of database

1. On-host dump: `/var/backups/polezno/polezno_*.dump` (`scripts/backup-db.sh`, retention ~14 days).
2. Prefer latest **offsite** object if LIVE (`scripts/backup-offsite-copy.sh` + `docs/offsite-backup.md`). If NOT LIVE — only same-host dumps exist.
3. Restore dry-run: `DUMP=... bash scripts/backup-restore-dry-run.sh` (temp `restore_probe_*` only).
4. Point app `DATABASE_URL` at restored DB only after validation.
5. Smoke: `/api/health`, public pages, `/admin` shell (avoid extracting PII from leads).

Never restore directly over production without a pre-restore dump of the broken state.

## 3. Loss of media

1. Typical VPS path: shared `public/media` / configured upload dir.
2. Restore from `polezno_media_*.tar.gz` (`scripts/backup-media.sh`).
3. Verify a known image URL returns 200.
4. Local archive round-trip was proven in ADMIN.E; production media restore remains **NOT EXECUTED** until an incident/authorized drill.

## 4. Content error (wrong save)

1. Admin → document → Versions → Restore.
2. Versioned: Articles, Excursions, Routes, Reviews, Guides, Photos, Site Settings.

## 5. Owner locked out

1. Developer (`developer`) or remaining Owner (`admin`) resets password via controlled server script.
2. Last-privileged-user deletion is blocked in CMS guards; emergency DB repair only with documented operator action.

## 6. Secrets / env for relaunch

Private ops store only (never git / never evidence dumps):

- `DATABASE_URL`
- `PAYLOAD_SECRET`
- `REVALIDATE_SECRET`
- `NEXT_PUBLIC_SERVER_URL` / site URL
- Email (Resend) keys if notifications required
- Map / analytics keys as currently used
- Offsite: `OFFSITE_MODE`, bucket/target, AWS or SSH credentials

## 7. Backup health check

On-host:

```bash
ls -lh /var/backups/polezno/polezno_*.dump | tail
node scripts/backup-health-check.mjs
# exit 0 = local dump fresh enough
# exit 2 = offsite NOT LIVE (expected until credentials exist)
# exit 1 = missing/empty/stale dump or offsite verify failed
```

Expect non-zero dump size and mtime within policy window (`BACKUP_POLICY` in `lib/runtime-lifecycle.mjs`: warn 36h / critical 72h; post-CONTENT.1 target 24h).

Health check recognizes only `polezno_*.dump` (on-host) and `source_*.dump` (E.1 disposable); probe stubs are ignored.

## 8. Offsite failure behaviour

`scripts/backup-offsite-copy.sh`:

- missing mode → exit **2** (`OFFSITE BACKUP NOT LIVE`)
- missing dump / empty dump / upload/verify failure → exit **non-zero**
- S3 success path requires authenticated `head-object` size > 0

Cron must treat non-zero as failure (no silent success).

## 9. RPO / RTO

| | Target | Actual (ADMIN.E.FINAL) |
|---|---|---|
| CMS / DB RPO | ≤ 24h (daily) | On-host daily dump ~03:15 UTC; **offsite NOT LIVE** → disaster RPO limited to last same-host dump |
| Media RPO | ≤ 24h when media archived daily | Media source on VPS; **scheduled media archive + offsite NOT LIVE** → media disaster recovery incomplete until owner enables archive+offsite |
| RTO | Hours (manual) | Restore itself: minutes on disposable host (proven); end-to-end depends on operator + server provisioning |

## 10. Schema migration before production rollout

Still a future rollout gate (not ADMIN.E.1):

1. Backup production DB.
2. Apply `scripts/migrations/admin-e-add-developer-role.sql` + schema sync.
3. Validate enum `admin|editor|developer`.
4. Smoke owner login (`admin` value unchanged).
5. Rollback = restore dump.
