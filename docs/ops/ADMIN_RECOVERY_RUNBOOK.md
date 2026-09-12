# ADMIN recovery runbook (IrkPortal)

No secrets in this file. Production mutations only with explicit owner approval.

## Recovery layers (honest split)

### CURRENT (ADMIN.E CLOSED)

| Layer | Status |
|---|---|
| **Code** | GitHub recovery — feature-branch remote recovery **PROVEN** (`origin/phase15-ux-funnel-hardening`). Production release SHA is independent (`/api/health` → `commitSha`). |
| **Data (on-host)** | Daily DB dump + media archive under `/var/backups/polezno/` |
| **Restore** | Local/disposable DB restore + app-on-restored-DB + local media round-trip **PROVEN** |
| **Offsite LIVE** | **NOT connected** — deferred to ADMIN.F by owner decision |

### ADMIN.F TARGET

Independent offsite (S3-compatible or SCP): DB + media outside the production VPS.

Recovery path after ADMIN.F:

GitHub + S3/offsite → fresh VPS restore.

Until then: do **not** claim full disaster recovery.

## Recovery sequence (end-to-end aspirational)

Incident → provision server → checkout known Git SHA → restore secrets → obtain DB backup (prefer offsite when LIVE; else on-host) → restore DB → obtain media → restore media → install/build/start app → health → frontend/admin smoke.

1. **Code** — Git remote `vizuallarin-ai/polezno-pro-irkutsk`. Pin exact SHA from `/api/health` or release artifact when recovering production.
2. **Secrets** — private ops store only (`DATABASE_URL`, `PAYLOAD_SECRET`, `REVALIDATE_SECRET`, site URL, email/map keys). Never from git.
3. **Database** — prefer latest **offsite** `db/` object when LIVE; else on-host `/var/backups/polezno/polezno_*.dump`. Restore into a **new** DB name first; validate; then cut over.
4. **Media** — `polezno_media_*.tar.gz` from offsite `media/` (when LIVE) or on-host archive into upload/media directory. DB dump alone is insufficient when media is on filesystem.
5. **Start app** — existing PM2 / `next start` contract on VPS.
6. **Smoke** — `/api/health`, `/`, `/map`, `/business`, `/explore`, `/admin`, one content page.

Operator dry-run note (ADMIN.E.1): `npm run test:admin-e1-restored-app` proves DB restore + app start + smoke without mutating production.

**Independence:** Git recovery ≠ data recovery. On-host backups cover host-local failure; independent offsite is required for VPS-loss disaster recovery (ADMIN.F).

## 1. Loss of application / bad deploy

1. Confirm current SHA: `GET /api/health` → `commitSha`.
2. Code recovery layer = Git remote.
3. Roll back via existing immutable release scripts when authorized.
4. Re-check `/api/health` and homepage smoke.

## 2. Loss of database

1. On-host dump: `/var/backups/polezno/polezno_*.dump` (`scripts/backup-db.sh`, retention ~14 days; daily via `backup-daily-onhost.sh`).
2. Prefer latest **offsite** object if LIVE (`scripts/backup-offsite-copy.sh`). If NOT LIVE — only same-host dumps exist.
3. Restore dry-run: `DUMP=... bash scripts/backup-restore-dry-run.sh` (temp `restore_probe_*` only).
4. Point app `DATABASE_URL` at restored DB only after validation.
5. Smoke: `/api/health`, public pages, `/admin` shell (avoid extracting PII from leads).

Never restore directly over production without a pre-restore dump of the broken state.

## 3. Loss of media

1. Canonical VPS path: `/var/www/polezno-shared/media` (linked from `public/media`).
2. Restore from `polezno_media_*.tar.gz` (`scripts/backup-media.sh`).
3. Verify a known image URL returns 200.
4. Local archive round-trip **PROVEN** in ADMIN.E final; production media overwrite restore remains **NOT EXECUTED** until an incident/authorized drill.

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
- Offsite (ADMIN.F): `OFFSITE_MODE`, bucket/target, AWS or SSH credentials

Canonical production env file: `/var/www/polezno-shared/.env.production` (mode **600**, `root:root`). Release path is a symlink.

## 7. Backup health check

On-host:

```bash
ls -lh /var/backups/polezno/polezno_*.dump /var/backups/polezno/polezno_media_*.tar.gz | tail
BACKUP_DIR=/var/backups/polezno REQUIRE_MEDIA_BACKUP=1 node scripts/backup-health-check.mjs
# exit 0 = local OK + offsite LIVE verified
# exit 2 = local OK; offsite NOT LIVE / deferred to ADMIN.F (expected until ADMIN.F)
# exit 1 = missing/empty/stale required local layer or offsite verify failed
```

Expect non-zero dump/archive size and mtime within policy window (`BACKUP_POLICY` in `lib/runtime-lifecycle.mjs`: warn 36h / critical 72h).

## 8. Offsite failure behaviour

`scripts/backup-offsite-copy.sh`:

- missing mode → exit **2** (`OFFSITE BACKUP NOT LIVE`)
- missing dump / empty dump / upload/verify failure → exit **non-zero**
- S3 success path requires authenticated `head-object` size > 0

Daily pipeline (`backup-daily-onhost.sh`) sources `/etc/polezno/offsite.env` when present and runs offsite after local archives. Health must show `offsite.db` + `offsite.media` HEALTHY for exit 0.

**ADMIN.F status:** LIVE offsite still **OWNER INFRA ACTION REQUIRED** until bucket+credentials exist.

## 9. RPO / RTO

| | Target | Actual (ADMIN.F) |
|---|---|---|
| CMS / DB RPO | ≤ 24h (daily) | On-host daily DB+media ~03:15 UTC proven; **offsite NOT LIVE** → independent disaster RPO incomplete |
| Media RPO | ≤ 24h | On-host media archive in daily pipeline; offsite pending owner infra |
| RTO | Hours (manual) | Restore proven on disposable; fresh-VPS path needs GitHub + offsite when LIVE |

## 10. Schema migration before production rollout

See `docs/ops/PRODUCTION_ROLLOUT_RUNBOOK.md` and `scripts/migrations/admin-f-prod-to-target.sql`.

1. Backup production DB (+ media).
2. Apply ADMIN.F SQL on production only during PROD.ROLLOUT.
3. Controlled Payload schema sync for version tables (rehearsed disposable first).
4. Deploy `TARGET_RELEASE_SHA`.
5. Rollback = code ± DB restore per `PRODUCTION_ROLLBACK_RUNBOOK.md`.

## See also

- `docs/offsite-backup.md`
- `docs/admin/ADMIN_F_HANDOFF.md`
- `docs/admin/ADMIN_F_IMPLEMENTATION_REPORT.md`
- `docs/ops/PRODUCTION_ROLLOUT_RUNBOOK.md`
