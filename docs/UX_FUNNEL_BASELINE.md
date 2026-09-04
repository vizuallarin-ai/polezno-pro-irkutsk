# GATE UX.A — UX Funnel & Typography Baseline

**Gate:** UX.A (audit / proof / planning only)  
**Date:** 2026-09-04  
**Audit SHA (exact target):** `a79365047dceb9475f885868779440eaa03ac49c`  
**UX branch:** `phase15-ux-funnel-hardening` (local only; not pushed)  
**Method:** code inventory + production visual walkthrough (`https://irkportal.ru`) for journey/CTA/prelaunch proof. Production not mutated. No public UI code changes in this gate.

---

## 1. Git baseline

| Ref | SHA |
| --- | --- |
| Starting / integrated local HEAD | `a79365047dceb9475f885868779440eaa03ac49c` |
| Parent / production feature branch tip | `493012926cf833bc3a6cfefc91f5356efd20e8ed` |
| `origin/master` (at UX.A close) | `ae3d00353ef7704a91a212491d3bae598cad5cb8` |
| `origin/phase15-commercial-core-launch` | `493012926cf833bc3a6cfefc91f5356efd20e8ed` |
| `origin/phase15-gate-c-integrated` (after push) | `a79365047dceb9475f885868779440eaa03ac49c` |
| UX branch HEAD | `a79365047dceb9475f885868779440eaa03ac49c` (+ docs commit) |

Known untracked baseline (not staged): disposable scripts, PDFs, `public/images/Alena.jpg`, `####/`. Tracked worktree was clean at preflight.

---

## 2. Remote proof

### Preflight

- Branch: `phase15-gate-c-integrated`
- HEAD = `a793650…`
- Tracked worktree clean
- `git fetch origin --prune` OK
- `origin/master` still `ae3d003…` (unchanged vs C.1R baseline)
- `origin/phase15-commercial-core-launch` still `4930129…`

### Ancestry

- `merge-base(origin/master, HEAD)` = `ae3d003…`
- `merge-base(origin/phase15-commercial-core-launch, HEAD)` = `4930129…`
- `4930129` **is** ancestor of `a793650`
- Commits `origin/master..HEAD`: `62d30a7` … `4930129` + Gate C.1 `a793650`
- No unknown commits between proven baseline and HEAD

### Drift before push

- `git ls-remote --heads origin phase15-gate-c-integrated` → **empty** (branch did not exist)
- Safe to create remote branch with normal push (no force)

### Push result

```text
git push -u origin phase15-gate-c-integrated
origin/phase15-gate-c-integrated = a79365047dceb9475f885868779440eaa03ac49c
HEAD                            = a79365047dceb9475f885868779440eaa03ac49c
merge-base(integrated, commercial-core) = 4930129…
commercial-core..integrated = a793650 only
origin/master unchanged = ae3d003…
```

### Mutations not performed

- No checkout/merge/push of `master`
- No PR created
- No deploy / PM2 / production SSH / env / DB changes

---

## 3. User journey map

### What Иркпортал is for a visitor (current model)

**Иркпортал** — авторский навигатор Алёны Ямщиковой по Иркутску: самостоятельные маршруты, экскурсии с гидом и B2B-программы. Публичный слоган: **«Иркутск без штампов»**. Legacy name **«Полезно про Иркутск»** ещё живёт в footer/about/CMS.

### 5–7 second read (home, production)

| Signal | Status |
| --- | --- |
| Это Иркпортал | **Yes** — wordmark ИРКПОРТАЛ |
| Авторский навигатор | **Yes** — badge + descriptor |
| Алёна Ямщикова | **Partial** — in descriptor/subtitle; strong only after scroll to author block |
| Можно найти маршруты | **Claimed**, but catalog empty → promise breaks on `/map` |
| Самостоятельно | **Claimed** in subtitle; no live catalog to prove it |
| Формат с Алёной | **Yes** — CTAs «Пройти с Алёной» / forms |
| Исследовать город | **Yes** — Scenario «Живу в Иркутске» → `/explore` |
| B2B | **Yes** — hero secondary + nav «Для бизнеса» |

