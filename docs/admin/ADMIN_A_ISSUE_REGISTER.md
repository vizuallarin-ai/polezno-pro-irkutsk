# ADMIN.A — Issue Register

**Date:** 2026-09-11  
**Gate:** GATE ADMIN.A  
**Legend:** P0 data/security/leads/prod · P1 blocks owner work · P2 major friction · P3 polish  
**Complexity:** S/M/L/XL

All items are findings only — **not fixed** in this gate.

---

## P0

### ADMIN-A-P0-01 — No versions/autosave outside articles
- **User:** Owner
- **Scenario:** Edit excursion/route/settings → mistake → cannot restore
- **Evidence:** Only `Articles` has `versions.drafts.autosave` (CODE-PROVEN)
- **Root cause:** Versions never enabled on commercial collections
- **Defect type:** Missing function / safety
- **Fix:** Enable drafts+versions on excursions, routes, photos, products, site-settings (or soft-archive workflow)
- **Acceptance:** Owner can restore previous version of an excursion after bad save (local/staging proven)
- **Deps:** ADMIN.E
- **Complexity:** M

### ADMIN-A-P0-02 — Offsite backup not configured
- **User:** Owner / ops
- **Scenario:** VPS loss → CMS + leads gone
- **Evidence:** `docs/offsite-backup.md` unchecked; OPS.2 notes offsite NOT CONFIGURED
- **Root cause:** Same-host cron only
- **Defect type:** Ops / recovery
- **Fix:** Encrypted offsite copy + restore dry-run doc for developer (owner-facing “who to call”)
- **Acceptance:** Dump exists off-host; restore dry-run recorded
- **Deps:** OPS follow-up / ADMIN.E
- **Complexity:** M

### ADMIN-A-P0-03 — Hard delete without soft-archive UX on leads & core content
- **User:** Owner
- **Scenario:** Accidental delete of lead or only excursion
- **Evidence:** Leads/excursions lack versions; delete is Payload hard delete (CODE-PROVEN)
- **Root cause:** No retention / archive-first policy in admin UX
- **Defect type:** Safety / process
- **Fix:** Confirmations; prefer `spam`/`archived`; restrict delete by role; optional trash
- **Acceptance:** Owner cannot permanently delete `new` lead in one click; content uses archive path
- **Deps:** ADMIN.D / ADMIN.E
- **Complexity:** M

---

## P1

### ADMIN-A-P1-01 — Excursion revalidate misses public pages
- **User:** Owner
- **Scenario:** Publish excursion → site still empty/stale
- **Evidence:** `app/api/revalidate/route.ts` excursions → only `/business` (CODE-PROVEN)
- **Root cause:** Incomplete path map
- **Defect type:** Business process / cache
- **Fix:** Revalidate `/excursions/[slug]`, `/map`, `/` (experience flags)
- **Acceptance:** Publish appears on detail + map within revalidate window (staging)
- **Deps:** ADMIN.B or hotfix with ADMIN.B
- **Complexity:** S

### ADMIN-A-P1-02 — Reviews collection hidden but consumed on homepage
- **User:** Owner
- **Scenario:** Add testimonial for trust block
- **Evidence:** `Reviews.admin.hidden=true`; `getFeaturedPublicReviews` on home; 0 reviews (CODE+PROD)
- **Root cause:** “Later” group never revisited
- **Defect type:** IA / access to feature
- **Fix:** Unhide; Russian labels; add draft/`status` + moderation before public
- **Acceptance:** Owner finds «Отзывы» in menu; draft not shown until published
- **Deps:** ADMIN.B
- **Complexity:** M

### ADMIN-A-P1-03 — Guides hidden; placeholder publicly readable
- **User:** Owner / visitors
- **Scenario:** Manage guide profile; public sees stub
- **Evidence:** REST guide `slug=Slug`, bio/quote stubs; `admin.hidden`; `read: () => true` (PROD+CODE)
- **Root cause:** Seed/placeholder + open read + hidden admin
- **Defect type:** Content + access + IA
- **Fix:** Unhide for owner; add status; restrict public read to active+complete; unpublish/replace placeholder (**OWNER CONTENT** for real bio — do not invent)
- **Acceptance:** No public stub fields; owner can edit guide from menu
- **Deps:** ADMIN.B + OWNER CONTENT
- **Complexity:** M

