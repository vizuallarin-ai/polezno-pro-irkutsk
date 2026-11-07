# REG.RU VPS Bootstrap Report

## Final status

**PRODUCTION PREPARED — DNS/TLS and owner access remain pending.**

REG.RU VPS bootstrap completed without DNS, production traffic, Beget, production data, or `master` changes. Staging remains isolated, and the clean production candidate is also private-only.

The clean production path is now prepared separately from staging. It is not publicly live because DNS still points to the previous address and no TLS/owner-login proof exists yet.

## Local preflight

| Check | Result |
|---|---|
| Branch | `recovery/polezno-rebrand-20261107` |
| Application SHA | `22e71fd0f0bfb80118245220077df5d2f7e3c8fe` |
| Remote sync | `git fetch origin` completed; branch was synchronized before local edits |
| Untracked artifacts | Preserved; no `git clean` or reset used |
| Existing recovery docs/scripts | Read before action |

## Server identity

| Field | Result |
|---|---|
| Provider/target | REG.RU / `79.174.91.110:22` |
| Hostname | `cv8301755.novalocal` |
| Host key | **VERIFIED** — `SHA256:tsXqiEl7n3rBy6BzlJsvd2xdIUzT+0TO5g11nKW5ZY0` |
| SSH authentication | **PASS** — root key and separate deploy key, BatchMode |
| OS | Ubuntu 26.04 LTS, kernel `7.0.0-15-generic` |
| Resources | 2 vCPU, 3.8 GiB RAM, 20 GiB disk, 16 GiB free at preflight |
| Swap | 2 GiB `/swapfile` |

The host key was obtained with `ssh-keyscan` and matched the owner-provided reference before insertion into `known_hosts`.

## Security baseline

- `deploy` is a non-root user with a separate local ED25519 key; its sudo-group membership was removed after setup.
- SSH effective policy: `PasswordAuthentication no`, `KbdInteractiveAuthentication no`, `PermitRootLogin prohibit-password`, public keys enabled.
- UFW is active: SSH/HTTP/HTTPS allowed; PostgreSQL and application ports have no public firewall rule.
- fail2ban and unattended-upgrades are enabled.

## Database and application

- PostgreSQL `16.15-1.pgdg26.04+2` is online and bound only to `127.0.0.1:5432`.
- `polezno_staging` is an empty disposable database with schema applied by `npm run db:push`; no production data, local recovery dump, leads, excursions, reviews, or media were imported.
- Immutable release: `/var/www/polezno-releases/22e71fd0f0bfb80118245220077df5d2f7e3c8fe`; `/var/www/polezno-current` points to it.
- Node.js `22.22.1`, Nginx `1.28.3`, PM2 `7.1.2`.
- PM2 runs `polezno-staging` as `deploy`, with systemd resurrection verified after stopping the daemon.
- Nginx listens only on `127.0.0.1:8080`; Next listens only on `127.0.0.1:3000`.
- Private smoke: `/`, `/map`, `/explore`, `/about`, `/business`, `/contact`, `/admin`, `/api/health`, `/robots.txt`, `/sitemap.xml` all returned HTTP 200.

## Production preparation

- Separate `polezno_production` PostgreSQL database and role created; staging was not reused.
- Production environment is separate at `/var/www/polezno-shared/env/production.env`, mode `600`, with newly generated secrets and canonical URL; values are not recorded here.
- Production release `/var/www/polezno-releases/22e71fd0f0bfb80118245220077df5d2f7e3c8fe-production` was checked out at exact application SHA `22e71fd0f0bfb80118245220077df5d2f7e3c8fe`, schema-pushed, and built successfully.
- Production PM2 process `polezno-production` runs as `deploy` on localhost `127.0.0.1:3001`; private Nginx proxy is `127.0.0.1:8081`.
- Production health reports `identitySource=artifact`, exact SHA, `database=up`, and `app=up`.
- Production users/leads/reviews/excursions/articles/routes/products counts are all zero; no seed or local recovery data was imported.
- Production private smoke returned HTTP 200 for all ten required routes.
- Owner account was not created because no verified owner login email was provided.

## Backups

- Daily `polezno-backup.timer` is enabled and active.
- Local PostgreSQL custom dump, media archive, and SHA256 manifest were created under `/var/backups/polezno`; integrity check passed.
- Retention is 14 days. No independent/offsite copy is configured.
- Separate `polezno-production-backup.timer` is enabled and active; its dump passed SHA256 verification and restore into a temporary disposable database, then the temporary database was removed.

## Application/rebrand fixes prepared locally

- Removed `Ранее — Иркпортал` from the public footer.
- Removed unconfirmed `info@polezno.irkutsk.ru` and `noreply@polezno.irkutsk.ru` fallbacks from active public/default behavior.
- Public email is opt-in through `PUBLIC_CONTACT_EMAIL`.
- Lead notification recipient is accepted only from `EMAIL_TO` and only when the CMS notification flag is enabled.
- Internal identifiers, collection slugs, repository name, and historical evidence were preserved.

## Not performed

- No DNS change, TLS issuance, public launch, production seed, or external mailbox configuration.
- No production database/media restore; available local data remains classified as `LOCAL_DEV_DATA` / `TEST_FIXTURE`.
- Nginx is intentionally private-only until DNS ownership, TLS, and data source are approved.
- Current DNS A lookup for the ASCII host returns `95.163.244.138`, not `79.174.91.110`; DNS was not changed.

## Remaining blockers

- Production content remains intentionally empty; later Beget material import is optional and does not block the clean launch path.
- Configure an independent backup destination before production traffic.
- Complete DNS/TLS cutover only after explicit owner approval.
- Provide the single verified owner login email required by the existing `create-admin.mjs` mechanism.
