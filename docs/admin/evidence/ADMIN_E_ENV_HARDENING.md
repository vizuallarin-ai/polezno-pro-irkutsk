# ADMIN.E — Production env hardening evidence

**No secret values in this file.**

## Finding triage

Prior closeout noted `.env.production` permissions class `777`.

Production inspection (ADMIN.E final):

| Path | Type | Mode | Owner:Group |
|---|---|---|---|
| `/var/www/polezno-shared/.env.production` | **real file (canonical)** | **600** | `root:root` |
| `/var/www/polezno-current/.env.production` | symlink → shared | symlink metadata `777` (`lrwxrwxrwx`) | `root:root` |

Linux always reports symlink metadata as `777`. Effective ACL is the **target** file mode.

## Runtime contract

| Item | Value |
|---|---|
| PM2 app | `polezno` |
| Process user | `root` |
| CWD | `/var/www/polezno-current` |
| Env load | Next/PM2 reads shared `.env.production` via release symlink |
| Runtime can read env | **yes** (`root` + mode `600`) |

Preferred target `600` is already satisfied. No `chmod`/`chown` mutation was required on the target file.

## After verification

| Check | Result |
|---|---|
| `/api/health` | `200` / `ok` |
| `database` | `up` |
| Production application SHA | `b3a51ba8500bb03b5f1124feab567bee3a313824` (unchanged) |
| Secrets printed | **no** |

## Verdict

**PRODUCTION ENV PERMISSIONS HARDENED / ALREADY SAFE**

Unsafe world-writable env file was **not** present on the canonical target. Symlink `777` was a false positive from `ls` on the link node.