### Competing brand formulations (do not change in UX.A)

1. **Иркпортал** (canonical chrome / SEO / OG)
2. **Полезно про Иркутск** (footer «Ранее —», about manifesto, CMS dashboard)
3. Descriptor lengths: «Авторский навигатор» / «…по Иркутску» / «…от Алёны Ямщиковой» / long CMS `projectDescriptor`
4. «без штампов» vs «без туристических штампов» vs «без „топ-10“»
5. Social handles still `polezno*` while wordmark is Иркпортал
6. Header descriptor is **hardcoded** and ignores CMS `projectDescriptor` prop

---

## 4. Persona audit

### Persona A — турист впервые в Иркутске

**Path:** `/` → маршруты → detail → самостоятельно / с Алёной → заявка

| Question | Finding |
| --- | --- |
| Куда нажать на hero? | Primary = **«Подобрать прогулку» → `/contact`**, not catalog. Secondary = B2B. Scenario «Приехать в гости» → **«К маршрутам»** is the discovery path, but below fold / competing. |
| «Смотреть маршруты» vs «подобрать» | **«Смотреть маршруты» почти нет в hero.** Primary language pushes contact early. |
| Слишком рано контакт? | **Yes (P1).** Hero CTA skips product selection. |
| Действий до маршрута | On production: **catalog empty** — cannot complete product selection. Funnel collapses to form or Explore. |
| Цена / длительность / дистанция | N/A until routes published. Card design supports meta when content exists. |
| Self vs guided | Copy exists on `/map` and in dual-path detail design; **no live products** to choose. |
| Next step | Over-clear contact; under-clear browse. |

**Verdict:** Tourist funnel is **broken at DISCOVERY/PRODUCT** while routes catalog is empty. Contact path works as fallback but is the wrong primary.

### Persona B — местный житель

**Path:** `/` → Исследовать → статья/фото → связанный маршрут → действие

| Finding | Detail |
| --- | --- |
| Ценность для местного | Scenario «Живу в Иркутске» + Explore exist — good intent. |
| Только туризм? | Partially mitigated by Explore + photos + author voice; empty photos teaser still tourist-adjacent. |
| Content → route | Article CTAs resolve to related route/excursion or contact (`resolveExploreCommercialHref`). With empty map, **related routes may dead-end to contact**. |
| Dead end | Photo archive prelaunch; events empty; after reading, commercial CTA often = contact. |

**Verdict:** Explore is the right local entry; **route bridge is weak** while map is empty.

### Persona C — high-intent B2C (прогулка с гидом)

**Path:** landing/route → Пройти с Алёной → form → success

| Finding | Detail |
| --- | --- |
| Catalog friction | Empty map → form is actually the only path — fewer clicks, but no product context. |
| Form length | Contact full: name + contact + preferred + message\* + consent. Route variant adds dates + people. |
| Fields needed for first contact | Name + one contact + short intent is enough; message\* + dates often premature. |
| After submit | Inline «Спасибо» — no dedicated success URL; SLA weaker than B2B («рабочий день» only on business form). |

**Verdict:** Intent path works; **over-forms** and **no product context** hurt conversion quality.

### Persona D — B2B

**Path:** `/` → Для бизнеса → направление → форма → success

| Finding | Detail |
| --- | --- |
| Separated from B2C? | **Yes** — `/business`, three directions, dedicated form. Header still shows B2C CTA «Подобрать прогулку» on B2B page (leakage of primary action). |
| Offer clarity | Strong: three formats, process, FAQ, business language. |
| Friction | 5 required fields + progressive disclosure extras — acceptable for B2B. Error via `alert()` is weak UX. |
| Next step | Clear: «Отправить заявку» → inline success with SLA. |

**Verdict:** Best-formed funnel on the site. Fix header CTA context on `/business` in a later gate (not UX.B typography-only unless scoped).

---

## 5. Current funnel

