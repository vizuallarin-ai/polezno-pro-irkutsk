# OPS.1 — Production Hygiene + Release Retention (IrkPortal / Beget VPS)

Concrete commands for `root@90.156.170.182` (`/var/www`).

Related: [immutable-release-deploy.md](./immutable-release-deploy.md), [DEPLOY-BEGET.md](./DEPLOY-BEGET.md), [OPS_1_PRODUCTION_HYGIENE.md](./OPS_1_PRODUCTION_HYGIENE.md).

---

## Topology

| Path | Role |
|------|------|
| `/var/www/polezno-releases/<40-hex-sha>/` | Immutable release trees |
| `/var/www/polezno-current` | Symlink → active release |
| `/var/www/polezno-shared/.env.production` | Shared env (symlink into each release) |
| `/var/www/polezno-shared/media` | Shared uploads/media (symlink into each release **after** build) |
| `/var/www/polezno` | Legacy mutable checkout — **not** PM2 runtime (trim only; optional) |
| PM2 app `polezno` | `cwd=/var/www/polezno-current`, `npm start` |

Nginx proxies `irkportal.ru` → `127.0.0.1:3000`.

---

## DISK CHECK

```bash
df -h /
du -xh --max-depth=1 /var/www | sort -hr
du -xh --max-depth=1 /var/www/polezno-releases | sort -hr
du -sh /var/log/journal /root/.npm /var/www/polezno-shared
journalctl --disk-usage
```

**Pre-deploy gate:** prefer **≥ 3.0G free** (safe); hard minimum ~**1.5–2.0G** for one new ~1.1G release + build scratch. Abort deploy if free &lt; 1.5G.

---

## DEPLOY (immutable release)

Do **not** mutate product code here — only release activation.

```bash
SHA=<40-char-hex>          # expected commit
BRANCH=<git-branch>        # e.g. phase15-ux-funnel-hardening
REL=/var/www/polezno-releases/$SHA
SHARED=/var/www/polezno-shared
REPO=https://github.com/vizuallarin-ai/polezno-pro-irkutsk.git

df -h /
# optional: KEEP=2 EXECUTE=1 bash scripts/ops-release-retention.sh
# (only after a successful prior deploy; never deletes current)

if [ ! -d "$REL/.git" ]; then
  git clone --branch "$BRANCH" --single-branch "$REPO" "$REL"
fi
cd "$REL"
git fetch origin
git checkout --force "$SHA"
git reset --hard "$SHA"

ln -sfn "$SHARED/.env.production" .env.production
mkdir -p public
# CRITICAL: no media symlink during Turbopack build
rm -f public/media

npm ci --include=dev
export NODE_ENV=production
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1536}"
export GIT_COMMIT_SHA="$SHA"
export BUILD_TIMESTAMP="$(date -u +%Y-%m-%dT%H:%M:%S.000Z)"
export PAYLOAD_MEDIA_DIR="$SHARED/media"

npm run build
node scripts/write-release-identity.mjs

# AFTER build only:
ln -sfn "$SHARED/media" public/media

ln -sfn "$REL" /var/www/polezno-current.new
mv -Tf /var/www/polezno-current.new /var/www/polezno-current
cd /var/www/polezno-current
pm2 restart polezno --update-env
sleep 4
curl -s http://127.0.0.1:3000/api/health
```

### MEDIA SYMLINK (Turbopack workaround)

**Order is mandatory:**

1. Create/checkout release dir  
2. Link `.env.production`  
3. Ensure `public/media` is **absent** (not a symlink)  
4. `npm ci` + `next build`  
5. `ln -sfn /var/www/polezno-shared/media public/media`  
6. Atomic `polezno-current` switch + `pm2 restart`  
7. Smoke  

If media is linked during build, Turbopack may panic:  
`Symlink public/media/... points out of the filesystem root`.

---

## ROLLBACK (no rebuild)

Keep at least one proven-good previous release (OPS.1: `d6c31b6…` while current is `ff8e2e0…`).

```bash
PREV=/var/www/polezno-releases/d6c31b69304cdc213500bf8ff261b64cf5b78ac1
# verify artifacts first (do not skip):
test -d "$PREV/.next" && test -d "$PREV/node_modules/next"
test -L "$PREV/public/media"
test -e "$PREV/.env.production"
readlink -f "$PREV/public/media"   # must be /var/www/polezno-shared/media

ln -sfn "$PREV" /var/www/polezno-current.new
mv -Tf /var/www/polezno-current.new /var/www/polezno-current
cd /var/www/polezno-current
pm2 restart polezno --update-env
sleep 4
curl -s http://127.0.0.1:3000/api/health
# expect commitSha of PREV
```

---

## RELEASE RETENTION

**Policy (OPS.1):** keep **CURRENT + 1 proven previous** (2 release dirs). Delete older completed SHA dirs only.

```bash
# dry-run
KEEP=2 bash scripts/ops-release-retention.sh

# execute (after successful deploy)
KEEP=2 EXECUTE=1 bash scripts/ops-release-retention.sh
```

**Never delete:**

- path pointed to by `/var/www/polezno-current`
- `/var/www/polezno-shared/media`
- `/var/www/polezno-shared/.env.production`
- PostgreSQL data under `/var/lib/postgresql`

---

## LOG CHECK

```bash
pm2 list
pm2 logs polezno --lines 50 --nostream
ls -lah /root/.pm2/logs/
journalctl --disk-usage
# journal capped via /etc/systemd/journald.conf.d/99-irkportal-size.conf (SystemMaxUse=200M)
# PM2: pm2-logrotate module (max_size 10M, retain 7, compress)
```

---

## SMOKE (post any ops change)

```bash
curl -s https://irkportal.ru/api/health
# commitSha must match expected
for u in / /explore /about /contact /map; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://irkportal.ru$u")
  echo "$code $u"
done
# typography live check (optional):
curl -s https://irkportal.ru/ | grep -oE 'prata_|golos_text_' | sort -u
```

`/routes` may redirect to the map/routes surface — follow redirects; final page must be healthy.
