# GATE UX.G — Real Experience Activation

## 1. Final Status

**GATE UX.G ENGINEERING READY / OWNER CONTENT BLOCKED / NO FAKE EXPERIENCE PUBLISHED**

Production remains on cultural media + working Discover/Trust/Book inquiry graph.  
**No** synthetic excursion, route, review, or fake social proof was published.

---

## 2. Baseline

| Item | Value |
|------|-------|
| Local branch | `phase15-ux-funnel-hardening` |
| Local / origin HEAD | `a3662203754e8456462280cd22dfbb5db87620d2` |
| Worktree | Clean tracked; untracked local docs/scripts/images only |
| Production SHA | `ff8e2e0a36fc4716a7834adc26076a7e588680c6` |
| `polezno-current` | `/var/www/polezno-releases/ff8e2e0…` |
| Prior gates | UX.D / UX.D.2 / UX.E / UX.F eng / OPS.1 closed as documented |

### Canonical docs read

- `docs/UX_E_CONTENT_EXPERIENCE_ARCHITECTURE.md`
- `docs/UX_F_CONTENT_ACTIVATION.md`
- `docs/UX_D2_TYPOGRAPHY_REBUILD.md`
- `docs/OPS_1_PRODUCTION_HYGIENE.md`
- `docs/phase15-gate-c-owner-content-pack.md`

### Production DB counts (2026-09-05, live Postgres)

| Entity | Count | Notes |
|--------|------:|-------|
| `articles` | 9 (8 published sampled) | Real Explore corpus |
| `excursions` | **0** | |
| `routes` | **0** | |
| `reviews` | **0** | |
| `photos` | **0** | |
| `site_settings` | **0** | Brand defaults in code |
| `media` | 4 | 2 seed placeholders + 1 shutterstock file + `Alena.jpg` (rights/alt incomplete) |
| `leads` | 0 | |

---

## 3. Owner Content Inventory

| Item | Status | Source |
|------|--------|--------|
| Flagship excursion | **MISSING** | DB `excursions=0`; Gate C pack Part A.1 blank |
| Route 1 | **MISSING** | DB `routes=0`; pack A.2 blank |
| Route 2 | **MISSING** | DB `routes=0`; pack A.3 blank |
| Reviews (3 or opt-out) | **MISSING** | DB `reviews=0`; pack A.6 unchecked |
| Launch photography + rights | **MISSING / UNVERIFIED** | No published `photos`; shared media has `Alena.jpg` without Site Settings / rights row |
| Author profile (Site Settings) | **PARTIAL** | Code defaults (`BRAND` / `getSiteSettings` fallbacks); CMS row empty |
| Price / duration / group / format | **MISSING** | No excursion/route rows |
| Includes / excludes / meet / cancel | **MISSING** | No CMS data |
| Booking process confirmation | **PARTIAL** | Product inquiry flow exists (`/contact` + lead API + context); owner pack A.1.9 unanswered |
| Untracked local folder `####/` (docx/pdf ~92MB) | **UNVERIFIED** | Filenames mojibake on Windows console; **not** treated as publish-approved owner proof until Alena fills Gate C pack + publication checkbox |

**Rule applied:** AI copy and unverified local files ≠ owner-approved commercial content.

---

## 4. Real / Partial / Missing

### READY (engineering + real content already live)

- Explore articles (8+) and article pages  
- Home → Explore → Article → About → Contact graph (UX.F)  
- Lead form with non-PII context (`lib/cta-constants.ts`, `components/forms/lead-form.tsx`)  
- Fail-closed public readiness (`lib/content-readiness.ts`, `lib/public-reviews.ts`)  
- Excursion/route page templates + SEO helpers + schema builders  
- Map Prelaunch empty state when no experiences  
- OPS.1 disk headroom for next ingest deploy  

### PARTIAL

- Author: brand defaults on About; no CMS Site Settings / approved portrait pipeline  
- Media: `Alena.jpg` in shared storage — **NOT PUBLIC** as product asset without rights + Site Settings  

### MISSING (blocks UX.G close)

- Published flagship excursion  
- ≥1–2 published routes with narrative points  
- Reviews **or** explicit owner opt-out  
- Rights-cleared hero/route/experience photos  
- Final commercial parameters (price unit, duration, group)  
- Owner publication permission (Gate C Part A.9)  

### NOT PUBLIC

- Seed/demo media (`seed-placeholder-*`)  
- Any draft CMS content (none present)  

---

## 5. Published Experience

**None.** Gate correctly refuses surrogate product.

---

## 6. Experience Architecture

**Prepared (code), not filled (data):**

