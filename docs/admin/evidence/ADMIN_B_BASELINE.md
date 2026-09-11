# ADMIN.B — Pre-change / post-change baseline

**Date:** 2026-09-11  
**Gate:** ADMIN.B  
**Starting HEAD:** `028c9d442439bec076a24b7b55d8f44070a3c248` (ADMIN.A audit)

## Repository identity (PROVEN)

| Item | Value |
|------|-------|
| Repo | `D:/AI_WORKSPACE/Projects/PoleznoProIrkutsk` |
| Branch | `phase15-ux-funnel-hardening` |
| Origin | `https://github.com/vizuallarin-ai/polezno-pro-irkutsk.git` |
| Starting SHA | `028c9d4` |
| Production SHA (ADMIN.A / before ADMIN.B) | `b3a51ba8500bb03b5f1124feab567bee3a313824` |
| Payload | `^3.85.0` |
| Next.js | `16.2.6` |
| Worktree before | Untracked only (`####/`, PDFs, phase15 scripts, `Alena.jpg`); no dirty tracked app files |

## ADMIN.A findings re-verified on HEAD

| Finding | Status on HEAD before ADMIN.B |
|---------|-------------------------------|
| Flat menu / no owner groups | CONFIRMED |
| Reviews/Guides `hidden: true`, group «Позже» | CONFIRMED |
| Places/Partners orphan + `read: () => true` | CONFIRMED |
| Navigation `mainNav` unused; CTA used | CONFIRMED |
| Manual slug / `validateRequiredSlug` only | CONFIRMED |
| Excursion price optional on publish | CONFIRMED |
| Excursion revalidate → only `/business` | CONFIRMED |
| Articles dual `_status`+`status` | CONFIRMED |
| Editor role cannot open admin | CONFIRMED |
| Guide placeholder filtered by readiness; REST open | CONFIRMED |

## What changed after ADMIN.A (before this gate)

Application code: **unchanged** since ADMIN.A commit (docs-only).

## ADMIN.B touch list (planned → done)

- All `payload/collections/*`, `payload/globals/*`, `payload.config.ts`
- `payload/access.ts`, `payload/validators.ts`, hooks (auto-slug, publish-guards, revalidate paths)
- `app/api/revalidate/route.ts`, `lib/slug.ts`, `lib/revalidate-paths.ts`, `lib/public-reviews.ts`
- Docs under `docs/admin/`

## Consciously deferred

| Item | Gate |
|------|------|
| Owner dashboard / wizards | ADMIN.C |
| Lead CRM nextContact / overdue | ADMIN.D |
| Versions outside articles; archive-first delete; full RBAC; offsite backup | ADMIN.E |
| Owner acceptance | ADMIN.F |
| Real owner content / unpublish demo catalog | CONTENT.1 |
| Rename `/api/routes` collision | later (documented) |

## Production after ADMIN.B local work

- Writes: **none**
- Deploy: **none**
- SHA must remain `b3a51ba…` until explicit deploy
