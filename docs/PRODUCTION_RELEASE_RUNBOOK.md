# Production Release Runbook — IrkPortal

For another engineer to deploy **after owner authorization**.  
This is not permission to deploy. Default is dry-run / abort.

Related: [RELEASE_1_PRODUCTION_READINESS.md](./RELEASE_1_PRODUCTION_READINESS.md), [OPS_1_PRODUCTION_RUNBOOK.md](./OPS_1_PRODUCTION_RUNBOOK.md), [immutable-release-deploy.md](./immutable-release-deploy.md).

Host: `root@90.156.170.182` · App root model: `/var/www/polezno-*`

---

## 0. Authorization gate

```text
COMMAND: confirm owner written approval for exact SHA
EXPECTED: SHA + window + rollback owner named
IF FAIL → STOP. Do not continue.
```

---

## 1. Pin SHA

```bash
COMMAND: export SHA=<40-char-lowercase-hex>
EXPECTED: echo $SHA | grep -E '^[0-9a-f]{40}$'
IF FAIL → ABORT
```

---

## 2. Local / CI preflight

```bash
COMMAND: git checkout phase15-ux-funnel-hardening && git rev-parse HEAD
EXPECTED: HEAD == $SHA, tracked worktree clean
IF FAIL → ABORT (do not reset blindly)

COMMAND: npm run release:preflight -- --expected-sha "$SHA"
EXPECTED: exit 0
IF FAIL → ABORT DEPLOY

COMMAND: npm run typecheck && npm run lint && npm run check:phase15
EXPECTED: exit 0
IF FAIL → ABORT

COMMAND: npm run test:deploy-immutable && npm run release:rollback-dry-run
EXPECTED: exit 0
IF FAIL → ABORT
```

---

## 3. Disk + current/previous

On VPS:

```bash
COMMAND: df -h /
EXPECTED: Avail ≥ 1.5G (prefer ≥ 3.0G)
IF FAIL → ABORT (cleanup via ops-release-retention dry-run first; never delete current)

COMMAND: readlink -f /var/www/polezno-current
EXPECTED: /var/www/polezno-releases/<current40hex>
IF FAIL → ABORT (unknown rollback target)

COMMAND: ls -1 /var/www/polezno-releases
EXPECTED: current SHA dir + at least one previous proven release
IF FAIL → ABORT (cannot rollback)
```

Record:

```text
CURRENT=<sha>
PREVIOUS=<sha>
TARGET=$SHA
```

---

## 4. Backup

```bash
COMMAND: bash /var/www/polezno-current/scripts/backup-db.sh
EXPECTED: polezno_<UTC>.dump + .sha256, exit 0
IF FAIL → ABORT DEPLOY

COMMAND: export BACKUP_ID=polezno_<UTC>.dump
EXPECTED: non-empty id recorded in deploy notes
IF FAIL → ABORT
```

Optional restore proof (temp DB only):

```bash
COMMAND: DUMP=/var/backups/polezno/$BACKUP_ID bash scripts/backup-restore-dry-run.sh
EXPECTED: RESTORE DRY-RUN OK
IF FAIL → treat backup as untrusted; ABORT high-risk deploy
```

---

## 5. Pre-switch live health

```bash
COMMAND: curl -sf http://127.0.0.1:3000/api/health
EXPECTED: HTTP 200, database=up, commitSha=$CURRENT
IF FAIL → ABORT (fix current before changing anything)
```

---

## 6. Materialize release (immutable dir)

```bash
COMMAND: REL=/var/www/polezno-releases/$SHA
COMMAND: test ! -e "$REL" || echo "release dir exists — verify before rebuild"
EXPECTED: empty new dir or verified prior build for same SHA
IF FAIL → investigate; never overwrite blindly

# clone/checkout exact SHA (see OPS_1_PRODUCTION_RUNBOOK.md)
COMMAND: git checkout --force "$SHA" && git reset --hard "$SHA"
EXPECTED: git rev-parse HEAD == $SHA
IF FAIL → ABORT

COMMAND: ln -sfn /var/www/polezno-shared/.env.production .env.production
COMMAND: rm -f public/media   # must be absent during Turbopack build
EXPECTED: env linked; no media symlink during build
IF FAIL → ABORT

COMMAND: npm ci --include=dev
COMMAND: export NODE_ENV=production GIT_COMMIT_SHA=$SHA BUILD_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%S.000Z)
COMMAND: export NODE_OPTIONS=--max-old-space-size=1536
COMMAND: export PAYLOAD_MEDIA_DIR=/var/www/polezno-shared/media
COMMAND: npm run build && node scripts/write-release-identity.mjs
EXPECTED: .next/ present; release-identity.json commitSha=$SHA
IF FAIL → production untouched; ABORT; delete incomplete release only if never switched

COMMAND: ln -sfn /var/www/polezno-shared/media public/media
EXPECTED: media shared link after build
IF FAIL → fix before switch
```

---

## 7. Switch (atomic)

```bash
COMMAND: ln -sfn "$REL" /var/www/polezno-current.new
COMMAND: mv -Tf /var/www/polezno-current.new /var/www/polezno-current
EXPECTED: readlink -f /var/www/polezno-current == $REL
IF FAIL → do not restart; repair symlink to PREVIOUS
```

