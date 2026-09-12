# ADMIN.G — Live smoke evidence

**Gate:** ADMIN.G  
**App SHA:** `fee5618ad139e6e5c9593bcad552cefeade25089`

## Health

| Check | Result |
|---|---|
| `/api/health` | 200 / ok / database=up / app=up / SHA=fee5618… |
| PM2 | online, restarts=0, unstable=0 |

## Public routes

| Route | Result |
|---|---|
| `/` | 200 |
| `/map` | 200 |
| `/explore` | 200 |
| `/about` | 200 |
| `/business` | 200 |
| `/contact` | 200 |
| `/admin` | 200 |
| `/routes` | 404 — **not a regression** (canonical routes UI is `/map`) |

## Admin (authenticated)

| Surface | Result |
|---|---|
| Login → Dashboard | PASS |
| Leads | PASS (list + CRM columns visible) |
| Excursions | PASS (empty list OK) |
| Routes | PASS (empty list OK) |
| Articles | PASS |
| Article edit form | PASS (read-only open) |
| Media | PASS |
| Photos | PASS (collection reachable via nav) |
| Reviews | PASS (empty list OK) |
| Versions UI | PASS (`Versions` English chrome) |
| Restore action visible | PASS (`Restore this version` — **not executed**) |

No fake production content created. No Restore performed.
