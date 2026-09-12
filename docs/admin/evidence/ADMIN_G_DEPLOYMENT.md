# ADMIN.G — Deployment evidence

**Gate:** ADMIN.G  
**Cutover:** 2026-09-12T06:51:59Z UTC

## Identity

| Item | Value |
|---|---|
| TARGET_RELEASE_SHA | `fee5618ad139e6e5c9593bcad552cefeade25089` |
| Deployed application SHA | `fee5618ad139e6e5c9593bcad552cefeade25089` |
| Previous / rollback SHA | `b3a51ba8500bb03b5f1124feab567bee3a313824` |
| Release path | `/var/www/polezno-releases/fee5618ad139e6e5c9593bcad552cefeade25089` |
| Current symlink | `/var/www/polezno-current` → release path above |

## Build / shared resources

| Check | Result |
|---|---|
| `npm ci --include=dev` | PASS |
| `npm run build` | PASS (Next.js 16.2.6) |
| `.next/release-identity.json` | commitSha = TARGET |
| `.env.production` shared link | PRESENT |
| `public/media` shared link (post-build) | PRESENT |
| Disk free before materialize | freed one old release (`7a6d971e…`) |

## Cutover

| Step | Result |
|---|---|
| Atomic symlink switch | PASS |
| `runtime-restart-safe.sh` | PASS |
| Post health | `commitSha=fee5618…`, database=up, app=up |
| Port :3000 | next-server under PM2 |
| PM2 | online, restarts=0 |

## Not done

- No force push
- No master merge
- No deploy of docs tip / other SHA