### ADMIN-A-P1-04 — Manual slug required (no autogen)
- **User:** Owner
- **Scenario:** Create any URL entity
- **Evidence:** No slug hooks; `validateRequiredSlug` on many collections (CODE)
- **Root cause:** Dev-centric model
- **Defect type:** UX / model
- **Fix:** Autogenerate from title; show read-only “Ссылка на сайте”; allow advanced edit for Developer
- **Acceptance:** Owner creates excursion without typing slug
- **Deps:** ADMIN.B/C
- **Complexity:** M

### ADMIN-A-P1-05 — Excursion publishable without price rules
- **User:** Owner / visitors
- **Scenario:** Publish commercial offer incomplete
- **Evidence:** `price` not required; only `priceOnRequest` checkbox (CODE)
- **Root cause:** Missing publish validation
- **Defect type:** Model / safety
- **Fix:** beforeValidate: require price XOR priceOnRequest; readiness checklist
- **Acceptance:** Cannot publish without explicit pricing mode
- **Deps:** ADMIN.B/E
- **Complexity:** S

### ADMIN-A-P1-06 — Navigation / many chrome fields not editable though CMS exists
- **User:** Owner
- **Scenario:** Change menu or home CTAs via settings → no effect
- **Evidence:** `navigation.mainNav` ignored; home CTAs from `cta-constants`; about manifesto hardcoded (CODE)
- **Root cause:** Dual sources of truth
- **Defect type:** Model / frontend contract
- **Fix:** Either wire CMS → UI or remove/hide false controls + document code-owned surfaces
- **Acceptance:** Every visible settings field either works or is hidden with note
- **Deps:** ADMIN.B (hide) / later product decision
- **Complexity:** M–L

### ADMIN-A-P1-07 — Editor role cannot use admin
- **User:** Future editor / Owner expecting roles
- **Scenario:** Create editor user → cannot login panel
- **Evidence:** `adminPanelAccess` admin-only; role option still shown (CODE)
- **Root cause:** Incomplete RBAC
- **Defect type:** Access
- **Fix:** Implement Owner/Editor/Developer matrix or remove editor option until ready
- **Acceptance:** Documented roles match actual access; API cannot escalate
- **Deps:** ADMIN.E
- **Complexity:** L

### ADMIN-A-P1-08 — CRM lacks next-contact / overdue / history
- **User:** Owner
- **Scenario:** Daily lead follow-up
- **Evidence:** Leads fields: status/adminComment/priority; no nextContactAt/history (CODE)
- **Root cause:** Inbox design, not sales desk
- **Defect type:** Missing function / process
- **Fix:** Minimal CRM fields + dashboard overdue (ADMIN.D)
- **Acceptance:** Owner filters overdue; notes + next date saved
- **Deps:** ADMIN.D
- **Complexity:** M

### ADMIN-A-P1-09 — Lead notification may silently skip
- **User:** Owner
- **Scenario:** New lead → no email
- **Evidence:** Resend skip if no key; prior audits UNKNOWN E2E; privacy tests prove skip path (CODE+tests)
- **Root cause:** Optional email without admin health warning
- **Defect type:** Process / ops visibility
- **Fix:** Dashboard “уведомления: ок/не настроены”; optional Telegram; never fail lead save (keep)
- **Acceptance:** Owner sees notify health; staging E2E send proven
- **Deps:** ADMIN.D/E
- **Complexity:** M

### ADMIN-A-P1-10 — Commercial shelves empty; demo catalog live
- **User:** Owner / visitors
- **Scenario:** Sell excursions; souvenirs/AR show seed items
- **Evidence:** 0 routes/excursions/photos/reviews; 4 products + 3 AR published (PROD)
- **Root cause:** Owner pack not received; seeds never unpublished
- **Defect type:** Owner content + process
- **Fix:** CONTENT.1 after signed pack; Gate C unpublish demo if still policy
- **Acceptance:** No demo commercial items without owner approval; ≥1 real excursion published
- **Deps:** OWNER CONTENT / CONTENT.1
- **Complexity:** XL (content) + S (unpublish)

### ADMIN-A-P1-11 — Articles dual publish status (`_status` + `status`)
- **User:** Owner
- **Scenario:** Think published but draft versioning blocks public
- **Evidence:** `articleReadAccess` requires both (CODE)
- **Root cause:** Payload drafts + custom status field
- **Defect type:** UX / model
- **Fix:** Single mental model in UI help; or sync hooks
- **Acceptance:** One clear “Опубликовано” control
- **Deps:** ADMIN.B
- **Complexity:** M

