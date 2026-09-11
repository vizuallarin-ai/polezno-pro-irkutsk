# ADMIN.E — Versioning policy

## Scope

| Entity | Versions | Drafts (`_status`) | Retention |
|---|---|---|---|
| Articles | Yes | Yes (autosave) | maxPerDoc **40** |
| Excursions | Yes | No | maxPerDoc **25** |
| Routes | Yes | No | maxPerDoc **25** |
| Reviews | Yes | No | maxPerDoc **25** |
| Guides | Yes | No | maxPerDoc **25** |
| Photos | Yes | No | maxPerDoc **25** |
| Site Settings | Yes | No | max **25** |
| Events / Products / AR / Leads | No | — | Deferred (storage vs need) |
| Media binaries | N/A | — | File backup separately |

Canonical config: `payload/versioning.ts`.

## Why not drafts on commercial collections

Those collections already have custom `status` (`draft|published|hidden|archived`). Enabling Payload drafts would create a second publish control. Articles keep drafts for historical reasons; sync hook aligns `_status` with custom `status`.

## Articles dual status (ADMIN-A-P1-11)

- **Canonical owner lifecycle:** custom field `status` (supports archive/hide).
- **Payload drafts:** `_status` kept in sync by `articleStatusSyncBeforeChange`.
- **Public read:** requires **both** `status=published` and `_status=published` (defense in depth).
- Owner list columns no longer surface `_status`.

## Retention rationale

Small project, occasional edits to flagship docs, rich text + media refs. 25 versions ≈ months of history without unbounded Postgres growth. Articles slightly higher (40) due to autosave draft churn.

## Restore UX

In Payload Admin → document → Versions → Restore. Proven locally: `docs/admin/evidence/ADMIN_E_VERSION_RESTORE.md`.

## Leads

No versions. CRM terminal statuses replace delete; history array deferred (not required for ADMIN.E CLOSED/PARTIAL).
