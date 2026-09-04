# Gate C — Controlled commercial content publication

**Status:** READY FOR OWNER MATERIALS (code + contracts in place)  
**Do not publish:** seed, demo, AI-invented prices, unverified facts.

See also: [phase15-content-input-manifest.md](./phase15-content-input-manifest.md)

## Prerequisites

1. Owner-approved materials for:
   - 1 auto excursion (~30 000 ₽ / 2.5 h) — confirm price in writing
   - 1 walking excursion (~8 000 ₽ / 1 h, up to 5 people) — confirm price
   - 2 self-guided routes with points, coordinates, geometry, real photos
   - Optional: 3–5 real reviews with consent
2. Admin access at `/admin`
3. Real photos with publication rights

## Operator checklist (CMS)

### Before publish

- [ ] Unpublish or draft any product/AR/photo with «Демо-» in title
- [ ] Run audit: `npm run check:gate-c`
- [ ] Confirm Resend is configured **or** accept that leads stay CMS-only until Gate D

### Excursions (×2)

For each:

- [ ] Title, format (`auto` / `walking`), confirmed price or honest «от …»
- [ ] Duration, group size, short + full description
- [ ] Real cover photo (≥1)
- [ ] SEO title/description
- [ ] Status → `published`
- [ ] Smoke: `/excursions/{slug}` shows price + CTA → `/contact`

### Routes (×2)

For each:

- [ ] Title, points in order with coordinates
- [ ] Valid geometry (admin geometry editor or manual GeoJSON)
- [ ] Duration/distance; point descriptions (verified facts only)
- [ ] Cover image
- [ ] Status → `published`
- [ ] Smoke: `/map` lists card; `/map/{slug}` map works on mobile

### Reviews (optional)

- [ ] Original text + source + consent
- [ ] Featured on home **or** leave SocialProof empty/hidden

## Definition of Done

- [ ] `/map` shows ≥4 live cards (2 routes + 2 excursions as experiences)
- [ ] No «Демо-» on public pages or sitemap
- [ ] Lead from excursion detail lands in CMS with `excursionSlug`
- [ ] Owner written approval stored (email/chat screenshot OK)

## Rollback

Set status → `draft` on the new docs. Nav/sitemap gates hide empty catalogs automatically.

## Blocked without owner

If materials are not received, **stop here**. Do not invent SKUs. Phases 1–2 still ship.
