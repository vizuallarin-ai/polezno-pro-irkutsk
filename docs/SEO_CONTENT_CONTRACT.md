# SEO Content Contract (for CONTENT.1)

Compact publish rules. Full technical matrix: `docs/SEO_1_TECHNICAL_READINESS.md`.

## Indexable only when published-ready

```text
entity ingested as draft
→ content validation
→ SEO fallback valid
→ canonical path valid
→ media rights / moderation pass (where applicable)
→ owner approval
→ status = published (+ Payload _status published for articles)
→ isPublicPublishedReady / isSitemapEligible
→ public detail + sitemap + index allowed
```

Draft / incomplete / demo markers never enter sitemap and never render as public detail.

## SEO fields (minimal)

Prefer existing CMS `seo` group when present:

| Field | Required? | Fallback |
| --- | --- | --- |
| `seo.title` / `seoTitle` | optional | real entity `title` |
| `seo.description` / `seoDescription` | optional | `excerpt` / `shortDescription` / `description` |
| `seo.image` / OG image | optional | cover → brand `/og-default.jpg` |

Do **not** invent:

- prices, ratings, reviews, guide credentials
- “лучшая экскурсия…” marketing claims
- phone / street address / opening hours for schema
- fake articles, routes, excursions, events

## Title rules

- Detail: `{Real Title}` + layout suffix `| Иркпортал`
- Do not pre-append brand in CMS titles (avoids double brand)
- Home uses absolute title

## Description rules

- Must match page meaning
- No keyword stuffing
- No claims absent from the body

## When URL enters sitemap

- Absolute `https://irkportal.ru…`
- Published-ready only
- Photo detail only if description is non-empty
- Empty collection → zero URLs for that collection (normal)

## Soft-404

Missing slug must be real HTTP 404 (`dynamicParams=false` allowlist). Never ship placeholder “не найдено” with 200.

## Structured data

Emit only facts on the page. Helpers live in `lib/jsonld.ts`. Person/guide schema only after real guide records exist.
