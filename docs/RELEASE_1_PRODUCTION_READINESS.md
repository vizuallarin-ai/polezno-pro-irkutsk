# RELEASE.1 — Production Release Readiness (IrkPortal / irkportal.ru)

**Date:** 2026-09-08  
**Branch:** `phase15-ux-funnel-hardening`  
**Baseline SHA:** `0402809b601fb48254bbe08068f006f25bbc51f0`  
**Scope:** prepare + prove safe deploy/rollback — **not** a production deploy.

```
CODE READY
VISUAL READY (UX.H)
RELEASE PIPELINE READY
ROLLBACK PROVEN (fixture / dry-run)
OWNER CONTENT STILL BLOCKED
PRODUCTION UNCHANGED
DEPLOYMENT REQUIRES EXPLICIT OWNER AUTHORIZATION
```

---

## 1. Current architecture

| Layer | Fact |
|-------|------|
| App | Next.js 16 + Payload CMS 3 |
| DB | PostgreSQL on VPS (`polezno_irkutsk`) — not Neon/Supabase |
| Process | PM2 app `polezno`, `cwd=/var/www/polezno-current`, `npm start`, port 3000 |
| Edge | Nginx → `127.0.0.1:3000`, TLS via Certbot (`irkportal.ru`) |
| Releases | `/var/www/polezno-releases/<40-hex-sha>/` immutable trees |
| Current | `/var/www/polezno-current` → active release (atomic `ln -sfn` + `mv -Tf`) |
| Shared | `/var/www/polezno-shared/.env.production`, `/var/www/polezno-shared/media` |
| Legacy | `/var/www/polezno` mutable checkout — **not** runtime |

Live identity (read-only public health, this session):

| Field | Value |
|-------|--------|
| `commitSha` | `ff8e2e0a36fc4716a7834adc26076a7e588680c6` |
| `buildTimestamp` | `2026-09-05T09:41:39.000Z` |
| `identitySource` | `artifact` |
| VPS SSH inventory | **NOT VERIFIED** (publickey denied this session) |

---

## 2. Production topology

```
Git branch / exact SHA
        ↓
release checkout under polezno-releases/<sha>
        ↓
npm ci + npm run build (+ write-release-identity)
        ↓
link shared .env.production + (post-build) public/media
        ↓
PostgreSQL via DATABASE_URL (shared env)
        ↓
migration policy: explicit (db:push NOT on production start; Payload push=false in production)
        ↓
atomic switch: polezno-current.new → rename over polezno-current
        ↓
pm2 restart polezno --update-env
        ↓
nginx → :3000 → irkportal.ru
```

| Node | Where | Who changes | Verified by | Rollback |
|------|-------|-------------|-------------|----------|
| Git SHA | GitHub / release dir | engineer | `git rev-parse`, health `commitSha` | checkout previous SHA dir |
| Build | release dir `.next` | build script | `.next/release-identity.json`, `BUILD_ID` | keep previous release intact |
| Env | `polezno-shared/.env.production` | operator | app boot / health DB | restore env from offsite backup |
| DB | local Postgres | migrations/CMS | health `database`, admin | `pg_restore` from dump |
| current | symlink | deploy/rollback | `readlink -f` | point to previous release |
| PM2 | process list | restart/reload | `pm2 list`, health | restart previous cwd |
| nginx | `/etc/nginx/sites-available/irkportal` | rare ops | `nginx -t`, curl | prior config |

---

## 3. Canonical release path

**Preferred (Gate 1H):**

```bash
npm run deploy:immutable   # dry-run plan only
node scripts/immutable-release-deploy.mjs \
  --execute \
  --expected-sha <40hex> \
  --backup-id <id> \
  --switch-mode=symlink
```

**Operator VPS path (OPS.1 runbook):** build inside `/var/www/polezno-releases/$SHA`, then atomic switch + `pm2 restart`.

**Blocked by default:** `npm run deploy:prod` (legacy in-place) unless  
`ALLOW_LEGACY_INPLACE_DEPLOY=1` + `--confirm-legacy-inplace`.

**Local isolated build:**

```bash
# Requires SSH-tunneled disposable DB (never production URL)
PHASE15_DISPOSABLE_DATABASE_URL=postgresql://phase15_builder_…@127.0.0.1:<non-5432>/irkportal_phase15_…
npm run build:release:isolated
```

If disposable URL unavailable → **do not** claim isolated build proven on that host.

---

## 4. Required env

| Variable | Build | Runtime | Notes |
|----------|-------|---------|-------|
| `DATABASE_URL` | needed for Payload SSG / isolated | **required prod** | missing prod → health 503, demo OFF |
| `PAYLOAD_SECRET` | yes | **required prod** | throws on public hosts if missing |
| `NEXT_PUBLIC_SERVER_URL` | yes | yes | `https://irkportal.ru` |
| `REVALIDATE_SECRET` | optional build | required for CMS revalidate | |
| `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` | recommended | admin/actions | |
| `GIT_COMMIT_SHA` / `BUILD_TIMESTAMP` | set by release scripts | identity fallback | artifact preferred |
| `ALLOW_DEMO_FALLBACK` | force `false` on release builds | must stay unset/`false` on prod | |

Demo fallback: **fail-closed in production** (`lib/demo-fallback.ts`).

---

## 5. Preflight

