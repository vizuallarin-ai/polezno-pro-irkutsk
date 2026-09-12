# ADMIN.F — Migration rehearsal evidence

## Verdict

**MIGRATION_REHEARSAL_PASS** (disposable DB on production VPS; production DB untouched)

## Method

1. Latest on-host dump → `adminf_mig_<stamp>` via `pg_restore`
2. Apply `scripts/migrations/admin-f-prod-to-target.sql`
3. Verify enums/columns/indexes/data readability
4. `dropdb` disposable
5. Confirm production `/api/health` SHA still `b3a51ba…`

## Observed after migrate (disposable)

| Check | Result |
|---|---|
| `enum_users_role` | `admin,editor,developer` |
| `enum_leads_status` | legacy + `booked,declined` |
| `enum_articles_status` | `draft,published,hidden,archived` |
| leads CRM columns | `next_contact_at`, `last_contact_at`, `closed_reason`, `closed_reason_note` |
| `reviews.status` | present (`enum_reviews_status`) |
| indexes | `leads_status_idx`, `leads_next_contact_at_idx` |
| owner `users.role=admin` | preserved (count ≥ 1) |
| articles readable | count 9 |

## Not included in SQL (by design)

Payload version tables for excursions/routes/reviews/photos/guides require controlled Payload schema sync after this SQL — rehearse on disposable before PROD.ROLLOUT.

## Production

**NOT APPLIED.**
