# GATE ADMIN.A — Total Admin / CMS / CRM Audit

**Status:** `GATE ADMIN.A PARTIAL`  
**Date:** 2026-09-11  
**Scope:** Read-only audit of admin workspace for owner (guide) operability.  
**No application code changes. No production mutations.**

Related artifacts:

- `docs/admin/ADMIN_A_ISSUE_REGISTER.md`
- `docs/admin/ADMIN_A_TARGET_ARCHITECTURE.md`
- `docs/admin/ADMIN_A_REMEDIATION_ROADMAP.md`
- `docs/admin/evidence/ADMIN_A_BASELINE.md`
- Existing operator manual (not replaced): `docs/admin-guide.md`

---

## 0. Verdict in one paragraph

Технически Payload CMS «собран широко»: 15 коллекций, 2 глобала, заявки, медиа, revalidate, dashboard-счётчики. Для заказчика-гида рабочее место **ещё не готово к самостоятельной безопасной эксплуатации коммерческого контура**: экскурсии/маршруты/фото/отзывы пусты, отзывы и гиды скрыты в меню при живом фронтенде, slug/GeoJSON/технические поля требуют знаний разработчика, CRM — inbox без воронки «следующий контакт», drafts/versions почти нигде нет, роль `editor` мертва, demo-сувениры/AR и placeholder-гид публично видны. Owner content pack по-прежнему бизнес-блокер. Аудит зафиксировал baseline и roadmap ADMIN.B–F; реализация не начата.

---

## 1. Preflight / source of truth

| Item | Value | Mark |
|------|-------|------|
| Repository | `D:/AI_WORKSPACE/Projects/PoleznoProIrkutsk` (ИркПортал / polezno-pro-irkutsk) | PROVEN |
| Branch | `phase15-ux-funnel-hardening` → `origin/...` | PROVEN |
| HEAD | `95ba8d0c83512f410c0d29342ed0d2cae20f4dc9` | PROVEN |
| Production SHA | `b3a51ba8500bb03b5f1124feab567bee3a313824` | PROVEN |
| Health | `ok` / DB up / app up | PROVEN |
| `/admin` | HTTP 200 | PROVEN |
| Payload / Next | 3.85.x / 16.2.6 | CODE-PROVEN |
| Worktree | Untracked only (`####/`, PDFs, phase15 scripts, `Alena.jpg`); no dirty tracked app files | PROVEN |

Prior reports consulted: total audit 2026-09-01, UX.F/G/H, CONTENT.0, OPS.2, RELEASE.2, `docs/admin-guide.md`, owner-content intake. Prior production claims (8 articles, 0 excursions/routes/reviews/photos) **reconfirmed** via read-only REST on 2026-09-11. Site Settings is **not** an empty DB absence — global returns defaults; phone/email still empty. Products (4) and AR (3) remain published catalog/demo-class content. Guide placeholder `slug=Slug` still live.

**Audit limits:** no owner login E2E in production; create/publish/unpublish journeys = `NOT PROVEN` (would require writes). Local disposable DB journeys not executed in this pass (no isolated DB spun up). Conclusions for journeys are CODE-PROVEN + production read evidence + prior docs.

---

## 2. Inventory map

### Collections & globals (CODE-PROVEN)

