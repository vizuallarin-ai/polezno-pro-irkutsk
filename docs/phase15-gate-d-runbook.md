# Gate D — Production deploy + email + health

**Status:** EXECUTE AWAITING OWNER (SSH + offsite backup + Resend DNS)

Code prerequisites from Phase 15 Gate B are in-repo. Do not switch production without backup.

## Prerequisites

- [ ] Offsite DB backup completed (not same-host only) — currently **BLOCKED** until owner confirms
- [ ] Same-host backup exists (see Gate B report)
- [ ] Branch `phase15-commercial-core-launch` (or merge target) built with:
  - `GIT_COMMIT_SHA=$(git rev-parse HEAD)`
  - `BUILD_TIMESTAMP` ISO
- [ ] `PAYLOAD_SECRET`, `DATABASE_URL`, `NEXT_PUBLIC_SERVER_URL=https://irkportal.ru` on VPS
- [ ] Optional but recommended: `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`

## Deploy sequence

```bash
# Local / CI identity
npm run build:release

# On VPS — dry-run first
npm run deploy:immutable   # follow docs/immutable-release-deploy.md

# After switch
curl -sS https://irkportal.ru/api/health
# expect: commitSha === expected SHA (not "unknown")

EXPECTED_GIT_SHA=<sha> npm run check:prod
```

## Resend E2E

1. Verify sender domain in Resend dashboard (SPF/DKIM)
2. Set `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO` on VPS
3. In CMS Site Settings: enable lead notifications + admin-only email field
4. Submit test lead from `/contact` with honeypot empty
5. Confirm email arrives within 2 minutes; lead appears in `/admin/collections/leads`

## Metrika goals (cabinet)

Code emits goals via `lib/analytics-events.ts`. In Yandex Metrika create goals matching:

| Goal name (suggested) | Trigger |
|-----------------------|---------|
| `lead_submit` | reachGoal on successful lead |
| `lead_submit_business` | B2B form success |
| `cta_contact_click` | primary CTA / messenger |
| `route_view` | route detail view |
| `excursion_view` | excursion detail view |

Mark cabinet verification: **DONE** only after test events appear in Metrika reports.

## Definition of Done

- [ ] `/api/health` returns expected SHA
- [ ] `check:prod` passes with `EXPECTED_GIT_SHA`
- [ ] Test lead → email + CMS
- [ ] Rollback path documented (symlink previous release)
- [ ] Metrika goals created (events verified)

## Stop if

- Offsite backup missing
- Health SHA unknown after deploy
- Lead form returns 5xx on production
