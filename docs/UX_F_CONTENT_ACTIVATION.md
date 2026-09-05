# GATE UX.F — Content Activation + Trust/Desire Layer

**Final status:** `GATE UX.F ENGINEERING CLOSED / OWNER CONTENT BLOCKED`

**Branch:** `phase15-ux-funnel-hardening`  
**Baseline SHA (pre-UX.F):** `3d8c3002440bc89542fb519709368acbfde53be6`  
**Canonical prior gate:** `docs/UX_E_CONTENT_EXPERIENCE_ARCHITECTURE.md`  
**Owner pack:** `docs/phase15-gate-c-owner-content-pack.md`

This gate activates the **minimum real experience graph** on production without inventing routes, reviews, places, or social proof. Full premium Trust/Desire with bookable experiences remains **blocked on owner content**.

---

## 1. Final Status

| Criterion | Result |
| --- | --- |
| Real content inventory | Done (prod DB + CMS) |
| Fake public proof | Absent (reviews=0; approach trust only) |
| DISCOVER → TRUST → DESIRE → BOOK | **Partial:** Discover/Trust/Book work on real articles + author + leads; **Desire (routes/excursions) empty** |
| Dead-end removal (articles) | Done (cross-category related + continue block) |
| Author in graph | Done |
| Internal linking where justified | Done (articles ↔ author ↔ explore; route links ready when CMS filled) |
| CTA context | Done (no vocabulary rewrite of UX.C) |
| Owner gap checklist | Done (this doc §14) |
| Ingestion path | Ready for articles/routes/reviews without code rewrite |
| SEO of existing articles | Titles/canonicals/JSON-LD present; covers/SEO fields partial |
| Mobile | Layout uses existing responsive primitives; smoke after deploy |
| Build / smoke | See §20–22 |
| Rollback release | Keep `4930129…` and previous UX tip |

**Why not “UX.F CLOSED”:** production has **0 routes, 0 excursions, 0 reviews, 0 photos, empty Site Settings row**. Desire layer and named social proof cannot be completed without owner materials. Engineering activation of the graph around **8 real articles + brand/author defaults** is complete.

---

## 2. Baseline

| Item | Value |
| --- | --- |
| Branch | `phase15-ux-funnel-hardening` @ origin |
| Worktree | Clean for product files; local untracked noise ignored |
| Production (pre) | SHA `3d8c300…`, identityComplete, worktreeDirty=false |
| Deploy topology | Immutable `/var/www/polezno-releases/<sha>` → `polezno-current`; shared env/media; PM2 `polezno` |
| Disk (pre) | ~78% (`11G/14G`) |
| Media build note | `public/media` symlink **after** `next build` (Turbopack) — unchanged |

---

## 3. Real Content Inventory (production DB)

| Entity | Count / state | Classification |
| --- | --- | --- |
| Articles published | 8 (featured, author Алёна) | **REAL** (editorial substance; `irkutsk-history` longest) |
| Articles draft empty | 1 | NOT READY |
| Routes | 0 | EMPTY |
| Excursions | 0 | EMPTY |
| Reviews | 0 | EMPTY |
| Photos | 0 | EMPTY |
| Places | 0 | EMPTY |
| Events | 0 | EMPTY |
| Makers | 0 | EMPTY |
| Site Settings rows | 0 | EMPTY → code `BRAND` fallbacks |
| Guides | 1 (`slug=Slug`, bio=`О себе`) | PLACEHOLDER / blocked by readiness |
| Products | 4 published + seed media | PLACEHOLDER (fail-closed Prelaunch) |
| AR postcards | published + seed SVG | PLACEHOLDER (fail-closed Prelaunch) |
| Media | seed SVGs + `Alena.jpg` + shutterstock jpg | PARTIAL (author file unused without settings) |

---

## 4. Placeholder / Missing Content

**Placeholder (not public product):** incomplete guide; seed-backed souvenirs/AR.  
**Missing (blocking Desire):** flagship excursion, 2 routes, 3 permissioned reviews, hero/route photos, filled Site Settings (author photo/bio).  
**Unpublished:** empty draft article #10; AR drafts.

---

## 5. Experience Graph Before

