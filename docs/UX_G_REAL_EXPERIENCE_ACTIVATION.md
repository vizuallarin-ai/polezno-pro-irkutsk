# GATE UX.G — Real Experience Activation

## 1. Final Status

**GATE UX.G ENGINEERING READY / OWNER CONTENT STILL BLOCKED / NO FAKE EXPERIENCE PUBLISHED**

Pass date: **2026-09-06** (continuation of blocked pass; no product ingest).

Production commercial entities remain empty. No synthetic experience, route, review, or fake proof was published. UX.H not opened.

---

## 2. Starting Baseline

| Item | Value |
|------|-------|
| Prior UX.G status | ENGINEERING READY / OWNER CONTENT BLOCKED |
| Production SHA | `ff8e2e0a36fc4716a7834adc26076a7e588680c6` |
| Production branch (code line) | `phase15-ux-funnel-hardening` |
| UX.D.2 | CLOSED / Prata + Golos live |
| UX.E / UX.F / OPS.1 | As previously closed |
| Disk (OPS.1) | ~55% / ~6.2G free |

---

## 3. Git State

| Item | Value |
|------|-------|
| Branch | `phase15-ux-funnel-hardening` |
| HEAD (after hygiene) | `5d0579365458b494ce9a27e675c90bfaf7bcb522` |
| Origin | Synced after push of docs commit |
| `5d05793` | Pure docs-only (`docs/UX_G_REAL_EXPERIENCE_ACTIVATION.md` +433); **pushed** `a366220..5d05793` |
| Worktree | Clean tracked; untracked local `####/`, PDFs, phase15 helper scripts |
| Production SHA vs git tip | Prod still on `ff8e2e0` (typography release); git tip is docs-ahead of that deploy — expected |

---

## 4. Owner Pack Sources

| SOURCE | OWNER APPROVED? | PUBLICATION APPROVED? | COMPLETE? | READY FOR PROD? |
|--------|-----------------|----------------------|-----------|-----------------|
| `docs/phase15-gate-c-owner-content-pack.md` | Form blank (~31 empty answer markers) | No | No | **No** |
| Production DB (`excursions/routes/reviews/photos/site_settings`) | N/A | N/A | Counts all **0** | **No** |
| Shared media `Alena.jpg` | Unclear rights row | No Site Settings link | Partial file only | **No** |
| Seed/demo media | No | No | N/A | **Rejected** |
| Untracked `####/` (Jun 2026): `Промт Морин.docx`, `ссылки и анализ сайта_17.06.docx`, `Структура_обучающих_курсов_…docx`, `Туроператор.docx`, `ТЭНГЭРИ.pdf` (~92MB) | **No explicit publish approval for UX.G** | No | Not Gate C pack | **UNVERIFIED — not used** |
| Chat/audit price hypotheses (e.g. old ~8k/30k figures) | Explicitly **not** Gate C prices | No | N/A | **Rejected** |
| Filled owner pack elsewhere in repo / admin | **Not found** | — | — | **No** |

---

## 5. Verification Matrix

### Flagship excursion (minimum GO fields)

| Field | Status |
|-------|--------|
| title | MISSING |
| slug | MISSING |
| short positioning | MISSING |
| full description | MISSING |
| audience | MISSING |
| duration | MISSING |
| price / pricing rule | MISSING |
| price unit | MISSING |
| max group size | MISSING |
| format | MISSING |
| included / not included | MISSING |
| meeting/logistics | MISSING |
| cancellation | MISSING |
| booking/inquiry rule | MISSING (flow exists; owner confirm blank) |
| guide/author | PARTIAL (brand defaults only) |
| photos | MISSING / UNVERIFIED |
| publication approval | MISSING |

### Routes / reviews / photos / Site Settings

| Surface | Status |
|---------|--------|
| Route 1 + 2 | MISSING |
| Reviews or explicit opt-out | MISSING |
| Rights-cleared photos | MISSING |
| Site Settings CMS row | MISSING (0 rows) |

### Production DB recount (2026-09-06)

| Entity | Count |
|--------|------:|
| articles | 9 |
| excursions | **0** |
| routes | **0** |
| reviews | **0** |
| photos | **0** |
| media | 4 |
| site_settings | **0** |
| leads | 0 |

---

## 6. Go / No-Go Decision

**NO-GO.**

Minimum A/B/C from this pass are **not** met:

- No publishable flagship experience in CMS or approved pack  
- No non-thin product substance available under no-fake rule  
- No approved hero visual for a commercial experience  

**Actions taken:** documentation update + git push of prior docs commit only.  
**Actions refused:** invent excursion/route/review; ingest `####/`; production data mutation; deploy; UX.H.

---

## 7. Backup

**Not performed** — no production-data mutation planned or executed.

---

## 8. Data Ingest

**Skipped** (NO-GO).

Ingest path remains ready when GO clears: Payload Admin → published Excursion/Routes/Reviews/Media + Site Settings; `hasPublicExperiences()` flips surfaces without page rewrite.

---

## 9. Site Settings

Unchanged. Brand code defaults only. CMS empty.

---

## 10. Flagship Experience

**Not published.**

---

## 11. Routes

**0.** Map remains honest Prelaunch.

---

## 12. Reviews

**0.** Fail-closed; no empty “Отзывы” product claim.

---

## 13. Media

Shared topology intact. `####/` and unverified files **not** ingested. OPS.1 media-after-build rule unchanged.

