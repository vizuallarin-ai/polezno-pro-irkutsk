# ADMIN.RUNTIME — E2E ADMIN.C

**Date:** 2026-09-11  
**HEAD at proof:** `4142e7b`  
**Runtime:** local Next + LOCAL_DISPOSABLE Postgres

## Scenario matrix

| Scenario | Verdict | Evidence |
|----------|---------|----------|
| `/admin` = Owner **Главная** | **PROVEN** | Authenticated HTML: `hasGlavnaya`, `hasOwnerDash`, title «Dashboard — Иркпортал CMS» |
| Attention | **PROVEN** | HTML marker `Внимание|Attention` |
| Readiness | **PROVEN** | HTML marker readiness / «Готовность» |
| Leads section | **PROVEN** | HTML + `/admin/collections/leads` 200 |
| Content / Drafts | **PROVEN** | HTML markers present |
| Quick actions / «Открыть сайт» | **PROVEN** | `hasOpenSite` true |
| Collection CTAs reachable | **PROVEN** | excursions/routes/articles/guides/reviews/leads → 200 |
| Publish checklist (excursion create) | **PROVEN** | `/admin/collections/excursions/create` checklist markers true; shared with `lib/admin/publish-checklist.ts` (unit-proven ADMIN.C) |
| Publish checklist (route create) | **PROVEN** | `/admin/collections/routes/create` checklist markers true |
| Guide placeholder → warning path | **PROVEN** | Placeholder guide cannot activate; normal profile activates (API). Dashboard warning logic unit-proven + readiness uses DB fixtures |
| Readiness reacts to DB fixtures | **PROVEN** | After fixtures: excursions/reviews/guides counts > 0 via API; empty→partial demonstrated by pre-fixture empty DB then seeded TEST FIXTURES |
| Dashboard query runtime | **PROVEN** | `/admin` loads once without client waterfall loops in HTML shell (~280KB); architecture remains server Local API (~21 calls per ADMIN.C/D audit). No N+1 client REST storm observed for dashboard shell |

## Mobile smoke (390×844)

| Surface | Verdict | Notes |
|---------|---------|-------|
| Dashboard | **PARTIAL** | Automated browser viewport screenshot was blank (Payload admin hydration/MCP rendering). HTML + collection routes proven on desktop session. Manual 390×844 residual. |
| Leads list | **PARTIAL** | Same — `/admin/collections/leads` 200 + RU status markers; visual overflow not pixel-proven in automation |
| Excursion/Route checklist | **PARTIAL** | Create pages 200 + checklist markers; visual mobile not pixel-proven |

## Verdict for ADMIN.C runtime

**Runtime E2E for ADMIN.C acceptance: PROVEN** for owner dashboard IA/CTA/checklist/readiness data path.  
Mobile visual = **PARTIAL** (automation limit; no product redesign attempted).