```text
ENTRY (/)
  ↓
ORIENTATION (hero: brand + slogan + dual CTA)
  ↓
DISCOVERY (ScenarioPicker / nav Маршруты|Исследовать)
  ↓
PRODUCT SELECTION (/map catalog)  ← BROKEN on production (PrelaunchState)
  ↓
PRODUCT DETAIL (/map/[slug] dual path)  ← unreachable without published routes
  ↓
INTENT (Пройти с Алёной / Подобрать / Обсудить)
  ↓
FORM (/contact or embedded LeadForm / BusinessForm)
  ↓
LEAD SUCCESS (inline only; /souvenirs/success is leftover shop copy)
```

| Step | Screen | CTA | Friction | Drop-off risk | Tracking | Missing event |
| --- | --- | --- | --- | --- | --- | --- |
| ENTRY | `/` | — | Header overcrowding | Low | pageview | — |
| ORIENTATION | Hero | Подобрать прогулку / Для бизнеса | Primary skips catalog | High for browsers | Metrika page | `hero_cta_click` |
| DISCOVERY | Scenarios / nav | К маршрутам / Исследовать | Below fold | Medium | — | `scenario_select` |
| PRODUCT SELECTION | `/map` | Подобрать прогулку | **Empty catalog** | **Critical** | — | `catalog_empty_view` |
| PRODUCT DETAIL | `/map/[slug]` | Открыть на карте / Пройти с гидом | Unreachable | Critical | — | `route_view` |
| INTENT | CTA blocks | Пройти с Алёной etc. | Synonym sprawl | Medium | — | `intent_select` |
| FORM | contact/lead/business | Submit labels vary | Field count / email-required on product/AR | High B2C | lead API | `form_start` / `form_submit` / `form_error` |
| SUCCESS | Inline | — | No confirmation URL | Medium | — | `lead_success` |

Do **not** implement analytics in UX.A / UX.B unless separately scoped.

---

## 6. CTA inventory

Canonical constants: `lib/cta-constants.ts`, `lib/leads-constants.ts` (`CTA_VARIANT_COPY`), `lib/navigation-constants.ts`.

| CTA | Where | Intent | Destination | Problem |
| --- | --- | --- | --- | --- |
| Подобрать прогулку | Header, hero, map empty, many fallbacks | B2C contact early | `/contact` | Skips catalog; overused as prelaunch escape |
| Для бизнеса | Hero, nav, about | B2B entry | `/business` | OK; competes on hero with primary |
| Связаться | Header dropdown, floating | Messengers + form | Telegram/MAX/email/`/contact#lead-form` | Triplicates Контакты + Подобрать |
| Форма на сайте | Contact dropdown | Form | `/contact#lead-form` | Synonym of contact |
| К маршрутам | Scenario, final CTA | Catalog browse | `/map` | Correct browse CTA — **not** hero primary |
| Смотреть маршруты | Business band, photo fallback, 404 | Catalog | `/map` | Synonym of «К маршрутам» |
| Исследовать | Scenario, nav | Content | `/explore` | OK |
| Читать | Scenario city history | Content | `/explore/irkutsk-history` | OK |
| Обсудить | Scenario team | B2B | `/business` | Short synonym of Обсудить задачу |
| Обсудить задачу | Business hero/form | B2B | `#business-form` | OK |
| Обсудить это направление | Business cards | B2B scoped | `/business?taskType=…` | OK |
| Обсудить программу | Route corporate | B2B | `/business?route=…` | OK |
| Обсудить программу для бизнеса | CTA constant | B2B | `/business` | Rarely surfaced as button label |
| Пройти с Алёной | Map form / lead variant | Guided | LeadForm | Good guided label |
| Пройти с гидом | Route detail | Guided | contact/excursion | Synonym split vs «с Алёной» |
| Написать гиду | Map footer | Guided contact | `/contact` | Another synonym |
| Написать / Спланировать | Author block | Contact | `/contact` | Ambiguous slash label |
| Написать нам | Final CTA, guides | Contact | `/contact` | Synonym |
| Написать Алёне | About CTA | Contact | LeadForm | Synonym |
| Спланировать визит | Home mid form | Plan | LeadForm | Synonym of Подобрать |
| Спланировать прогулку | Photo detail | Plan | `/contact` | Synonym |
| Открыть маршрут | Cards / articles | Product | `/map/{slug}` | OK when catalog live |
| Подробнее | Excursion cards / B2B teaser | Detail | various | Generic |
| Обсудить дату | Experience card | Booking | `/contact?intent=excursion` | Synonym of Запросить дату |
| Запросить дату | Excursion / article | Booking | contact/excursion | OK |
| Запросить маршрут | Constant | Route request | — | Label family only |
| Читать о городе | Prelaunch secondary | Explore | `/explore` | OK escape |
| Смотреть фото | Home / explore | Photos | `/explore/photos` | Leads to empty archive |
| В каталог | Souvenirs preview | Shop | `/souvenirs` | OK |
| Написать о коллекции | Souvenirs | Contact | `/contact` | OK for empty |
| Оставить заявку | Product / business band | Order/B2B | form | Overloaded label |
| Уточнить товар | Souvenir CTA | Product Q | LeadForm | OK |
| Предзаказать открытку | AR | Preorder | LeadForm | OK |
| Открыть эффект | AR player | In-page | player | OK |
| Создать тур с нами | About | Contact | `/contact` | Stale travel-agency voice |
| Хотите анонсировать событие? | Events empty | Contact | `/contact` | OK |
| Открыть закрытый маршрут | Paid route | Club | Boosty | External; Club nav same |

