# Production Incident Runbook — IrkPortal

Host topology: nginx → `127.0.0.1:3000` → PM2 `polezno` → Next/Payload · DB Postgres · `/var/www/polezno-*`

Related: [OBS_1_PRODUCTION_OPERATIONS.md](./OBS_1_PRODUCTION_OPERATIONS.md), [PRODUCTION_RELEASE_RUNBOOK.md](./PRODUCTION_RELEASE_RUNBOOK.md).

---

## Triage order

```text
public https://irkportal.ru/api/health
→ local http://127.0.0.1:3000/api/health
→ PM2 status / restart delta
→ ss -ltnp :3000 owner
→ pm2 logs (new lines only)
→ Postgres / health.database
→ nginx status + error.log
→ disk df -h
```

Compare **local vs public**:

| Local | Public | Likely |
|-------|--------|--------|
| green | red | nginx / TLS / DNS |
| red | red | app / DB / runtime |
| SHA mismatch vs symlink | either | identity drift / orphan process |

```bash
npm run ops:status   # from release with OBS.1 scripts; or curl health manually
```

---

## Site down

1. Public health.
2. Local health.
3. `pm2 describe polezno` — online vs errored/stopped.
4. Port owner (`ss -ltnp | grep :3000`).
5. If nothing listening → safe start (`runtime-restart-safe.sh` when available).
6. If DB down in health → Postgres section.
7. If nginx inactive → nginx section.

---

## 502

1. nginx error log.
2. Is anything on `:3000`?
3. PM2 online but app crashing? → logs.
4. Restart only via safe script after port classification.

---

## 500 storm

1. Count recent 5xx in nginx access (not a single probe).
2. `pm2 logs polezno --err --lines 100`.
3. Ignore known benign soft-404 `NoFallbackError` if HTTP status is 404 and log size stable.
4. Rollback to previous release if bad deploy identity.

---

## DB down

1. Health `database=down`.
2. `systemctl is-active postgresql` (or cluster unit).
3. `sudo -u postgres psql -d polezno_irkutsk -c 'SELECT 1'`.
4. Shared env symlink present? (do not print secrets).
5. Do **not** `db:push` as incident response.

---

## PM2 down / errored

1. `pm2 describe polezno`.
2. Port still held by orphan? → EADDRINUSE section.
3. Safe restart.
4. If crash loop → check `max_restarts`; do not `pm2 restart` in a manual loop.

---

## Restart storm

Symptoms: restart_time climbing fast; error log filled with EADDRINUSE or boot crashes.

1. `pm2 stop polezno`.
2. Free port if expected orphan.
3. Fix root cause before start (config, build, env).
4. Start once; watch health; do not enable thrash.

---

## EADDRINUSE / port 3000 occupied

**OPS.2:** production PM2 owns direct Next (`next-server` is the PM2 PID). Prefer `EXPECTED_SHA=… bash scripts/runtime-restart-safe.sh`.

1. `ss -ltnp | grep :3000` → pid.
2. `tr '\\0' ' ' < /proc/$PID/cmdline` and `readlink /proc/$PID/cwd`.
3. Confirm user/path look like IrkPortal Next under `polezno-current` or `polezno-releases/*`.
4. `pm2 stop polezno`.
5. Wait for exit; if listener remains and is **expected** → SIGTERM → wait → SIGKILL.
6. If **foreign** → ABORT (do not killall node).
7. Start via `runtime-restart-safe.sh` or `pm2 start ecosystem.config.cjs`.
8. Health + public smoke.
9. Never `killall node`.

---

## Wrong live SHA

`basename $(readlink -f /var/www/polezno-current)` ≠ health `commitSha`.

1. Orphan old process likely — EADDRINUSE procedure.
2. Or wrong symlink — retarget atomic current to intended SHA; safe restart.
3. Verify artifact `.next/release-identity.json` on release dir.

---

## Disk full

**Do not delete first:** current release, immediate rollback, fresh backup, shared media/env.

Order:

1. Incomplete/failed target release dirs.
2. Temp caches (`/root/.npm` carefully).
3. Older releases beyond retention (`ops-release-retention.sh` dry-run first).
4. Old backups per retention.
5. Rotated logs.

---

## Backup failure

1. `/var/log/polezno-backup.log` (after cron install).
2. Run `bash /var/www/polezno-current/scripts/backup-db.sh` manually; validate `pg_restore --list` + sha256.
3. Disk space.
4. Offsite still separate owner action.

---

## nginx down

1. `systemctl status nginx`
2. `nginx -t` before reload
3. Do not redesign vhosts during incident

---

## Alert delivery

```text
ALERT DELIVERY: NOT CONFIGURED
```

Health URL contract for external uptime: `GET /api/health` → 200 + JSON `status=ok`.

Do not put secrets in alerts.
