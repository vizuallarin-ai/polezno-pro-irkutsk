# Yandex Metrika goals — cabinet setup

**Code status:** READY (`lib/analytics-events.ts`)  
**Cabinet status:** EXTERNAL VERIFICATION PENDING until events appear in reports

Counter ID: `NEXT_PUBLIC_YANDEX_METRIKA_ID` (default in code if unset: see `yandex-metrika.tsx`)

## Goals to create (JavaScript event / reachGoal)

| Goal ID / name | When it fires |
|----------------|---------------|
| `lead_form_success` | Successful `/api/leads` response in forms |
| `lead_form_submit` | Submit click |
| `lead_form_error` | Failed submit |
| `business_cta_click` | B2B CTA |
| `hero_cta_click` | Hero primary CTA |
| `route_view` | Route detail mount |
| `excursion_view` | Excursion detail mount |
| `messenger_click` | Telegram / MAX / email |
| `cta_click` | Generic CTA helper |

## Verification steps

1. Open site with Metrika debug / browser console
2. Submit a test lead → expect `reachGoal` / dataLayer push
3. In Metrika → Goals → confirm hits within 15–30 minutes
4. Mark Gate D Metrika checkbox only after step 3