```text
Home → Scenario → Author → “guest highlights” framing → Prelaunch photos/souvenirs → CTA
Explore articles → often ZERO similar (1 per category) → CTA only → dead end
About → guides link (empty) → CTA
Map / routes → Prelaunch empty
```

---

## 6. Experience Graph After

```text
HOME
  → Explore rail (3 real articles)     [DISCOVER]
  → Author → /about + assist           [TRUST]
  → Approach trust (not fake guests)   [TRUST]
  → Hero/Final CTA: Explore or Map     [context]
  → Contact form                       [BOOK]

ARTICLE
  → Author link /about                 [TRUST]
  → Related route/excursion when CMS   [DESIRE]
  → Similar across categories          [DISCOVER]
  → «Куда дальше» continue block       [stage CTAs]
  → Assist / ContactCta                [BOOK]

ABOUT
  → Manifest + author text             [TRUST]
  → Featured articles                  [DISCOVER]
  → Assist + Explore + Business        [BOOK / B2B]
```

---

## 7. Trust Layer Changes

- Social proof empty state retitled **«Как устроен подход»** (not guest quotes).
- Explicit note: named reviews appear only with permission.
- Reviews loader filtered via `lib/public-reviews.ts` (demo markers / empty rejected).
- Author remains primary trust asset (Site Settings / BRAND).

---

## 8. Desire Layer Changes

- Articles gain continue journey + honest CTA copy when catalog empty.
- Home/Final CTA prefer **Explore** while experiences are empty (avoid false “catalog full”).
- Route/excursion related blocks wired for when owner publishes relations — no synthetic products.

---

## 9. Author Integration

- Home author block already linked to `/about`.
- Article byline → `/about`.
- About uses shared `getSiteSettings()`, shows author short text, featured articles, explore + assist CTAs.
- Guides listing left Prelaunch (placeholder CMS guide not public-ready).

---

## 10. Route / Experience Improvements

- No synthetic routes/excursions.
- `hasPublicExperiences()` drives CTA context.
- Owner pack remains source of truth for publishing first products.

---

## 11. Explore Improvements

- Articles pass `isPublicPublishedReady`.
- `getSimilarExploreMaterials` fills cross-category when cluster is thin.
- Explore index links to approach + assist under featured.
- Home Explore preview section.

---

## 12. Internal Linking

| From | To |
| --- | --- |
| Home | Articles, About, Contact, Explore |
| Article | About, similar articles, route/excursion if set, Contact |
| About | Explore featured, Contact, Business |
| Explore | About, Contact, Map (prelaunch until filled) |

Places layer **not** opened empty.

---

## 13. CTA Context

UX.C labels preserved. Contextual selection:

| Stage | Behaviour |
| --- | --- |
| DISCOVER | Исследовать Иркутск / similar materials |
| TRUST | О проекте / approach |
| DESIRE | Смотреть маршруты / related experience when catalog ready |
| BOOK | Подобрать мне прогулку / ContactCtaSection |

---

## 14. Owner Content Gap

### BLOCKING NOW

| Item | Format | Min volume | Lands on | Unlocks |
| --- | --- | --- | --- | --- |
| Flagship excursion | Title, short+full text, price or «по запросу», duration, group, meet point, cancel rules | Complete Part A.1 | `/excursions/[slug]`, `/map` | Desire + Book product |
| Route 1 | Ordered points + map source + duration | Complete Part A.2 | `/map/[slug]` | Self-guided Desire |
| Route 2 | Same, distinct from #1 | Complete Part A.3 | `/map/[slug]` | Catalog depth |
| Author profile in Site Settings | Name, role, short bio, portrait rights | Part A.4 | Home, About | Trust photo (not only BRAND text) |
| 3 permissioned reviews **or** explicit opt-out | Name + text + consent | Part A.6 | Home trust | Named social proof |
| Launch photos with rights | Excursion/routes/profile | Part A.5 | Covers/hero | Visual Desire |
| Publish permission checkbox | Table at end of pack | Part A.9 | Ops | Legal publish |

### NEEDED NEXT

| Item | Why |
| --- | --- |
| Cover images + seo.title/description on 8 articles | SEO + desire |
| Link articles → routes once published | Graph Desire |
| Real photos archive (≥4 featured) | Home photos rail |
| Fill Site Settings contacts (non-placeholder) | Contact transparency |

