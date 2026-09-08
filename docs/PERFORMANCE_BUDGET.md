# Performance budget (IrkPortal)

Deterministic guards for PERF.1+ regressions. Enforced by `npm run test:perf`.

## Hard contracts

| Guard | Rule |
| --- | --- |
| Page template | No `app/(site)/template.tsx` that hides the tree with `opacity: 0` |
| Metrika | Must use `lazyOnload`; boot must not set `webvisor:true` |
| Fonts | Golos must not load unused `latin-ext` |
| Photos | `getFeaturedPhotos` uses bounded `limit` + `React.cache` |
| Settings/nav | `getSiteSettings` / `getNavigation` request-memoized via `React.cache` |
| Below-fold grids | `EditorialPhotoGrid` defaults `priorityCount=0` |
| Empty map | Prelaunch `/map` must not mount `RouteMap` |
| Maps loader | `script.async = true` |
| Lenis | Must remove GSAP ticker on cleanup |
| OG asset | `public/og-default.jpg` < 200 KB |
| GSAP reveals | Home scroll `from()` uses `immediateRender: false` |

## Soft lab targets (not CI-hard)

```text
LCP <= 2.5 s (lab, mobile)
CLS <= 0.1
INP <= 200 ms (field; lab uses TBT/interaction probes only as proxy)
```

Do not fail CI on single Lighthouse variance. Capture lab artifacts under `.deploy-artifacts/perf-1/` (gitignored).

## Delivery notes (production nginx — read-only)

- Hashed `/_next/static/*`: long-lived immutable cache — expected
- HTML: gzip observed; do not cache HTML forever without release process
- Media under `/media`: not immutable-forever (content can replace paths)
