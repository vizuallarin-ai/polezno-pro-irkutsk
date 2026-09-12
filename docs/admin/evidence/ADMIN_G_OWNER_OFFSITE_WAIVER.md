# ADMIN.G — Owner offsite waiver

**Recorded:** 2026-09-12  
**Gate:** ADMIN.G production rollout continuation

## Owner statement (accepted)

Owner explicitly authorized continuing ADMIN.G **without** LIVE offsite backup.

Accepted risk: **on-host-only** backup (DB + media on VPS; restore proof exists).

LIVE S3/offsite is **not** a hard blocker for this ADMIN.G rollout.

## Policy labels (mandatory in final report)

| Label | Value |
|---|---|
| OFFSITE BACKUP | **DEFERRED BY OWNER** |
| ON-HOST BACKUP RISK | **ACCEPTED BY OWNER** |

## Operator constraints from waiver

- Do **not** provision S3 / bucket / external storage for this gate
- Do **not** stop ADMIN.G again solely due to missing offsite
- Continue: fresh backup → migration → deploy exact `fee5618…` → verify → owner access → post-backup → report

## Prior STOP context

ADMIN.G first pass (`77dd4e4`) stopped under ADMIN.F hard-blocker interpretation. This waiver supersedes that stop for offsite only.