### LATER

Souvenirs, AR, Places hubs, additional guides, video — only with real assets.

---

## 15. Content Ingestion Readiness

| Entity | Path | Code change needed for next publish? |
| --- | --- | --- |
| Article | Payload → `/explore` | No (readiness + linking already) |
| Route / excursion | Payload → `/map` | No (`hasPublicExperiences` flips CTAs) |
| Review featured | Payload → home | No (`public-reviews` filter) |
| Photo | Payload approved | No |
| Related article→route | CMS relation fields | No |

Bottleneck is **owner fill**, not multi-file engineering.

---

## 16. SEO Readiness

- Articles: canonical via `buildPageMetadata`, JSON-LD Article + breadcrumbs.
- Indexable `/explore` + category hubs.
- No doorway pages added.
- Gaps: many articles lack cover + dedicated seo fields (fall back to title/excerpt).

---

## 17. Mobile Acceptance

Uses existing mobile-first section/grid patterns (375–1440). Post-deploy smoke should include `/`, `/explore`, article detail, `/about`, `/contact` on 390px.

---

## 18. Infrastructure / Disk Status

- Pre UX.F: ~78%.
- Retention: keep current + one rollback (`4930129` and/or prior UX release).
- Do not delete shared media.
- Turbopack media symlink workaround remains documented; not changed.

---

## 19. Files Changed

- `lib/explore.ts` — readiness + cross-category similar
- `lib/public-reviews.ts` — safe featured reviews
- `lib/experiences.ts` — `hasPublicExperiences`
- `app/(site)/page.tsx` — explore rail, catalog-aware CTAs
- `app/(site)/explore/[slug]/page.tsx` — author, continue, excursion, CTAs
- `app/(site)/explore/page.tsx` — approach/assist links
- `app/(site)/about/page.tsx` — settings + featured articles
- `components/sections/explore-preview.tsx` — new
- `components/sections/social-proof.tsx` — approach trust
- `components/sections/final-cta.tsx` — contextual primary
- `components/cms/content-continue.tsx` — new
- `components/cms/related-blocks.tsx` — contextual ArticleCtaBlock
- `components/explore/explore-breadcrumbs.tsx` — related heading
- `docs/UX_F_CONTENT_ACTIVATION.md` — this file

---

## 20. Tests / Build

- `npm run typecheck` — PASS  
- `npm run lint` — PASS (pre-existing warnings only)  
- Production build — on VPS release deploy  

---

## 21. Deployment

Immutable release of UX.F tip SHA to `polezno-current` (see post-deploy notes). Rollback: previous release dir retained.

---

## 22. Production Smoke

After deploy verify:

- `/api/health` → new SHA, identityComplete  
- `/` explore rail + approach trust  
- `/explore`, `/explore/irkutsk-history` related + continue  
- `/about` featured materials  
- `/contact` form  
- `/map` Prelaunch (honest empty)

---

## 23. Remaining Risks

1. Owner content still blocks full Desire.  
2. Site Settings empty → brand defaults only; portrait may be curated fallback.  
3. Article covers are placeholder path when no CMS image.  
4. Disk pressure if many immutable releases accumulate.  
5. Hardcoded About manifesto text is pre-existing editorial (not invented for UX.F reviews).

---

## 24. Definition of Done Evidence

| # | Evidence |
| --- | --- |
| 1–2 | §3–4 inventory; no fake reviews published |
| 3 | Partial graph §6; Desire blocked |
| 4 | Similar + ContentContinue |
| 5 | Author links home/article/about |
| 6–7 | Linking + CTA context |
| 8 | §14 checklist |
| 9 | §15 ingestion |
| 10 | §16 SEO |
| 11–14 | §17–22 |

**Gate label:** ENGINEERING CLOSED / OWNER CONTENT BLOCKED — not falsely CLOSED.

---

## 25. Recommended Next Gate

**GATE UX.G — Owner Content Launch** (or resume Gate C pack execution): ingest excursion + 2 routes + reviews/photos + Site Settings, then re-verify Desire stage and only then claim full UX.F product closure.
