# ADMIN.A — Baseline evidence (anonymized)

**Date:** 2026-09-11  
**Gate:** GATE ADMIN.A  
**Mutations:** none

## Repository

| Item | Value | Confidence |
|------|-------|------------|
| Path | `D:/AI_WORKSPACE/Projects/PoleznoProIrkutsk` | PROVEN |
| Project identity | `package.json` name `polezno-pro-irkutsk`; health `project: irkportal` | PROVEN |
| Branch | `phase15-ux-funnel-hardening` | PROVEN |
| HEAD | `95ba8d0c83512f410c0d29342ed0d2cae20f4dc9` | PROVEN |
| Upstream | `origin/phase15-ux-funnel-hardening` | PROVEN |
| Remote | `https://github.com/vizuallarin-ai/polezno-pro-irkutsk.git` | PROVEN |
| Worktree | dirty — only untracked assets/scripts/PDFs; **no modified tracked files** at audit start | PROVEN |
| Next.js | `16.2.6` (`package.json`) | CODE-PROVEN |
| Payload | `^3.85.0` (`package.json`) | CODE-PROVEN |

## Production runtime

| Item | Value | Confidence |
|------|-------|------------|
| Health URL | `https://irkportal.ru/api/health` → HTTP 200 | PROVEN |
| Health body | `status=ok`, `database=up`, `app=up`, `identityComplete=true`, `worktreeDirty=false` | PROVEN |
| Production application SHA | `b3a51ba8500bb03b5f1124feab567bee3a313824` | PROVEN |
| Build timestamp | `2026-09-09T03:12:22.000Z` | PROVEN |
| `/admin` | HTTP 200, `X-Powered-By: Next.js, Payload` | PROVEN |
| `/admin/login` | Login form Email / Password / Login (Payload default chrome) | PROVEN |
| Repo HEAD vs prod | Local HEAD includes OPS.2 docs/runtime commits after `b3a51ba`; live app identity still `b3a51ba` | PROVEN |

## Public smoke (HTTP)

All HTTP 200: `/`, `/map`, `/explore`, `/explore/photos`, `/excursions`, `/souvenirs`, `/ar-postcards`, `/events`, `/about`, `/about/guides`, `/contact`, `/business`, `/admin`.

## CMS content counts (read-only REST / sitemap)

| Entity | Published / public count | Notes | Confidence |
|--------|--------------------------|-------|------------|
| Articles | **8** | Titles match real Irkutsk materials | PROVEN |
| Routes | **0** | Custom `/api/routes` returns `[]`; sitemap map slugs = 0 | PROVEN |
| Excursions | **0** | | PROVEN |
| Photos | **0** | | PROVEN |
| Reviews | **0** | Public REST `read: () => true` | PROVEN |
| Events | **0** | | PROVEN |
| Products | **4** | Catalog seed-like titles; `soon` / `pre_order` | PROVEN |
| AR postcards | **3** | Mix `coming_soon` / `animated_image` | PROVEN |
| Makers | **0** published | | PROVEN |
| Guides | **1** | Placeholder: `slug=Slug`, bio/quote stubs; publicly readable | PROVEN |
| Places | **0** | | PROVEN |
| Partners | **0** | | PROVEN |
| Site settings | Global exists | Defaults present; `contact.phone`/`email` empty; Telegram set; empty `defaultSeo`/`stats` | PROVEN |
| Leads via REST GET | HTTP **405** | Create blocked for public REST (admin-only access) | PROVEN |

## Checks run (local, non-mutating)

| Command | Result |
|---------|--------|
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0 (17 warnings, 0 errors) |
| `npm run test:leads` | 8 passed |
| `npm run test:lead-privacy` | 7 passed |

## Explicitly NOT done

- No production DB writes / seeds / deletes
- No admin login with credentials
- No deploy / PM2 / nginx / backup changes
- No application code edits in this gate
