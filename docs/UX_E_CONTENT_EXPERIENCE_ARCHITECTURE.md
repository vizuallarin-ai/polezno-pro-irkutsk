# GATE UX.E — Content Readiness + Experience Architecture

**Branch:** `phase15-ux-funnel-hardening`  
**Baseline (UX.D tip):** `fd944ee2ef127b5937b3e470d2f88399f1e48f7d`  
**Constraint:** Do not change visual system (UX.D), CTA vocabulary (UX.C), or lead backend. This gate is architecture + operating system for content.

**Related owner pack:** `docs/phase15-gate-c-owner-content-pack.md`  
**Readiness code:** `lib/content-readiness.ts`, `lib/public-content-contract.ts`

---

## 1. Current Content State

### 1.1 Existing entities (live architecture)

| Entity | CMS / code | Public surface | Commercial readiness |
| --- | --- | --- | --- |
| Routes | `routes` | `/map`, `/map/[slug]` | Structure ready; often empty → Prelaunch |
| Excursions | `excursions` | `/excursions/[slug]` (catalog via `/map`) | Structure ready; often empty |
| Articles (Explore) | `articles` | `/explore`, `/explore/[slug]` | Strongest SEO/editorial layer |
| Photos | `photos` | `/explore/photos` + submit | Archive + UGC path; often empty |
| Products / makers | `products`, `makers` | `/souvenirs…` | Inquiry model (not e-commerce) |
| AR postcards | `ar-postcards` | `/ar-postcards…` | Preorder/question leads |
| Events | `events` | `/events…` | Calendar shell |
| Guides | `guides` | `/about/guides` | Thin / often empty |
| Reviews | `reviews` | Home SocialProof only | Stub; no listing page |
| Places | `places` | **No public page** | Hidden stub; related from articles |
| Partners | `partners` | None | Hidden stub |
| Business | static + CMS hooks | `/business` | Always present; B2B form |
| Author / brand | Site Settings | `/`, `/about` | Always present |
| Club | offsite Boosty | Nav only | Not an on-site catalog |

Demo content is fail-closed on production with `DATABASE_URL`. Section URLs stay public; empty catalogs use honest Prelaunch (UX.B).

### 1.2 Presentation vs acquisition

| Page type | Examples | Role today |
| --- | --- | --- |
| Presentation / brand | `/about`, scenario picker, author block | Trust + orientation |
| Catalog shells | `/map`, souvenirs, AR, events, photos | Ready for product; empty = Prelaunch |
| Editorial / SEO | `/explore` articles | Organic acquisition potential |
| Conversion | `/contact`, route CTAs, business form | UX.C complete |
| Offsite community | Boosty | Soft loyalty, not owned content graph |

### 1.3 Trust surfaces

- Author presence (Алёна) — strong brand signal
- Generic guest highlights when no reviews — **placeholder trust**
- Stats from Site Settings — optional
- Real photos / routes / reviews — **weak or empty on prod**

### 1.4 Depth gap (product perception)

The site can already **ask for a walk**. It cannot yet consistently **prove the depth of Irkutsk** through interconnected stories, places, people, and proof. That gap is the core of UX.E.

---

## 2. Missing Content Layers

| Layer | Status | Why it matters |
| --- | --- | --- |
| Places as hubs | Stub only | Connect routes ↔ articles ↔ photos |
| People / figures | Missing as entity | Decembrists, merchants, locals = desire |
| Eras / timeline | Fields only (`historicalPeriod`) | Cultural depth without new SPA |
| Baikal as destination | Tag/facet only | National demand magnet |
| Reviews / stories | Stub / highlights | Trust for 30–50k experiences |
| Video hub | URL fields only | Media growth |
| User stories | Photo UGC only | Share stage of funnel |

**UX.E rule:** do not invent CMS collections before publishable content exists. Prefer activating Places + publishing Routes/Excursions/Reviews first.

---

## 3. Experience Architecture

### 3.1 Current journey (as built)

```text
Unknown → Home (brand) → Explore OR Map
  → Route/Article → Intent CTA → Contact form → Lead → (offline) reply
```

B2B parallel: Home/Business → form → lead.

