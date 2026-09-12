# ADMIN.G — Production migration evidence

**Gate:** ADMIN.G  
**Applied:** 2026-09-12T06:44:33Z UTC  
**Duration:** ~0s wall (DDL additive)

## Artifact

| Item | Value |
|---|---|
| File | `scripts/migrations/admin-f-prod-to-target.sql` |
| SHA256 | `60ff724f1a8c85f6bb255d8232e2af3b42ac8ee82e771863b67043ea8e8aa5ff` |
| Apply | `psql -v ON_ERROR_STOP=1` as postgres → `polezno_irkutsk` |
| Exit | 0 |

## Follow-up schema sync

| Item | Value |
|---|---|
| Method | `npm run db:push` from TARGET release tree (controlled Payload push) |
| Result | `DB_SCHEMA_PUSH_OK` |
| Version tables | `_excursions_v`, `_routes_v`, `_reviews_v`, `_photos_v`, `_guides_v`, `_site_settings_v` (+ related) present |

## Post-migration verify

| Check | Result |
|---|---|
| `enum_users_role` | `admin,editor,developer` |
| `enum_leads_status` | legacy + `booked,declined` |
| leads CRM columns | present |
| `reviews.status` | present |
| indexes | `leads_status_idx`, `leads_next_contact_at_idx` |
| Aggregate counts | users=1, leads=1, articles=9, excursions=0, routes=0, reviews=0, media=4 (unchanged) |
| `users.role=admin` | preserved (≥1) |
| Old app health after SQL | still ok on `b3a51ba…` before cutover |

## Compatibility verdict

**CONDITIONAL — ADDITIVE SCHEMA / DB RESTORE IF NEW ENUM VALUES WRITTEN**

No destructive DROP. Old application may boot on unused additive columns; if new enum values are written in production after cutover, code-only rollback may require DB restore from PRE_ADMIN_G dump.
