# ADMIN.D — Security review

## Public create mapping

| Path | CRM fields from client? |
|------|-------------------------|
| `POST /api/leads` (all branches) | **No** — `status: "new"` hardcoded; CRM fields omitted |
| `buildUnifiedLeadData` | Strips via `omitCrmInternalFields`; forces `status: "new"` |
| Zod public schemas | Do not declare CRM keys → stripped |
| Newsletter lead create | `status: "new"` only |

**CRM-internal names:** `status`, `adminComment`, `nextContactAt`, `lastContactAt`, `closedReason`, `closedReasonNote`, `priority` (priority recomputed server-side).

## Public read / update / delete

| Access | Anonymous | Admin |
|--------|-----------|-------|
| read | **false** (`leadsReadAccess`) | true |
| create | **false** (Local API override only after spam checks) | true |
| update | **false** | true |
| delete | **false** | true |

GraphQL disabled. Exact `/api/leads` GET remains non-list (405 / app route).

## Notification PII

New-lead Resend payload unchanged: allowlisted non-PII keys only (`leadId`, `createdAt`, `sourceType`, `adminUrl`, `correlationId`).  
ADMIN.D does **not** email clients automatically (except existing review-request on `closed`).

## Tests

| Suite | Covers |
|-------|--------|
| `test:admin-d` | Injection strip, access false for anon, follow-up terminal safety |
| `test:leads` | Spam + create access |
| `test:lead-privacy` | Resend payload / body PII |

## Residual risks (accepted / deferred)

| Risk | Gate |
|------|------|
| Hard delete still possible for admin | ADMIN.E |
| In-memory rate limit reset | OPS / later |
| Consent optional on some API schema paths (UI requires) | Pre-existing |
| Field-level access not set (collection-level sufficient while create is admin-only + whitelist) | Monitor if public create ever relaxed |