---

## 14–20. Home / Explore / Trust / Desire / Select / Booking / Lead

Unchanged from UX.F engineering:

- Discover/Trust/Book inquiry on articles work  
- Desire/Select product path **inactive** (no experience)  
- Lead context plumbing ready for excursion/route intents  

---

## 21. Commercial Clarity

N/A — no commercial entity.

---

## 22. SEO / OG

Article SEO live. No thin experience URLs created.

---

## 23. About H1 Decision

**Deferred (no redesign this pass).** Prior note stands: visible Prata quote + `sr-only` H1. Revisit only with real experience launch or dedicated a11y pass — not blocking owner pack.

---

## 24. Empty States

Still accurate: map/experiences prelaunch; Explore full; no false “маршруты доступны” as catalog of products.

---

## 25. Ingest Repeatability

Unchanged — second experience/route/review addable via CMS without React structure change once first GO ingest lands.

---

## 26. Tests / Build

Docs-only pass; production `ff8e2e0` build remains live. No new app code.

---

## 27. Visual Acceptance

Not applicable to new surfaces (none shipped).

---

## 28. Production Deploy

**None.** SHA remains `ff8e2e0…`. Symlink unchanged. Disk ~55%.

---

## 29. Production Smoke

| Check | Result |
|-------|--------|
| `/api/health` | ok / `ff8e2e0…` |
| Commercial counts | still zero |
| Fake public products | absent |

---

## 30. E2E Journey Evidence

| Stage | Status |
|-------|--------|
| DISCOVER | Works (Explore) |
| TRUST | Partial (author/content; no reviews/product) |
| DESIRE | **Blocked** — no real experience |
| SELECT | **Blocked** |
| BOOK | Inquiry works; product BOOK path inactive |

---

## 31. Remaining Owner Gap (exact actions)

Fill and sign `docs/phase15-gate-c-owner-content-pack.md` Part A. Until then UX.G cannot close.

### Critical path (blocks GO)

1. **FLAGSHIP EXPERIENCE** — title, short+full text, final price **or** price-on-request, duration, group size, format, included/excluded, meeting point, cancel rules, confirm form booking.  
2. **PUBLICATION APPROVAL** — Part A.9 signature.  
3. **≥1 visual** with rights for hero (or explicit “text-first launch” note — still needs product copy).  
4. **AUTHOR / SITE SETTINGS** — display name, role, bio, approved portrait.  
5. **REVIEWS** — 3 permissioned **or** explicit opt-out checkbox.  

### Strongly recommended for same launch

6. **ROUTE 1 + ROUTE 2** — ordered points + walk confirmation + map links.  
7. **ARTICLE ↔ PRODUCT** mapping table (only real thematic links).  

### Explicitly do NOT use without new approval

- `####/*` June materials (tour operator / Tengri / courses / site analysis)  
- Old chat price figures  
- Seed placeholders  

---

## 32. Definition of Done Evidence

| # | Evidence |
|---|----------|
| Owner pack verified | **FAIL** — still blank |
| Publication approval | **FAIL** |
| ≥1 real experience in production | **FAIL** |
| No fake content | **PASS** (refusal) |
| Engineering ingest path | **PASS** |
| UX.D.2 preserved | **PASS** |
| E2E Desire→Book | **FAIL** — blocked |
| Deploy this pass | N/A |

---

## 33. Recommended Next Action

1. Owner returns completed Gate C pack + media + A.9 signature.  
2. Resume this same UX.G gate: backup → controlled ingest → acceptance → OPS.1 deploy → E2E proof.  
3. Do **not** open UX.H.  
4. Do **not** invent product copy to “unblock” Desire.

---

# Owner Blocking Pack (unchanged criteria)

See previous pass sections in git history / Gate C questionnaire. Machine checklist below remains the GO gate.

### 1. FLAGSHIP EXPERIENCE / TITLE + PROMISE
**MISSING** — final title + 2–4 sentence short description. Unlocks Desire entry.

### 2. FLAGSHIP EXPERIENCE / FULL NARRATIVE
**MISSING** — ordered places + true blurbs. Unlocks editorial body.

### 3. FLAGSHIP EXPERIENCE / COMMERCIAL BLOCK
**MISSING** — price or on-request; unit; duration minutes; group; includes/excludes. Unlocks commercial clarity + CTA.

### 4. FLAGSHIP EXPERIENCE / LOGISTICS + POLICY
**MISSING** — meet / cancel / weather / form confirmation. Unlocks BOOK copy.

### 5. ROUTE 1 + ROUTE 2
**MISSING** — optional for minimal GO if experience alone is complete; required for full graph. Unlocks `/map` product honesty.

### 6. PHOTOGRAPHY / RIGHTS MATRIX
**MISSING** — per-file role, photographer, publish yes/no. Unlocks hero/OG.

### 7. REVIEWS OR OPT-OUT
**MISSING** — 3 reviews **or** explicit “launch without reviews”. Unlocks honest trust layer.

### 8. SITE SETTINGS / AUTHOR
**MISSING** — CMS identity + approved portrait. Unlocks author-as-product.

### 9. ARTICLE ↔ PRODUCT LINKS
**MISSING** — explicit slug pairs only where real. Unlocks Explore→Desire.

### 10. PUBLICATION PERMISSION
**MISSING** — Gate C A.9. Unlocks production ingest.