### CTA verdict (patterns to consolidate later)

~**25+ public labels** collapsing into ~**8 intents**.

**Recommended B2C vocabulary (target model):**

1. **Смотреть маршруты** — browse catalog (`/map`)
2. **Пройти с Алёной** — guided intent
3. **Подобрать мне прогулку** — help me choose / contact

**B2B:** **Обсудить программу** (or keep **Обсудить задачу** if form-scoped).

**Chrome contact:** one of **Связаться** *or* **Контакты**, not both as peers with primary CTA.

---

## 7. Form friction audit

| Form | Fields (visible) | Required | Excess / notes | Compact vs full |
| --- | --- | --- | --- | --- |
| ContactForm (`/contact`) | name, contact, preferred, message, consent | name, contact, message, consent | Message\* often premature | Prefer compact for first contact |
| LeadForm compact | name, contact (+optional message) | name, contact | OK model | **Target compact B2C** |
| LeadForm route | + dates, people, format options | + message\* when full | Dates/people OK contextual; message\* still heavy | Contextual route form |
| BusinessForm | name, company, contact, taskType, description + collapsed extras | 5 core | Extras OK behind disclosure; no consent; `alert` on error | Full B2B justified |
| ProductOrderForm | name, email\*, phone?, tg?, message?, qty, consent | name, email, consent | **Email forced** vs contact-any elsewhere | Align with contact-any |
| AR preorder / question | similar + slug context | name, email, consent | Same email friction; dual forms on page | Compact + optional qty |
| Maker placement | many + 3 consents | high | Highest legal friction — OK for placement | Keep full |
| Photo submit | file + meta + 3 consents | high | Justified for UGC | Keep full |

**Target model (for later gates, not UX.A):**

- **Compact B2C:** name + one contact + optional short note + consent
- **Contextual route:** compact + dates/people/format when on route
- **Full B2B:** keep 5-field core + progressive extras

---

## 8. Prelaunch audit

| Section | Live value now (prod) | Primary nav? | «Ещё»? | Hide / direct URL / teaser |
| --- | --- | --- | --- | --- |
| Маршруты `/map` | **Empty PrelaunchState** | Must stay primary when live; **currently damages trust** | — | Keep URL; **do not** make empty state the hero promise |
| Исследовать | Content hub | Primary | — | Keep |
| Для бизнеса | Strong | Primary | — | Keep |
| О проекте | Manifesto | Primary | — | Keep; fix legacy name later |
| Контакты | Form | Primary | — | Consider demoting vs Связаться |
| События | Empty | No | Always listed | Prefer «Ещё» or hide until published |
| Фото | Empty archive | No | Always | Teaser OK; avoid home promise without content |
| AR | Prep / empty catalog | No | Always | «Ещё» or direct URL |
| Клуб | External Boosty only | No | Always | Keep external; clarify label |
| Сувениры | **Has products on prod** | No | Always | Can promote when stocked |
| Guides | Profiles empty | Linked from about | — | Soft teaser |

