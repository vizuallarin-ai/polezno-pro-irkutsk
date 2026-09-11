# ADMIN.A — Target Admin Architecture

**Date:** 2026-09-11  
**Principle:** `простая оболочка для владельца → безопасные бизнес-сценарии → Payload как техническое основание`  
**Do not rewrite CMS from scratch** — no evidence justifies a greenfield admin.

---

## 1. Layering

```
┌─────────────────────────────────────────────┐
│ Owner shell (RU labels, groups, dashboard,  │
│ wizards, checklists, help)                  │
├─────────────────────────────────────────────┤
│ Safe business scenarios                     │
│ (publish excursion, handle lead, photos)    │
├─────────────────────────────────────────────┤
│ Payload 3 collections / globals / access    │
│ (existing schema; incremental fields only)  │
└─────────────────────────────────────────────┘
```

| Need | Approach |
|------|----------|
| Rename / regroup / help text | Standard Payload admin config |
| Hide tech fields / orphans | `admin.hidden` / `condition` / groups |
| Dashboard + readiness | Extend `BeforeDashboard` (already custom) |
| Guided publish | Custom components / multi-step only where forms are overloaded (routes, photos) |
| Auto slug, price XOR, revalidate | Hooks + small route fix |
| Full separate Next “operator app” | **Not required now** — only if Payload UI still fails owner acceptance in ADMIN.F |

**Avoid building:** enterprise CRM, multi-tenant CMS, custom auth replacement, payment booking engine, parallel content DB.

---

## 2. Target menu (Owner)

| Menu | Maps to | Notes |
|------|---------|-------|
| Главная | Dashboard | Attention + quick actions |
| Заявки | `leads` | First operational item |
| Экскурсии | `excursions` | Commercial core |
| Маршруты | `routes` | Map experiences |
| Статьи | `articles` (label rename from Материалы) | Explore |
| Фотографии | `photos` (+ guided media) | Archive |
| Отзывы | `reviews` | Unhide + draft |
| Сувениры и AR | `products`, `makers`, `ar-postcards` | Group; demo policy |
| Профиль и контакты | subset `site-settings` + `guides` | Human name |
| Настройки сайта | rest of `site-settings` SEO/hero | Clear what is live |
| Пользователи и доступ | `users` | Owner + Developer only as needed |
| Системные инструменты | Media advanced, Navigation, Places, Partners, legacy | **Developer group / hidden from Owner** |

Payload `admin.group` can approximate this without a new framework.

---

## 3. Target dashboard

Show only decision-useful items:

1. **Новые заявки** (count + link)
2. **Просроченный контакт** (after `nextContactAt` exists)
3. **Черновики** экскурсий/маршрутов/статей
4. **Не готово к публикации** (missing price, cover, points)
5. **Фото на модерации**
6. **Пустые критичные полки** (0 excursions / 0 routes) — until filled
7. **Уведомления email: настроены / нет**
8. **Открыть сайт** button

Quick actions:

- Добавить экскурсию  
- Создать маршрут  
- Написать статью  
- Загрузить фото  
- Добавить отзыв  
- Смотреть заявки  
- Изменить контакты  
- Открыть сайт  

No vanity traffic charts.

---

## 4. Roles

| Capability | Owner | Content Editor | Developer |
|------------|:----:|:--------------:|:---------:|
| Dashboard / leads process | ✓ | read leads optional | ✓ |
| Excursions/routes/articles/photos/reviews | ✓ | ✓ | ✓ |
| Publish | ✓ | ✓ or limited | ✓ |
| Delete core / leads | limited | ✗ | ✓ |
| Site settings contacts/SEO | ✓ | limited | ✓ |
| Users / roles | invite editor only | ✗ | ✓ |
| System group / seeds / env | ✗ | ✗ | ✓ |
| Export leads | ✓ | ✗ | ✓ |

Server access must match UI (fix ADMIN-A-P1-07 / P1-13). Until Editor is real, hide the dead option or implement properly.

---

## 5. Key scenarios (target)

### Publish excursion (happy path)

1. Главная → Добавить экскурсию  
2. Wizard: название → формат → описание → цена (или «по запросу») → длительность → обложка  
3. Slug auto  
4. Checklist green → Предпросмотр → Опубликовать  
5. Site shows on `/excursions/[slug]` and `/map` after revalidate  

### Handle lead

1. Заявки → Новые  
2. Open → call/message → note + next contact date → status «Связаться/Обсуждение»  
3. When done → «Завершено» / «Отказ» (map from closed/spam carefully)  
4. Optional review-request only when appropriate  

### Photo

1. Upload with rights checklist (plain language)  
2. Cannot publish without rights confirmation (keep existing gates)  

---

## 6. Field policy

| Auto | Hide from Owner | Keep advanced |
|------|-----------------|---------------|
| slug from title | stripe* ids, providerRawResponse, geoLine raw when map UI enough | Geometry map editor |
| priceLabel defaults | navigation global if unused | SEO group with examples |
| pointsCount / isPaid sync | Places/Partners | Lexical where actually rendered |
| QR URL for AR | Dual legacy SEO duplicates | — |

---

## 7. CRM target (minimal)

Statuses (owner language ↔ storage):

| UI | Storage (proposed mapping) |
|----|----------------------------|
| Новая | `new` |
| Связаться | `in_progress` |
| Обсуждение | `replied` or new value — **OWNER DECISION** |
| Забронировано | new value or tag — **OWNER DECISION** |
| Завершено | `closed` |
| Отказ / Спам | `spam` or closed+reason |

Add: `nextContactAt`, richer notes, optional `outcome`.  
Do **not** add full pipeline analytics yet.

---

## 8. What Payload standard vs custom

| Standard Payload | Custom components |
|------------------|-------------------|
| Groups, labels, descriptions, columns, filters | Owner dashboard readiness |
| Drafts/versions enablement | Route publish wizard (optional) |
| Field conditions | Photo rights checklist UI |
| Access functions | Leads overdue chips (extend existing filters) |
| Preview URLs | Notify health indicator |

---

## 9. Explicit non-goals

- Replacing Payload Admin with bespoke React admin  
- External CRM mandatory integration (Bitrix/amocrm) before lead volume warrants  
- Online payments / live booking calendar in ADMIN.B–E  
- Inventing owner marketing copy or fake reviews/excursions  
