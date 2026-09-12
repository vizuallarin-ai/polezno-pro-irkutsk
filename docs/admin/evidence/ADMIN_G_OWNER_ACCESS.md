# ADMIN.G — Owner access evidence

**Gate:** ADMIN.G  
**No temporary password stored in this file.**

## Identity

| Item | Value |
|---|---|
| ADMIN_LOGIN_URL | `https://irkportal.ru/admin` |
| Owner email | `admin@irkportal.ru` |
| Users count | 1 |
| Role | `admin` preserved |

## Results (status only)

| Check | Result |
|---|---|
| OWNER PASSWORD RESET | **PASS** |
| OWNER LOGIN | **PASS** |
| OWNER ROLE PRESERVED | **PASS** |
| Users count unchanged | PASS |
| Email unchanged | PASS |
| Production SHA after reset | `fee5618ad139e6e5c9593bcad552cefeade25089` |

## Reset method notes

- Single existing owner/admin only
- Password-only update
- `overrideAccess: true`
- Per-operation `context.bypassDeleteGuards` only (guards/config unchanged)
- One-shot ops script removed after run
- Temporary password delivered only in interactive final report (not in git)

## Human acceptance

HUMAN OWNER ACCEPTANCE = **PENDING** (manual checklist for owner)