**Principle for UX.B+ / content gates:** production must not feel «half built». Empty always-on nav items are the main unfinished signal (especially Events/Photos/AR while Routes empty is catastrophic).

---

## 9. Typography map

### CURRENT TYPOGRAPHY MAP

| Font | Source | Applied | Cyrillic | Weights | Variable/static | Perf |
| --- | --- | --- | --- | --- | --- | --- |
| **Geist** | `next/font/google` → `--font-geist-sans` | Body / UI / brand wordmark / most H1 sans | **No** (latin, latin-ext only) → falls to Arial | Variable axis | Variable | Downloads Latin face rarely used for RU glyphs |
| **Geist Mono** | `next/font/google` → `--font-geist-mono` | Theme token only; **unused in UI** | No | Variable | Variable | Dead weight on every page |
| **Cormorant Garamond** | `next/font/google` → `--font-cormorant` | `.font-serif` display accents, hero H1, quotes | **Yes** | 300/400/500 × normal+italic | Static | Heaviest; italic 300 is critical path |
| Helvetica Neue / Arial | CSS fallbacks | **Actual RU sans rendering** | Arial yes | OS | System | Metrics mismatch vs Geist Latin |
| Georgia | Serif fallback | If Cormorant fails | Yes | OS | System | OK |

Declared in `app/(site)/layout.tsx`; tokens in `app/globals.css` (`--font-sans`, `--font-serif`).

### Role usage

| Role | Face | Pattern / issues |
| --- | --- | --- |
| Brand | Sans uppercase `tracking-widest` `text-sm font-medium` | Looks like Arial caps; not distinctive |
| Navigation | Sans `text-sm` muted, weight 400 | Light/small; poor hierarchy vs CTAs |
| Display | Cormorant italic accents + `font-light tracking-tight` sans | Strong editorial signature; inconsistent with catalog H1s (`font-medium` sans) |
| Body | Sans ~Arial, `leading-relaxed` / 1.6 | Readable but generic |
| UI | Sans `text-sm font-medium` buttons; labels `uppercase tracking-widest text-xs` | Labels very tracked; 10–11px meta hard |

---

## 10. Navigation typography audit

File: `components/layout/header.tsx`

| Element | Classes | Issue |
| --- | --- | --- |
| Wordmark | `text-sm font-medium tracking-widest uppercase` | Small for brand; tracking noise |
| Descriptor | `text-[11px] … truncate max-w-[220px] lg:max-w-xs` | Truncates («Иркут…»); hardcoded; competes with nav |
| Desktop nav | `text-sm text-muted-foreground` | Low contrast/weight; no clear active hierarchy |
| «Ещё» | same as nav | OK |
| Contacts | `text-xs uppercase tracking-wider` | Third type level in bar |
| Связаться / CTA | `text-sm` buttons `h-11` | Correct affordance; crowd the bar |
| Mobile links | `text-3xl font-light tracking-tight` | Better presence; long list |

**Verdict:** Problem is **not only the font family** — it is **density + size + weight + truncate + too many type levels**. Geist without Cyrillic makes menu labels render in Arial, so «wrong font feeling» is partly a **subset bug**. Recommended UX.B: fix Cyrillic UI face + tighten hierarchy; optionally keep Cormorant for display.

---

## 11. Wrapping audit

### Forced `<br>`

| Location | Classification |
| --- | --- |
| `city-hero-visual.tsx` `<br>` before «штампов» | Intended editorial; **often dead** because «Иркутск» link branch wins first |
| `contact/page.tsx` `Напишите<br />Алёне` | Editorially justified |
| `final-cta.tsx` `Готовы<br />гулять?` | Editorially justified |

### CSS wrap utilities

- `text-balance` / `text-pretty` / `text-wrap`: **none**
- `whitespace-nowrap`: Button + filter chips + floating contact rows
- `truncate`: header descriptor (problem), card overlays
- `line-clamp-*`: cards (OK)

