# ADMIN.F — Mobile acceptance

**Viewport:** 390×844

**Verdict:** MOBILE_SMOKE_PASS

## Pages

| Path | Overflow | Notes |
|---|---|---|
| `/admin/login` | no | w=390/390 |
| `/admin` | no | w=390/390 |
| `/admin/collections/leads` | no | w=390/390 |
| `/admin/collections/excursions` | no | w=390/390 |
| `/admin/collections/routes` | no | w=390/390 |


## Limitations (accepted)

- Payload core admin chrome is desktop-first; minor density issues OK.
- Criterion: emergency owner tasks possible on phone.
- Login form usable at 390px (proven).
- Custom Owner Dashboard / Leads filters must not cause critical horizontal overflow.

## Evidence

`docs/admin/evidence/ADMIN_F_MOBILE_SMOKE.json`
