# New Host Cutover Plan

## Current state

The REG.RU target is `79.174.91.110` (`cv8301755.novalocal`). Host identity, root key access, deploy key access, security baseline, PostgreSQL 16 staging and clean production databases, immutable releases, PM2, private Nginx, smoke, and local backups are verified. DNS, registrar, TLS, owner login, and production traffic remain unchanged.

## Minimum target

- Ubuntu 26.04 LTS VPS (actual host; application/runtime verified on this OS).
- 2 vCPU, at least 2 GB RAM plus swap, and at least 20 GB SSD; size upward for the actual PostgreSQL/media volume.
- Node.js 22, PostgreSQL 16, Nginx, Certbot pending DNS, PM2, Git, and a firewall.
- Persistent PostgreSQL storage and a shared media directory outside immutable release directories.
- Health endpoint, immutable release mechanism, PM2 process, and existing backup scripts retained.
- Private offsite backup destination for both database and media before production cutover.

## Ordered cutover

1. Provision the new VPS and record the exact IP and SSH principal; do not reuse the unavailable host by assumption.
2. Rotate/reissue production secrets in a private store: `DATABASE_URL`, `PAYLOAD_SECRET`, `REVALIDATE_SECRET`, `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`, email credentials, map/API keys, revalidation secrets, and deployment keys as applicable.
3. Checkout the recovery branch or an explicitly approved commit; build without connecting to a production database.
4. Choose the data source explicitly: a verified Beget production dump/media archive, or an owner-approved empty/new database. The local dump is not an automatic production source.
5. Restore into a new disposable database first; run `pg_restore --list`, schema checks, counts, media checksum checks, and application smoke tests.
6. Configure Nginx for the ASCII IDN host and optional `www` alias, then obtain TLS after DNS is intentionally pointed at the new host.
7. Configure `NEXT_PUBLIC_SERVER_URL=https://xn--e1aediabqeeaegncqpq.xn--p1ai`, Payload secrets, email sender/recipient, and Yandex/analytics domain restrictions.
8. Start the immutable release with PM2; verify `/api/health`, `/`, `/map`, `/explore`, `/business`, `/admin`, `/robots.txt`, and `/sitemap.xml`.
9. Enable daily local DB+media backups and prove an independent offsite copy before accepting production traffic.
10. Only after owner approval, switch DNS and run the post-cutover read-only smoke suite.

## Current production preparation

- Production database: `polezno_production`, empty except for controlled Payload schema.
- Production application SHA: `22e71fd0f0bfb80118245220077df5d2f7e3c8fe`.
- Production process and Nginx are intentionally private on `127.0.0.1:3001` and `127.0.0.1:8081`.
- Current DNS A lookup is `95.163.244.138`; planned record remains `@ -> 79.174.91.110`.
- Owner account creation is pending one verified owner login email.

## SEO migration contract

Preserve existing paths and slugs. The known mapping is:

| Old origin | New origin |
|---|---|
| `https://irkportal.ru/<path>` | `https://xn--e1aediabqeeaegncqpq.xn--p1ai/<path>` |

Keep `/map` as the canonical route; `/routes` is not to be recreated. Configure 301 redirects on the old domain only if its DNS/host control is recovered. Current status: **SEO REDIRECT = BLOCKED BY OLD DOMAIN ACCESS**.

Yandex Webmaster:

- Add/verify the new IDN property in its ASCII host form.
- Submit the new sitemap.
- Use the site move tool only when the old property and redirect control are available.
- Recheck canonical URLs and indexability after the new host serves TLS.

Google Search Console:

- Add/verify the new domain property.
- Submit the new sitemap.
- Use Change of Address only when old-domain verification and redirects are available.
- Monitor coverage, canonical selection, and 404s for preserved paths.

## Current blockers

- Production is intentionally a new empty database; later Beget material import remains optional.
- Owner login email is not yet provided for the clean production database.
- Old-domain redirect control is unknown/unavailable.
- Production secrets require rotation and private re-entry.
- Mailbox/DNS verification for the new sender domain is not proven.