### Bad wrap / orphan risks

| Surface | Problem |
| --- | --- |
| Hero H1 «Иркутск без штампов» | Large serif; orphan risk on «штампов»; intended `<br>` often unused |
| Header descriptor | Truncate mid-phrase; name/city link clipped |
| Route/article CMS titles | No balance; long RU titles rag |
| «Алёна Ямщикова» | Possible first/last name split |
| Souvenirs long H1 | Italic tail orphan risk |
| CTA buttons | nowrap OK; long labels steal header width |
| Privacy H1 | Multi-line legal title, no balance |

**Future rules (do not add in UX.A):** H1/H2 `text-balance`; body `text-pretty`; nav/CTA controlled nowrap; descriptor responsive (no hostile truncate).

---

## 12. Header audit

### Competing actions (xl desktop)

Brand + city link + 5 primary + Ещё + Telegram + Email (+MAX) + Связаться + Подобрать прогулку ≈ **11–13** targets.

**Conflict:** more than 2–3 peer actions. Especially:

- **Контакты** (nav) + **Связаться** (dropdown) + **Подобрать прогулку** (CTA) + messenger links

### Target navigation (proposal only — not implemented)

```text
Primary: Маршруты | Исследовать | Для бизнеса | О проекте | Ещё
Right:   Связаться   [optional single B2C CTA]
```

- Drop **Контакты** from primary if **Связаться** remains (or inverse).
- Keep secondary (Events, Photos, AR, Club, Souvenirs) in **Ещё**, gated by content readiness where possible.
- On `/business`, primary CTA should not scream B2C «Подобрать прогулку».

### Mobile

- Bar: brand + Telegram + hamburger (OK density)
- Sheet: ~20 targets with duplicated messengers (HeaderContacts + ContactDropdown + CTA)
- Need hierarchy: nav block → one contact method group → one primary CTA

---

## 13. Font pair candidates

### Candidate A — **Recommended: keep Cormorant + replace Geist with Cyrillic UI sans**

| Role | Font |
| --- | --- |
| Display / Editorial | **Cormorant Garamond** (keep) |
| UI / Text | **Onest** or **Manrope** or **Inter** with **cyrillic** subset (pick one after glyph check) |

**Why:** Editorial italic accent already defines Иркпортал. Main defect is Geist’s missing Cyrillic → Arial. Fixing UI face + tokens is lower risk than full rebrand fonts.

**Eval:** Cyrillic quality high on Onest/Manrope; good 13–15px UI; variable available; avoids luxury/tech template look if weights kept calm (400/500/600).

### Candidate B — Single family system

| Role | Font |
| --- | --- |
| Display + UI | **Onest** (or Manrope) only; italic sparingly via style |

Simpler perf; loses current serif signature.

### Candidate C — Stronger editorial

| Role | Font |
| --- | --- |
| Display | **Source Serif 4** or **Literata** (Cyrillic) |
| UI | **Source Sans 3** |

More «publishing»; risk of generic Google Fonts pair.

### Recommendation

**Candidate A.** Do **not** install fonts in UX.A. In UX.B: remove unused Geist Mono; load UI sans with `cyrillic`; keep Cormorant; retune sizes/weights/tracking for header.

If visual QA after Cyrillic fix feels sufficient, **do not** chase a third display face.

---

## 14. Recommended typography direction

1. **Keep** Cormorant Garamond for limited display accents + hero.
2. **Replace** Geist (and drop Geist Mono) with a Cyrillic-capable UI sans.
3. **Retune tokens:** nav ≥14–15px medium; reduce uppercase tracking noise; descriptor one line without hostile truncate.
4. **Add wrap policy:** balance headings; pretty body; nowrap only for chips/short CTAs.
5. **Unify** catalog H1s with marketing H1 system (fewer `font-medium` vs `font-light` accidents).

---

## 15. P0 / P1 / P2 / P3 ledger

### P0 — blocks journey

