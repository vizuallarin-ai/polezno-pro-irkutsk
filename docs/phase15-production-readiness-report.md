# Phase 15 — Production Readiness Report



**Date:** 2026-09-02 (Gate B closeout)  

**Project:** Иркпортал / `polezno-pro-irkutsk`  

**Branch:** `phase15-commercial-core-launch`  

**Previous local SHA:** `0e006c7`  

**Target release SHA:** recorded after Gate B commit (see `.deploy-artifacts/phase15-gate-b/target-sha.txt`)



---



## 1. Final status

**`LOCAL VERIFIED BACKUP READY / OFFSITE BACKUP BLOCKED / GATE B BUILD BLOCKED`**

| Gate | Status |
|------|--------|
| Gate A — production truth | **CLOSED** |
| Deployment backup prerequisite (same-host) | **LOCAL BACKUP READY** |
| Offsite disaster recovery backup | **BLOCKED** — artifacts on same VPS only |
| Gate B — isolated build | **IN PROGRESS / see Gate B closeout** — disposable VPS DB via SSH tunnel; Neon not used; Windows PostgreSQL not installed |
| Deploy infrastructure (symlink switching) | **NOT IMPLEMENTED** |
| Deploy execute | **NOT READY** — owner approval + infra migration still required |
| Gate C / D | **NOT STARTED** |



Production is **not fully attested** until `/api/health` is deployed and returns expected SHA.



---



## 2. SSH Agent access



**BatchMode proof (2026-09-02):**



```powershell

ssh -o BatchMode=yes -o IdentitiesOnly=yes -i "$env:USERPROFILE\.ssh\irkportal_ed25519" root@90.156.170.182 "printf 'SSH_AGENT_OK\n'"

# → SSH_AGENT_OK

```



Read-only VPS preflight completed via SSH this run.



---



## 3. Production mutations ledger



| When | Mutation | Scope |

|------|----------|-------|

| Prior run | `irkportal_ed25519.pub` added to `/root/.ssh/authorized_keys` | SSH access |
| Backup run 2026-09-01 | Created `/var/backups/polezno/20260901T171914Z/` with DB/media/env/evidence artifacts | **Authorized backup-only mutations** |
| Application | Unchanged | No git/npm/build/PM2 restart/nginx/DB schema/CMS mutations |



---



## 4. Production identity chain



| Layer | Evidence | SHA / ID |

|-------|----------|----------|

| GitHub `origin/master` (`git ls-remote`) | verified | `73ca3f7b6c72a9f0f3d1a07e0a44947ec8200a20` |

| Local audit baseline | same | `73ca3f7` |

| VPS git checkout (live SSH) | verified | `3631094e14616c6f816bbd6308701e201ed69309` |

| VPS cached `origin/master` | stale | `36349e28da9b651dec5b2a533189e4d7d23fdf38` |

| `.next/BUILD_ID` (live SSH) | verified | `zOvFS1L8wUwIeQ5wVB9ij` |

| Build timestamp (UTC) | live `stat` | 2026-06-20 11:00:16 |

| PM2 start | prior evidence | 2026-06-20 11:00:26 UTC |

| `/api/health` on production | **404** | endpoint not deployed |

| Phase 15 committed HEAD | branch | `0e006c7` |

| Phase 15 target after readiness commit | pending | `TARGET_SHA_PENDING_LOCAL_COMMIT` |



**Confidence:** Running release ≈ checkout `3631094` (checkout + BUILD_ID + build timestamp correlation). Cryptographic runtime attestation requires `/api/health` deploy.



**Ancestry:** Production is **3 commits behind** audit master, **4 commits behind** Phase 15 tip (before readiness commit).



---



## 5. VPS resources (read-only, live SSH)



| Resource | Value |

|----------|-------|

| Disk `/` | 14G total, 8.0G used, **5.6G free (59%)** |

| RAM | 1.9Gi total, ~655Mi used, **~1.3Gi available** |

| Swap | 2.0Gi total, 96Mi used |

| Node | **v20.20.2** |

| npm | **10.8.2** |



---



## 6. PM2 findings (live SSH)



| Field | Value |

|-------|-------|

| Process | `polezno` |

| Status | **online** |

| cwd | `/var/www/polezno` (direct path, **not** release symlink) |

| Node | 20.20.2 |

| Restarts | **25** (lifetime) |

| exec_mode | fork_mode |

| Uptime anchor | since 2026-06-20 build/restart |



**Risk:** PM2 cwd points at mutable live checkout — in-place deploy/build pattern. Atomic switch requires infrastructure migration (see §15).



---



## 7. Nginx findings (live SSH)



| Check | Result |

|-------|--------|

| Service | **active** |

| Config test | **ok** (`nginx -t` successful) |

| `server_name` | `irkportal.ru`, `www.irkportal.ru` |

