# ADMIN.B — Revalidation matrix

**Date:** 2026-09-11  
**Source of truth:** `lib/revalidate-paths.ts` → `app/api/revalidate/route.ts`  
**Hook:** `payload/hooks/revalidate.ts` POSTs `{ collection, slug }`

| Collection / global | Paths | Tags | Frontend consumers (CODE-PROVEN) |
|---------------------|-------|------|----------------------------------|
| articles | `/explore`, `/explore/[slug]`, `/` | `cms:articles`, `cms:articles:[slug]` | explore listing/detail, home |
| events | `/events`, `/events/[slug]` | `cms:events…` | events pages |
| products | `/souvenirs`, `/souvenirs/[slug]` | `cms:products…` | souvenirs |
| makers | `/souvenirs`, `/souvenirs/makers`, `/souvenirs/makers/[slug]` | `cms:makers…` | makers |
| routes | `/map`, `/map/[slug]`, `/` | `cms:routes…` | map, home experiences |
| **excursions** | `/map`, `/excursions/[slug]`, `/business`, `/` | `cms:excursions…` | map experiences, detail, business, related blocks |
| photos | `/explore/photos`, `/explore/photos/[slug]`, `/explore` | `cms:photos…` | photo archive |
| ar-postcards | `/ar-postcards`, `/ar-postcards/[slug]` | `cms:ar-postcards…` | AR |
| reviews | `/` | `cms:reviews` | home featured reviews |
| guides | `/about/guides`, `/about` | `cms:guides` | guides page |
| site-settings | `/`, `/about`, `/contact` | `cms:site-settings` | layout/contacts/SEO |
| navigation | `/` | `cms:navigation` | header CTA |
| default / unknown | `/` | — | safety net |

## ADMIN.A fix

Before: `excursions` → only `/business`.  
After: detail + map + business + home.

## Verification

| Check | Mark |
|-------|------|
| Unit paths matrix (`npm run test:admin-b`) | TEST-PROVEN |
| Hook calls `/api/revalidate` with secret | CODE-PROVEN |
| Staging/local publish smoke with live Next cache | NOT PROVEN (no disposable E2E in this pass) |
| Production revalidate after deploy | NOT PROVEN (no deploy) |

## Note on cache tags

Project primarily uses `revalidatePath`. Tags `cms:*` are emitted for forward compatibility; Next 16 requires `revalidateTag(tag, 'max')`.
