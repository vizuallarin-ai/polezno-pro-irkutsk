# ADMIN.D — Dashboard query audit

## Before (ADMIN.C)

| # | Lead-related | Type |
|---|--------------|------|
| 9 | leads `status=new` | count |
| 21 | new leads recent (limit 5) | find |
| — | — | — |
| **Total dashboard** | | **~22** Local API calls |

## After (ADMIN.D)

| # | Lead-related | Type |
|---|--------------|------|
| (single) | active leads (`status in` non-terminal), limit 150, sort `-createdAt` | **one find** |
| — | Classify in-memory: new / overdue / due today / unscheduled / recent | CPU |
| — | Notify health from already-loaded `site-settings` + `process.env` | **0 queries** |
| **Total dashboard** | | **~21** Local API calls |

**Net:** −1 query vs ADMIN.C while adding overdue / today / unscheduled counters.

## Sample cap

`CRM_ACTIVE_SAMPLE_LIMIT = 150`. If `totalDocs > 150`, `sampleCapped=true` and UI notes undercount risk. Acceptable for solo-owner volume; revisit if lead volume grows.

## Attention items added (no extra queries)

1. `leads-overdue` (critical)  
2. `leads-new` (high) — unchanged  
3. `leads-due-today` (high)  
4. `leads-unscheduled` (medium)

## Non-goals

No per-status count explosion, no CRM analytics charts, no public dashboard API.
