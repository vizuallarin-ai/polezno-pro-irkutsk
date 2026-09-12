# GATE ADMIN.G — Production release report

## Final status

```text
GATE ADMIN.G TECHNICALLY CLOSED /
PRODUCTION MIGRATION PASS /
TARGET RELEASE fee5618ad139e6e5c9593bcad552cefeade25089 DEPLOYED /
PRODUCTION HEALTHY /
OWNER ACCESS PROVEN /
OWNER LOGIN PROVEN /
MOBILE LIVE SMOKE PASS /
POST-RELEASE BACKUP PROVEN /
OFFSITE DEFERRED BY OWNER /
ON-HOST BACKUP RISK ACCEPTED BY OWNER /
HUMAN OWNER ACCEPTANCE PENDING
```

**Captured closeout:** 2026-09-12 UTC

---

## A. Final status

**TECHNICALLY CLOSED** — human owner acceptance pending (checklist).

## B. Release identity

| Item | Value |
|---|---|
| Old production SHA | `b3a51ba8500bb03b5f1124feab567bee3a313824` |
| TARGET_RELEASE_SHA | `fee5618ad139e6e5c9593bcad552cefeade25089` |
| DEPLOYED_APPLICATION_SHA | `fee5618ad139e6e5c9593bcad552cefeade25089` |
| REPOSITORY_DOCS_TIP_AT_ADMIN.G_START | `e1a949f` |
| Docs tip after closeout evidence | (new docs-only commit; **not** application SHA) |

## C. Preflight

PASS — see `evidence/ADMIN_G_PREFLIGHT.md`. Baseline SHA matched; health/PM2/disk OK.

## D. Pre-deploy backups

PASS — `polezno_20260912T064401Z.dump` + `polezno_media_20260912T064402Z.tar.gz`  
OFFSITE BACKUP = **DEFERRED BY OWNER**  
ON-HOST BACKUP RISK = **ACCEPTED BY OWNER**  
Waiver: `evidence/ADMIN_G_OWNER_OFFSITE_WAIVER.md`

## E. Migration

PASS — `admin-f-prod-to-target.sql` + controlled Payload schema sync  
Counts preserved; compatibility **CONDITIONAL — ADDITIVE / DB RESTORE IF NEW ENUM VALUES WRITTEN**

## F. Deployment

PASS — immutable release dir + atomic symlink + `runtime-restart-safe.sh`  
Active: `/var/www/polezno-releases/fee5618…`

## G. Health

PASS — `/api/health` SHA=fee5618…, DB up, PM2 online, restarts=0

## H. Public smoke

PASS for `/`, `/map`, `/explore`, `/about`, `/business`, `/contact`, `/admin`  
`/routes` → 404 expected (canonical `/map`)

## I. Admin smoke

PASS — Dashboard, Leads, Excursions, Routes, Articles, Media, Reviews, Versions; Restore visible not executed

## J. Owner access

PASS technically — details without password in `evidence/ADMIN_G_OWNER_ACCESS.md`  
Temporary password: **interactive report only** (never in repo)

## K. Mobile

PASS — 390×844; no critical overflow; navigation usable

## L. Security

| Check | Result |
|---|---|
| `.env.production` mode 600 | unchanged |
| No secrets in release tree | OK |
| Backup dir not public | OK |
| Role guards unchanged | OK (per-op bypass only for reset) |
| Anonymous admin API | not newly opened |

## M. Backup after release

PASS — `polezno_20260912T074124Z.dump` + media archive; offsite deferred by owner

## N. Rollback readiness

| Item | Value |
|---|---|
| Old SHA available | `b3a51ba…` release dir kept |
| PRE_ADMIN_G DB/media | proven |
| POST_ADMIN_G backup | proven |
| Verdict | CONDITIONAL additive / restore if new enums written |

## O. Content readiness

**OWNER CONTENT BLOCKED** for commercial launch (0 excursions/routes/reviews) — separate from system release.

## P. Owner acceptance

PRODUCTION OWNER ACCESS TECHNICALLY PROVEN  
HUMAN ACCEPTANCE **PENDING** — `ADMIN_G_OWNER_ACCEPTANCE_CHECKLIST.md`

## Q. Git

Docs-only evidence commits on `phase15-ux-funnel-hardening`  
Force? **no**  
Master touched? **no**  
Deployed app SHA unchanged by docs tip.

## R. Remaining risks

1. Offsite still deferred — VPS-loss DR incomplete (accepted)
2. Content pack incomplete — commercial launch blocked
3. Email notify keys still MISSING
4. Temporary password must be changed by owner after first login

## S. Owner manual checklist

See `ADMIN_G_OWNER_ACCEPTANCE_CHECKLIST.md`

## T. Final recommendation

**ADMIN.G TECHNICALLY CLOSED — HUMAN ACCEPTANCE PENDING**

Do not start the next gate automatically.
