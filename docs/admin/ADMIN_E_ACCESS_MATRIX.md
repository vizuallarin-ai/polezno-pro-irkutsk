# ADMIN.E — Access matrix (server-enforced)

Machine roles: `admin` = Owner, `editor` = Content Editor, `developer` = Developer.

Legend: **Y** allowed · **N** denied · **P** published/public filter · **A** archive-first (hook) · **D** developer hard-delete only

UI `admin.hidden` is **not** a security boundary.

| Collection / Global | Anon READ | Anon C/U/D | Owner | Editor | Developer | Notes |
|---|---|---|---|---|---|---|
| Users | N | N | CRUD* | N | CRUD | *Owner cannot assign/delete Developer; lockout guards |
| Leads | N | N† | RU (no D) | N | CRUD | †Public create only via `/api/public/leads` + Local API override |
| Excursions | P | N | CRUD+A | CRUD+A | CRUD | Versions max 25 |
| Routes | P | N | CRUD+A | CRUD+A | CRUD | Versions max 25 |
| Articles | P‡ | N | CRUD+A | CRUD+A | CRUD | ‡`_status`+`status` both published; versions+drafts |
| Photos | P | N | CRUD+A | CRUD+A | CRUD | Versions |
| Reviews | P | N | CRUD+A | CRUD+A | CRUD | Versions |
| Guides | filtered | N | CRUD+A | CRUD+A | CRUD | Active-flag delete guard |
| Events | P | N | CRUD+A | CRUD+A | CRUD | No versions (lower priority) |
| Products | P | N | CRUD+A | CRUD+A | CRUD | No versions |
| Makers | P§ | N | CRUD+A | CRUD+A | CRUD | §published + placement active |
| AR Postcards | P | N | CRUD+A | CRUD+A | CRUD | |
| Media | public only | N | CU (no D) | CU (no D) | CRUD | Hard delete Developer |
| Places | N | N | N | N | CRUD | System |
| Partners | N | N | N | N | CRUD | System |
| Site Settings | Y (public fields) | N | U | N | U | Versions max 25 |
| Navigation | Y | N | U | N | U | Hidden system UI |

## Operations

| Op | Owner | Editor | Developer |
|---|---|---|---|
| Admin panel | Y | Y | Y |
| Owner dashboard leads | Y | N | Y |
| Hard delete published content | N (must archive) | N | Y |
| Hard delete leads | N | N | Y |
| Manage users | Y* | N | Y |

## API surfaces

| Endpoint | Class | Auth |
|---|---|---|
| `POST /api/public/leads` | PUBLIC | Spam checks; CRM fields forced server-side |
| `GET /api/public/routes` | PUBLIC | Published map data only |
| `POST /api/revalidate` | INTERNAL | `x-revalidate-secret` |
| `GET /api/health` | PUBLIC | No secrets |
| Payload REST `/api/{collection}` | AUTH / filtered | Collection access |
| `POST /api/photos/submit` | PUBLIC | Existing intake contract |
| Admin geometry routes | OWNER/DEV | `requireAdminUser` |