### 3.2 Losses today

| Stage | Loss |
| --- | --- |
| Discover | Empty catalogs; weak organic depth beyond a few articles |
| Trust | Few real reviews/photos; highlights feel generic |
| Desire | Thin storytelling links (place/person/era not first-class) |
| Book | UX.C is strong — not the bottleneck |
| Share | No owned story/UGC loop beyond Boosty + photo submit |

### 3.3 Target model

```text
DISCOVER  →  TRUST  →  DESIRE  →  BOOK  →  SHARE
   │           │          │         │        │
 explore/    author +   stories +  compact  reviews/
 photos/     proof      places +   lead     UGC/
 SEO         reviews    routes     form     media
```

Commercial promise: not “tour listing”, but **personal introduction to Irkutsk through someone who knows its history, people, places, and hidden meanings**.

---

## 4. Target Content Model

### 4.1 Entity map

| Entity | Exists for | User need | Links to | Conversion |
| --- | --- | --- | --- | --- |
| Authorial routes | Core paid/self-guided product | “What should I do?” | places, stories, Alena | Пройти с Алёной / Смотреть маршруты |
| Places | Geographic/cultural anchors | “What is this place?” | routes, articles, photos | Related route CTA |
| Stories / articles | Meaning + SEO | “Why does this matter?” | places, eras, routes | Assist / open route |
| People / figures | Emotional memory | “Who shaped the city?” | eras, places, stories | Explore → route |
| Eras | Temporal frame | “How did Irkutsk become…” | stories, places | Category hubs |
| Cultural phenomena | Unique angles | Curiosity beyond checklist | stories, media | Share + explore |
| Baikal | Destination demand | “Baikal + city” | routes, stories | Guided / assist |
| Video | Reach + emotion | Quick immersion | stories, places | Contact / route |
| Reviews | Proof | Risk reduction | routes, experiences | Book |
| User stories / UGC | Belonging | “People like me went” | photos, routes | Share + assist |

### 4.2 Need → stage → business value

| Content | Need | Stage | Business value |
| --- | --- | --- | --- |
| Explore article | Orient / dream | Discover | SEO + desire |
| Photo archive | Atmosphere | Discover/Trust | Brand depth |
| Review | Reduce risk | Trust | Conversion rate |
| Route detail | Choose | Desire | High-intent lead |
| Guided CTA | Commit | Book | Revenue |
| After-tour story | Belong | Share | Referrals + content flywheel |

---

## 5. Premium Positioning Framework

**From:** экскурсия по Иркутску (commodity).  
**To:** персональное знакомство с городом через эксперта, который знает историю, людей, места и скрытые смыслы.

### Premium perception stack

1. **Авторская методология** — how Alena builds a walk (criteria, pacing, what she refuses).
2. **Истории** — not checklists; narrative beats per place.
3. **Доступ к неочевидному** — yards, details, people, off-postcard Irkutsk.
4. **Локальная экспертиза** — living knowledge, not agency script.
5. **Персонализация** — dates, energy, group, interest (UX.C already starts this).
6. **Социальное доказательство** — named reviews, guest photos, specific outcomes.

Site UX already supports premium *presentation*. Content must supply premium *substance*.

---

## 6. SEO Content System

### 6.1 Principle

SEO must attract people with intent to **understand Irkutsk** and **buy an experience**, not generic “туры Байкал дёшево”.

### 6.2 Clusters (pillars)

| Pillar | Supporting stories | Experience pages | Conversion |
| --- | --- | --- | --- |
| Иркутск без штампов | wooden city, courtyards, center walks | flagship route/excursion | guided / assist |
| История и люди | Decembrists, merchants, eras | related routes | assist |
| Байкал рядом с городом | lake+city days, seasons | Baikal-linked routes | guided / B2B |
| Жить / гулять локально | local guides, hidden places | self-guided routes | assist |
| Для гостей 2–5 дней | itineraries | `/map` programs | discovery CTA |
| Для бизнеса | city programs | `/business` | Обсудить программу |

### 6.3 Model

```text
Pillar Content (explore hubs / flagship articles)
  → Supporting Stories (articles, photos, people)
    → Experience Pages (routes / excursions)
      → Conversion (/contact intent or #lead-form)
```