| `proxy_pass` | `http://127.0.0.1:3000` |

| Config file | `/etc/nginx/sites-available/irkportal` |



---



## 8. PostgreSQL findings (live SSH)



| Check | Result |

|-------|--------|

| Service | **active** |

| Version | **PostgreSQL 16.15** (Ubuntu) |



---



## 9. Backup inventory (verified 2026-09-01 UTC)

**RUN_ID:** `20260901T171914Z`  
**Directory:** `/var/backups/polezno/20260901T171914Z/` (mode `700`, owner `root:root`)

| Artifact | Size | Validation |
|----------|------|------------|
| `database.dump` | 255,360 bytes | `pg_dump -Fc`; `pg_restore --list` → **633 lines** |
| `media.tar.gz` | 413,803 bytes | `tar -tzf` PASS; **8 files** match source |
| `env.production.backup` | 1,961 bytes | byte compare → **PASS** |
| `package-lock.production-drift.patch` | 9,905 bytes | forward `git apply --check` FAIL (tree already drifted); reverse check **PASS** |
| `release-identity.txt` | 445 bytes | HEAD, BUILD_ID, remote master |
| `git-status.txt` | 21 bytes | ` M package-lock.json` |
| `pm2-description.txt` | 132 bytes | sanitized (no env values) |
| `manifest.txt` | 1,087 bytes | no secrets |
| `SHA256SUMS` | 427 bytes | `sha256sum -c` → **PASS** |
| `pg_restore-list.txt` | 47,650 bytes | catalog reference |
| `media-tar-list.txt` | 332 bytes | tar listing reference |

**Source sizes before backup:**

| Source | Size | Count |
|--------|------|-------|
| PostgreSQL database | 13,057,047 bytes | n/a |
| `/var/www/polezno/public/media` | 414,146 bytes | 8 files |

**Backup classification:**

| Type | Status |
|------|--------|
| Deployment rollback backup (same-host) | **READY** |
| Same-host local verified backup | **READY** |
| Offsite disaster recovery | **BLOCKED** — not copied off VPS |

**`scripts/backup-db.sh` audit (not executed):** uses hardcoded `DB_NAME`, custom format OK, but includes **14-day retention deletion** and no `pg_restore` verification — unsuitable for this run; one-time procedure used instead.

**Restore capability:** logical archive validated (`pg_restore --list`, `tar -tzf`); **full restore drill not performed**.

### Post-backup production smoke (2026-09-01T17:19 UTC)

| Check | Result |
|-------|--------|
| PM2 status | **online** (restarts unchanged: 25 → 25) |
| nginx | **active** |
| Production HEAD | `3631094` unchanged |
| BUILD_ID | `zOvFS1L8wUwIeQ5wVB9ij` unchanged |
| git status | unchanged (` M package-lock.json`) |
| `https://irkportal.ru/` | **200** |
| `/map` | **200** |
| `/business` | **200** |
| `/explore` | **200** |
| `/sitemap.xml` | **200** |
| `/api/health` | **404** (expected for current release) |
| Disk after backup | ~5.6 GB free (5833908 KB available) |



---



## 10. Environment presence matrix (names only, live SSH)



Source: `/var/www/polezno/.env.production` — values **not** printed.



| Variable | Status |

|----------|--------|

| `DATABASE_URL` | **PRESENT** |

| `DATABASE_URI` | **ABSENT** (project uses `DATABASE_URL`) |

| `PAYLOAD_SECRET` | **PRESENT** |

| `NEXT_PUBLIC_SERVER_URL` | **PRESENT** |

| `NEXT_PUBLIC_YANDEX_MAPS_API_KEY` | **PRESENT** |

| `YANDEX_ROUTER_API_KEY` | **ABSENT** |

| `RESEND_API_KEY` | **ABSENT** |

| `EMAIL_FROM` | **ABSENT** |

| `EMAIL_TO` | **ABSENT** |



---



## 11. CMS aggregate counts (read-only SQL, live SSH, no PII)



| Collection | Total | Published (`_status`) | Draft (`_status`) | Notes |

|------------|-------|----------------------|-------------------|-------|

| routes | 0 | 0 | 0 | |

| excursions | 0 | 0 | 0 | |

| products | 4 | n/a | n/a | `_status` column not populated / no versioning |

| ar_postcards | 5 | n/a | n/a | prior HTTP evidence: 3 pub + 2 draft |

| articles | 9 | 8 | 1 | |

| reviews | 0 | 0 | 0 | |

| leads | 0 | — | — | no leads by status |



Commercial core (routes/excursions) **empty** on production — Gate C content work pending.



---



## 12. Local check results



| Check | Baseline `73ca3f7` | Current (uncommitted) |

|-------|-------------------|------------------------|

| ESLint errors | 4 | **0** |

