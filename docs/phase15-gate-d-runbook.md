# Gate D — Production deploy + email + health

**Status:** CODE DEPLOYED `99d7bc8` (2026-09-04) — Resend E2E and Metrika cabinet still PENDING

## Done on 2026-09-04

- [x] Offsite DB backup: `20260904T062525Z` (VPS `/var/backups/polezno/` + local `.deploy-artifacts/backups/`, SHA256 `c0d24a56…b7c8`)
- [x] Schema: `media.visibility` column added
- [x] Immutable release `/var/www/polezno-releases/99d7bc8…` switched; previous `ae3d003…`
- [x] `GET /api/health` → `commitSha=99d7bc830a67e1f9fff37119dff05aedb1fefc02`
- [x] Smoke 200: `/`, `/map`, `/explore`, `/business`, `/contact`, `/admin`, sitemap, robots, `/icon`

## Still open

- [ ] Resend DNS + E2E test lead → email (env keys may still be missing on VPS)
- [ ] Metrika goals in cabinet (`docs/metrika-goals.md`)
- [ ] Gate C content (owner materials)

## Rollback

```bash
ln -sfn /var/www/polezno-releases/ae3d00353ef7704a91a212491d3bae598cad5cb8 /var/www/polezno-current.new
mv -Tf /var/www/polezno-current.new /var/www/polezno-current
cd /var/www/polezno-current && pm2 restart polezno
```

## Resend E2E

1. Verify sender domain in Resend dashboard (SPF/DKIM)
2. Set `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO` in `/var/www/polezno-shared/.env.production`
3. `pm2 restart polezno`
4. In CMS Site Settings: enable lead notifications
5. Submit test lead from `/contact`
6. Confirm email + row in `/admin/collections/leads`

## Metrika goals (cabinet)

See `docs/metrika-goals.md`.
