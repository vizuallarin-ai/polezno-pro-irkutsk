# ADMIN.B — Field → consumer audit (owner collections)

**Date:** 2026-09-11  
**Legend:** USED · CONDITIONAL · LEGACY · DEAD · UNKNOWN

## Excursions

| Field | Category | Consumer |
|-------|----------|----------|
| title, slug, status, format | USED | listing/detail/map |
| shortDescription, fullDescription | USED | detail |
| price, priceOnRequest, duration, groupSize | USED / CONDITIONAL | detail pricing UI |
| includes, excludes | CONDITIONAL | detail lists |
| cover, coverUrl | CONDITIONAL | cover helper |
| relatedRoutes, guide | CONDITIONAL | relations |
| showInRoutesPage, isFeatured | USED | map filter / flags |
| content (Lexical) | DEAD | hidden in admin; not rendered |
| seo.* | CONDITIONAL | metadata helpers |

## Routes

| Field | Category | Consumer |
|-------|----------|----------|
| title, slug, status, category, format, type, description | USED | map adapters |
| fullDescription, duration, distance, difficulty | USED | detail |
| routePoints.*, routeGeometry.*, geoLine | USED | map geometry |
| isSelfGuided, isGuidedAvailable, isCorporateAvailable, experienceType, priceLabel, booking* | USED | experiences/filters |
| cover/coverUrl | CONDITIONAL | cover |
| audioGuide, pdfGuide, schedule | CONDITIONAL | map sidebar when present |
| stripeProductId | LEGACY | hidden |
| providerRawResponse | LEGACY | hidden via condition |
| seo.* | CONDITIONAL | metadata |

## Articles

| Field | Category | Consumer |
|-------|----------|----------|
| title, slug, status, _status, excerpt, content, category | USED | explore |
| coverImage/coverUrl, tags, publishedAt, authorName | USED / CONDITIONAL | cards/detail |
| relatedRoute/Excursion | CONDITIONAL | related blocks |
| relatedPlaces | DEAD | hidden (places orphan) |
| author (legacy) | LEGACY | already hidden |
| geo-ish sidebar (street/place/…) | CONDITIONAL | explore metadata |

## Photos

| Field | Category | Consumer |
|-------|----------|----------|
| title, slug, image, status, moderation*, rights* | USED | explore/photos + gates |
| category, year, street, place, description | USED / CONDITIONAL | archive |
| alt via media | USED | a11y |

## Reviews

| Field | Category | Consumer |
|-------|----------|----------|
| author, text, city, photo | USED | `getFeaturedPublicReviews` |
| rating, serviceType | CONDITIONAL | admin/list |
| status (new) | USED | public access + query |
| isFeatured | USED | home filter |

## Guides

| Field | Category | Consumer |
|-------|----------|----------|
| name, slug, photo, bio, quote, specialization, experience, languages | USED | `/about/guides` |
| isActive, order | USED | listing filter/sort |
| isFeatured | UNKNOWN / CONDITIONAL | not primary home path |
| routes relation | CONDITIONAL | not heavily rendered |

## Site settings

| Field | Category | Consumer |
|-------|----------|----------|
| projectName, author*, contact.*, footer* | USED | layout/about/contact |
| hero* / mainCta / secondaryCta | CONDITIONAL | some home CTAs still code-owned |
| defaultSeo / leadSettings | USED | SEO + forms |
| manifesto, heroVideo, stats, socialLinks legacy, ogImage legacy | LEGACY / CONDITIONAL | tab «Служебное» |

## ADMIN.B actions on dead/confusing

- Hide: excursion.content, event.fullDescription, event.hasApplicationForm, article.relatedPlaces, navigation.mainNav, route.stripeProductId (already)
- Clarify: dual article publish help text; site-settings false-editability note on Hero tab
- Do **not** drop DB columns
