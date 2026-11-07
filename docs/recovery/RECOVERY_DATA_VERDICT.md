# Recovery Data Verdict

## Final verdict

**Code recovery baseline: PROVEN locally.**

**Production database recovery: NOT PROVEN.**

**Production media recovery: NOT PROVEN.**

The local PostgreSQL database and custom-format dump are usable local recovery/test sources. Their schema and content counts are real for the local environment, but there is no independent evidence tying them to the last production database. The archive named `polezno_local_*` and the existing ADMIN.E evidence identify it as a local recovery artifact, not an offsite production snapshot.

The available media archive is a five-file probe/placeholder archive. It is readable, but it is not a production media library.

## Classification

| Artifact | Classification | Why |
|---|---|---|
| Local PostgreSQL `polezno_irkutsk` | `LOCAL_DEV_DATA` | Local service, local connection string, no production provenance |
| `polezno_local_2026-09-11T12-39-07-446Z.dump` | `LOCAL_DEV_DATA` | `pg_restore --list` PASS, but filename and evidence describe local restore flow |
| `media-probe.tgz` | `TEST_FIXTURE` | Probe archive with 5 tiny placeholder/probe files |
| `public/media/` | `TEST_FIXTURE` | Same probe/placeholder family; no production provenance |
| Beget VPS/on-host backups | `UNVERIFIED` | SSH check timed out; no backup access established |

## What is safe to use

- Use the local dump only for disposable restore rehearsal and schema/application compatibility checks.
- Use the copied dump and media archive as preserved local evidence.
- Use the GitHub/local application baseline for a new-host build after secrets and data source are explicitly selected.

## What must not be claimed

- Do not claim `PRODUCTION_RECOVERED`.
- Do not restore the local dump over a future production database without an owner-approved, independently verified data decision.
- Do not treat local content counts as production content counts.
- Do not treat five probe media files as recovered production media.

## Required external evidence for a production-data verdict

Request from Beget, if available:

1. A PostgreSQL custom/plain dump or PostgreSQL data snapshot with creation timestamp and source host/database provenance.
2. The production Payload media directory/archive.
3. SHA-256 checksums or an independently verifiable transfer record.
4. Any configuration needed for recovery, excluding reuse of compromised secrets.
