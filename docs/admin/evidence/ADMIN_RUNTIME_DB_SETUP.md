# ADMIN.RUNTIME — Local DB Setup

**Date:** 2026-09-11  
**Gate:** ADMIN.RUNTIME  
**Starting HEAD:** `4142e7b`

## Root cause (why 5432 was previously unavailable)

At ADMIN.B/C/D gate time, evidence recorded port `127.0.0.1:5432` as closed / unreachable.

At RUNTIME diagnosis:

| Check | Result |
|-------|--------|
| Service | `postgresql-x64-16` **Running** (StartType Automatic) |
| Listeners | `0.0.0.0:5432`, `127.0.0.1:5432`, `[::]:5432` |
| TCP test | `Test-NetConnection 127.0.0.1:5432` → **True** |
| Engine | PostgreSQL **16.15** (Windows native install) |
| Docker | **Not installed** — not used |

**Verdict:** Prior blocker was the native Windows PostgreSQL service not accepting connections (stopped/unavailable). No Docker compose path in this project for local Postgres. Recovery = use the already-installed `postgresql-x64-16` service (now Running), not a second parallel DB.

## Project-canonical local DB

| Item | Value |
|------|-------|
| Config source | `.env.local` `DATABASE_URL` |
| Host | `localhost` |
| Port | `5432` |
| Database | `polezno_irkutsk` |
| User | `postgres` |
| Classification | **LOCAL_DISPOSABLE** (hard safety check) |
| Ensure script | `npm run ensure-db` → `DB_EXISTS polezno_irkutsk` |
| Schema push | `npm run db:push` (`scripts/push-db-schema.mjs`, Payload `push: true` in non-production) |

Secrets / full DSN: **not recorded**.

## Safety proof before mutation

```text
host=localhost
port=5432
database=polezno_irkutsk
user=postgres
classification=LOCAL_DISPOSABLE
schema_mutation_allowed=true
```

Production host (`90.156.170.182` / live `irkportal.ru` DB) was **not** used as a substitute.

## What was restored / used

1. Confirmed Windows service `postgresql-x64-16` Running.
2. Confirmed TCP 5432 open.
3. `npm run ensure-db` — database already exists.
4. Ping via `pg` client — connected to local `polezno_irkutsk`.
5. No production dump / PII download.

## Disposable vs production

| Aspect | Local | Production |
|--------|-------|------------|
| Host | `localhost` | VPS (not used) |
| DB name | `polezno_irkutsk` (local instance) | separate VPS instance |
| Writes this gate | local only | **none** |
| Schema sync | local `db:push` | **none** |

## Notes

- Same logical DB name as production example does **not** imply same instance — isolation is by host (`localhost` vs VPS).
- Docker PostgreSQL was not introduced (CLI absent; project uses native local PG + optional VPS disposable tunnels for other gates).