### ADMIN-A-P1-12 — `/api/routes` shadows Payload REST routes collection
- **User:** Developer / tooling
- **Scenario:** REST inspect routes like other collections → `[]` custom shape
- **Evidence:** `app/api/routes/route.ts` vs Payload API (CODE+PROD)
- **Root cause:** Path collision
- **Defect type:** Architecture
- **Fix:** Move public map API to `/api/map-routes` or similar; restore Payload path
- **Acceptance:** Payload REST for `routes` works for staff; public map API documented
- **Deps:** ADMIN.B (careful)
- **Complexity:** M

### ADMIN-A-P1-13 — World-readable hidden collections
- **User:** Security / privacy
- **Scenario:** Unauthenticated REST lists guides/reviews/places/partners
- **Evidence:** `read: () => true` (CODE); guides stub visible (PROD)
- **Root cause:** Temporary open access
- **Defect type:** Access
- **Fix:** publishedOrStaff / featured filters; never open-read drafts/PII
- **Acceptance:** Anonymous REST cannot read incomplete guides; reviews only published
- **Deps:** ADMIN.E
- **Complexity:** M

---

## P2

### ADMIN-A-P2-01 — Flat menu mixes content, sales, system
- IA not task-based · Fix in ADMIN.B · S–M

### ADMIN-A-P2-02 — Route form cognitive overload (points + GeoJSON + schedule + SEO)
- Geometry panel helps but JSON remains · ADMIN.B/C wizards · L

### ADMIN-A-P2-03 — Orphan collections Places/Partners in schema
- Hide deeper / remove from mental model · ADMIN.B · S

### ADMIN-A-P2-04 — CMS fields unused by frontend (excursion `content`, event `fullDescription`, route audio/PDF/schedule mapping gap)
- Hide or wire · OWNER DECISION · M–L

### ADMIN-A-P2-05 — Dashboard incomplete (no reviews/AR/readiness/open site)
- ADMIN.C · M

### ADMIN-A-P2-06 — English Payload login chrome (“Forgot password?”)
- Brand + RU · ADMIN.B/E · S

### ADMIN-A-P2-07 — In-memory lead rate limit resets on restart
- Prior audit P2 · sticky store or edge limit · ADMIN.D/E · M

### ADMIN-A-P2-08 — Photo rights model hard for owner (correct but heavy)
- Guided checklist UI · ADMIN.C · M

### ADMIN-A-P2-09 — admin-guide drift vs reality (nav editable? reviews path?)
- Sync in ADMIN.E owner guide · S

### ADMIN-A-P2-10 — DEPLOY-ADMIN.md still Vercel+Neon oriented
- Mark superseded / point to Beget · docs only · S

### ADMIN-A-P2-11 — Mobile admin operability unknown
- Test tablet persona · ADMIN.F · M

### ADMIN-A-P2-12 — Newsletter leads create without notify
- CODE · decide product · S

### ADMIN-A-P2-13 — Makers REST vs catalog placementStatus mismatch
- Align access with `MAKER_PUBLISHED_WHERE` · ADMIN.E · S

### ADMIN-A-P2-14 — No audit trail of who changed lead status
- ADMIN.D/E · M

### ADMIN-A-P2-15 — Import map may be stale for custom fields
- Verify RouteGeometry/Leads filters/QR in admin runtime · NOT PROVEN fully · S

---

## P3

### ADMIN-A-P3-01 — Dashboard copy “CMS production” developer-toned
### ADMIN-A-P3-02 — Guides/Reviews/Partners missing Russian `labels`
### ADMIN-A-P3-03 — Duplicate legacy site-settings SEO fields
### ADMIN-A-P3-04 — Quick actions include Event before core empty excursions narrative
### ADMIN-A-P3-05 — Lint warnings (unused imports in Leads/revalidate) — non-blocking

---

## Classification index

| ID | Type |
|----|------|
| P0-01 | Safety missing |
| P0-02 | Ops/docs |
| P0-03 | Safety / process |
| P1-01 | Cache / process |
| P1-02 | IA |
| P1-03 | Content + access + IA |
| P1-04 | UX |
| P1-05 | Model validation |
| P1-06 | Frontend contract |
| P1-07 | Access |
| P1-08 | Missing CRM |
| P1-09 | Ops visibility |
| P1-10 | Owner content |
| P1-11 | UX model |
| P1-12 | Architecture |
| P1-13 | Access |
| P2-* | Mixed UX/IA/docs/security hardening |
| P3-* | Polish |

