# Incident: PM2 EADDRINUSE / orphan next-server

**Date:** 2026-09-09 (UTC)
**Host:** `root@90.156.170.182`
**App:** IrkPortal `polezno`
**During:** SEO.1 + PERF.1 production cutover → TARGET `b3a51ba…`

---

## Incident

After atomic `polezno-current` switch, `pm2 restart polezno --update-env` failed to bind `:3000`. PM2 reported online briefly then errored; restart count climbed (~629). Public/local health still answered with **OLD** SHA because orphan `next-server` from previous release kept serving.

## Impact

- Cutover delayed; short window of identity drift (symlink TARGET, traffic OLD process).
- Restart storm noise in PM2 metrics/logs (`EADDRINUSE`).
- Required manual recovery (no customer content mutation).

## Detection

Post-switch health assert: `commitSha` remained `7a6d971e…` while symlink pointed at `b3a51ba…`. PM2 status → `errored`; `ss` showed `next-server` pid `1193277` (started Sep08) holding `:3000`.

## Timeline (condensed)

1. Pre-switch smoke on `:3912` (TARGET) PASS; live still OLD.
2. Atomic symlink → TARGET.
3. `pm2 restart` → new npm cannot listen → EADDRINUSE loop.
4. Diagnose: orphan next-server; PM2 not owning listener.
5. `pm2 stop` → kill orphan → port free → `pm2 start` → health TARGET PASS.

## Root cause

```text
PM2 managed PID = npm
package.json start → npm runs `sh -c next start`
listener = next-server (grandchild)

pm2 restart sends stop to npm → npm/sh can exit while next-server survives (orphan)
→ new instance EADDRINUSE → autorestart hammering
```

## Recovery

1. Confirm symlink TARGET.
2. `pm2 stop polezno`.
3. Identify `:3000` owner; verify cmdline/cwd look like expected Next under polezno paths.
4. SIGTERM (then SIGKILL if needed) **only** expected orphan.
5. `pm2 start` / start with ecosystem.
6. Local + public health SHA match TARGET; smoke.

## Why restart count ~629

`autorestart: true` without effective `max_restarts` / adequate backoff on the live dump → rapid fail loop while port occupied.

## Corrective actions (OBS.1)

- Direct Next binary in `ecosystem.config.cjs` (no npm wrapper).
- Storm bounds: `max_restarts`, `min_uptime`, `restart_delay`, backoff.
- `scripts/runtime-restart-safe.sh` — stop → port guard → start → health/identity.
- Fixtures `npm run test:ops-lifecycle`.
- Incident + release runbook updates.
- **OPS.2:** apply ecosystem on live (authorized runtime window).

## Prevention

Never use bare `pm2 restart` as the only cutover step. Use safe restart script; verify port owner and health SHA.

## Status

```text
INCIDENT CLOSED / PRODUCTION RECOVERED ON TARGET / ENGINEERING FIX IN OBS.1 / LIVE PM2 CONTRACT APPLY DEFERRED TO OPS.2
```