Or owner-approved:

```bash
COMMAND: node scripts/immutable-release-deploy.mjs --execute --expected-sha "$SHA" --backup-id "$BACKUP_ID" --switch-mode=symlink
EXPECTED: status switched / idempotent-success
IF FAIL → follow script rollback / ABORT
```

---

## 8. Process reload (OBS.1 — do NOT use bare pm2 restart)

**Incident history:** `pm2 restart` with `script: npm / args: start` left orphan `next-server` on `:3000` → `EADDRINUSE` → restart storm. See `docs/incidents/2026-09-09-pm2-eaddrinuse.md`.

```bash
COMMAND: EXPECTED_SHA="$SHA" bash /var/www/polezno-current/scripts/runtime-restart-safe.sh
EXPECTED: exit 0; health commitSha=$SHA; port :3000 owned by Next under polezno paths
IF FAIL → do not hammer pm2 restart; follow EADDRINUSE procedure in PRODUCTION_INCIDENT_RUNBOOK.md; rollback symlink if needed
```

Fallback only if safe script missing on an old release tree (copy from engineering branch first):

```bash
COMMAND: pm2 stop polezno; ss -ltnp | grep ':3000'   # must be free or expected orphan only
COMMAND: # then pm2 start /var/www/polezno-current/ecosystem.config.cjs --only polezno --env production
```

`ecosystem.config.cjs` must use **direct** `node_modules/next/dist/bin/next` (not npm wrapper).

Downtime class: **short restart window** (single process — not zero-downtime).
`PM2 online ≠ ready` — wait for `/api/health`.

Pre-switch alternate-port smoke: prefer `node scripts/preswitch-smoke-server.mjs --port 3912 --expect-sha "$SHA" --smoke` (trap cleanup).

---

## 9. Post-switch health + smoke

```bash
COMMAND: curl -sf http://127.0.0.1:3000/api/health
EXPECTED: commitSha=$SHA, database=up, app=up, HTTP 200
IF FAIL → CODE ROLLBACK to PREVIOUS immediately (safe restart after symlink retarget)

COMMAND: EXPECTED_GIT_SHA=$SHA SITE_URL=https://irkportal.ru npm run release:smoke
EXPECTED: all routes pass
IF FAIL → ROLLBACK

COMMAND: npm run ops:check   # when OBS.1 scripts present on tree
EXPECTED: OVERALL != UNHEALTHY
```

---

## 10. Rollback (code)

```bash
COMMAND: PREV=/var/www/polezno-releases/<previous40hex>
COMMAND: test -d "$PREV/.next" && test -e "$PREV/.env.production" && test -L "$PREV/public/media"
COMMAND: ln -sfn "$PREV" /var/www/polezno-current.new && mv -Tf /var/www/polezno-current.new /var/www/polezno-current
COMMAND: EXPECTED_SHA="$(basename "$PREV")" bash "$PREV/scripts/runtime-restart-safe.sh" || EXPECTED_SHA="$(basename "$PREV")" bash /var/www/polezno-current/scripts/runtime-restart-safe.sh
COMMAND: curl -sf http://127.0.0.1:3000/api/health
EXPECTED: commitSha of PREVIOUS, database=up
IF FAIL → check nginx, pm2 logs, Postgres; EADDRINUSE runbook; do not keep half-switched state
```

---

## 11. Retention (after SUCCESS only)

```bash
COMMAND: KEEP=2 bash scripts/ops-release-retention.sh
EXPECTED: dry-run lists only older-than-previous candidates
COMMAND: KEEP=2 EXECUTE=1 bash scripts/ops-release-retention.sh
EXPECTED: current + 1 previous remain
IF FAIL → stop; never force-delete
```

---

## 12. Troubleshooting map

| Symptom | First look |
|---------|------------|
| 502 | nginx error log → `pm2 list` → app listening :3000 |
| 500 | `pm2 logs polezno` → Payload/Next stack |
| health 503 / database=down | Postgres service, `DATABASE_URL`, shared env symlink |
| health SHA mismatch | orphan next-server or wrong symlink — see PRODUCTION_INCIDENT_RUNBOOK EADDRINUSE |
| EADDRINUSE / restart storm | `ss -ltnp :3000` → stop PM2 → free expected orphan → safe start (never killall node) |
| Turbopack media panic | media symlink present during build — rebuild without it |
| disk full mid-build | abort; do not switch; free space; delete incomplete release dir |

Logs:

- PM2: `~/.pm2/logs/polezno-*.log`
- nginx: `/var/log/nginx/error.log`
- Postgres: `journalctl -u postgresql`

---

## 13. Lead smoke (optional, owner-approved)

```bash
COMMAND: npm run release:smoke -- --lead-plan
EXPECTED: printed conventions only
# Then POST one marked lead; verify admin; delete marker lead
IF FAIL → investigate API/DB; do not leave test PII
```

---

## 14. Explicit non-goals

- No merge to master from this runbook alone  
- No DNS / secret rotation unless separately approved  
- No owner content ingest in the same change window as code switch  
- No `npm run deploy:prod` without legacy emergency flags  
