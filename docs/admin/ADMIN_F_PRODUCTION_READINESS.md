# ADMIN.F — Production readiness

## Independent verdicts

| Area | Verdict |
|---|---|
| SYSTEM (code/admin) | **CONDITIONAL GO** — feature branch ready; not deployed |
| CONTENT | **NO-GO** — see content readiness |
| BACKUP on-host | **GO** — daily DB+media unattended proven |
| BACKUP offsite | **NO-GO** — owner infra required |
| MIGRATION | **GO** — SQL + disposable rehearsal PASS |
| OWNER ACCEPTANCE | **PENDING** — human session required |
| PRODUCTION ROLLOUT | **NO-GO / CONDITIONAL** until offsite + owner (+ content if commercial) |

## Production config (names only, presence)

Observed on VPS `.env.production` mode `600`:

| Name | Status |
|---|---|
| `DATABASE_URL` | PRESENT |
| `PAYLOAD_SECRET` | PRESENT |
| `NEXT_PUBLIC_SERVER_URL` | PRESENT |
| `REVALIDATE_SECRET` | PRESENT |
| `RESEND_API_KEY` | MISSING |
| `RESEND_FROM` | MISSING |
| `LEAD_NOTIFY_EMAIL` | MISSING |
| `GIT_COMMIT_SHA` | MISSING (health uses artifact identity — OK) |
| Offsite `/etc/polezno/offsite.env` | MISSING |

Notify path: **NOT LIVE** until Resend + recipient configured.

## Schema delta (prod → target)

Production lacks: `developer` role; lead `booked`/`declined` + CRM date/reason columns; `reviews.status`; content version tables beyond articles; articles `hidden`/`archived` enum values.

Artifact: `scripts/migrations/admin-f-prod-to-target.sql`  
Then Payload schema sync for version tables.

## TARGET_RELEASE_SHA

**Frozen:** `fee5618ad139e6e5c9593bcad552cefeade25089` on `phase15-ux-funnel-hardening`.

This is the ADMIN.F closeout tip (readiness code + SHA pins). Later docs-only follow-ups do **not** re-freeze TARGET unless an explicit ADMIN.F re-closeout says so.

## Safety during ADMIN.F

| Action | Done? |
|---|---|
| Production app deploy | **no** |
| Merge master | **no** |
| Production DB migration | **no** |
| Production content mutation | **no** |
| Force push | **no** |
