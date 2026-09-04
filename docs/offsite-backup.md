# Offsite disaster-recovery backup (Gate D prerequisite)

Same-host VPS dumps are **not** enough. Complete this before production release switch.

## Minimum procedure

1. On VPS, dump Postgres:

```bash
sudo -u postgres pg_dump -Fc polezno_irkutsk > /tmp/polezno_irkutsk-$(date -u +%Y%m%dT%H%M%SZ).dump
```

2. Copy dump **off the VPS** (owner machine, S3, another region, encrypted USB):

```bash
scp root@90.156.170.182:/tmp/polezno_irkutsk-*.dump ./backups/
```

3. Record: filename, SHA256, storage location, date in a private note (not in git).

4. Optional: also archive `/var/www/.../public/media` and `.env.production` (secrets separately).

## Definition of Done

- [ ] Dump exists outside the production host
- [ ] Restore dry-run tested once on a scratch DB
- [ ] Checkbox in Gate D runbook marked

Until then: **Gate D execute stays BLOCKED**.
