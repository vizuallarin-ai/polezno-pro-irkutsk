# SEO.1 — Technical SEO Readiness

## 1. Baseline

| Field | Value |
| --- | --- |
| Branch | `phase15-ux-funnel-hardening` |
| Starting SHA | `05930bd2a56c284bc3224afcd9ddad8708dd8edc` |
| Ending SHA | `7c65e968ed7e4337fdd0f913f1f6892c1eabe58a` |
| Live production SHA | `7a6d971e81ecccc781a91e95ade257090f94a08a` |
| Deploy in SEO.1 | **NO** |
| Production DB mutation | **NO** |

Owner CMS shelves at gate start: excursions/routes/reviews/photos/site_settings = 0.

## 2. Route inventory

| Route | Type | Empty-capable | Index |
| --- | --- | --- | --- |
| `/` | static | n/a | yes |
| `/map` | static + client UI | yes (catalog empty UI) | yes |
| `/map/[slug]` | CMS / demo SSG | n/a | only published route (`dynamicParams=false`) |
| `/explore` | static + CMS featured | yes | yes |
| `/explore/[slug]` | category hub **or** article | category empty UI | category yes; article only if published |
| `/explore/photos` | CMS shelf | yes | yes only when photos exist |
| `/explore/photos/[slug]` | CMS | n/a | only with meaningful description |
| `/explore/photos/submit` | form | n/a | noindex |
| `/events` | CMS shelf | yes | yes only when events exist |
| `/events/[slug]` | CMS SSG | n/a | published + readiness only |
| `/souvenirs` | CMS shelf | yes | yes only when products/makers exist |
| `/souvenirs/[slug]` | CMS SSG | n/a | published only |
| `/souvenirs/makers/[slug]` | CMS SSG | n/a | published only |
| `/souvenirs/success` | success | n/a | noindex |
| `/souvenirs/submit-maker` | form | n/a | noindex |
| `/ar-postcards` | CMS shelf | yes | yes only when postcards exist |
| `/ar-postcards/[slug]` | CMS SSG | n/a | published only |
| `/excursions/[slug]` | CMS SSG | n/a | published only |
| `/business` | static B2B | n/a | yes |
| `/about` | static | n/a | yes |
| `/about/guides` | CMS shelf | yes | yes only when guides exist |
| `/contact` | static + form | n/a | yes (self-canonical; query ignored) |
| `/privacy` | static | n/a | yes (deliberate) |
| `/program` | redirect → `/business` | n/a | n/a |
| `/admin`, `/api/*` | private | n/a | disallow via robots |

## 3. Indexation matrix

| Route type | Index? | Condition |
| --- | --- | --- |
| Home / core sections | yes | real public page |
| Explore categories | yes | editorial hub copy exists |
| Explore article | yes | published-ready article |
| Excursion / route detail | yes | published-ready entity + SSG slug |
| Events / souvenirs / AR / guides / photos hubs | conditional | noindex while empty |
| Photo detail | conditional | index only with non-empty description |
| Filter/query URLs | canonicalize | `/map?…`, `/contact?…` → clean canonical |
| Success / submit forms | noindex | always |
| 404 / missing entity | noindex | routing 404 (`dynamicParams=false` / global-not-found) |
| Draft / preview | no | readiness gate + not in sitemap |

## 4. Metadata architecture

- Root defaults: `app/(site)/layout.tsx` — `metadataBase`, title template `%s | Иркпортал`, OG/Twitter defaults, Google verification token.
- **No inherited `canonical: "/"`** (removed in SEO.1).
- Page-specific: static `metadata` or `generateMetadata`.
- CMS entities: `lib/seo-metadata.ts` → `buildPageMetadata` (title/description/OG/Twitter/canonical).
- Helpers: `lib/seo/title.ts`, `lib/seo/canonical.ts`, `lib/seo/robots-policy.ts`.

## 5. Canonical policy

- Host: `https://irkportal.ru` (`lib/site-url.ts` / `DEFAULT_SITE_URL`).
- Middleware 308: `www.irkportal.ru` → apex.
- Trailing slash: Next default `trailingSlash: false` (slash → non-slash).
- Query/tracking: self-canonical on clean paths (`/map`, `/contact`, etc.).
- `/excursions` permanent redirect → `/map` (no `?filter=` doorway).

