# ADMIN.G — Preflight evidence

**Captured:** 2026-09-12T06:20–06:22Z (UTC)  
**Mutations:** none (read-only)

## Local

| Item | Value |
|---|---|
| Repo | `vizuallarin-ai/polezno-pro-irkutsk` |
| Branch | `phase15-ux-funnel-hardening` |
| HEAD (docs tip) | `e1a949f2a2f1ad2ebddd17d4ed21af55e7e7dd60` |
| Remote tip | `e1a949f2a2f1ad2ebddd17d4ed21af55e7e7dd60` (= local) |
| Tracked worktree | clean |
| Unrelated untracked | present (`####/`, `scripts/_tmp-*`, PDFs) — not part of release |
| TARGET_RELEASE_SHA | `fee5618ad139e6e5c9593bcad552cefeade25089` |
| `git cat-file -t TARGET` | `commit` |
| Remote contains TARGET | `origin/phase15-ux-funnel-hardening` |
| Migration artifact | `scripts/migrations/admin-f-prod-to-target.sql` |
| Migration SHA256 | `60FF724F1A8C85F6BB255D8232E2AF3B42AC8EE82E771863B67043EA8E8AA5FF` |

## Production runtime

| Item | Value |
|---|---|
| Host | Beget VPS / `irkportal.ru` |
| `/api/health` | `status=ok`, `database=up`, `app=up` |
| `commitSha` | `b3a51ba8500bb03b5f1124feab567bee3a313824` (**matches expected pre-ADMIN.G baseline**) |
| PM2 `polezno` | online, restarts=0, cwd=`/var/www/polezno-current` |
| Current symlink | `/var/www/polezno-releases/b3a51ba8500bb03b5f1124feab567bee3a313824` |
| Port 3000 | `next-server` (PM2 pid observed) |
| nginx | :80/:443 |
| Disk `/` | 14G total, ~3.7G free (~73% used) — release space YES |

## Env presence (names only)

| Name | Status |
|---|---|
| `/var/www/polezno-shared/.env.production` | PRESENT mode 600 |
| `DATABASE_URL` | PRESENT |
| `PAYLOAD_SECRET` | PRESENT |
| `NEXT_PUBLIC_SERVER_URL` | PRESENT |
| `REVALIDATE_SECRET` | PRESENT |
| `RESEND_API_KEY` / `RESEND_FROM` / `LEAD_NOTIFY_EMAIL` | MISSING |
| `GIT_COMMIT_SHA` | MISSING (artifact identity OK) |
| `/etc/polezno/offsite.env` | **MISSING** |

## Backup (existing on-host; not yet ADMIN.G fresh pre-deploy)

| Layer | Latest artifact | Size | Validation |
|---|---|---|---|
| DB | `polezno_20260912T052400Z.dump` | 492984 | `pg_restore --list` exit 0 |
| Media | `polezno_media_20260912T052400Z.tar.gz` | 413803 | `tar -tzf` exit 0 |
| Health script | `/var/www/polezno-shared/ops/scripts/backup-health-check.mjs` | — | exit **2** (local PASS, offsite NOT_LIVE) |

## Offsite

| Item | Value |
|---|---|
| Configured | false |
| Live | **NOT_LIVE** / `DEFERRED_OWNER_INFRA` |
| Contract scripts | READY on shared ops |

## Schema vs ADMIN.F baseline (read-only)

| Check | Production | Matches ADMIN.F? |
|---|---|---|
| `enum_users_role` | `admin,editor` | YES |
| `enum_leads_status` | legacy only (no booked/declined) | YES |
| leads CRM columns | absent | YES |
| `reviews.status` | absent | YES |
| `enum_articles_status` | `draft,published` | YES |
| version tables | `_articles_v` only | YES |
| `leads_status_idx` / `leads_next_contact_at_idx` | absent | YES |

### Aggregate counts (no PII)

| Table | Count |
|---|---|
| users | 1 (`admin` role) |
| leads | 1 |
| articles | 9 |
| excursions | 0 |
| routes | 0 |
| reviews | 0 |
| media | 4 |

Owner/admin identity: **exactly one** `admin` user (email reserved for interactive access block; not committed here as secret).

## ADMIN.F blocker summary (at ADMIN.G start)

| Area | Verdict |
|---|---|
| SYSTEM | CONDITIONAL GO (code ready, not deployed) |
| MIGRATION | GO (rehearsal PASS) |
| BACKUP on-host | GO |
| BACKUP offsite | **NO-GO** |
| CONTENT | NO-GO (commercial) |
| OWNER ACCEPTANCE | PENDING |
| PRODUCTION ROLLOUT (ADMIN.F) | **NO-GO until offsite (+ owner; content if commercial)** |

## Preflight decision

**STOP before fresh pre-deploy backup → migration → deploy.**

Reason: ADMIN.F treats LIVE offsite as hard production-rollout blocker; no explicit owner waiver found in repo/docs; ADMIN.G §7 forbids inventing a waiver.
