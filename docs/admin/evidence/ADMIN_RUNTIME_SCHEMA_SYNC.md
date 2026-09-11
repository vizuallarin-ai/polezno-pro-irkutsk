# ADMIN.RUNTIME — Schema Sync

**Date:** 2026-09-11  
**Gate:** ADMIN.RUNTIME  
**HEAD at sync:** `4142e7b`  
**Method:** project-canonical `npm run db:push` → `scripts/push-db-schema.mjs`  
**Target:** LOCAL_DISPOSABLE only (`localhost:5432/polezno_irkutsk`)

## Pre-sync safety

| Check | Result |
|-------|--------|
| Hard classification | LOCAL_DISPOSABLE |
| schema_mutation_allowed | true |
| Production DB | not targeted |
| Payload production push | `push: process.env.NODE_ENV !== "production"` in `payload.config.ts`; push script forces `NODE_ENV=development` |

## Command result

```text
Pushing Payload schema to PostgreSQL...
[✓] Pulling schema from database...
DB_SCHEMA_PUSH_OK
```

Warnings (non-blocking for schema):

- No email adapter → console email (expected local).
- sharp warning in push harness (separate from app deps).

## Post-sync verification (`scripts/_tmp-verify-schema.mjs`)

### ADMIN.B — reviews

| Requirement | Present |
|-------------|---------|
| `reviews.status` | **yes** (`USER-DEFINED`) |

### ADMIN.D — leads

| Column | Present |
|--------|---------|
| `status` | yes (`USER-DEFINED`) |
| `next_contact_at` | yes (`timestamp with time zone`) |
| `last_contact_at` | yes (`timestamp with time zone`) |
| `closed_reason` | yes (`USER-DEFINED`) |
| `closed_reason_note` | yes (`character varying`) |

### Indexes (sample)

- `leads_status_idx`
- `leads_next_contact_at_idx`

### Tables present

`reviews`, `leads`, `excursions`, `routes`, `articles`, `guides` — all present.

## Strategy note

No new migration architecture introduced. Local/dev uses Payload/Drizzle `push` as already documented for ADMIN.B (`Local db.push in non-production`). Production remains `push: false` / no schema mutation in this gate.

## Verdict

**SCHEMA SYNC PROVEN** on local disposable database for ADMIN.B reviews.status and ADMIN.D lead CRM fields/indexes.
