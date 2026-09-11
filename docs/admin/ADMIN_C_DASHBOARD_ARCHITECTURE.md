# ADMIN.C — Dashboard Architecture

**Date:** 2026-09-11  
**Gate:** ADMIN.C — Owner Dashboard & Publishing UX

## Principle

Payload Admin remains the only backoffice. `/admin` landing is an **operational** owner home («Главная»), not analytics BI and not a second CMS.

## Landing

| | |
|--|--|
| Route | `/admin` |
| Component | `payload/components/OwnerDashboardView.tsx` |
| Template | Payload `DefaultTemplate` + `Gutter` |
| Replaces | Default ModularDashboard collection cards |
| Legacy | `BeforeDashboard` is a no-op (kept for stale import maps) |

## Blocks (priority order)

1. **Требует внимания** — actionable items only  
2. **Готовность к запуску** — CONTENT.0 checklist (not vanity %)  
3. **Заявки** — new count + recent new + link (no CRM)  
4. **Контент** — compact published/draft shelves  
5. **Черновики** — recent drafts with «Продолжить»  
6. **Быстрые действия** + **Открыть сайт**

## Canonical modules

| Module | Role |
|--------|------|
| `lib/content-readiness.ts` | Public commercial classification (unchanged contract) |
| `lib/admin/owner-launch-readiness.ts` | Owner launch checklist + attention generation |
| `lib/admin/publish-checklist.ts` | Shared excursion/route publish rules |
| `lib/admin/admin-routes.ts` | Admin URL helpers / quick actions |
| `payload/dashboard/fetch-owner-dashboard.ts` | Local API aggregation |
| `payload/hooks/publish-guards.ts` | Server authority (uses publish-checklist) |

## Readiness criteria (CONTENT.0)

1. Contacts (phone ∨ email ∨ telegram)  
2. ≥1 published-ready excursion  
3. ≥1 published-ready route  
4. Valid non-placeholder guide profile  
5. ≥1 non-demo published review  
6. ≥3 published-ready photos  

Demo products / AR **never** mark the project ready.

## Publishing UX

UI checklist fields on Excursions + Routes mirror `publish-checklist` messages.  
Server `beforeValidate` guards remain authoritative.

## Articles dual status

Dashboard counts use admin field `status`.  
Public readiness also checks `_status` when present (`content-readiness`).  
Full model sync deferred (ADMIN.E / remediation).

## Auth / data boundary

- Fetch runs only inside authenticated admin view.  
- Local API with `overrideAccess: true` (same pattern as former BeforeDashboard).  
- No public REST endpoint for dashboard aggregates.