| Раздел админки | Техническая сущность | Назначение | Кто использует | Где на сайте | Состояние | Риск |
| -------------- | -------------------- | ---------- | -------------- | ------------ | --------- | ---- |
| Маршруты | `routes` | Карта/маршруты, точки, геометрия | Owner | `/map`, `/map/[slug]` | Visible; **0 published** | GeoJSON/slug; сложная форма |
| Заявки | `leads` | Inbox форм | Owner | — | Visible; CRM thin | Потеря лида без next-contact |
| Материалы | `articles` | Explore | Owner | `/explore` | **8 published**; drafts+autosave | Двойной `_status`+`status` |
| Фото Иркутска | `photos` | Фотоархив + модерация | Owner | `/explore/photos` | Visible; **0** | Сложные права/gates |
| События | `events` | Календарь | Owner | `/events` | Visible; **0**; `fullDescription` unused | Лишняя когнитивная нагрузка |
| Экскурсии | `excursions` | Коммерческие экскурсии | Owner | `/excursions/[slug]`, `/map` | Visible; **0**; revalidate → `/business` only | P1 publish gap |
| Мастера | `makers` | Авторы сувениров | Owner | `/souvenirs/makers` | Visible; **0** | placement vs status |
| Сувениры | `products` | Каталог | Owner | `/souvenirs` | **4 published** seed-like | Demo на проде |
| AR-открытки | `ar-postcards` | AR/QR | Owner | `/ar-postcards` | **3 published** | Demo/coming_soon |
| Медиа | `media` | Uploads | Owner/Dev | через relations | Visible; 50MB | Тяжёлые файлы |
| Пользователи | `users` | Auth | Admin | — | Только `admin` входит | Role `editor` мёртв |
| Места | `places` | POI | — | **не используется** | Hidden orphan | Путаница |
| Гиды | `guides` | Профили гидов | Owner (скрыто) | `/about/guides` | Hidden; **1 placeholder** | Публичный stub |
| Отзывы | `reviews` | Social proof | Owner (скрыто) | Home | Hidden; **0**; no draft | Случайная публикация |
| Партнёры | `partners` | Логотипы | — | unused | Hidden orphan | — |
| Настройки сайта | `site-settings` | Hero/контакты/SEO/leads | Owner | layout, about, forms | Visible; частично defaults | Hero CTA не всегда из CMS |
| Навигация | `navigation` | Меню | — | **игнорируется кодом** | Hidden orphan fields | Ложное ощущение редактируемости |

### Cross-cutting (CODE-PROVEN)

- Access: `payload/access.ts` — admin panel = admin only; published-or-staff for catalogs; leads CRUD admin-only; media visibility; photo publish where.
- Hooks: revalidate (most content), route geometry sync, photo publish gates, AR QR/slug lock, leads→review email on close, events `isPast`.
- Custom admin UI: `BeforeDashboard`, `LeadsListFilters`, `RouteGeometryPanel`/`MapEditor`, `ArPostcardQrPreview`.
- Versions/drafts/autosave: **только articles**.
- Localization: i18n ru+en; collection labels mostly RU; guides/reviews/partners unlabeled.
- GraphQL: disabled.
- Upload limit: 50 MB; sizes thumbnail/card/hero.
- Backup: OPS.2 daily DB cron on VPS (docs); **offsite backup NOT CONFIGURED** (`docs/offsite-backup.md`).
- Email: Resend optional; notify without PII; silent skip if unconfigured.
- Webhooks/jobs: none beyond revalidate HTTP + review-request email.

### Gaps summary

| Gap type | Examples |
|----------|----------|
| In CMS, unused on site | `places`, `partners`, `navigation.mainNav`, route audio/PDF/schedule/guide (UI dead), article geo/meta fields, excursion Lexical `content`, event `fullDescription`/`hasApplicationForm`, site-settings `manifesto`/`heroVideo` |
| On site, hard to edit | `reviews`, `guides` (hidden); nav/home CTAs/about values/privacy/B2B copy hardcoded |
| Dangerous / confusing | Public REST `read: () => true` on reviews/guides/places/partners; `/api/routes` shadows Payload REST; excursion revalidate misses `/map` & detail |
| Hidden tech knowledge | slug, GeoJSON JSON, dual status on articles, photo rights gates, relationship pickers to hidden guides |

---

## 3. Information architecture (owner lens)

**Current menu (visible):** flat Payload list — Маршруты, Заявки, Материалы, Фото, События, Экскурсии, Мастера, Сувениры, AR, Медиа, Пользователи + Настройки сайта. Hidden «Позже»: Места, Гиды, Отзывы, Партнёры, Навигация.

**Problems (INFERRED + CODE-PROVEN):**

