# ADMIN.D — Baseline

**Date:** 2026-09-11  
**Gate:** ADMIN.D — Lead CRM & Follow-up Workflow  
**Starting HEAD:** `a1eb7eec084ec86e09157851639200f8000289ea`  
**Branch:** `phase15-ux-funnel-hardening`  
**Production SHA (unchanged):** `b3a51ba8500bb03b5f1124feab567bee3a313824`

## Repository identity

| Check | Value | Verdict |
|-------|-------|---------|
| Root | `D:/AI_WORKSPACE/Projects/PoleznoProIrkutsk` | OK |
| Origin | `https://github.com/vizuallarin-ai/polezno-pro-irkutsk.git` | OK |
| Branch | `phase15-ux-funnel-hardening` (ahead of origin by prior ADMIN.C commits) | OK |
| Package | `polezno-pro-irkutsk` · Next `16.2.6` · Payload `^3.85.0` | OK |
| Worktree | Untracked leftovers only (`####/`, pdfs, phase15 scripts) — no conflicting CRM WIP | OK |

## Lead pipeline map (before ADMIN.D)

```
Frontend forms (LeadForm / Business / Souvenir / AR / Contact)
  → POST /api/leads  (+ newsletter → leads row)
  → honeypot / min-fill 3s / IP rate-limit (in-memory)
  → Zod (compact / business / souvenir / AR) — unknown keys stripped
  → explicit Local API create (overrideAccess), status forced "new"
  → Resend notify (PII-stripped payload)
  → Admin list (inbox) + statuses new|in_progress|replied|closed|spam
  → on transition to closed + email: review-request email
```

## Pre-ADMIN.D CRM capability

| Capability | Status |
|------------|--------|
| Hardened public intake | Present |
| Admin-only REST read/create/update/delete | Present (`leads*Access = isAdmin`) |
| Status + adminComment + priority | Present (inbox, not CRM desk) |
| `nextContactAt` / overdue | **Absent** |
| Owner status vocabulary (Забронировано / Отказ) | **Absent** |
| Interaction history array | **Absent** (deferred — not needed for D) |
| Versions on leads | **Absent** (ADMIN.E) |
| Dashboard overdue | **Absent** (only `new` count) |

## Existing machine statuses (production-compatible)

| Value | Old label | Notes |
|-------|-----------|-------|
| `new` | Новый | Intake default; dashboard attention |
| `in_progress` | В работе | Keep value |
| `replied` | Ответ отправлен | Keep value |
| `closed` | Закрыт | Triggers review email — keep as «Завершено» only |
| `spam` | Спам | Keep as system terminal |

**Production status histogram:** NOT PROVEN (no prod SQL in this gate). Compatibility strategy: preserve all existing values; add `booked` + `declined`.

## Security baseline (reconfirmed)

- Public create via constructed whitelist / `buildUnifiedLeadData` — not body passthrough.
- `adminComment` never mapped from public forms.
- Payload REST create/read blocked for anonymous.
- `test:leads` + `test:lead-privacy` green before changes.

## Dashboard query baseline (ADMIN.C)

~22 Local API calls; lead-specific: count `status=new` + find 5 new.

## Local DB

`.env.local` points at `localhost:5432/polezno_irkutsk`. Port **closed** at gate time → local E2E / schema sync NOT PROVEN in this session.
