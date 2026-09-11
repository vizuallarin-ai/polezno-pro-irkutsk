# ADMIN.RUNTIME — Baseline

**Date:** 2026-09-11  
**Gate:** ADMIN.RUNTIME — Local DB & Consolidated Owner E2E  
**Starting HEAD:** `4142e7b3853472d86b346f4e992af39e98cd86cc`  
**Branch:** `phase15-ux-funnel-hardening`  
**Feature commit ADMIN.D:** `0ec8df5`  
**Production SHA (read-only, expected unchanged):** `b3a51ba8500bb03b5f1124feab567bee3a313824`

## Repository identity

| Check | Value | Verdict |
|-------|-------|---------|
| Root | `D:/AI_WORKSPACE/Projects/PoleznoProIrkutsk` | OK |
| Origin | `https://github.com/vizuallarin-ai/polezno-pro-irkutsk.git` | OK |
| Package | `polezno-pro-irkutsk` · Next `16.2.6` · Payload `^3.85.0` | OK |
| Branch | `phase15-ux-funnel-hardening` (ahead of origin by 6 commits at gate start) | OK |
| HEAD | `4142e7b` (`docs(admin): ADMIN.D CRM architecture and gate evidence`) | OK |
| Worktree | Clean tracked tree; pre-existing untracked leftovers only (`####/`, PDFs, phase15 scripts, `_tmp-*`) — not part of this gate commit scope unless promoted intentionally | OK |

## Prior gate status (historical; not rewritten)

| Gate | Status at RUNTIME start |
|------|-------------------------|
| ADMIN.B | PARTIAL — CODE/TEST-PROVEN, runtime E2E not proven |
| ADMIN.C | PARTIAL — CODE/TEST-PROVEN, runtime E2E not proven |
| ADMIN.D | PARTIAL — CODE/TEST-PROVEN, runtime E2E not proven |

## Shared blocker (historical)

ADMIN.B/C/D documented: local PostgreSQL on `127.0.0.1:5432` unavailable / port closed.

## Production read-only health (gate start)

Source: `GET https://irkportal.ru/api/health` (public, no login, no writes).

| Field | Value |
|-------|-------|
| project | `irkportal` |
| status | `ok` |
| commitSha | `b3a51ba8500bb03b5f1124feab567bee3a313824` |
| buildTimestamp | `2026-09-09T03:12:22Z` |
| database | `up` |
| app | `up` |
| Match expected prod SHA | **YES** |

## Local DATABASE_URL classification (no secrets)

Hard safety check (`scripts/_tmp-db-safety-check.mjs`):

| Field | Value |
|-------|-------|
| host | `localhost` |
| port | `5432` |
| database | `polezno_irkutsk` |
| user | `postgres` |
| classification | **LOCAL_DISPOSABLE** |
| schema_mutation_allowed | **true** |

## Postgres diagnosis snapshot (gate start)

| Check | Result |
|-------|--------|
| Windows service | `postgresql-x64-16` — **Running** / Automatic |
| TCP `127.0.0.1:5432` | **Listen** (True) |
| Docker Postgres | Docker CLI **not installed** — N/A |
| `npm run ensure-db` | `DB_EXISTS polezno_irkutsk` |
| Ping | PostgreSQL **16.15**, db `polezno_irkutsk`, port `5432` |

**Root cause of prior blocker:** at ADMIN.B/C/D gate time the service/port was not accepting connections. At RUNTIME start the native Windows PostgreSQL 16 service is running and reachable; no second DB stack introduced.

## Constraints reconfirmed

- Production: **READ ONLY**
- No production schema sync / migration / login mutation / deploy / push
- No ADMIN.E / RBAC / versions / archive / backups / CONTENT.1
- Bug fixes only if they block ADMIN.B/C/D runtime proof
