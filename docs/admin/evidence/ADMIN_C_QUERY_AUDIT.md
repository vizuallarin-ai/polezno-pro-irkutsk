# ADMIN.C — Dashboard query audit

**Fetcher:** `payload/dashboard/fetch-owner-dashboard.ts`  
**Pattern:** single `Promise.all` (no sequential waterfall for core widgets)  
**Access:** Local API inside authenticated admin view only; `overrideAccess: true` (admin-gated page)

## Inventory (~22 calls)

| # | Type | Collection / global | Purpose |
|---|------|---------------------|---------|
| 1–2 | count | excursions published / draft | shelf |
| 3–4 | count | routes published / draft | shelf |
| 5–6 | count | articles published / draft | shelf |
| 7–8 | count | reviews published / draft | shelf |
| 9 | count | leads `status=new` | attention / leads |
| 10 | count | photos pending moderation | attention |
| 11 | count | photos total | shelf |
| 12 | find limit 40 | published excursions | publishedReady |
| 13 | find limit 40 | published routes | publishedReady |
| 14 | find limit 40 | published articles | publishedReady |
| 15 | find limit 40 depth 1 | published+approved photos | publishedReady |
| 16 | find limit 40 | published reviews | publishedReady / demo filter |
| 17 | find limit 40 | guides | placeholder + ready |
| 18–20 | find limit 5 | draft excursions/routes/articles | drafts list |
| 21 | find limit 5 | new leads | recent leads |
| 22 | findGlobal | site-settings | contacts |

## Risks

| Risk | Mitigation |
|------|------------|
| Many small counts | Parallel; Payload count is cheap vs full scans |
| Ready sample cap 40 | Enough for current catalog; if >40 published incomplete, publishedReady may undercount — monitor post CONTENT.1 |
| Widget failure | Per-query try/catch → `errors[]`; panel still renders |
| Public exposure | No new public API route |

## Performance note

Acceptable for single-owner CMS. Do not add charts or unbounded finds in ADMIN.C.