## 6. Robots

Endpoint: `/robots.txt` (`app/robots.txt/route.ts`)

- Allow `/`
- Disallow `/admin`, `/admin/`, `/api/`, success/submit forms
- `Host: irkportal.ru`
- `Sitemap: https://irkportal.ru/sitemap.xml`

## 7. Sitemap

Endpoint: `/sitemap.xml` (`app/sitemap.ts`)

- Absolute `https://irkportal.ru…` URLs only
- Core static always; empty CMS shelves **omitted**
- Dynamic entities only when `isSitemapEligible` (published-ready)
- Photos in sitemap only with non-empty description
- `lastmod` only from real `updatedAt` (no `new Date()` spam on static rows)
- Empty excursions/routes → zero detail URLs (normal)

## 8. Structured data

| Schema | Where | Fact-safe notes |
| --- | --- | --- |
| Organization | site layout | no street/phone/hours; no default email claim |
| WebSite | site layout | no SearchAction |
| Article | explore article | real title/excerpt/dates/author if present |
| TouristTrip | route / excursion detail | price only if > 0 |
| Event | event detail | offers only with numeric price |
| Product | souvenir detail | offers only if price > 0 |
| BreadcrumbList | detail pages | real hierarchy |
| Person | helper only | not rendered until CONTENT.1 |

JSON-LD serialized via `serializeJsonLd` (`<` → `\u003c`).

## 9. Dynamic CMS contract

See `docs/SEO_CONTENT_CONTRACT.md`.

Publish → readiness → sitemap → indexable.

## 10. Empty-content safety

- No fake excursions/routes/reviews invented
- Sitemap does not list empty shelves or missing entities
- Schema does not claim TravelAgency / AggregateRating / fake prices
- Soft-404 addressed: `dynamicParams=false` + `globalNotFound` + removed catch-all that forced streamed 200

## 11. Status codes / redirects

| Case | Behavior |
| --- | --- |
| Missing entity slug | routing 404 (SSG allowlist) |
| Unknown path | `global-not-found` |
| `http://` → `https://` | nginx (observed) |
| `www` → apex | Next middleware 308 |
| `/program`, `/for-companies` | → `/business` |
| `/shop*` | → `/souvenirs*` |
| `/excursions` | → `/map` |

**Production note (pre-SEO.1 deploy):** live `7a6d971e` still streams `notFound()` as HTTP 200 (Next streamed soft-404). Fix ships on this branch; requires release authorization.

## 12. Internal linking

Primary nav: map, explore, business, about. Secondary: events, photos, AR, souvenirs, guides. Footer covers contact + history article link. `/about/guides` is secondary (More menu), not orphan.

Broken chrome risk if `/explore/irkutsk-history` is unpublished on production — CONTENT.1 / owner pack.

## 13. Image / alt policy

- Meaningful images: concise factual alt
- Decorative: `alt=""`
- Brand OG: `/og-default.jpg` 1200×630

## 14. Search engine handoff

Owner actions after public content launch:

1. Confirm Google Search Console property (token already in root metadata)
2. Add Yandex Webmaster verification token when issued
3. Submit `https://irkportal.ru/sitemap.xml`
4. Inspect canonical host (apex only)
5. Monitor coverage / soft-404

## 15. Verification

```bash
npm run test:seo
npm run lint
npm run typecheck
npm run build
# against local or staging after start:
SEO_SMOKE_BASE=http://127.0.0.1:3000 npm run seo:smoke
```

## 16. Remaining blockers

- Owner pack still empty (CONTENT.1)
- Yandex verification token not in metadata
- Production soft-404 remains until SEO.1 is released
- nginx www→apex optional hardening (code middleware covers app responses)

## 17. Gate status

```text
GATE SEO.1 CLOSED / TECHNICAL SEO CONTRACT HARDENED / INDEXATION RULES VERIFIED / METADATA AND STRUCTURED DATA READY / SITEMAP AND ROBOTS VERIFIED / DYNAMIC CONTENT SEO-GATED / NO FAKE SEO CONTENT CREATED / PRODUCTION UNCHANGED
```
