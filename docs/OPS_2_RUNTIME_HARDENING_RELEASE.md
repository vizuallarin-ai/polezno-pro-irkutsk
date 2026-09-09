# OPS.2 — Production Runtime Hardening Release

**Date (UTC):** 2026-09-09
**Live application SHA (unchanged):** `b3a51ba8500bb03b5f1124feab567bee3a313824`
**Engineering tip after closeout:** see git log (whitespace + OPS.2 docs)

```text
GATE OPS.2 CLOSED / DIRECT-NEXT PM2 RUNTIME LIVE / NPM WRAPPER RETIRED / SAFE RESTART LIVE-PROVEN / PORT 3000 OWNERSHIP STABLE / RESTART STORM GUARDS ACTIVE / SCHEDULED DB BACKUP INSTALLED / PRODUCTION APPLICATION SHA UNCHANGED / OWNER CONTENT STILL BLOCKED
```

---

## Baseline (before)

| Field | Value |
|-------|-------|
| Symlink | `/var/www/polezno-releases/b3a51ba…` |
| Health | green, SHA `b3a51ba…` |
| PM2 script | `/usr/bin/npm` args `start` |
| Process tree | `npm → sh -c next start → next-server` |
| Port 3000 | `next-server` pid `1217998` |
| Restarts | 629 (historical storm residue) |
| Live ecosystem file | still npm wrapper (pre-OBS.1 on release tree) |
| Backup cron | absent |

Rollback snap (no secrets): `/tmp/ops2-pm2-rollback.json` on VPS; ecosystem bak `ecosystem.config.cjs.ops2-pre.bak`.

---

## Runtime transition

| Step | Result |
|------|--------|
| Overlay OBS.1 `ecosystem.config.cjs` + `runtime-restart-safe.sh` onto current release + `/var/www/polezno-shared/ops/` | PASS |
| CRLF fix on shell script (LF required) | PASS |
| Safe restart #1 (apply direct-Next) | PASS |
| Safe restart #2 (controlled live proof) | PASS |
| `pm2 save` | PASS — dump has direct Next |

**Old model:** `PM2 → npm → sh -c next start → next-server`
**New model:** `PM2 → node_modules/next/dist/bin/next start` (= `next-server` is PM2 PID)

Config source: engineering `ecosystem.config.cjs` (OBS.1), applied to live current without SHA/symlink change.

---

## Process proof (after)

```text
PM2 PID / runtime PID: 1219744 (next-server v16.2.6)
Tree: next-server (threads only) — no npm, no sh -c
npm wrapper: ABSENT
shell wrapper: ABSENT
Restarts after apply: 0 (new process identity; historical 629 retired with delete+start)
```

---

## Port proof

| Phase | Result |
|-------|--------|
| Before stop | 1× next-server (expected) |
| After stop | free |
| After start | 1× next-server = PM2 PID |
| After proof restart | 1× next-server; no orphan; no EADDRINUSE |

---

## Safe restart live proof

```text
Controlled cycles: 1 (plus initial apply = 2 scripted runs)
Stop: PASS
Port release: PASS
Start: PASS
Health: PASS SHA=b3a51ba…
Orphan: NONE
EADDRINUSE: NONE
Unexpected restart delta after settle: 0
```

---

## PM2 guards (live)

| Knob | Value |
|------|-------|
| max_restarts | 10 |
| min_uptime | 10000 ms |
| restart_delay | 3000 |
| exp_backoff | 1000 |
| kill_timeout | 8000 |
| status | online |

---

## Persistence

| Item | Status |
|------|--------|
| `pm2-root.service` | enabled (inactive while daemon already running — normal) |
| `pm2 save` | YES |
| Saved script | `/var/www/polezno-current/node_modules/next/dist/bin/next` |
| Reboot contract | systemd enabled unit + dump.pm2 direct-Next |

---

## Backup scheduler

| Field | Value |
|-------|-------|
| Mechanism | `/etc/cron.d/polezno-backup` |
| Cadence | daily **03:15 UTC** |
| Lock | `flock -n /var/lock/polezno-backup.lock` |
| Command | `bash /var/www/polezno-current/scripts/backup-db.sh` |
| Log | `/var/log/polezno-backup.log` |
| Duplicates | none in root crontab |
| Latest dump | `polezno_20260909T031054Z.dump` (~1.2h age at verify) |
| Validation | sha256 + `pg_restore --list` 634 lines PASS |
| Offsite | **NOT CONFIGURED** |

---

## Health / smoke

Local + public health: `ok` / `up` / SHA `b3a51ba…`
Routes `/ /explore /map /business /about /contact /robots.txt /sitemap.xml`: HTTP 200
Owner counts: all 0 — no mutation

---

## Ops status

```text
ops:status OVERALL=HEALTHY
PM2: PASS — direct runtime contract
npmWrapper warning: ABSENT
ops:check exit 0
```

---

## Production mutations

```text
Application deploy: NO
Application SHA change: NO
Symlink switch: NO
PM2 runtime config: YES
Controlled PM2 stop/start: YES
Backup scheduler installation: YES
DB schema / env secrets / DNS / nginx redesign: NO
```

Overlay note: live release worktree contains updated `ecosystem.config.cjs` + `scripts/runtime-restart-safe.sh` (same SHA). Shared mirror: `/var/www/polezno-shared/ops/`. Next immutable code deploy will ship the same files from git.

---

## Remaining risks

| Risk | Status |
|------|--------|
| Offsite backup | NOT CONFIGURED |
| External alerting | NOT CONFIGURED |
| Disk ~3.8G free | PASS for next release; monitor |
| Owner content | still blocked |

**Next:** WAIT FOR OWNER PACK / CONTENT.1