1. Business tasks ≠ menu order (Заявки not first; «Материалы» vs «Статьи»).
2. Sales (leads), content, catalog, system (users/media) mixed.
3. Orphan/demo modules (events empty, products/AR demo) compete with empty core (excursions/routes).
4. Reviews/guides needed for trust but hidden — owner won't find them without docs.
5. No «what needs attention» beyond counters; no readiness checklist.
6. Login is English Payload chrome — brand weak for non-technical owner.

**Target menu:** see `ADMIN_A_TARGET_ARCHITECTURE.md`.

**Hide from Owner (Developer-only):** Users (except invite), raw Media internals if replaced by guided upload, Places/Partners until productized, Navigation global, Stripe/legacy fields, providerRawResponse, schema tools, seed scripts.

---

## 4. End-to-end journeys

Legend: **CODE** = schema/hooks/frontend; **PROD** = live read; **E2E** = interactive create/publish — not done.

| Сценарий | Шаги пользователя | Ожидаемый результат | Фактический результат | Точка затруднения | Severity | Evidence |
| -------- | ----------------- | ------------------- | --------------------- | ----------------- | -------- | -------- |
| Создать экскурсию | Admin → Экскурсии → Create → fill → Save draft | Черновик | Поля есть; price не required | Slug вручную | P1 | CODE |
| Цена/длительность/формат | Fill price or priceOnRequest, duration, format | Понятная карточка | Price optional → можно опубликовать без цены | Нет publish gate | P1 | CODE Excursions.ts |
| Изображения | cover upload media | Cover on site | cover/coverUrl dual | Два способа cover | P2 | CODE |
| Preview | Preview URL | `/excursions/[slug]` | Preview configured | Без auth preview on draft NOT PROVEN | P2 | CODE |
| Публикация | status=published | Видна на `/map` и detail | Revalidate только `/business` | Stale public pages | P1 | `app/api/revalidate/route.ts` |
| Проверка на сайте | Open public URL | Live content | 0 excursions now | Owner content | P1 | PROD REST |
| Unpublish | status≠published | Скрыта | Access filter publishedOrStaff | Cache hole same | P1 | CODE |
| Archive/delete | status archived / delete | Safe remove | No soft-archive UX; delete hard | Versions отсутствуют | P0/P1 | CODE |
| Restore | versions restore | Rollback | **No versions** on excursions | Потеря правок | P0 | CODE |
| Маршрут + точки | Fill points lat/lng | Map line | Geometry panel helps | Manual GeoJSON still present | P1 | CODE Routes |
| GeoJSON ручной | Edit JSON | Line on map | Supported for power users | Owner fails without map UI mastery | P1 | CODE |
| Статья | Create → publish | `/explore` | **Works in production** (8 live) | Dual `_status`+status; slug | P2 | PROD+CODE |
| Фото | Rights + moderation + publish | `/explore/photos` | Gates strong; 0 photos | Complexity + empty | P2 | CODE+PROD |
| Отзыв | Create featured | Home proof | Collection **hidden**; no draft | Accidental public REST | P1 | CODE+PROD |
| Сувенир/AR | Publish catalog | Shop/AR pages | 4+3 live seed-class | Demo pollution | P2 | PROD |
| Профиль гида | Guides | `/about/guides` | Hidden; placeholder live | `slug=Slug` | P1 | PROD |
| Контакты/SEO/settings | Site settings | Header/footer/SEO | Partial; phone/email empty; many hero CTAs hardcoded | False editability | P1 | CODE+PROD |
| Заявка | Form → API → leads | Notify + inbox | Code path solid; E2E notify on prod NOT PROVEN | No nextContact; CRM thin | P1 | CODE+tests |

**Safe further test plan (no prod write):** spin local Postgres + `DATABASE_URL` local-only → seed minimal → owner persona walkthrough → screenshots in evidence. Or staging clone restore from backup.

---

## 5. UI/UX audit (admin screens)

### Strengths (CODE-PROVEN)

- Russian labels on most business collections.
- Dashboard counters + quick actions exist.
- Leads list filters (chips by status/source).
- Photo publish gates & AR rights gates protect bad publish.
- Route geometry map editor reduces raw GeoJSON for some flows.
- Admin guide PDF exists (`docs/admin-guide.md`).

