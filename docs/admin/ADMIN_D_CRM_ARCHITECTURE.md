# ADMIN.D — CRM Architecture

**Date:** 2026-09-11  
**Product:** ИркПортал / «Полезно про Иркутск»  
**Scope:** Minimal operational CRM for one owner — not HubSpot/amoCRM.

## Principle

Person leaves a lead → owner sees it → contacts → knows next step → books or declines.  
No lead should be lost because the owner forgot.

## Canonical domain

| Module | Role |
|--------|------|
| `lib/leads/crm.ts` | Statuses, labels, terminal rules, follow-up classification, timezone calendar helpers, CRM field denylist |
| `payload/collections/Leads.ts` | Schema + tabs UX + soft validation + review hook on `closed` |
| `lib/leads-api-helpers.ts` | Public create whitelist; strips CRM internals |
| `lib/admin/owner-launch-readiness.ts` | Attention items (overdue / new / today / unscheduled) |
| `payload/dashboard/fetch-owner-dashboard.ts` | One active-leads find → CRM summary |
| `payload/components/LeadsListFilters.tsx` | Owner filter chips |
| `lib/admin/admin-routes.ts` | Status / overdue / today / unscheduled admin URLs |

## Follow-up engine

Timezone: **Asia/Irkutsk** (`OWNER_TIMEZONE`). Comparisons use `Date` instants + calendar YMD in owner TZ (not string-local hacks).

| Bucket | Rule |
|--------|------|
| overdue | Active status + `nextContactAt < now` |
| due_today | Active + same owner calendar day as now + `nextContactAt >= now` |
| upcoming | Active + future beyond today |
| unscheduled | `in_progress` \| `replied` \| `booked` + missing `nextContactAt` |
| none | Terminal, or `new` without date |

Terminal (`closed`, `declined`, `spam`) **never** overdue.

`booked` is **not** terminal — contact before the excursion remains expected.

## History

Deferred. Notes + dates sufficient for ADMIN.D. Versions/audit → ADMIN.E.

## Notify health

Compact label on dashboard from existing `site-settings.leadSettings.leadNotificationEnabled` + env (`RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`). No new storage.

## Explicit non-goals

External CRM, messaging integrations, telephony, email sequences, AI scoring, bookings engine, payments, multi-tenant, employee CRM, funnel analytics charts.