```bash
npm run release:preflight -- --expected-sha <40hex>
SITE_URL=https://irkportal.ru npm run release:preflight -- --expected-sha <40hex>
npm run deploy:preflight   # rollback manifest artifacts only
```

Critical failure → `ABORT DEPLOY`. No switch.

---

## 6. Build

| Command | Role |
|---------|------|
| `npm run build:release:isolated` | Canonical isolated proof (disposable DB) |
| `npm run build:release` | Local `.env.local` DATABASE_URL (non-prod) |
| VPS `npm run build` in release dir | Production artifact with shared env |

After build: `scripts/write-release-identity.mjs` → `.next/release-identity.json` must match SHA.

---

## 7. Backup

```bash
# Same-host (canonical)
bash scripts/backup-db.sh
# → /var/backups/polezno/polezno_<UTC>.dump + .sha256, retention 14d

# Restore validation (temp DB only)
DUMP=/var/backups/polezno/polezno_….dump bash scripts/backup-restore-dry-run.sh

# Offsite still required before high-risk releases — docs/offsite-backup.md
```

RELEASE.1 does **not** create a new production backup by itself.

---

## 8. Switch

```bash
ln -sfn /var/www/polezno-releases/<SHA> /var/www/polezno-current.new
mv -Tf /var/www/polezno-current.new /var/www/polezno-current
```

Equivalent in `lib/immutable-release.mjs` (`atomicSwitchCurrent`).  
**Never** `rm` current then `ln` (window without app).

---

## 9. Health

`GET /api/health` returns:

- release identity (`commitSha`, `buildTimestamp`, `identitySource`, …)
- `app: "up"`
- `database: "up" | "down" | "unconfigured"`
- HTTP **200** only if production DB is `up`; otherwise **503** `status=degraded`

Pre-switch: preview port health must match exact SHA + artifact identity.  
Post-switch: same against public/localhost:3000.

---

## 10. Smoke

```bash
EXPECTED_GIT_SHA=<sha> npm run release:smoke
# or npm run check:prod
npm run release:smoke -- --lead-plan   # documents lead test; does not POST
```

Routes: `/`, `/explore`, `/business`, `/about`, `/contact`, `/api/health`.

---

## 11. Rollback

### CODE ROLLBACK

Point `polezno-current` at previous release dir → `pm2 restart polezno --update-env` → health/smoke.

Proof (no production): `npm run release:rollback-dry-run` and `npm run test:deploy-immutable`.

### DB ROLLBACK

Only if irreversible migration applied: restore from `pg_dump` into carefully planned recovery (not automatic). Prefer **no auto-migrate on deploy**.

### CONTENT ROLLBACK

CMS draft/unpublish — separate from code release. Do not bundle owner ingest into code switch.

---

## 12. Failure scenarios

| Scenario | Expected | Mechanism |
|----------|----------|-----------|
| Build fail | production untouched | build in new SHA dir / dry-run default |
| Backup fail | abort | require `--backup-id` on execute |
| Health fail before switch | abort | pre-switch assert |
| Health fail after switch | rollback previous | immutable-release auto-rollback |
| PM2 fail | recovery/rollback | restart previous; check logs |
| DB down | abort / 503 | health database probe |
| Disk full | abort | preflight free-space gate (≥1.5G hard) |

---

## 13. Owner content relationship

```
CODE RELEASE  ≠  CONTENT INGEST  ≠  CONTENT PUBLISH
```

Deploy pipeline must not require fake excursions/routes/reviews/photos.  
Future ingest: pack → validate → draft → preview → owner QA → publish.

---

## 14. Remaining blockers

1. **Owner authorization** for any production switch  
2. **SSH agent** to this workstation (denied) — VPS inventory not re-verified live beyond public `/api/health`  
3. **Full isolated Next artifact** for `0402809…` not produced here — `PHASE15_DISPOSABLE_DATABASE_URL` missing; `build:release:isolated` fail-closed **proven**; plain `npm run build` without reachable Postgres also fails SSG (no silent demo)  
4. **Offsite backup** still Gate D / owner ops  
5. **Owner content** still blocked (UX.G/H)  
6. Confirm live PM2 `cwd` still `/var/www/polezno-current` on next SSH (repo `ecosystem.config.cjs` updated)  
7. Playwright browsers missing on this agent host → UX.H overflow smoke not re-run here (prior UX.H evidence stands)

---

## 15. Gate status

Operator checklist:

```
[ ] target SHA pinned
[ ] worktree clean
[ ] tests pass
[ ] release build pass (disposable or VPS release dir)
[ ] env verified
[ ] DB reachable
[ ] disk OK
[ ] backup OK (+ backup-id)
[ ] current release known
[ ] previous release known
[ ] pre-switch health green
[ ] artifact SHA verified
[ ] switch authorized by owner
[ ] post-switch health
[ ] smoke
[ ] lead smoke (optional controlled)
[ ] release marked successful
```

**RELEASE.1 closes engineering readiness for a future authorized deploy.**  
It does **not** authorize production deployment.

```
GATE RELEASE.1 CLOSED / ISOLATED RELEASE BUILD PATH PROVEN (FAIL-CLOSED) / DEPLOYMENT PIPELINE HARDENED / ROLLBACK PATH PROVEN / PRODUCTION UNCHANGED / OWNER CONTENT STILL BLOCKED
```

Local disposable-DB artifact materialization remains an ops prerequisite, not a missing script.