| Layer | Code surface | Data |
|-------|--------------|------|
| Detail page | `app/(site)/excursions/[slug]/page.tsx` | empty |
| Catalog via experiences | `lib/experiences.ts` → `/map` | `hasPublicExperiences() === false` |
| CMS model | `payload/collections/Excursions.ts` | title, slug, format, short/full, price / on-request, duration, groupSize, includes/excludes, cover, relatedRoutes, guide, richText, featured, SEO |
| JSON-LD | `touristTripSchema` | unused until publish |

Target page architecture from gate brief remains the **ingest checklist** when owner data arrives — not implemented as empty shells.

---

## 7. Desire Layer

**Not activated.** Desire requires a real product. Current Desire CTAs stay honest Prelaunch / Explore / Contact assist.

---

## 8. Premium Substance

**Cannot claim.** No proven personalization, group limits, special access, or logistics beyond brand narrative on Explore/About.

---

## 9. Routes

**0 published.** Route collection schema exists (`payload/collections/Routes.ts`) including geometry fields. Public `/map` remains Prelaunch.

---

## 10. Explore Integration

Wiring for related route/excursion blocks exists on article pages (UX.F). With empty relations, articles correctly show author / continue / contact — **no fake “book this tour”**.

---

## 11. Home Integration

Home shows real Explore preview + author approach trust. **No** marketplace experience grid invented. When `hasPublicExperiences` flips, catalog surfaces activate without redesign.

---

## 12. Trust / Reviews

`lib/public-reviews.ts` filters demo/empty. Home trust remains approach/process — **no empty reviews carousel**.

---

## 13. Author Integration

About + brand defaults live. Experience↔author link awaits guide relation + Site Settings photo/bio confirmation.

---

## 14. Photography

| Asset | Status |
|-------|--------|
| Editorial Explore | Text-first; limited stock/illustration |
| `Alena.jpg` shared | File exists; rights/alt/Site Settings incomplete → **not activated as product proof** |
| Excursion/route covers | Missing |

---

## 15. Pricing

No live commercial price. Gate C explicitly forbids republishing old chat prices without reconfirmation.

---

## 16. CTA / Booking Flow

Existing B2C inquiry path is production-ready:

Experience/Contact → `/contact?…` context → lead API → notify.

Without an experience slug, CTAs correctly remain Discover / Assist.

---

## 17. Context Preservation

Proven in engineering (UX.C / phase15 checks): product type + slug in URL/payload; form shows “Вы выбрали: …”. Ready for excursion/route intents when published.

---

## 18. Mobile Acceptance

Not re-run for new experience UI (none shipped). UX.D.2 typography remains production baseline.

---

## 19. SEO

Article SEO live. Experience SEO templates ready; no thin experience URLs created.

---

## 20. Share Layer

Article OG paths exist. Experience OG will use excursion SEO image when owner provides cover.

---

## 21. Content Ingestion

**Path without rewrite:**

1. Payload Admin → create Excursion / Routes / Reviews / Media  
2. Set `status=published`, fill required commercial fields  
3. Link articles ↔ routes/excursions via existing relations  
4. Fill Site Settings global  
5. Optional: non-destructive import script later — **do not** run destructive seeds on prod  

`hasPublicExperiences()` flips map/home commercial surfaces automatically.

---

## 22. Production Data Safety

**No production mutations** in UX.G (no inserts, no resets, no seed).  
Articles and shared media untouched.

---

## 23. Files Changed

| File | Change |
|------|--------|
| `docs/UX_G_REAL_EXPERIENCE_ACTIVATION.md` | This report + Owner Blocking Pack |

No application code changes (no-fake / no surrogate product).

---

## 24. Tests / Build

Not required for docs-only blocked gate. Prior production build of `ff8e2e0` remains live; OPS.1 headroom OK for future content deploy.

---

## 25. Deployment

**No deploy.** Product SHA unchanged: `ff8e2e0…`.

---

## 26. Production Smoke

| Check | Result |
|-------|--------|
| `/api/health` | `ff8e2e0…` ok |
| Public graph | Explore articles live; map/excursions empty honest |
| Fake experiences | Absent |

---

## 27. End-to-End Evidence

Journey **DISCOVER → TRUST → BOOK (inquiry)** still works on articles/author.  

**DESIRE → SELECT → BOOK (product)** **not** proven — blocked on owner content.

---

## 28. Remaining Risks

- Untracked `####/` materials may contain owner drafts — must not be auto-ingested without pack + permission.  
- Shutterstock-named media file in shared storage: treat as **not** cleared for marketing until rights confirmed.  
- Temptation to “fill” Desire with AI copy would violate Gate C / UX.G no-fake rule.

