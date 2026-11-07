# REG.RU VPS Bootstrap Report

## Final status

**BLOCKED — local release candidate prepared; REG.RU VPS bootstrap not started.**

The requested server-side bootstrap could not be safely started because the target host key is unknown locally and no trusted fingerprint or authentication secret was provided. DNS, production traffic, Beget, production data, and `master` were not changed.

## Local preflight

| Check | Result |
|---|---|
| Branch | `recovery/polezno-rebrand-20261107` |
| Current HEAD | `0f062fef4535de1bae069a47a3d5ada8f58f03c8` before RECOVERY.2 local edits |
| Remote sync | `git fetch origin` completed; branch was synchronized before local edits |
| Untracked artifacts | Preserved; no `git clean` or reset used |
| Existing recovery docs/scripts | Read before action |

## Server identity

| Field | Result |
|---|---|
| Provider/target | REG.RU / `79.174.91.11:22` (declared by task) |
| SSH host key | **NOT VERIFIED** — no matching entry in local `known_hosts` |
| SSH authentication | **NOT ATTEMPTED beyond strict host-key gate** |
| OS/CPU/RAM/disk/swap | **NOT VERIFIED** |

The bounded command used strict host-key checking with the existing project key and stopped with `Host key verification failed`. No password was searched for, recorded, or sent.

## Application/rebrand fixes prepared locally

- Removed `Ранее — Иркпортал` from the public footer.
- Removed unconfirmed `info@polezno.irkutsk.ru` and `noreply@polezno.irkutsk.ru` fallbacks from active public/default behavior.
- Public email is opt-in through `PUBLIC_CONTACT_EMAIL`.
- Lead notification recipient is accepted only from `EMAIL_TO` and only when the CMS notification flag is enabled.
- Internal identifiers, collection slugs, repository name, and historical evidence were preserved.

## Not performed

- No SSH bootstrap, deploy user, firewall, system package installation, PostgreSQL installation, PM2, Nginx, Certbot, swap, or server backup configuration.
- No production database/media restore; local data remains classified as `LOCAL_DEV_DATA` / `TEST_FIXTURE`.
- No DNS change, TLS issuance, public launch, production seed, or external mailbox configuration.

## Required unblock

Provide or confirm the REG.RU server host fingerprint through a trusted channel and provide a safe authentication path (existing authorized public key or interactive password entry). After that, rerun the bounded identity probe before any server mutation.
