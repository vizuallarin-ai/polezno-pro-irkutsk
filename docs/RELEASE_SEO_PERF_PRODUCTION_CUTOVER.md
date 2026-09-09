# RELEASE — SEO.1 + PERF.1 Production Cutover

**Date (UTC):** 2026-09-09  
**Engineering branch:** `phase15-ux-funnel-hardening`  
**Deployed SHA (live):** `b3a51ba8500bb03b5f1124feab567bee3a313824`

```text
PRODUCTION RELEASE CLOSED / SEO.1 + PERF.1 LIVE / EXACT TARGET VERIFIED / HEALTH AND DB GREEN / SOFT-404 AND CANONICAL CONTRACT LIVE / PERFORMANCE DELIVERY SANITY PASSED / ROLLBACK PRESERVED / OWNER CONTENT STILL BLOCKED
```

---

## Authorization

Owner authorized controlled **code-only** production deploy of exact TARGET containing closed SEO.1 + PERF.1.  
Owner content ingest, DB schema migration, env/DNS/nginx redesign — **not** authorized.

---

## Target resolution

| Field | Value |
|------|-------|
| SEO.1 feat | `7c65e968ed7e4337fdd0f913f1f6892c1eabe58a` |
| SEO.1 docs tip (pre-PERF) | `85bcaecaeff283c97e7e8148e27726c2e6c0a28c` |
| PERF.1 code closeout | `cfce88fe679cb88a268423441c800473343490bb` |
| Exact TARGET | `b3a51ba8500bb03b5f1124feab567bee3a313824` (PERF.1 docs SHA tip = SEO+PERF code/tests/docs) |
| TARGET contains SEO.1 | YES |
| TARGET contains PERF.1 | YES |
| Unrelated later commits included | NO |

---

## Release identity

| Role | SHA |
|------|-----|
| OLD / immediate rollback | `7a6d971e81ecccc781a91e95ade257090f94a08a` |
| Older recovery (preserved) | `ff8e2e0a…`, `d6c31b69…` |
| TARGET / LIVE | `b3a51ba8500bb03b5f1124feab567bee3a313824` |

| Build field | Value |
|-------------|-------|
| `BUILD_ID` | `LMItS3ewJ8eEBJo3qzTDV` |
| `buildTimestamp` | `2026-09-09T03:12:22.000Z` |
| `identitySource` | `artifact` |
| Release dir | `/var/www/polezno-releases/b3a51ba8500bb03b5f1124feab567bee3a313824` |

---

## Backup (pre-deploy)

| Field | Value |
|-------|-------|
| File | `/var/backups/polezno/polezno_20260909T031054Z.dump` |
| Timestamp | `2026-09-09 03:10:55` (VPS) |
| Size | `492984` bytes |
| SHA256 | `734c01e2ba1e160bc85b3a8535c77519ea433af823f6844249ddbc02fd140808` |
| Validation | `pg_restore --list` PASS (634 lines); `.sha256` written |

Script: `/var/www/polezno-current/scripts/backup-db.sh` (while CURRENT was still `7a6d971e…`).

---

## Pre-switch

1. Immutable dir created; exact checkout `git rev-parse HEAD` = TARGET.
2. Shared env/media: `.env.production` + `public/media` → `/var/www/polezno-shared/*` (media linked **after** build).
3. `ALLOW_DEMO_FALLBACK` unset; production env keys present (values not logged).
4. `npm ci --include=dev` + `npm run build` + `write-release-identity.mjs`.
5. Artifact verify: commitSha = TARGET.
6. Pre-switch smoke on `:3912`: health TARGET; routes PASS; soft-404 **HTTP 404**; canonical apex; robots/sitemap; JSON-LD fact-safe; `test:perf` PASS.
7. Production remained on OLD until atomic switch.
8. **DB:** no `db:push`, no migrations, no schema mutation.

Disk after build: ~3.8G free on `/` (ABORT threshold not breached).