| ESLint warnings | 20 | **19** (≤ baseline) |

| `npx tsc --noEmit` | PASS | **PASS** |

| `npm run check:phase15` | n/a | **12/12 PASS** |

| `npm run build:release:isolated` | n/a | **FAIL** — `PHASE15_DISPOSABLE_DATABASE_URL` not set |



### ESLint warning correction



**Fixed** `react-hooks/exhaustive-deps` regression in `components/routes/route-map.tsx`:



- `routes` memoized via `useMemo`

- `drawRoutes` stored in ref via dedicated `useEffect` (avoids ref-during-render)

- Redraw effect depends on `[mapReady, mode, routes, activeRouteId, activePointId]` — not `drawRoutes` callback identity

- Contract test added: `disposable database guard blocks production-like URLs`



---



## 13. Isolated build evidence



| Environment option | Status |

|--------------------|--------|

| Docker | **Not available** |

| Podman | **Not available** |

| WSL | **Not available / not configured** |

| Local PostgreSQL (`127.0.0.1:5432`) | **Not running** |

| `PHASE15_DISPOSABLE_DATABASE_URL` | **Not set** |

| `neon.new` API | **Removed** — unreliable; `provision-disposable-db.mjs` deleted |



**Gate B release build: NOT PASS.**



### Owner action to unblock Gate B



```powershell

$env:PHASE15_DISPOSABLE_DATABASE_URL = "postgresql://user:pass@disposable-host/dbname"

npm run build:release:isolated

```



Script refuses production-like URLs (`90.156.170.182`, `irkportal.ru`, `polezno_irkutsk@`). URL is never logged.



---



## 14. Readiness scripts verdict



| Script | Verdict |

|--------|---------|

| `scripts/build-release-isolated.mjs` | **PASS review** — requires owner disposable URL; blocks prod DSN; cleans env in `finally` |

| `scripts/deploy-prod-safe.mjs` | **PASS review** — preflight only; `--execute` explicitly blocked; no atomic switch claims |

| `scripts/provision-disposable-db.mjs` | **DELETED** — wrapped unreliable `neon.new` |

| `lib/build-database-guard.ts` | **PASS** — production URL markers blocked; tested in phase15-checks |

| `package.json` scripts | `build:release:isolated`, `deploy:preflight` — appropriate |

| `.gitignore` | `.deploy-artifacts/`, `eslint-*.json` — appropriate |



**Limitations (honest):**



- Preflight ≠ safe deploy

- No atomic release switch implemented

- `deploy-prod.mjs` still in-place pull/build/restart — high risk



---



## 15. Safe deploy architecture (design review — NOT implemented)



Current production: PM2 cwd = `/var/www/polezno` (mutable). Creating `/var/www/polezno-releases/<sha>` alone **does not** switch traffic.



### Required infrastructure migration (prerequisite)



1. **Immutable release dirs:** `/var/www/polezno-releases/<sha>/`

2. **Shared env:** `/var/www/polezno-shared/.env.production` (outside release tree)

3. **Shared media:** symlink `public/media` → `/var/www/polezno-shared/media`

4. **Stable symlink:** `/var/www/polezno-current` → active release

5. **PM2 cwd:** repoint to `/var/www/polezno-current` (one-time migration)

6. **Pre-switch health:** start release on free local port, verify `/api/health` SHA

7. **Atomic switch:** `ln -sfn releases/<sha> polezno-current` then `pm2 restart polezno`

8. **Rollback:** reverse symlink to `3631094` + preserved BUILD_ID `zOvFS1L8wUwIeQ5wVB9ij`

9. **Keep previous release dir** until rollback window closes



**Status:** `DEPLOY INFRASTRUCTURE MIGRATION REQUIRED` before owner-approved execute.



Rollback manifest captured locally via `npm run deploy:preflight`.



---



## 16. Remaining blockers



| # | Blocker | Owner |
|---|---------|-------|
| 1 | Isolated release build not PASS | Owner — provide disposable Postgres URL |
| 2 | Offsite disaster recovery backup | Owner/DevOps — copy `/var/backups/polezno/20260901T171914Z/` off VPS |
| 3 | Atomic release switching not implemented | DevOps — symlink migration (§15) |
| 4 | `/api/health` not on production | Deploy after Gate B closed |
| 5 | Commercial CMS content empty (routes/excursions) | Gate C — Алёна |
| 6 | Recurring backup schedule | DevOps — fix `backup-db.sh` (remove retention delete, add verification) |



---



## 17. Local commit policy this run



**No commit created** — isolated release build still blocked.

Backup run updated this report only (local file); no git commit per policy.



---



## 18. Untracked baseline (unchanged)



`####/`, `IrkPortal.pdf`, `admin-guide.pdf`, `docs/audits/`, `public/images/Alena.jpg` — not modified, not committed.



