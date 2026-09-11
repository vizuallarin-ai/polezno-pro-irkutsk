# ADMIN.C — Readiness matrix

**Canonical public classifier:** `lib/content-readiness.ts`  
**Canonical owner launch checklist:** `lib/admin/owner-launch-readiness.ts`  
**Source of owner minimum:** CONTENT.0 / `docs/CONTENT_0_OWNER_CONTENT_INTAKE.md` (1 excursion · 1 route · 1 guide · 1 review · 3–5 photos · contacts)

| Criterion | Owner label | Pass condition | Attention if fail | Demo products/AR |
|-----------|-------------|----------------|-------------------|------------------|
| contacts | Контакты заполнены | phone ∨ email ∨ telegram in site-settings | critical → profile | ignored |
| excursion | Есть опубликованная экскурсия | ≥1 `published-ready` excursion | critical → create/list | never counts |
| route | Есть опубликованный маршрут | ≥1 `published-ready` route | critical → create/list | never counts |
| guide | Профиль гида готов | ≥1 public-ready AND no placeholder | high → open profile | n/a |
| reviews | Есть отзывы | ≥1 published non-demo review | high → create | n/a |
| photos | Фотографии (минимум 3) | ≥3 published-ready photos; 1–2 = warn | medium/high → photos | n/a |

## Explicit non-criteria (do not greenwash)

- Published demo souvenirs / AR postcards
- Events fullness
- Article count (shown in shelves only; not launch blocker)
- Vanity % readiness score (we show `okCount / totalCount` of the six criteria only)

## Articles dual status

| Surface | Field used |
|---------|------------|
| Dashboard shelf counts | `status` |
| `publishedReady` sample | `commercialInputFromDoc('article')` → also respects `_status` when set |

Ambiguity remains for ADMIN.E.

## Proof

`npm run test:admin-c` + `npm run test:readiness`
