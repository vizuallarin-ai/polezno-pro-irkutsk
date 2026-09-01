# Phase 15 — Commercial Core Launch (local Gate B checkpoint)

**Дата:** 2026-09-01  
**Сайт:** https://irkportal.ru  
**Ветка (local only):** `phase15-commercial-core-launch`  
**Production mutations:** none in this checkpoint

---

## Scope

Phase 15 переводит платформу к управляемому коммерческому запуску. Этот checkpoint закрывает **локальный Gate B** при заблокированной production identity.

## Gate B — что сделано локально

| Item | Change |
|------|--------|
| Release identity | `GET /api/health` → `{ project, status, commitSha, buildTimestamp }` |
| Build env | `GIT_COMMIT_SHA`, `BUILD_TIMESTAMP` через `next.config.ts` + `scripts/build-release.mjs` |
| Sitemap observability | Structured JSON log in `getCmsUrls()` error branch (no DSN/PII) |
| Contract checks | `npm run check:phase15` |
| Prod smoke extension | `EXPECTED_GIT_SHA` compare in `npm run check:prod` |
| Lint floor | 4 errors → 0 |
| Docs truth | README Stripe removed; lead-only sales model |
| Content manifest | `docs/phase15-content-input-manifest.md` |

## Health / build identity contract

```
GET /api/health
{
  "project": "irkportal",
  "status": "ok",
  "commitSha": "<GIT_COMMIT_SHA or unknown>",
  "buildTimestamp": "<ISO or unknown>"
}
```

- Без filesystem paths, env values, DB details, secrets.
- `commitSha === "unknown"` → production SHA acceptance **FAIL**.
- Deploy/build должен задавать `GIT_COMMIT_SHA=$(git rev-parse HEAD)`.

## Sitemap

- Классификация сохранена: **NOT REPRODUCED / OBSERVABILITY GAP**
- Семантика query не менялась; добавлен sanitized logging + regression checks.

## Isolated build

```bash
# Требует .env.local с локальным DATABASE_URL (не production)
npm run build:release
```

Build-time DB dependency: Next.js SSG + Payload `generateStaticParams` / CMS pages требуют PostgreSQL at build. На VPS build выполняется рядом с local Postgres (`docs/DEPLOY-BEGET.md`).

## Env (имена только)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL (local on VPS) |
| `PAYLOAD_SECRET` | Payload CMS |
| `NEXT_PUBLIC_SERVER_URL` | Canonical URL |
| `GIT_COMMIT_SHA` | Release identity at build |
| `BUILD_TIMESTAMP` | Release identity at build |
| `RESEND_API_KEY` | Lead email (optional) |
| `EMAIL_FROM` / `EMAIL_TO` | Email sender/recipient |
| `REVALIDATE_SECRET` | ISR revalidation |
| `NEXT_PUBLIC_YANDEX_MAPS_API_KEY` | Maps |
| `YANDEX_ROUTER_API_KEY` | Route geometry (optional) |
| `NEXT_PUBLIC_YANDEX_METRIKA_ID` | Analytics |

## Sales model

**Lead → ручное согласование.** Online payment / Stripe checkout **не используются**.

## Blockers (open)

- Production SHA unknown (no SSH)
- Gate C content not owner-approved
- Resend E2E not tested
- Deploy of this branch not performed

## Next gates

- **Gate A (remaining):** SSH read-only → live SHA, PM2, backup proof  
- **Gate C:** owner content per manifest  
- **Gate D:** backup → deploy → CMS publish → lead/email E2E  