---

## 29. Definition of Done Evidence

| DoD item | Status |
|----------|--------|
| ≥1 real experience published | **FAIL — blocked** |
| Owner-approved only / no fake proof | **PASS (by refusal)** |
| Price/duration/format/group | **FAIL — missing** |
| Explore/Home/Route integration of product | **N/A until data** |
| CTA + context | **PASS (engineering)** |
| UX.D.2 preserved | **PASS** |
| Production data safe | **PASS** |
| Full DESIRE→BOOK proof | **FAIL — blocked** |

Gate **not** closed as product-complete. Engineering readiness for ingest is **PASS**.

---

## 30. Recommended Next Gate

**Owner execution of Gate C pack → UX.G resume (content ingest + publish + E2E + deploy).**  
Do **not** start UX.G product coding until Part A minimum is filled and signed.

Alternate label: **UX.G-CONTENT** after owner delivery.

---

# Owner Blocking Pack (exact)

Fill answers in `docs/phase15-gate-c-owner-content-pack.md` (or same structure by email). Below: machine-usable blocking list.

### 1. FLAGSHIP EXPERIENCE / TITLE + PROMISE

| Field | |
|-------|--|
| **ITEM** | Flagship guided experience title + short promise |
| **MISSING DATA** | Final public title; 2–4 sentence short description (audience + what guest sees) |
| **WHY REQUIRED** | H1 + hero lead + catalog card; without it no public `/excursions/[slug]` |
| **EXACT FORMAT** | Title ≤80 chars; shortDescription 400–800 chars; Russian; no unverified superlatives |
| **EXAMPLE STRUCTURE** | Title: «…» / Short: «Прогулка для … Вы увидите … Отличие от обзорной: …» |
| **WHERE IT WILL APPEAR** | `/excursions/[slug]`, `/map`, optional Home featured |
| **WHAT IT UNLOCKS** | Desire entry + SELECT |

### 2. FLAGSHIP EXPERIENCE / FULL NARRATIVE

| Field | |
|-------|--|
| **ITEM** | Full program narrative (order of places + why each) |
| **MISSING DATA** | Ordered places; 1–2 true sentences each; what makes it non-generic |
| **WHY REQUIRED** | Desire substance + editorial body; fails “story not marketplace card” |
| **EXACT FORMAT** | Numbered list OR rich text sections; no invented history |
| **EXAMPLE STRUCTURE** | 1. Place — why · 2. Place — why · Closing: what guest understands |
| **WHERE IT WILL APPEAR** | Experience page body / richText |
| **WHAT IT UNLOCKS** | Desire layer + related Explore linking targets |

### 3. FLAGSHIP EXPERIENCE / COMMERCIAL BLOCK

| Field | |
|-------|--|
| **ITEM** | Price, duration, group, format, included/excluded |
| **MISSING DATA** | Final price **or** explicit «по запросу»; unit (group/person); duration minutes; min–max group; format (walking/…); includes[]; excludes[] |
| **WHY REQUIRED** | Product clarity + BOOK CTA honesty; Gate C forbids stale chat prices |
| **EXACT FORMAT** | `price`: integer RUB **or** `priceOnRequest=true`; `duration`: integer minutes; `groupSize`: text e.g. `2–6 человек`; arrays of strings for includes/excludes |
| **EXAMPLE STRUCTURE** | Price 12000 / group / 180 min / 2–6 / Входит: гид, … / Не входит: транспорт, … |
| **WHERE IT WILL APPEAR** | Experience practical block, schema price if fixed |
| **WHAT IT UNLOCKS** | Premium clarity + booking CTA |

### 4. FLAGSHIP EXPERIENCE / LOGISTICS + POLICY

| Field | |
|-------|--|
| **ITEM** | Meeting point + cancel/weather rules + booking confirmation |
| **MISSING DATA** | Public meeting description (no private address if undesired); cancel/reschedule/weather rules; confirm form→manual date OK |
| **WHY REQUIRED** | Trust + post-inquiry expectation |
| **EXACT FORMAT** | Free text; yes/no on «заявка через сайт, дату подтверждаю лично» |
| **EXAMPLE STRUCTURE** | Meet: «у … ориентир …» / Cancel: «за 48ч …» / Booking: да |
| **WHERE IT WILL APPEAR** | Practical Information section |
| **WHAT IT UNLOCKS** | Complete BOOK journey copy |

### 5. ROUTE 1 + ROUTE 2 / SELF-GUIDED

