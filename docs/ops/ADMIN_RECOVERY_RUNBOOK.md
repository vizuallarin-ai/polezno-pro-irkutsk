# ADMIN recovery runbook (IrkPortal)

No secrets in this file. Production mutations only with explicit owner approval outside ADMIN.E.

## 1. Loss of application / bad deploy

1. Confirm current SHA: `GET /api/health` → `commitSha`.
2. Code recovery layer = Git remote `vizuallarin-ai/polezno-pro-irkutsk`.
3. Roll back to last known-good immutable release artifact / previous SHA via existing deploy scripts (`release:rollback-dry-run`, `deploy:immutable`).
4. Re-check `/api/health` and homepage smoke.

**Risk note:** If local commits were never pushed, remote recovery point may be missing — push approved recovery branch before relying on Git alone.

## 2. Loss of database

1. Locate on-host dump: `/var/backups/polezno/polezno_*.dump` (from `scripts/backup-db.sh`, retention ~14 days).
2. Prefer latest offsite copy if LIVE (see `docs/offsite-backup.md`). If not LIVE — only same-host dumps exist.
3. Restore into a **new** database name first (`scripts/backup-restore-dry-run.sh` pattern).
4. Point app `DATABASE_URL` at restored DB only after validation.
5. Smoke: `/api/health`, `/admin` login, one published page.

Never restore directly over production without a pre-restore dump of the broken state.

## 3. Loss of media

1. Media path (typical VPS): shared `public/media` / configured upload dir.
2. Restore from `polezno_media_*.tar.gz` produced by `scripts/backup-media.sh`.
3. Verify a known image URL still 200.
4. DB dump alone does **not** restore binary files.

## 4. Content error (wrong save)

1. Open document in Admin → Versions → Restore prior version.
2. Entities with versions: Articles, Excursions, Routes, Reviews, Guides, Photos, Site Settings.
3. If no version: republish from known-good content or developer DB point-in-time dump.

## 5. Owner locked out

1. Developer logs in (privileged role `developer` or remaining `admin`).
2. Reset owner password via controlled server script (`scripts/reset-admin-password.mjs`) — never commit passwords.
3. If **all** privileged users lost: emergency DB update by developer with server access (document who did it). Prevented in normal UI by lockout guards.

## 6. Secrets / env for relaunch

Needed (values in private ops store, not git):

- `DATABASE_URL`
- `PAYLOAD_SECRET`
- `REVALIDATE_SECRET`
- `NEXT_PUBLIC_SERVER_URL` / site URL
- Email (Resend) keys if notifications required
- Map / analytics keys as currently used

## 7. Backup health check

```bash
ls -lh /var/backups/polezno/polezno_*.dump | tail
# expect non-zero size, fresh mtime within 24–48h for daily cron
```

Local Windows proof used PostgreSQL 16 client tools + `npm run test:admin-e-backup`.

## 8. RPO / RTO (targets)

| | Target | Actual capability (ADMIN.E) |
|---|---|---|
| RPO | ≤ 24h for CMS; leads may lose up to last successful dump | Daily on-host dump; offsite NOT LIVE |
| RTO | Hours (manual restore) | Depends on operator + dump availability |

## 9. Schema migration before production rollout

1. Backup production DB.
2. Apply planned SQL (`scripts/migrations/admin-e-add-developer-role.sql` + Payload schema push/migrate strategy).
3. Validate enum `admin|editor|developer`.
4. Smoke admin login as existing owner (`admin` role unchanged).
5. Rollback = restore dump.

ADMIN.E does **not** apply production migrations.