| ID | Issue |
| --- | --- |
| P0-1 | Production `/map` empty while «Маршруты» is primary promise — tourist funnel cannot select a product |
| P0-2 | (Content) Core routes/excursions not published — engineering alone cannot close; needs owner content gate |

*No broken submit endpoint found in code audit; lead POST exists. P0 is product emptiness, not API.*

### P1 — hurts choice / conversion

| ID | Issue |
| --- | --- |
| P1-1 | Hero primary CTA = contact (`Подобрать прогулку`) before catalog browse |
| P1-2 | CTA synonym sprawl (25+ labels) |
| P1-3 | Header: Контакты + Связаться + primary CTA + messengers |
| P1-4 | B2C forms too long for first contact (message\*, dates early) |
| P1-5 | Product/AR require email while contact allows any channel |
| P1-6 | Empty sections always in nav/home (photos, events, AR) → unfinished feel |
| P1-7 | Route detail drops embedded form (`showForm={false}`) — depends on messengers |
| P1-8 | B2C CTA still primary on `/business` page |

### P2 — perception quality

| ID | Issue |
| --- | --- |
| P2-1 | Geist without Cyrillic → Arial UI |
| P2-2 | Geist Mono loaded unused |
| P2-3 | Header descriptor truncate + hardcoded |
| P2-4 | No `text-balance` / `text-pretty` |
| P2-5 | Dual brand Иркпортал / Полезно |
| P2-6 | «с гидом» vs «с Алёной» voice split |
| P2-7 | `/souvenirs/success` leftover checkout copy |
| P2-8 | Mobile menu duplicates contact methods |

### P3 — polish

| ID | Issue |
| --- | --- |
| P3-1 | Inconsistent H1 weight systems |
| P3-2 | Eyebrow `tracking-[0.3em]` noise |
| P3-3 | Business form `alert()` errors |
| P3-4 | Minor spacing/alignment in header `h-16` two-line brand |

---

## 16. Target UX model

### Home B2C (hypothesis — confirmed by audit)

| Priority | Label | Dest |
| --- | --- | --- |
| Primary | **Смотреть маршруты** | `/map` |
| Secondary | **Подобрать мне прогулку** | `/contact` (help path) |
| Separate | **Для бизнеса** | `/business` (not equal peer to primary browse) |

**Override condition:** While `/map` is empty, primary browse CTA is dishonest — either publish routes **or** temporarily primary = help/contact with honest copy. Prefer **publish routes** (content gate), not permanent contact-first.

### Route funnel

```text
Маршруты → choose by situation/filter → route detail
  → самостоятельно (map) / с Алёной (compact form) / корпоратив (business)
  → short lead
```

### B2C vocabulary (3)

- Смотреть маршруты
- Пройти с Алёной
- Подобрать мне прогулку

### B2B

- Обсудить программу / Обсудить задачу (form)

---

## 17. UX.B implementation ledger

UX.B scope: **font pairing, typography tokens, sizes, weights, line-height, wrapping, header, navigation, mobile navigation.**  
No funnel rewiring of CTAs destinations unless needed for header chrome consistency; no CMS model changes; no deploy.

