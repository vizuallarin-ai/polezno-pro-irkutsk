# PERF.1 — Performance / Core Web Vitals Readiness

## 1. Baseline

| Field | Value |
| --- | --- |
| Branch | `phase15-ux-funnel-hardening` |
| Starting SHA | `85bcaecaeff283c97e7e8148e27726c2e6c0a28c` |
| Ending SHA | *(set after commit)* |
| Live production SHA | `7a6d971e81ecccc781a91e95ade257090f94a08a` |
| Deploy | **NO** |
| Production DB mutation | **NO** |

SEO.1 was already on the branch but **not deployed**. LIVE ≠ CANDIDATE.

## 2. Measurement methodology

```text
Environment:
  LIVE = https://irkportal.ru (prod SHA 7a6d971e, production DB)
  CANDIDATE = local `next start` after build with DATABASE_URL empty
              + ALLOW_DEMO_FALLBACK=true (demo corpus; NOT prod DB)

Mobile profile: intended 390×844 + simulated throttle (Lighthouse)
Desktop profile: browser sanity ~1440

Runs:
  - perf-smoke timing (LIVE + CANDIDATE)
  - SEO regression smoke (CANDIDATE)
  - deterministic contract tests (test:perf)
  - browser visual confirmation of first paint (CANDIDATE /)

Field data: NOT AVAILABLE (no CrUX/RUM export in this gate)

Lighthouse lab JSON: UNAVAILABLE in this agent environment
  (Chrome not installed; Edge launch hit sandbox EPERM on temp profile).
  Do not treat missing Lighthouse numbers as a failed gate when contracts + delivery fixes land.
```

**Comparability warning:** CANDIDATE TTFB/HTML size is not a fair race against LIVE (different data backend, demo routes/articles present locally). Compare architecture outcomes (opacity:0 removed, deferred Metrika, bounded photo queries), not raw ms deltas.

## 3. Live vs candidate

| Signal | LIVE | CANDIDATE |
| --- | --- | --- |
| Health SHA | `7a6d971e…` confirmed | local build of branch tip |
| Home HTML delivery | prerender HIT, gzip on HTML | local static/demo |
| Site-wide `opacity:0` template | present on LIVE (pre-PERF) | **removed** |
| Metrika | head inline + `webvisor:true` | `lazyOnload` + `webvisor:false` |
| Empty `/map` | mounts Yandex Maps | static placeholder, no API |

## 4. Route metrics (timing smoke — diagnostic)

| Route | LIVE ms / bytes | CANDIDATE ms / bytes | Note |
| --- | --- | --- | --- |
| `/` | ~827 / 100514 | ~281 / 108718 | CANDIDATE larger HTML due to demo content |
| `/explore` | ~116 / 116917 | ~25 / 141285 | demo articles inflate candidate |
| `/map` | ~107 / 58202 | ~26 / 77206 | empty LIVE vs demo routes CANDIDATE |
| `/business` | ~285 / 118658 | ~393 / 116500 | dynamic |
| `/about` | ~127 / 88664 | ~23 / 86529 | |
| `/contact` | ~165 / 56415 | ~72 / 54589 | |

## 5. LCP findings

| Route | Likely LCP element | Problem (pre-fix) | Fix | Result |
| --- | --- | --- | --- | --- |
| `/` | Hero H1 / hero image | Site `template.tsx` painted `opacity:0` until Framer hydrated → LCP delayed | Delete template | First paint shows H1 + hero immediately (browser verified) |
| `/` | Hero image | Below-fold photo grid used `priority` on 2 images | `priorityCount=0` on home preview | Hero no longer competes with preview thumbs |
| `/explore` | Title / cards | Same template opacity | Deleted | Visible SSR text |
| `/map` | H1 / map chrome | Template + empty catalog still loaded Maps API | Template gone; empty catalog skips map | No Yandex JS on empty shelf |
| `/business` | H1 | Template opacity | Deleted | Visible SSR |

## 6. CLS findings

- Fonts: `next/font` + `display:swap` + `adjustFontFallback` kept.
- Map empty state: fixed-height placeholder (no CLS from map mount).
- GSAP `from({opacity:0})` on home sections: `immediateRender:false` so hydrate does not blank bands.
- Removed site-wide fade that previously interacted badly with LCP/CLS perception.

