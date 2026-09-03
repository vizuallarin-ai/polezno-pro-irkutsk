# Immutable release deploy (Gate 1H)

Local implementation of immutable release directories + atomic current switch for IrkPortal (`polezno-pro-irkutsk`).

**Status:** LOCALLY IMPLEMENTED / FIXTURE TESTED / PRODUCTION EXECUTE AWAITING OWNER  
This document does **not** claim production has been switched.

## Architecture

Under `DEPLOY_ROOT` (default `/var/www` in production; fixtures use a temp dir):

| Path | Role |
|------|------|
| `LEGACY_APP` (`polezno`) | Existing mutable checkout — **never** rewrite its `package-lock.json` during deploy |
| `RELEASES_DIR` (`polezno-releases/<40-char-sha>/`) | Immutable release trees |
| `SHARED_DIR` (`polezno-shared/`) | Shared `.env.production` and `media/` (linked into each release) |
| `CURRENT_SYMLINK` (`polezno-current`) | Active release pointer |

### Switch modes

- **`symlink` (default, production):** create `polezno-current.new` as a directory symlink, then `rename` over `polezno-current`.
- **`pointer` (fixtures / Windows without symlink privilege):** write `polezno-current.new` as JSON `{ "target": "<abs path>" }`, then rename over `polezno-current`.

## Commands

```bash
# Dry-run / preflight only (default) — prints plan, exit 0
npm run deploy:immutable

# Real execute (owner-approved, non-default)
node scripts/immutable-release-deploy.mjs \
  --execute \
  --expected-sha <40-char-hex> \
  --backup-id <backup-id> \
  --switch-mode=symlink

# Fixture tests (tmpdir + pointer mode)
npm run test:deploy-immutable
```

Related preflight (no switch): `npm run deploy:preflight` → `scripts/deploy-prod-safe.mjs`.

## Flags

| Flag | Meaning |
|------|---------|
| `--execute` | Perform mutations; without it, plan only |
| `--expected-sha` | Full 40-char lowercase hex SHA (required with `--execute`) |
| `--backup-id` | Backup id recorded in ledger (required with `--execute`) |
| `--switch-mode` | `symlink` \| `pointer` |
| `--health-port` | Alternate localhost port for pre-switch health (default `3911`) |
| `--project-root` | Repo root for `package.json` / `git rev-parse HEAD` |

## Env

| Variable | Default |
|----------|---------|
| `DEPLOY_ROOT` | `/var/www` |
| `LEGACY_APP` | `polezno` |
| `RELEASES_DIR` | `polezno-releases` |
| `SHARED_DIR` | `polezno-shared` |
| `CURRENT_SYMLINK` | `polezno-current` |
| `DEPLOY_HEALTH_HOOK` | optional `.mjs` health mock for tests |

## Safety rules

1. Default mode is **dry-run** — no mutations.
2. `--execute` requires `--expected-sha` (40 hex) and `--backup-id`.
3. Package name must be `polezno-pro-irkutsk`.
4. Local ancestry stub: `expected-sha` must equal `git rev-parse HEAD` (injectable in tests).
5. Deploy lock file under `DEPLOY_ROOT` prevents parallel runs.
6. **No broad `rm -rf`.** Only delete the deploy lock or `*.new` temp current under an allowed prefix.
7. Never mutate legacy checkout `package-lock.json`.
8. Mutation ledger is written to an artifact file **without secrets**.
9. Pre-switch health must report exact SHA, `identitySource=artifact`, `identityComplete=true`, `worktreeDirty=false`.
10. Post-switch smoke failure triggers **automatic rollback** to previous current.
11. If current already points at the expected SHA, exit success after verification (idempotent).
12. **Retention cleanup is not included** in this gate.

## Modules

- `lib/deploy-path-safety.ts` — path normalize / allowed-prefix / safe release dir name
- `lib/immutable-release.mjs` — pure helpers + `runImmutableReleaseDeploy`
- `scripts/immutable-release-deploy.mjs` — CLI state machine
- `scripts/test-immutable-release-deploy.mjs` — local fixture tests