---

## Owner decisions / content required

| Item | Mark |
|------|------|
| Real flagship excursion + pricing/booking rules | OWNER CONTENT REQUIRED |
| Routes / photos rights-cleared / reviews or opt-out | OWNER CONTENT REQUIRED |
| Site contacts phone/email completeness | OWNER CONTENT REQUIRED |
| Keep vs unpublish seed products/AR | OWNER DECISION REQUIRED |
| Whether navigation/home CTAs should become CMS-owned | OWNER DECISION REQUIRED |
| CRM status vocabulary (booked vs closed) | OWNER DECISION REQUIRED |
| Whether Events stay in owner menu while empty | OWNER DECISION REQUIRED |
| Deactivate or replace production guide `slug=Slug` | OWNER / CONTENT.1 (CMS now allows; prod not mutated in ADMIN.B) |

---

## ADMIN.B remediation mapping (2026-09-11)

| Issue | Severity | Resolution | Evidence |
|-------|----------|------------|----------|
| ADMIN-A-P1-01 Excursion revalidate | P1 | **resolved** | `lib/revalidate-paths.ts`, `app/api/revalidate/route.ts`, `test:admin-b` |
| ADMIN-A-P1-02 Reviews hidden | P1 | **resolved** | `Reviews.ts` unhidden + status; `public-reviews.ts` |
| ADMIN-A-P1-03 Guides hidden / placeholder | P1 | **partial** | Unhidden + access filter + safety hook; prod placeholder not mutated |
| ADMIN-A-P1-04 Manual slug | P1 | **resolved** | `lib/slug.ts`, `payload/hooks/auto-slug.ts` on owner collections |
| ADMIN-A-P1-05 Excursion price publish | P1 | **resolved** | `publish-guards.ts` server beforeValidate |
| ADMIN-A-P1-06 Nav/false editability | P1 | **partial** | Hide unused nav/mainNav; Site Settings notes; wiring deferred |
| ADMIN-A-P1-07 Editor role | P1 | **partial** | UI warning only; RBAC → ADMIN.E |
| ADMIN-A-P1-11 Articles dual status | P1 | **partial** | Help text clarified; model sync → later |
| ADMIN-A-P1-12 `/api/routes` shadow | P1 | **deferred** | Documented; rename needs consumer migration |
| ADMIN-A-P1-13 World-readable hidden | P1 | **partial** | places/partners staff-only; reviews/guides filtered; full matrix → ADMIN.E |
| ADMIN-A-P2-01 Flat menu | P2 | **resolved** | `admin.group` IA |
| ADMIN-A-P2-02 Route form overload | P2 | **partial** | Tabs + publish checklist UI (ADMIN.C); full wizard still not required |
| ADMIN-A-P2-03 Orphan Places/Partners | P2 | **resolved** (hide) | hidden + staff-only; schema kept |
| ADMIN-A-P2-04 Dead CMS fields | P2 | **partial** | Obvious dead hidden; more wiring TBD |
| ADMIN-A-P3-02 Missing RU labels guides/reviews | P3 | **resolved** | labels added |
| ADMIN-A-P0-* / P1-08/09/10 / P2-05… | — | **deferred** | ADMIN.D/E / CONTENT.1 |

---

## ADMIN.C remediation mapping (2026-09-11)

| Issue | Severity | Resolution | Evidence |
|-------|----------|------------|----------|
| ADMIN-A-P2-05 Dashboard incomplete | P2 | **partial** | Owner «Главная» + readiness + leads + open site; local E2E NOT PROVEN |
| ADMIN-A-P3-01 Dashboard developer tone | P3 | **resolved** | Owner copy / operational blocks |
| ADMIN-A-P2-02 Route cognitive load | P2 | **partial** | Publish checklist UI; no multi-step wizard |
| ADMIN-A-P2-08 Photo rights UX | P2 | **deferred** | Empty-state copy only; guided rights UI later |
| Placeholder guide visibility | P1 carry | **dashboard warn** | Attention «Профиль гида не готов»; prod data untouched |
| Publish visibility before error | P1 carry | **partial** | Shared checklist UI + ADMIN.B guards authoritative |