| Field | |
|-------|--|
| **ITEM** | Two distinct self-guided routes |
| **MISSING DATA** | Title; purpose (1–3 sentences); ordered points (≥3 each) with short true blurbs; duration/distance if known; map method (Yandex link / place links / walkthrough / GPX); owner walk confirmation + date; “what we must not promise” |
| **WHY REQUIRED** | Route ≠ excursion; Desire + Explore graph + `/map` honesty |
| **EXACT FORMAT** | Per Gate C §§2–3; points list; confirmation checkbox |
| **EXAMPLE STRUCTURE** | Route title · Why · P1…Pn · Duration · Confirmed: yes / date |
| **WHERE IT WILL APPEAR** | `/map/[slug]`, related blocks on articles/experience |
| **WHAT IT UNLOCKS** | SELECT layer + article→route CTAs |

### 6. PHOTOGRAPHY / RIGHTS MATRIX

| Field | |
|-------|--|
| **ITEM** | Rights-cleared photos for experience, routes, profile |
| **MISSING DATA** | Per-file: role (HERO/EDITORIAL/ROUTE/AUTHOR/PROOF/AMBIENT), filename, photographer, publish yes/no, caption, signature; third-party consent if not owner |
| **WHY REQUIRED** | Visual Desire without legal/risk filler |
| **EXACT FORMAT** | Table Gate C §5; prefer JPG/WebP ≥1600px long edge for hero |
| **EXAMPLE STRUCTURE** | #1 HERO excursion / `file.jpg` / Alena / да / caption |
| **WHERE IT WILL APPEAR** | Covers, About, experience gallery |
| **WHAT IT UNLOCKS** | Photography system + OG images |

### 7. REVIEWS / OR EXPLICIT OPT-OUT

| Field | |
|-------|--|
| **ITEM** | Three permissioned reviews **or** written opt-out |
| **MISSING DATA** | Name; text; which experience/context; source; publish permission; **or** checkbox «открываем без отзывов» |
| **WHY REQUIRED** | No fake proof; empty carousel forbidden |
| **EXACT FORMAT** | Gate C §6; real names only with consent |
| **EXAMPLE STRUCTURE** | Reviewer · city optional · text · experience link · permission yes |
| **WHERE IT WILL APPEAR** | Home SocialProof / experience trust (if opted in) |
| **WHAT IT UNLOCKS** | Named TRUST layer |

### 8. SITE SETTINGS / AUTHOR

| Field | |
|-------|--|
| **ITEM** | Public author identity for product |
| **MISSING DATA** | Display name; one-line role; first-person bio; approved portrait (may reuse rights-cleared `Alena.jpg` only after pack confirmation) |
| **WHY REQUIRED** | Author-as-product-asset on experience + About consistency |
| **EXACT FORMAT** | Site Settings fields + media upload |
| **EXAMPLE STRUCTURE** | Name · Role · Bio 500–1200 chars · photo |
| **WHERE IT WILL APPEAR** | About, experience guide block, footer |
| **WHAT IT UNLOCKS** | Author integration DoD |

### 9. ARTICLE ↔ PRODUCT LINKS

| Field | |
|-------|--|
| **ITEM** | Which Explore articles map to which route/experience |
| **MISSING DATA** | Explicit pairs (article slug → route/excursion slug) only where thematic link is real |
| **WHY REQUIRED** | Experience graph without spam CTAs |
| **EXACT FORMAT** | Table: `article_slug | related_route_slug | related_excursion_slug | CTA label` |
| **EXAMPLE STRUCTURE** | `wooden-irkutsk-details` → route `…` → excursion `…` → «Обсудить прогулку» |
| **WHERE IT WILL APPEAR** | Article related blocks |
| **WHAT IT UNLOCKS** | Explore→Desire path |

### 10. PUBLICATION PERMISSION

| Field | |
|-------|--|
| **ITEM** | Final go-live signature |
| **MISSING DATA** | Gate C Part A.9 checkboxes + name + date |
| **WHY REQUIRED** | Legal/editorial authority to publish commercial claims |
| **EXACT FORMAT** | Signed pack |
| **EXAMPLE STRUCTURE** | «Проверила тексты, цены, фото… разрешаю публикацию» |
| **WHERE IT WILL APPEAR** | Ops checklist before prod ingest |
| **WHAT IT UNLOCKS** | Production publish + UX.G close attempt |

---

**Minimum to reopen UX.G for closing:** items **1–4 + 5 (at least one route) + 6 (enough for hero) + 7 (reviews or opt-out) + 8 + 10**.  
Item 9 can follow within the same ingest sprint.