### Weaknesses

| Area | Finding | Sev |
|------|---------|-----|
| Terms | «Материалы», «Slug», «payload», English Login | P2 |
| Form length | Routes = very long (points + geometry + schedule + SEO) | P1 |
| Required vs optional | Excursion price optional | P1 |
| Help/examples | Sparse vs owner needs | P2 |
| Units | Duration minutes OK; price ₽ OK | — |
| Destructive | Hard delete without archive/versions on most | P0 |
| Empty states | Dashboard shows zeros but no «что сделать первым» checklist | P2 |
| Mobile/tablet admin | Default Payload — NOT PROVEN usable for owner | P2 |
| Technical traps | Slug, GeoJSON, relationship IDs, dual status, hidden guides | P1 |

---

## 6. Content model notes

### Publish protection

| Risk | Protected? | Mark |
|------|------------|------|
| Excursion without price | **No** (unless priceOnRequest unchecked and price empty still publishable) | CODE |
| Route without points | No hard block | CODE |
| Title empty | Required fields block | CODE |
| Photo without rights | **Yes** hook | CODE |
| AR unknown rights | **Yes** hook | CODE |
| Empty SEO | Allowed | CODE |
| Broken relationships | Soft nulls; hidden guide hard to pick | CODE |
| Demo content | Still published products/AR | PROD |
| Unconfirmed review | No moderation/status on reviews | CODE |
| PII in leads | Admin-only; notify stripped | CODE+tests |

### Suggested field changes

See issue register + target architecture. Priority themes: auto-slug, price required XOR priceOnRequest, unhide reviews with draft, readiness checklist, hide orphan collections, fix excursion revalidate, map CMS fields that frontend actually reads.

---

## 7. CRM audit (leads)

### What exists (CODE-PROVEN)

Pipeline: public forms → `POST /api/leads` (+ newsletter) → honeypot / min-time / IP rate-limit → Zod → `payload.create(leads, overrideAccess)` → Resend notify (PII-stripped) → admin list → statuses `new | in_progress | replied | closed | spam` → on `closed` + email: review-request email.

Captured: name/contacts, consent, UTM/referrer/pageUrl, source snapshots (route/product/AR text fields), priority, adminComment, rich requestType/source enums, list search + chips.

### What is missing for owner mini-CRM

- Assignee / owner (single-operator OK)
- Next contact date + overdue
- Status history / audit trail
- Reminder notifications
- Duplicate detection
- Export
- Retention/deletion policy UI
- Conversion metrics
- True relationship to excursion/route (text snapshots only)
- Telegram notify (docs mention messenger; code = email only)
- Funnel labels mismatched to owner language (`replied` vs «Обсуждение/Забронировано»)

**Verdict:** working **lead inbox + spam-hardened intake**, **not** an operational mini-CRM. Adequate as storage; insufficient as daily sales desk for a solo guide without phone/Telegram discipline outside the system.

**Minimal CRM (recommended):** keep 5–6 statuses mapped to owner words; add `nextContactAt`, `internalNotes` (or promote adminComment), filter overdue, email+optional Telegram ping on new, prevent delete of `new` without confirm, export CSV later.

**Defer:** full pipeline analytics, multi-assignee, calendar sync, payment CRM, external Salesforce-class tools — until lead volume justifies.

---

## 8. Dashboard

Current `BeforeDashboard`: counts routes/articles/events/excursions/products/leads new/photos pending/drafts; quick +Route +Article +Event +Excursion +Product, Photos, Leads, Settings.

Gaps: no reviews/guides/AR/makers; drafts link only articles; no readiness/errors; no «open site»; no overdue leads; English/technical tone «CMS production».

Target: see architecture doc.

---

## 9. Error protection & recovery

| Mechanism | Present? | Notes |
|-----------|----------|-------|
| Drafts/autosave/versions | Articles only | P0 elsewhere |
| Unsaved changes guard | Payload default | NOT PROVEN UX |
| Soft archive | status options include archived | Weak UX |
| Delete confirm | Payload default | Hard delete |
| Optimistic locking | Not custom | |
| Audit log | No | P1 for leads |
| Backup | Daily on-host (OPS.2) | Offsite missing P0 |
| Restore docs | Partial runbooks | Owner cannot self-restore |
| Roles | Admin-only panel | Editor dead |
| Media private | visibility field | |

