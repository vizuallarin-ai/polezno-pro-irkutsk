# GATE ADMIN.F — Implementation report

## Final status

```text
GATE ADMIN.F PARTIAL /
TECHNICAL OWNER E2E PASS /
MOBILE SMOKE PASS /
MIGRATION REHEARSAL PASS /
ON-HOST BACKUP UNATTENDED PROVEN /
OFFSITE NOT LIVE — OWNER INFRA ACTION REQUIRED /
OWNER HUMAN ACCEPTANCE PENDING /
CONTENT NO-GO FOR COMMERCIAL LAUNCH /
BUILD PASS /
PRODUCTION APPLICATION UNCHANGED
```

## Baseline

| Item | Value |
|---|---|
| Starting SHA | `437fec662e1fe231b3986c2fb7e0c7ce99ae77fc` |
| Frozen TARGET_RELEASE_SHA | `fee5618ad139e6e5c9593bcad552cefeade25089` |
| Production SHA | `b3a51ba8500bb03b5f1124feab567bee3a313824` (unchanged) |
| Branch | `phase15-ux-funnel-hardening` |

## Changes in this gate

1. Backup health reports separate `offsite.db` / `offsite.media`; gate label ADMIN.F.
2. Daily on-host pipeline optionally runs offsite when `/etc/polezno/offsite.env` present.
3. Production migration SQL `scripts/migrations/admin-f-prod-to-target.sql`.
4. Migration rehearsal script + disposable VPS proof.
5. `npm run test:admin-f` release-readiness checks.
6. Technical owner E2E + mobile smoke scripts.
7. Rollout/rollback runbooks + acceptance/content docs.

## First unattended backup

- Pre-ADMIN.E.final cron was DB-only (03:15 dumps without media).
- New `backup-daily-onhost` cron installed 2026-09-12 ~05:02Z (after 03:15).
- Manual pipeline PROVEN; `at` unattended run PROVEN at 05:24Z (DB+media+health).
- Next natural cron: 03:15 UTC daily.

## Offsite

**NOT LIVE** — owner must provision private object storage + secrets.

## Recommendation

**CONDITIONAL GO for PROD.ROLLOUT planning** only after:

1. LIVE offsite proof, and  
2. Human owner acceptance, and  
3. Content pack if commercial launch is the goal.

Do **not** auto-start PROD.ROLLOUT from this gate.
