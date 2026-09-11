# ADMIN.RUNTIME — E2E ADMIN.D

**Date:** 2026-09-11  
**HEAD at proof:** `4142e7b`  
**Runtime:** local Next + LOCAL_DISPOSABLE Postgres  
**Raw:** `docs/admin/evidence/_ADMIN_RUNTIME_E2E_RAW.json`

## Scenario matrix

| Scenario | Verdict | Evidence |
|----------|---------|----------|
| Public lead ingestion | **PROVEN** | `POST /api/leads` → status forced `new`; create succeeds with empty Resend |
| CRM injection blocked | **PROVEN** | Public body `status/booked`, `nextContactAt`, `adminComment`, `closedReason*` ignored; lead stays `new` |
| Anonymous Lead REST read | **PROVEN** | GET-by-id without cookie → **403** |
| CRM lifecycle new→…→closed | **PROVEN** | upcoming → due_today → overdue → replied → booked (not terminal) → closed (`none`) |
| Declined terminal | **PROVEN** | status `declined` + reason → classification `none` |
| Unscheduled | **PROVEN** | `in_progress` + null `nextContactAt` → `unscheduled` |
| `new` without date not unscheduled | **PROVEN** | classifier → `none` |
| CRM summary | **PROVEN** | `summarizeCrmLeads` on GET-by-id sample |
| Lead field readability | **PROVEN** | GET-by-id keys include status, nextContactAt, createdAt, source |
| Admin leads UI | **PROVEN** | `/admin/collections/leads` 200; RU status labels markers present |
| Dashboard CRM signals | **PROVEN** | `/admin` HTML includes leads/attention/next-contact markers |

## Architecture note (not a failed criterion)

`GET /api/leads` (collection list) returns **405** because `app/api/leads/route.ts` exports only `POST` and shadows Payload REST for that exact path.  
Owner Admin list uses **Local API** (works). Security: anonymous list remains unavailable. Documented residual; not fixed in this gate (would be route rename / dual handler — product API change).

## PROD-READ status histogram

**NOT PROVEN** — no production SQL / PII. Compatibility of old statuses remains strategy-level (values preserved). Does not block local RUNTIME gate.

## Verdict for ADMIN.D runtime

**Runtime E2E for ADMIN.D acceptance: PROVEN** (local). Production histogram remains NOT PROVEN.
