# Полезно про Иркутск — Rebrand Report

## Decision

- Official public brand: **Полезно про Иркутск**.
- Canonical production hostname: `xn--e1aediabqeeaegncqpq.xn--p1ai`.
- Unicode presentation form: `полезнопроиркутск.рф`.
- Old public brand: **Иркпортал**; retained only where it is historical, an internal identifier, or an explicit legacy label.

## Implemented locally

- Central fallback brand and legacy-name semantics updated in `lib/brand-constants.ts` and `lib/site-settings.ts`.
- Canonical site URL and ASCII IDN host centralized in `lib/site-url.ts`.
- Next.js Server Actions allowed origins and image remote patterns now use the new host.
- Payload admin title, public layout metadata, Open Graph, Twitter metadata, 404 metadata, JSON-LD fallback names, robots/sitemap host generation, QR defaults, and public consent copy now use the new brand/host.
- Public business, souvenirs, AR postcard, photo, about, and privacy copy updated.
- Email defaults and production environment examples updated to the new operational email convention (`polezno.irkutsk.ru`); mailbox/DNS ownership still requires external verification.
- SEO, release, performance, health, seed, and notification privacy checks updated to the new canonical host where they assert public behavior.
- Default Open Graph artwork generator updated; the existing `public/og-default.jpg` must be regenerated/verified as part of the test pass.
- Active deployment and capability documentation updated. Historical evidence and internal identifiers were not globally rewritten.

## Verification evidence

- `npm run typecheck`: PASS.
- `npm run lint`: PASS, 19 pre-existing warnings, 0 errors.
- `npm run test:seo`: PASS.
- `npm run test:admin-f`: PASS, 6 checks.
- `npm run test:readiness`: PASS, 13 checks.
- `npm run build`: PASS; Next.js 16.2.6 compiled, TypeScript completed, 45/45 static pages generated.
- Local `npm start` smoke: `/`, `/admin`, `/api/health`, `/robots.txt`, `/sitemap.xml` returned HTTP 200. Homepage title and Payload admin title contained the new brand.
- No production HTTP, DNS, registrar, database, seed, deploy, or content write was performed.

## Intentionally retained

- Repository name, package name, PostgreSQL database/user names, Payload collection slugs, release project ID `irkportal`, analytics event names, disposable database prefixes, and historical evidence.
- `Иркпортал` in `legacyProjectName` is intentional so the footer can state the former public name after CMS settings are migrated.
- Old `irkportal.ru` remains a blocked production marker in the isolated-build guard and in historical evidence; it is not an allowed origin or image host.

## CMS data boundary

No production CMS mutation was performed. The local database was probed read-only. If a disposable/local CMS dataset is selected for a later content migration, scope it to `site_settings.project_name`, `site_settings.legacy_project_name`, public default SEO fields, and contact/notification settings; do not mass-rewrite article, route, review, or lead content.

Suggested scoped SQL shape for a disposable/local database only (review the returned row before applying; not executed):

```sql
SELECT id, project_name, legacy_project_name
FROM site_settings
WHERE project_name = 'Иркпортал'
   OR legacy_project_name = 'Полезно про Иркутск';

UPDATE site_settings
SET project_name = 'Полезно про Иркутск',
    legacy_project_name = 'Иркпортал'
WHERE project_name = 'Иркпортал'
   OR legacy_project_name = 'Полезно про Иркутск';
```
