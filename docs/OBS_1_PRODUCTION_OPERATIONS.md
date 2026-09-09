# OBS.1 — Production Operations / Runtime Observability

**Date (UTC):** 2026-09-09
**Branch:** `phase15-ux-funnel-hardening`
**Live application SHA (unchanged):** `b3a51ba8500bb03b5f1124feab567bee3a313824`

```text
GATE OBS.1 CLOSED / PM2-NEXT LIFECYCLE ROOT CAUSE RESOLVED / ORPHAN PROCESS PATH ELIMINATED (CONTRACT) / PORT OWNERSHIP GUARDED / RESTART STORM PROTECTED / HEALTH-DISK-BACKUP OBSERVABILITY READY / INCIDENT RUNBOOK READY / PRODUCTION APPLICATION UNCHANGED / OWNER CONTENT STILL BLOCKED
```

Live PM2 dump still runs the **legacy npm wrapper** until an authorized OPS.2 runtime apply (`runtime-restart-safe.sh`). Code + fixtures prove the fixed contract.

**OPS.2 update (2026-09-09):** direct-Next PM2 runtime is **LIVE VERIFIED**; npm wrapper **retired**; safe restart **LIVE VERIFIED**; backup cron **installed** (`/etc/cron.d/polezno-backup`). See [OPS_2_RUNTIME_HARDENING_RELEASE.md](./OPS_2_RUNTIME_HARDENING_RELEASE.md).

---

## 1. Baseline

| Field | Value |
|-------|-------|
| Starting SHA | `82e8144e81f4181bb8936aa1c6646ceb18fb8339` |
| Live | `b3a51ba…` health green, DB up |
| PM2 (live read-only) | `script=/usr/bin/npm args=start`, restarts=629 (historical), pid npm→sh→next-server |
| Port 3000 owner | `next-server` child of `sh -c next start` under npm |
| Disk | ~3.8G free (~73% used) |
| Backup cron | **NOT installed** |
| Latest backup | `polezno_20260909T031054Z.dump` |

---

## 2. Last incident

See [incidents/2026-09-09-pm2-eaddrinuse.md](./incidents/2026-09-09-pm2-eaddrinuse.md).

---

## 3. PM2 / Next RCA

Live process tree (healthy moment after recover):

```text
PM2
└─ npm start          (PM2-managed PID)
   └─ sh -c next start
      └─ next-server   (LISTEN :3000)
```

`package.json` `"start": "next start"` makes npm spawn a shell. PM2 tracks **npm**, not `next-server`.

---

## 4. Root cause

1. **Who listens on :3000?** `next-server` (not the npm PID PM2 restarts).
2. **On `pm2 restart`:** SIGTERM hits npm; npm/`sh` exit can leave `next-server` reparented (orphan) still bound to :3000.
3. **New start** → `EADDRINUSE`.
4. **Autorestart** with no effective `max_restarts` / weak backoff → restart storm (~629).
5. **Recovery:** `pm2 stop` → kill verified orphan → `pm2 start`.

Not “PM2 sometimes glitches” — **npm wrapper + shell-spawned Next is the lifecycle footgun**.

---

## 5. Runtime lifecycle contract (after OBS.1)

```text
PM2
→ node node_modules/next/dist/bin/next start
→ next-server binds :3000
```

- `ecosystem.config.cjs` uses direct Next binary.
- `max_restarts: 10`, `min_uptime: 10s`, `restart_delay: 3000`, `exp_backoff_restart_delay: 1000`, `kill_timeout: 8000`.
- Canonical reload: `scripts/runtime-restart-safe.sh` (stop → port free / expected-orphan TERM → start → health+SHA).
- Foreign listener → **ABORT** (no blind kill).
- Alternate-port smoke: `scripts/preswitch-smoke-server.mjs` with cleanup trap.

---

## 6. Safe restart

```bash
EXPECTED_SHA=$(basename "$(readlink -f /var/www/polezno-current)")
bash /var/www/polezno-current/scripts/runtime-restart-safe.sh
```

Requires the OBS.1 scripts to exist on the release tree (next immutable release) **or** copy from engineering branch for OPS.2 apply.

---

## 7. Port ownership

| Phase | Rule |
|-------|------|
| Pre-start | `:3000` free, else classify owner |
| Expected Next under polezno paths | graceful TERM → wait → KILL if needed |
| Foreign | abort |
| Post-stop | must be free before start |

---

## 8. Restart storm protection

| Knob | Value |
|------|-------|
| max_restarts | 10 |
| min_uptime | 10s |
| restart_delay | 3s |
| exp_backoff | 1s+ |
| Ops delta CRITICAL | ≥15 restarts / 5 min (ops helpers) |

---

## 9. Health monitoring

```bash
npm run ops:status
npm run ops:check
```

Probes public `/api/health` (and local when on VPS).
`PM2 online ≠ ready` — readiness = health 200 + app/database up + commitSha.

---

## 10. Disk

| Level | Free MB |
|-------|---------|
| WARNING | < 3000 |
| CRITICAL | < 1500 |
| Safe next release | free ≥ 1500 (prefer ≥ 3000) |

Retention policy: keep **current + immediate rollback** (+ optional one older). Do not delete rollback in OBS.1.

---

## 11. Backup freshness

| Policy (pre-CONTENT.1) | |
|------------------------|--|
| WARNING | age > 36h |
| CRITICAL | age > 72h |
| Post-CONTENT.1 target | critical ≤ 24h |

**Scheduler needed now: YES** — cron was absent; local dumps do not survive VPS loss.

Install (authorized ops):

```bash
install -m 644 scripts/cron/polezno-backup /etc/cron.d/polezno-backup
```

**Offsite:** still incomplete → P1/P2 risk (same-host only).

---

## 12. Logs

| Stream | Path |
|--------|------|
| PM2 out/err | `/root/.pm2/logs/polezno-*.log` |
| nginx | `/var/log/nginx/access.log`, `error.log` |
| backup | `/var/log/polezno-backup.log` (after cron install) |
| Postgres | `journalctl -u postgresql` |

Rotation: `pm2-logrotate` present (10M×7); nginx via system logrotate.

**Known benign:** `NoFallbackError` lines during intentional soft-404 probes when HTTP 404 is correct — do not treat as 5xx storm.

---

## 13. 5xx monitoring

```bash
# recent 5xx sample (ops)
awk '$9 ~ /^5/ {c++} END{print c+0}' /var/log/nginx/access.log
```

---

## 14. Incident handling

See [PRODUCTION_INCIDENT_RUNBOOK.md](./PRODUCTION_INCIDENT_RUNBOOK.md).

---

## 15. Remaining risks

| Risk | Severity |
|------|----------|
| Live PM2 still npm wrapper until OPS.2 | HIGH (mitigated by runbook + scripts in git) |
| Backup cron not yet installed on VPS | MEDIUM |
| Offsite backup absent | MEDIUM/HIGH for data durability |
| External uptime/alert channel | NOT CONFIGURED |
| 14G disk + multiple releases | WARNING capacity |

---

## 16. Gate status

Closed for engineering contract + observability + fixtures.
**Next:** `OPS.2` — apply ecosystem + `runtime-restart-safe` + backup cron on production without app feature deploy.