| File/component | Current problem | Proposed change | Risk | Acceptance |
| --- | --- | --- | --- | --- |
| `app/(site)/layout.tsx` | Geist latin-only; Mono unused | Swap UI sans to Cyrillic-capable; remove Mono; keep Cormorant | Font flash / layout shift | RU nav/body render in designed face; Lighthouse fonts OK; no layout.tsx logic change beyond fonts |
| `app/globals.css` | Tokens assume Geist; no wrap helpers | Update `--font-sans`; optional utility notes for balance/pretty | Global regression | Body/UI consistent; Cormorant still via `.font-serif` |
| `components/layout/header.tsx` | Density, truncate descriptor, type levels, duplicates | Retype sizes/weights; simplify visual hierarchy; fix descriptor behavior; mobile sheet hierarchy | Nav IA change perception | ≤3 peer actions visually; descriptor readable 360–1280; mobile no duplicate messenger stacks |
| `lib/navigation-constants.ts` | Контакты + contact CTA overlap | Propose primary set without Контакты **or** without Связаться peer | IA debate | Documented decision + implemented consistently desktop/mobile |
| `components/ui/button.tsx` | Global nowrap | Keep nowrap for short labels; allow wrap class override if needed | CTA wrap | Primary CTAs one line on mobile ≥360 where length allows |
| `components/visual/city-hero-visual.tsx` | Dead `<br>` branch; huge H1 orphans | Balance/wrap rules; fix title render branch if needed | Hero visual | H1 balanced 360/390/430/desktop; no orphan «штампов» |
| `app/(site)/contact/page.tsx` | Forced br | Keep or replace with CSS balance | Low | «Напишите / Алёне» still clear |
| `components/sections/final-cta.tsx` | Forced br | Same | Low | «Готовы / гулять?» intact |
| Marketing H1 pages (`explore`, `events`, `souvenirs`, `business-page-content`, etc.) | Inconsistent scale | Shared heading classes / tokens | Broad CSS | Visual consistency checklist |
| `components/contact/floating-contact.tsx` | Extra contact chrome | Typography only unless duplication addressed | Overlap with header | Does not fight header CTA visually |
| Docs follow-up | — | Update this file or UX.B notes after ship | — | Diff limited to intended files |

**Explicitly out of UX.B (defer):**

- Publishing routes content (owner/content gate)
- Rewriting all CTA copy sitewide (may be UX.C funnel gate)
- Form field reduction (UX.C)
- Removing legacy brand «Полезно» from about/footer (brand gate)
- Analytics events
- `/souvenirs/success` copy fix (small content fix — can ride along if safe)

---

## 18. Deferred items

- Content publication for routes/excursions (unblocks P0)
- Nav visibility flags tied to `getSecondaryCatalogFlags` / real emptiness
- CTA vocabulary enforcement across `CTA_VARIANT_COPY`
- Compact B2C form schema change
- Brand legacy cleanup
- PR from `phase15-gate-c-integrated` → master (separate release gate)
- Deploy of `a793650` (not this gate)
- Push of `phase15-ux-funnel-hardening` (after UX.B or when requested)

---

## Page 7-question matrix (summary)

| Page | Where am I? | Section? | For me? | Priority on screen | Main action | After action | Trap / competing CTA |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | Home brand | Navigator | Tourist/local/B2B mixed | Slogan + CTAs | Подобрать → contact | Form | Contact before routes; B2B peer |
| `/map` | Routes | Catalog | Tourist | Empty prelaunch | Подобрать / Читать | Form or explore | **Dead product** |
| Route detail | Specific route | Product | Chooser | Dual path | Map / guided / business | Intent | Form often messengers-only |
| `/explore` | Knowledge | Editorial | Local/curious | Categories | Read | Article | Weak route bridge |
| Article | Topic | Editorial | Reader | H1 + body | Related CTA | Route/contact | Contact fallback |
| `/explore/photos` | Archive | Photos | Visual | Empty | Prelaunch CTAs | Contact/explore | Unfinished |
| Photo detail | One photo | Archive | — | Image | Related route | Map/contact | — |
| `/business` | B2B | Programs | Companies | 3 directions + form | Обсудить задачу | Success | Header B2C CTA |
| `/souvenirs` | Shop | Merch | Gift | Catalog (live) | Product / contact | Form | Order ≠ pay |
| Product | SKU | Merch | Buyer | Order form | Оставить заявку | Inline | Email required |
| `/ar-postcards` | AR | Product line | Novelty | Prelaunch/catalog | Preorder | Form | «Скоро» effects |
| `/about` | Manifesto | Story | Trust | Quote/values | Create tour / B2B | Contact | Legacy name |
| `/contact` | Contact | Lead | High intent | Form | Отправить | Inline thanks | Long form |

---

## Validation notes (UX.A)

- Audit evidence: code + production browser snapshots (home, `/map`, `/business`).
- No UI source files modified in this gate.
- Documentation-only commit on `phase15-ux-funnel-hardening`.
- UX branch **not** pushed.
- Master / production **unchanged** by this gate.

---

*End of GATE UX.A baseline.*