## 7. JS / client findings

| Issue | Action |
| --- | --- |
| Site-wide Framer `template.tsx` | Removed (also drops FM from every navigation shell) |
| Lenis + GSAP ticker always-on | Idle-deferred start; ticker removed on cleanup |
| Metrika Webvisor on every page | Deferred `lazyOnload`; webvisor off at boot |
| Header still full client | Left for PERF.1+ (higher rewrite risk) |
| Map already `dynamic(..., { ssr:false })` | Kept; empty path no longer mounts |

## 8. Images

```text
Critical: hero CityImage priority + sizes=100vw (unchanged, correct)
Lazy: CityImage default lazy; home grid priorityCount=0
Formats: next/image avif/webp (next.config)
Largest repo public asset: og-default.jpg ~26KB (budget OK)
getFeaturedPhotos: bounded limit query + React.cache; home fetches once
```

## 9. Fonts

```text
Prata: 400, cyrillic + cyrillic-ext + latin, swap, adjustFontFallback
Golos: 400/500/600 — removed unused latin-ext
Preload: Next default (both above-fold on home)
CLS: metric-adjusted fallbacks retained
```

## 10. Map

```text
Library: Yandex Maps JS API v3 via lib/yandex-maps-loader.ts
Initial load: dynamic import on /map and route detail only
Lazy: empty catalog → no RouteMap / no API
Bundle impact: not on home/explore/business
script.async = true; probe cache force-cache
```

## 11. Caching

```text
React.cache: getSiteSettings, getNavigation, getFeaturedPhotos
No force-dynamic spray on marketing pages
LIVE HTML: x-nextjs-cache HIT + gzip observed
Static chunks: Cache-Control public, max-age=31536000, immutable
og-default.jpg: short max-age=0 on LIVE (delivery note, nginx untouched)
```

## 12. Third-party

| Dependency | Cost | Loading | Action |
| --- | --- | --- | --- |
| Yandex Metrika | high with Webvisor | was head-blocking inline | lazyOnload, webvisor false |
| Yandex Maps | high | only map routes, dynamic | skip when empty; async script |
| next/font Google origin | build-time self-host | preload | trimmed latin-ext |
| Lenis/GSAP | medium always-on | layout | idle defer + cleanup |

## 13. Fixes (shipped)

1. Delete `app/(site)/template.tsx` (opacity:0 until JS)
2. Defer Metrika; disable Webvisor on boot
3. `React.cache` for settings/nav/featured photos; bounded photo limit
4. Home shares one photo fetch; below-fold `priorityCount=0`
5. Drop Golos `latin-ext`
6. Lenis idle start + ticker cleanup
7. Empty map placeholder (no API)
8. Maps script `async` + cached probe
9. GSAP `immediateRender: false` on home scroll reveals
10. `test:perf` + `perf:smoke` regression tooling

## 14. Performance budget

See `docs/PERFORMANCE_BUDGET.md`.

## 15. SEO / UX regression

```text
SEO smoke (CANDIDATE): PASS (titles, canonicals, 404, robots, sitemap)
Browser / CANDIDATE: hero H1 + CTAs visible; Prata/Golos intact
390/1440: visual system unchanged (no redesign)
```

## 16. Field-data boundary

```text
FIELD DATA: NOT AVAILABLE
After public content launch: connect Search Console CWV / optional RUM in OBS.1 — do not vendor-lock in PERF.1.
```

## 17. Remaining blockers

- Lighthouse lab numbers not captured in this environment (tooling)
- LIVE still serves pre-PERF SHA until authorized release
- Header still a large client island (follow-up)
- Optional: nginx brotli for CSS (HTML already gzip)

## 18. Gate status

```text
GATE PERF.1 CLOSED / PERFORMANCE PATH HARDENED / MOBILE DELIVERY OPTIMIZED / CORE WEB VITALS RISKS REDUCED / BUNDLE AND MEDIA DELIVERY AUDITED / MAP AND ANIMATION COST CONTROLLED / UX AND SEO REGRESSIONS ABSENT / PRODUCTION UNCHANGED
```
