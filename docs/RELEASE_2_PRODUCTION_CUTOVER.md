# RELEASE.2 — Production Cutover Closeout (IrkPortal / irkportal.ru)

**Date (UTC):** 2026-09-08  
**Gate:** RELEASE.2 — owner-authorized production cutover  
**Engineering branch:** `phase15-ux-funnel-hardening`  
**Deployed SHA (live):** `7a6d971e81ecccc781a91e95ade257090f94a08a`

```text
GATE RELEASE.2 CLOSED / PRODUCTION CUTOVER COMPLETE / TARGET 7a6d971e LIVE
/ HEALTH AND SMOKE PASSED / ROLLBACK PRESERVED / OWNER CONTENT STILL BLOCKED
```

---

## Authorization

Owner explicitly authorized controlled production deploy of exact TARGET SHA  
`7a6d971e81ecccc781a91e95ade257090f94a08a` (code/UI/release only).  
Owner content ingest was **not** authorized.

---

## Release identity

| Role | SHA |
|------|-----|
| OLD (pre-cutover CURRENT) | `ff8e2e0a36fc4716a7834adc26076a7e588680c6` |
| PREVIOUS (older recovery) | `d6c31b69304cdc213500bf8ff261b64cf5b78ac1` |
| TARGET / LIVE | `7a6d971e81ecccc781a91e95ade257090f94a08a` |

| Build field | Value |
|-------------|-------|
| `BUILD_ID` | `u4Juj77wvink8_v05SVQ5` |
| `buildTimestamp` | `2026-09-08T08:54:53.000Z` |
| `identitySource` | `artifact` |
| Release dir | `/var/www/polezno-releases/7a6d971e81ecccc781a91e95ade257090f94a08a` |

---

## Backup (pre-deploy)

| Field | Value |
|-------|-------|
| File | `/var/backups/polezno/polezno_2026-09-08_0853.dump` |
| Timestamp | `2026-09-08 08:53:10` (VPS local) |
| Size | `492984` bytes |
| SHA256 | `4cc913209a66db73b92395fc37b86169f38c09ba065e316fa2d619ed7ed84106` |
| Validation | `pg_restore --list` PASS (634 lines); `.sha256` written |

Script used: `/var/www/polezno-current/scripts/backup-db.sh` (then CURRENT was still `ff8e2e0a…`).

---

## Build & pre-switch

1. Immutable dir created (not built inside `polezno-current`).
2. Exact checkout: `git rev-parse HEAD` = TARGET.
3. Shared env: `ln -sfn /var/www/polezno-shared/.env.production .env.production`.
4. Media absent during Turbopack build; after build: `public/media` → `/var/www/polezno-shared/media`.
5. `npm ci --include=dev` + `npm run build` + `write-release-identity.mjs`.
6. Artifact verify: `release-verify-artifact.mjs` → commitSha = TARGET.
7. Pre-switch smoke on `:3912`: health `database=up`, routes `/`, `/explore`, `/business`, `/about`, `/contact`, `/api/health` PASS.
8. Production remained on OLD until atomic switch.

**DB:** no `db:push`, no migrations, no schema mutation. Payload `push=false` in production.

---

## Switch & PM2

| Step | Result |
|------|--------|
| Atomic switch | `ln -sfn $REL /var/www/polezno-current.new` + `mv -Tf … /var/www/polezno-current` |
| New current | `/var/www/polezno-releases/7a6d971e81ecccc781a91e95ade257090f94a08a` |
| PM2 | `pm2 restart polezno --update-env` |
| Status | `online` |
| CWD | `/var/www/polezno-current` |
| Restarts | before `4` → after `5` |
| Memory (after) | ~60 MB |

---

## Health

| Check | Result |
|-------|--------|
| Local `http://127.0.0.1:3000/api/health` | 200, `status=ok`, `commitSha=TARGET`, `database=up`, `app=up` |
| Public `https://irkportal.ru/api/health` | same identity as local |

---

## Public smoke

| Route | HTTP | Result |
|-------|------|--------|
| `/` | 200 | PASS |
| `/explore` | 200 | PASS |
| `/business` | 200 | PASS |
| `/about` | 200 | PASS |
| `/contact` | 200 | PASS |
| `/api/health` | 200 | PASS |

---

## Visual sanity (UX.H short)

| Viewport | Result |
|----------|--------|
| 390px | Logo + burger (`Открыть меню`); hero present; no horizontal overflow |
| 1440px | Logo + desktop nav + CTA; hero present; no horizontal overflow |

---

## Logs

- PM2 out: Next.js Ready; Payload WARN no email adapter (expected — Resend unset).
- Error log: stale “Failed to find Server Action” entries from **before** cutover (`mtime` ~08:23Z); **no new error writes** after TARGET Ready (~09:00Z) during smoke.
- nginx: no new critical errors attributed to TARGET in recent window.
- DB: reachable; health `database=up`.

---

## Rollback

| Target | Path |
|--------|------|
| Immediate | `/var/www/polezno-releases/ff8e2e0a36fc4716a7834adc26076a7e588680c6` |
| Older recovery | `/var/www/polezno-releases/d6c31b69304cdc213500bf8ff261b64cf5b78ac1` |

All three release dirs **preserved** (no retention cleanup during cutover).  
Disk after cutover: ~4.9G free on `/`.

---

## Production mutations (actual)

```text
fresh DB backup
new release directory + build
current symlink switch
PM2 restart
```

```text
DB schema mutation: NO
content mutation: NO
env mutation: NO
DNS mutation: NO
nginx redesign: NO
merge master/main: NO
```

---

## Owner content status

```text
OWNER CONTENT STILL BLOCKED
```

Read-only counts after cutover (approx.):

| Collection / area | Count |
|-------------------|------:|
| excursions | 0 |
| routes | 0 |
| reviews | 0 |
| photos | 0 |
| site_settings | 0 |
| media rows | 4 (existing shared; not newly ingested) |
| leads | 0 |

Missing owner materials remain: real excursions, routes, reviews, photo archive content, site settings / owner CMS copy as required by content gates.

---

## Next recommended gate

**CONTENT.1 — Owner Content Ingest (authorized)**  

Do not start until owner authorizes content ingest separately.
