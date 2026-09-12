# ADMIN.F — baseline evidence

**Date:** 2026-09-12  
**Gate:** ADMIN.F Owner Acceptance & Production Readiness

## Git / identity

| Item | Value |
|---|---|
| Repo | `vizuallarin-ai/polezno-pro-irkutsk` |
| Branch | `phase15-ux-funnel-hardening` |
| Starting HEAD | `437fec662e1fe231b3986c2fb7e0c7ce99ae77fc` |
| Production application SHA (before/after ADMIN.F) | `b3a51ba8500bb03b5f1124feab567bee3a313824` |
| Worktree | clean tracked; unrelated untracked leftovers ignored (`####/`, `_tmp-*`, etc.) |

## Production health (read-only)

```json
{"project":"irkportal","status":"ok","commitSha":"b3a51ba8500bb03b5f1124feab567bee3a313824","database":"up","app":"up","identityComplete":true}
```

Production SHA **unchanged** throughout ADMIN.F. No deploy / merge master / production schema migration / production content mutation.

## Versions

- Payload `^3.85.0`
- Next.js `16.2.6`

## ADMIN.E carry-forward

On-host DB+media backup pipeline operational. Unattended proof for new daily wrapper: see backup evidence. LIVE offsite still owner-infra blocked entering this gate.