Internal links: every story → related place/route; every route → 1–2 stories + guided CTA; never B2C → `/business`.

---

## 7. Media Growth Foundation

### Formats

| Format | Role | Cadence (target) |
| --- | --- | --- |
| Long articles | SEO + depth | 2–4 / month |
| Photo stories | Atmosphere | continuous archive |
| Short video | Reach / Reels | weekly when filming |
| Long video | YouTube authority | monthly |
| Place essays | Hub pages | with Places activation |
| Expert notes | Methodology / B2B | monthly |

### Themes that travel beyond Irkutsk

- “Irkutsk is not only Baikal”
- Wooden city as living fabric
- Decembrist / merchant layers without textbook dryness
- Winter city without postcard kitsch
- How a local guide designs a walk
- Baikal day that still respects the city

---

## 8. Content Operating System (after each walk)

Collect within 48h:

1. **Facts:** group size, weather, pace, deviations from plan  
2. **Stories:** 1 guest question, 1 surprising detail, 1 emotional beat  
3. **Proof:** 3–10 photos (rights cleared), optional short clip  
4. **Quote:** 1 permissioned guest line → Reviews CMS  
5. **Place notes:** update Place/article seeds (what worked)  
6. **Lead loop:** what made people book / hesitate  

Library growth path: raw notes → story draft → place enrichment → route polish → review publish → social cut.

---

## 9. Implementation Roadmap

### PHASE 1 — Close GATE UX.E (foundation only)

| Action | Why | Impact | Complexity |
| --- | --- | --- | --- |
| Publish this architecture + owner priority list | Align team without code churn | Clarity | Low |
| Keep Prelaunch honesty | Trust | High | Done |
| Priority publish pack: 1 excursion, 1–2 routes, author complete, 3 reviews, hero photo | Make `/` and `/map` truthful | High | Owner content |
| 3–5 explore articles in pillars | SEO + desire | High | Medium |
| Do **not** open Places/Video hubs empty | Avoid hollow premium | High | Decision |

### PHASE 2 — Content engine

| Action | Why | Impact | Complexity |
| --- | --- | --- | --- |
| Activate Places pages when ≥N real places | Hub graph | High | Medium |
| Reviews listing when featured exist | Trust | High | Low–Med |
| Post-walk OS in checklist/admin habit | Flywheel | High | Process |
| Internal linking pass article↔route | SEO + conversion | Med | Low |
| Short video pipeline | Reach | Med | Medium |

### PHASE 3 — Regional media platform

| Action | Why | Impact | Complexity |
| --- | --- | --- | --- |
| People + eras taxonomies | Depth | High | Medium |
| Baikal destination narrative | National demand | High | Medium |
| Video hub | Media brand | Med | High |
| UGC stories program | Share stage | Med | Medium |
| Partners as trust layer | B2B/B2C | Med | Low |

---

## 10. Definition of Done — GATE UX.E

GATE UX.E is **CLOSED** when:

1. Content inventory and gaps documented (this file).  
2. Experience model DISCOVER→TRUST→DESIRE→BOOK→SHARE documented.  
3. Premium positioning framework documented.  
4. Target entity model + conversion links documented.  
5. SEO cluster model documented.  
6. Media + post-walk operating system documented.  
7. Phased roadmap with effort/impact documented.  
8. No visual redesign / no CTA vocabulary rewrite / no fake content.  
9. Owner next actions clear (link to content pack).  
10. Commit on UX branch; production deploy handled separately as ops.

**Explicit non-goals for UX.E code:** new Payload collections, fake routes/reviews, hiding Prelaunch sections, marketplace features.

---

## 11. Owner next actions (immediate)

Reuse / execute `docs/phase15-gate-c-owner-content-pack.md`:

1. Flagship excursion (complete fields + photos + price)  
2. 1–2 self-guided or guided routes  
3. Author photo + bio confirmed  
4. 3 real reviews with permission  
5. One true hero photograph  
6. Then: 3 pillar articles (history / walk / Baikal-city)

Until then, conversion UX remains ready; desire/trust layers stay thin by content, not by interface.
