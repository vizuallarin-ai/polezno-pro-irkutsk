# ADMIN recovery runbook (IrkPortal)

No secrets in this file. Production mutations only with explicit owner approval outside ADMIN.E / ADMIN.E.1.

## Recovery sequence (end-to-end)

1. **Code** — Git remote `vizuallarin-ai/polezno-pro-irkutsk` (requires pushed branch / tag / release artifact).
2. **Database** — restore `polezno_*.dump` into a **new** DB name first; validate; then cut over.
3. **Media** — restore `polezno_media_*.tar.gz` into upload/media directory (DB dump alone is insufficient if media is on filesystem).
4. **Env / secrets** — private ops store (`DATABASE_URL`, `PAYLOAD_SECRET`, `REVALIDATE_SECRET`, site URL, email/map keys).
5. **Start app** — existing PM2 / `next start` contract on VPS.
6. **Smoke** — `/api/health`, `/`, `/map`, `/business`, `/admin`, one content page.

Operator dry-run note (ADMIN.E.1): local disposable path `npm run test:admin-e1-restored-app` proves steps 2+5+6 against a restored dump without mutating production.

## 1. Loss of application / bad deploy

1. Confirm current SHA: `GET /api/health` → `commitSha`.
2. Code recovery layer = Git remote.
3. Roll back via existing immutable release scripts (`release:rollback-dry-run`, `deploy:immutable`) when authorized.
4. Re-check `/api/health` and homepage smoke.

**Risk:** If ADMIN.E commits were never pushed, remote Git recovery for those changes is **MISSING** until an authorized non-force push.

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

## 8. Offsite failure behaviour

`scripts/backup-offsite-copy.sh`:

- missing mode → exit **2** (`OFFSITE BACKUP NOT LIVE`)
- missing dump / empty dump / upload/verify failure → exit **non-zero**
- S3 success path requires authenticated `head-object` size > 0

Cron must treat non-zero as failure (no silent success).

## 9. RPO / RTO

| | Target | Actual (ADMIN.E.1) |
|---|---|---|
| RPO | ≤ 24h CMS; leads ≤ last successful dump | Daily on-host dump; **offsite NOT LIVE** → disaster RPO = last on-host dump only |
| RTO | Hours (manual) | Designed: restore dump + media + release + env; local app-on-restored-DB smoke ~minutes on disposable host |

## 10. Schema migration before production rollout

Still a future rollout gate (not ADMIN.E.1):

1. Backup production DB.
2. Apply `scripts/migrations/admin-e-add-developer-role.sql` + schema sync.
3. Validate enum `admin|editor|developer`.
4. Smoke owner login (`admin` value unchanged).
5. Rollback = restore dump.