**Owner failure modes:** publish empty excursion; delete only route; edit GeoJSON break map; upload 40MB photo; hide reviews collection → invent off-site process; change site-settings hero while home CTAs hardcoded → «не сохранилось»; miss lead notify if Resend unset; publish placeholder guide already live.

---

## 10. Roles & security

| Role today | Reality |
|------------|---------|
| `admin` | Full panel + CRUD |
| `editor` | **Cannot open `/admin`**; staff-only for some reads | CODE |

Proposed: Owner / Content Editor / Developer — see architecture.

Security notes (CODE-PROVEN, no changes made):

- Leads create via public REST blocked; Local API override after spam checks — good.
- Reviews/guides/places/partners world-readable via REST — oversharing schema/data if any PII ever stored.
- `/api/routes` custom route masks Payload REST for `routes` — ops/debug risk.
- Rate limit in-memory — resets on process restart (prior P2).
- CSRF/session: Payload defaults — runtime brute-force NOT PROVEN.
- Media under `public/media` — public files expected for public visibility.
- No secrets in audit docs.

---

## 11. Training & self-operation

| Asset | Status |
|-------|--------|
| `docs/admin-guide.md` (+ PDF) | Exists; June 2026; useful but drifts vs hidden reviews & hardcoded nav |
| In-admin onboarding | Minimal (BeforeDashboard blurb) |
| Checklists/templates | Owner-content pack templates exist; empty pack |
| Help section in admin | No |
| Password reset | Dev script `reset-admin-password` — owner blocked |

Future doc outline: `ADMIN_GUIDE_OWNER.ru.md` — plain Russian: login, daily leads, publish excursion wizard, photos rights, what never to touch, when to call developer, backup expectations. Full text deferred to ADMIN.E (this gate only outlines).

Developer still required for: password reset, deploy, schema, GeoJSON edge cases, offsite restore, Resend/DNS, role invites until Owner self-serve exists.

---

## 12. Scores (0–5)

| Направление | Оценка | Доказательства | Основная проблема |
| ----------- | -----: | -------------- | ----------------- |
| Понятность навигации | 2 | Flat Payload; hidden reviews/guides | Не бизнес-IA |
| Простота публикации | 2 | Slug; dual status; revalidate holes | Технический publish |
| Управление экскурсиями | 2 | Schema OK; 0 live; no price gate; bad revalidate | Не owner-ready |
| Управление маршрутами | 2 | Geometry editor helps; form heavy; 0 live | Сложность |
| Работа с фотографиями | 3 | Strong gates; empty archive | Сложные права |
| Работа со статьями | 4 | 8 live; drafts/autosave | Лучший контур |
| Работа с отзывами | 1 | Hidden; no draft; 0 content | Неоперабельно |
| CRM заявок | 2 | Inbox+spam+UTM; no next contact | Не мини-CRM |
| Предотвращение ошибок | 2 | Photo/AR gates; weak elsewhere | Versions gap |
| Восстановление | 2 | On-host backup; no versions/offsite | P0 offsite |
| Роли и безопасность | 2 | Admin-only; editor dead; open reads | Role model |
| Мобильная работа | 1 | Default Payload; NOT PROVEN | Не целевой UX |
| Самостоятельность заказчика | 1 | Content pack blocked; tech traps | Developer dependence |
| Общая эксплуатационная готовность | 2 | Platform up; commercial CMS empty/demo | Not owner-operable |

---

## 13. Confidence & next gate

Do **not** start ADMIN.B without explicit approval.

Recommended next: **ADMIN.B — Information Architecture & CMS Simplification** (highest leverage before CRM chrome): menu groups, Russian IA, unhide/fix reviews+guides safely, hide orphans, labels/help, auto-slug, fix excursion revalidate, hide tech fields — still without inventing owner content.
