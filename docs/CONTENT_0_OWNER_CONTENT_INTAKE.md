# CONTENT.0 — Owner Content Intake / Validation / Normalization

## 1. Purpose

Подготовить безопасный конвейер приёма реальных материалов владельца **без** fake content и **без** mutation production CMS.

Финальное состояние gate:

```text
OWNER CONTENT PIPELINE READY
VALIDATION CONTRACTS READY
NORMALIZATION WORKFLOW READY
PREVIEW INGEST FORMAT READY
NO FAKE CONTENT CREATED
NO PRODUCTION CONTENT MUTATION
```

## 2. Current CMS model

Источник истины — Payload collections/globals в репозитории.

| Entity | CMS | Draft/publish | Notes |
| ------ | --- | ------------- | ----- |
| Excursions | `excursions` | `status` draft/published/… | required: title, slug, format, shortDescription |
| Routes | `routes` | `status` | points require lat/lng; geometry hooks |
| Reviews | `reviews` | none (admin hidden) | required: author, text; **no source/permission fields** |
| Guides | `guides` | `isActive` (admin hidden) | required: name, slug, photo, bio |
| Photos | `photos` | status + moderation + rights gates | strong rights enforcement |
| Media | `media` | visibility public/private | upload to `public/media` |
| Site settings | global `site-settings` | always readable | contacts, author, SEO, lead settings |
| Events / Articles | collections | status (+ articles versions/drafts) | not minimum launch pack |
| Business / Contacts | **no collection** | — | pages + leads + site-settings |

Localization: Payload i18n admin UI `ru`/`en`, **не** per-document localized content fields.  
Versioning: articles only (drafts). Excursions/routes use status select, not Payload versions.

Подробный mapping: `lib/content-intake/mapping.ts`.

## 3. Owner content contracts

Machine-readable Zod: `lib/content-intake/schemas.ts`.

Human staging: `docs/owner-content/*.md` + template `OWNER_CONTENT_TEMPLATE.md`.

Contracts cover: excursion, route, review, guide, site settings, media, pricing/booking.

## 4. Minimum launch pack

Нужно минимум:

1 flagship excursion · 1 route · 1 guide · 1 real review · 3–5 photos · site contacts · price + booking rules.

Текущий статус: **OWNER_CONTENT_STILL_BLOCKED** (`docs/owner-content/pack.json` пуст).

## 5. Intake statuses

Field: `PRESENT | MISSING | AMBIGUOUS | UNVERIFIED | INVALID | DERIVED | SYSTEM_GENERATED | OWNER_CONFIRMATION_REQUIRED | READY`

Entity: `NOT_RECEIVED → … → READY_FOR_INGEST → READY_FOR_PUBLISH`  
CONTENT.0 **никогда** не ставит `PUBLISHED`.

## 6. Validation

`validateOwnerPack()` — blockers vs warnings; optional gaps ≠ ingest blockers.

```bash
npm run content:intake:validate
```

Non-zero exit только при blocking invalid **полученного** pack.

## 7. Normalization

`normalizeOwnerPack()`: trim, phones, dates, line breaks, slug candidate, price structure detection, duplicate filenames/checksums.

**Не** добавляет факты, цены, координаты, отзывы.

## 8. Media policy

Rights обязательны для publish. Duplicates детектятся. Quality warnings для low-res hero.  
Raw binaries вне git: `owner-content-private/`.

## 9. Rights / source provenance

Reviews без source → `SOURCE UNVERIFIED`.  
Text blocks: `provenance.source / ownerConfirmed / lastUpdated`.  
AI copy policy: orthography/structure OK; inventing facts forbidden (`AI_COPY_POLICY` in mapping).

## 10. Dry-run plan

```bash
npm run content:intake:plan
```

Shows WOULD_CREATE / UPDATE_CANDIDATE / LINK / SKIP / BLOCKED.  
`productionWrite: false` always in CONTENT.0.  
`--execute` rejected.

## 11. Ingest boundary

CONTENT.1 only after pack received, blockers cleared, rights OK, min pack ready, plan reviewed, **explicit authorization**.

Idempotency via `ownerContentId` + optional `cmsIdMapping` + slug/checksum match → `UPDATE_CANDIDATE`.

## 12. Publication boundary

`READY_FOR_INGEST ≠ READY_FOR_PUBLISH`.

Publish needs: validation pass, owner confirmation, media rights, prices confirmed, booking rules confirmed, preview QA.

Recommended flow: INGEST → DRAFT → PREVIEW → OWNER QA → PUBLISH.  
Gap: reviews/guides lack full draft status — document in mapping; do not create production drafts in CONTENT.0.

## 13. Client clarification flow

`formatClientClarification()` / `OWNER_MISSING_FIELDS.md` — human questions, no CMS jargon.  
Ничего не отправляется клиенту автоматически.

## 14. Security / privacy

- Secrets / raw PII / client binaries → not in git (`owner-content-private/`)
- Templates + empty pack + schemas → git OK
- Review PII: минимальное approved display name
- Lead notification email stays admin-only in CMS

## 15. Remaining blockers

- Owner materials not received
- Production content counts remain empty for commercial entities (by design)

## 16. Gate status

```text
GATE CONTENT.0 CLOSED / OWNER CONTENT INTAKE CONTRACTS READY / VALIDATION AND NORMALIZATION PIPELINE READY / DRY-RUN INGEST PLANNING READY / NO FAKE CONTENT CREATED / PRODUCTION CONTENT UNCHANGED / OWNER PACK STILL AWAITED
```

## Handoff to CONTENT.1

Не начинать, пока pack не получен и не авторизован ingest.
