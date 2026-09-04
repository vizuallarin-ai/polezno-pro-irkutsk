# GATE UX.C — Conversion Implementation

## 1. Starting baseline

| Item | Value |
| --- | --- |
| Branch | `phase15-ux-funnel-hardening` |
| Starting SHA | `d24e47d71595e11d9ec464334f5a72117edbca9c` (UX.B docs) |
| Implementation tip | `1612a0683226350ea6dc4262c15ba4ae823cf8ef` |
| Documentation tip | see `git rev-parse HEAD` on this branch after docs commit |
| Production tip (unchanged) | `493012926cf833bc3a6cfefc91f5356efd20e8ed` |
| `origin/master` (unchanged) | `ae3d00353ef7704a91a212491d3bae598cad5cb8` |
| UX branch pushed | **NO** |

Commits (UX.C):

1. `f9a536f` — `feat: reduce conversion friction across public journeys`
2. `a6639b1` / `5254eb2` — runtime start script encoding / `$HOME` fixes
3. `1612a06` — Telegram→email Payload fix + leftover CTA labels + stop-script fallback
4. docs commit — `docs: record UX C conversion acceptance`

## 2. UX.B runtime proof

Isolated disposable Postgres (VPS) + local exact build:

- Script: `scripts/phase15-uxc-runtime-start.ps1` / `phase15-uxc-runtime-stop.ps1`
- First successful exact build SHA: `a6639b19e95767c0c628eb60b6c0842dfe25f3c7`
- Final exact build SHA: `1612a0683226350ea6dc4262c15ba4ae823cf8ef`
- Health: `identityComplete=true`, commit matches artifact
- Visual matrix (`scripts/visual-matrix.mjs`): **pass=true**, P0=0, P1=0 (P2 only localhost Yandex Maps / cert noise)
- Viewports: 360 / 390 / 430 / 768 / 1280 / 1440
- Routes checked: `/`, `/map`, `/contact?intent=walk`, `/business`, `/explore`, `/souvenirs`, `/ar-postcards`, `/explore/photos`, `/about`, `/about/guides`

## 3. Current conversion issues (before UX.C)

- B2C forms asked for long message / preferred method / too many fields
- Route high-intent CTA often left page context without embedded form
- Contact page was generic when intent was known
- Success copy was thin; errors used `alert()` on business
- Telegram `@handle` was incorrectly written into Payload `email` (type=email) → 500 on save

## 4. Form architecture decision

Keep one public B2C surface:

`LeadForm` + `variant` / intent / context / progressive disclosure

Typed modes in practice:

- `compact` / `contact` / `route` (via ContactCtaSection flags)
- `business` → dedicated `BusinessForm` (qualification retained)
- `product` / `ar` → inquiry forms with automatic product/AR context

No parallel lead backend. No CRM. `/api/leads` preserved.

## 5. Compact B2C model

**Required:** name, contact, consent  
**Optional (behind «Уточнить детали»):** dates, people, format, short comment  
**Not required:** standalone email when Telegram/phone given; long message; preferred contact method (default `any`)

Schema: `publicB2cLeadSchema` (+ existing `compactLeadSchema` for API)

## 6. Route high-intent model

- Route detail primary CTA: `Пройти с Алёной` → `#lead-form` (or excursion when related)
- Embedded `ContactCtaSection` with `showForm`, route context, dates/people under details
- Contextual label: `Вы выбрали: [title]`
- Self-guided vs guided hierarchy preserved; unavailable self-guided shows honest «Скоро»

## 7. Assisted choice

`/contact?intent=walk` chrome + compact form; light qualification (when / people) under details by default for walk intent.

## 8. B2B model

Kept: name, company, contact, taskType, message (min 10), optional dates/people/format/budget/website behind «Дополнительные поля».  
Removed UX: `alert()`; added inline error, retry, messenger fallbacks, analytics submit/success/error.

## 9. Product / AR model

Inquiry (not e-commerce). Product/AR title shown as «Вы выбрали». Contact field replaces required email. CTA labels remain status-honest (`Уточнить наличие`, `Написать об открытке`, etc.).

## 10. Context preservation

`buildContactHref` / `assistWalkHref` / `routeContactHref` — non-PII only: intent, productType, slug, article, sourceBlock.  
Attribution fields on submit: sourceType/Slug/Title/Id/Block, requestType, pageUrl, referrer, UTM, route/product/AR/material/photo context.

## 11. CTA cleanup

Canonical public B2C vocabulary applied on about/footer/guides/author/explore/photo leftovers:

- Смотреть маршруты
- Пройти с Алёной
- Подобрать мне прогулку
- Обсудить программу
- Связаться

## 12. Success UX

Explains acceptance + next step (Алёна свяжется по контакту) + one soft next action (маршруты / explore). No SLA promise.

## 13. Error UX

Inline Russian errors; retry; messenger fallback hierarchy («Или напишите напрямую»). No public `alert()` on conversion forms. Form values retained on recoverable failure.

## 14. Funnel telemetry

Events used (no PII): `lead_form_open`, `lead_form_start`, `lead_form_submit`, `lead_form_success`, `lead_form_error`, plus existing `cta_click` / `messenger_click` / `contact_click`. Success only after API OK.

## 15. PII / privacy

- No PII in URL query
- Analytics sanitize strips name/contact/email/phone/message/telegram
- Consent + privacy link preserved
- Honeypot `_hp`, min fill time, rate limit preserved

## 16. Mobile visual matrix

360/390/430: contact compact form, checkbox, submit, disclosure — no P0 overflow. Header CTA/min-h targets intact.

## 17. Runtime smoke

Assisted contact chrome; business form fields; home discovery/assist CTAs; lead API on disposable DB only.

## 18. Lead API smoke (disposable)

| Case | Result |
| --- | --- |
| Telegram compact B2C | 200 `ok` (after email-derive fix) |
| Phone compact B2C | 200 `ok` |
| Invalid | 400 validation (RU field errors) |
| Honeypot | 200 `ignored` |
| B2B | 200 `ok` (earlier run) |

## 19. Tests

- `npm run typecheck` PASS
- `npm run lint` 0 errors
- `npm run test:leads` PASS
- `npm run test:lead-privacy` PASS
- `npm run test:readiness` PASS
- `npm run check:phase15` PASS
- `git diff --check` PASS

## 20. Build

Exact isolated `npm run build:release:isolated` PASS for SHA `1612a06…`.

## 21. Cleanup

`phase15-uxc-runtime-stop.ps1`: phase15_dbs=0, phase15_roles=0, inventory hashes match baseline, production HEAD/BUILD_ID unchanged.

## 22. Remaining UX.D scope

- Cross-site visual polish / mobile edge cases
- Empty/prelaunch consistency pass
- Accessibility hardening beyond conversion surfaces
- Dead-end audit
- Funnel end-to-end acceptance with real content
- Analytics readiness / Metrika goal verification
- Final UX release acceptance
- Optional: soften leftover B2B microcopy synonyms («Обсудить задачу», «Обсудить это направление»)
- Optional: re-check form `isSubmitting` flash when validation fails under automation

## Mutation ledger

- public UI changed: **YES**
- lead UX changed: **YES**
- production mutation: **NO**
- master mutation: **NO**
- UX branch pushed: **NO**
- deploy: **NO**