---

## Switch & PM2

| Step | Result |
|------|--------|
| Atomic switch | `ln -sfn $REL /var/www/polezno-current.new` + `mv -Tf … /var/www/polezno-current` |
| New current | `/var/www/polezno-releases/b3a51ba8500bb03b5f1124feab567bee3a313824` |
| First `pm2 restart` | Failed to bind: orphan `next-server` pid `1193277` held `:3000` (`EADDRINUSE`); PM2 entered restart storm |
| Recovery | `pm2 stop` → kill orphan → port free → `pm2 start polezno --update-env` |
| Final status | `online` |
| CWD | `/var/www/polezno-current` |
| PID (stable) | `1217985` |
| Memory (after) | ~55–62 MB |

**Runbook note:** on this host, `pm2 restart` may leave a detached `next-server` listening on `:3000`. Free the port before expecting TARGET health.

---

## Health

| Check | Result |
|-------|--------|
| Local `http://127.0.0.1:3000/api/health` | 200, `commitSha=TARGET`, `database=up`, `app=up` |
| Public `https://irkportal.ru/api/health` | same identity as local |

---

## Public smoke

| Route | HTTP | Result |
|-------|------|--------|
| `/` | 200 | PASS |
| `/explore` | 200 | PASS |
| `/map` | 200 | PASS (empty-catalog placeholder; no Maps mount) |
| `/business` | 200 | PASS |
| `/about` | 200 | PASS |
| `/contact` | 200 | PASS |
| `/robots.txt` | 200 | PASS |
| `/sitemap.xml` | 200 | PASS |
| `/api/health` | 200 | PASS |

---

## SEO production verification

| Check | Result |
|-------|--------|
| Soft-404 (`/explore|map|excursions/__…`) | **HTTP 404** |
| Canonical | apex `https://irkportal.ru…` on `/`, `/explore`, `/map`, `/business` |
| www → apex | **308** `Location: https://irkportal.ru/` |
| robots | Allow `/`; Host; Sitemap; private paths disallowed |
| sitemap | no `/admin`, `/api/`, no fake excursion/map detail URLs |
| metadata | title/description/canonical/robots/OG present on `/`, `/explore`, `/business` |
| JSON-LD | parseable; no AggregateRating / fake Review |

---

## PERF production sanity

| Check | Result |
|-------|--------|
| No site `template.tsx` opacity:0 | PASS |
| Fonts Prata + Golos in HTML | PASS |
| Hero H1 visible (browser) | PASS |
| Empty `/map` placeholder (no Yandex Maps) | PASS |
| `_next/static` Cache-Control | `public, max-age=31536000, immutable` |
| OG asset size | ~26 KB |
| Lighthouse lab | UNAVAILABLE (tooling); not a blocker |

---

## Owner content

```text
excursions=0
routes=0
reviews=0
photos=0
site_settings=0
Mutation by release: NO
```

---

## Rollback

| Item | Value |
|------|-------|
| Immediate rollback SHA | `7a6d971e81ecccc781a91e95ade257090f94a08a` |
| Preserved on disk | YES |
| Rollback possible | YES (atomic retarget + PM2; free `:3000` if orphan) |
| Release cleanup | **NOT** executed |

---

## Production mutations (actual)

- Fresh DB backup file written
- New immutable release directory for TARGET
- Atomic `polezno-current` symlink switch
- PM2 stop/start after orphan kill
- **DB schema mutation: NO**
- **Owner content mutation: NO**
- **Env mutation: NO**
- **DNS mutation: NO**
- **nginx redesign: NO**

---

## Remaining

- Production engineering: document orphan-`next-server` restart footgun in future runbook polish
- SEO account actions: Search Console / Webmaster (OBS.1)
- Owner content: pack still absent → CONTENT.1 blocked

**Next recommended gate:** `OBS.1 — Production Observability & Operations Readiness`
