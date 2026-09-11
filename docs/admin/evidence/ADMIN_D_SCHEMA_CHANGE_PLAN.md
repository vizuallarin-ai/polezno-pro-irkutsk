# ADMIN.D — Schema change plan

**Status:** Planned for future deploy with Payload schema sync. **Not applied to production in this gate.**

## New / changed persisted fields on `leads`

| Field | Type | Nullable / default | Purpose | Index | Migration impact |
|-------|------|--------------------|---------|-------|------------------|
| `status` | select (enum extended) | default `new` | CRM workflow | **yes** (`index: true`) | Existing values unchanged; new options `booked`, `declined` |
| `nextContactAt` | date (day+time) | nullable | Follow-up / overdue | **yes** | New column; NULL for all existing rows |
| `lastContactAt` | date (day+time) | nullable | Last real contact | no | New column; NULL OK |
| `adminComment` | textarea | nullable | Owner notes (existing) | no | Relabeled «Заметка»; no data change |
| `closedReason` | select | nullable | Refusal reason | no | New; only meaningful when `declined` |
| `closedReasonNote` | text | nullable | Free-text refusal note | no | New |
| `priority` | select | default `normal` | Existing | no | Unchanged |

## Compatibility

| Existing value | After deploy |
|----------------|--------------|
| `new` / `in_progress` / `replied` / `closed` / `spam` | Readable; labels updated in admin UI |
| Rows without `nextContactAt` | Valid; «Новая» not flagged unscheduled; active non-new without date → unscheduled signal |
| Unknown legacy status | `beforeValidate` rejects **new writes** with unknown status; old rows with only known values expected |

## Indexes

Payload `index: true` on `status` and `nextContactAt` → Postgres indexes on next `payload migrate` / `db:push`.  
Rationale: overdue filters and dashboard active-lead query.

No production index DDL in this gate.

## Deploy order (future)

1. Ship code that understands old + new statuses (backward compatible).
2. Run Payload schema sync / migrate on target DB.
3. Smoke: create lead via form → status `new`; set `nextContactAt`; dashboard overdue.
4. Rollback: new columns nullable → code rollback leaves unused columns; do not drop columns blindly.

## Rollback considerations

- Removing `booked`/`declined` from options after use would orphan values — avoid.
- Prefer forward-compatible enum growth only.

## Related pending schema (not ADMIN.D)

- `reviews.status` (ADMIN.B) still pending sync where applicable.
