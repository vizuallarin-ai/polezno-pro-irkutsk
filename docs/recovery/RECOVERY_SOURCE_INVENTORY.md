# Recovery Source Inventory

## Scope

- Checked: `D:\AI_WORKSPACE\Projects\PoleznoProIrkutsk`
- Checked known sibling checkout: `I:\Сайты\PoleznoProIrkutsk`
- Checked known independent target: `D:\AI_WORKSPACE\Backups\PoleznoProIrkutsk`
- No broad computer-wide scan was performed.
- No source files, database rows, media, or production systems were mutated during inventory.

## Code

| Source | Result | Evidence |
|---|---|---|
| Local checkout | `AVAILABLE` | `D:\AI_WORKSPACE\Projects\PoleznoProIrkutsk` |
| Branch before recovery work | `phase15-ux-funnel-hardening` | HEAD `0efa04729304eabd77f07743dffbfff9ec006dd6` |
| Recovery branch | `CREATED` | `recovery/polezno-rebrand-20261107` |
| Production application baseline | `AVAILABLE LOCALLY` | `fee5618ad139e6e5c9593bcad552cefeade25089` is an ancestor of local HEAD |
| GitHub origin | `REACHABLE / IN SYNC AT FETCH` | `origin/phase15-ux-funnel-hardening` matched local branch (`0 0`) |
| Worktree state | `DIRTY BEFORE WORK` | Pre-existing untracked artifacts were preserved; no `git clean`/reset used |

## Database and media artifacts

| Source | Path | Timestamp | Size | Validation | Classification | Confidence |
|---|---|---:|---:|---|---|---|
| Local custom dump | `.tmp-admin-e-backup/polezno_local_2026-09-11T12-39-07-446Z.dump` | 2026-09-11 20:39:07 +08 | 347,818 bytes | `pg_restore --list` PASS; custom gzip archive; DB 16.15; 886 TOC entries | `LOCAL_DEV_DATA` | High for local provenance; production provenance not proven |
| Media probe archive | `.tmp-admin-e-media/media-probe.tgz` | 2026-09-11 20:44:32 +08 | 567 bytes | `tar -tzf` PASS; 5 files | `TEST_FIXTURE` | High |
| Current public media tree | `public/media/` | mixed | 5 files, probe/placeholder content | Read-only inventory; no production provenance | `TEST_FIXTURE` | High |
| Sibling checkout artifacts | `I:\Сайты\PoleznoProIrkutsk` | checked 2026-11-07 | no dump/media backup found | Read-only inventory | `UNVERIFIED` | High for absence in checked paths |

## Independent local copies

Created without changing source files:

`D:\AI_WORKSPACE\Backups\PoleznoProIrkutsk\2026-11-07-local-recovery`

| Copy | Size | SHA-256 |
|---|---:|---|
| `database/polezno_local_2026-09-11T12-39-07-446Z.dump` | 347,818 bytes | `8DEA91CF736BE5E7390001FB6D8236E8F9820B0B607900622CC3149552918446` |
| `media/media-probe.tgz` | 567 bytes | `35D278D8ED73DD527447A36596FAFB38C449F62E525A6316317DEEEF7CB34003` |

The copied hashes match the source hashes. This is an independent path outside Git on the same local disk, not an offsite copy and not a production recovery proof.

## Local PostgreSQL read-only probe

- Service: `postgresql-x64-16`, `Running`.
- Database: `polezno_irkutsk`.
- User used for probe: `postgres` from local `.env.local` connection; no credentials were printed.
- Session was forced read-only with `default_transaction_read_only=on` and a statement timeout.
- Payload tables were present, including `articles`, `excursions`, `routes`, `reviews`, `media`, `leads`, `site_settings`, `navigation`, and Payload system tables.

Content counts and latest `updated_at` values:

| Entity | Count | Latest `updated_at` |
|---|---:|---|
| Articles | 4 | 2026-09-11 18:28:08.803 +08 |
| Excursions | 8 | 2026-09-11 20:40:48.161 +08 |
| Routes | 3 | 2026-09-12 13:40:47.668 +08 |
| Reviews | 7 | 2026-09-11 20:40:48.208 +08 |
| Media | 3 | 2026-09-11 18:28:28.407 +08 |
| Leads | 22 | 2026-09-12 13:40:47.877 +08 |

No lead or other personal fields were selected or printed.

## Beget

- Known SSH key path existed locally: `%USERPROFILE%\\.ssh\\irkportal_ed25519`.
- One bounded read-only SSH connection check was attempted against the documented host with strict host-key verification and batch mode.
- Result: connection timeout during SSH banner exchange, exit 255.
- Status: `BEGET VPS = UNAVAILABLE / UNKNOWN`.
- `BEGET RECOVERY = NOT PROVEN`.
- No retry loop, migration, deploy, content write, or backup download was attempted.
