# ADMIN.E — API security evidence

## Namespace moves

| Before | After | Consumers updated |
|---|---|---|
| `POST /api/leads` (shadowed Payload) | `POST /api/public/leads` | Lead/business/souvenir/AR forms + release-smoke |
| `GET /api/routes` (shadowed Payload) | `GET /api/public/routes` | No frontend fetch consumers found; map uses Local/`getRoutesForMap` |

Effect: Payload REST for `leads` / `routes` collections is no longer masked by App Router handlers. Collection access remains authoritative (anon cannot create/read leads).

## Revalidate

`POST /api/revalidate`:

- Requires `REVALIDATE_SECRET` via `x-revalidate-secret` (missing secret → 401)
- Body size guard (413 > 4KB)
- Type checks on `collection` / `slug`
- Paths/tags only from allowlisted matrix (`lib/revalidate-paths.ts`) — no arbitrary path injection

## Health

`GET /api/health` returns identity + `database` up/down — no `DATABASE_URL`, no stack traces, no secrets.

## Rate limit

In-memory lead rate limit (`lib/lead-spam`) — **ACCEPTED RISK** on single-instance VPS (resets on process restart). Redis not introduced in ADMIN.E.

## CSRF / forms

Public lead POST: honeypot + min fill time + IP rate limit + Zod + server-forced CRM fields (`status=new`). Unexpected CRM injection rejected by design (ADMIN.D invariant preserved).

## GraphQL

Disabled (prior gates).

## Classification snapshot

| Endpoint | Class |
|---|---|
| `/api/public/leads` | PUBLIC intake |
| `/api/public/routes` | PUBLIC read |
| `/api/revalidate` | INTERNAL secret |
| `/api/health` | PUBLIC ops |
| `/api/newsletter`, `/api/photos/submit`, `/api/qr` | PUBLIC limited |
| Payload `/api/*` | AUTH / published filters |
| `/admin/*` | AUTH staff |
