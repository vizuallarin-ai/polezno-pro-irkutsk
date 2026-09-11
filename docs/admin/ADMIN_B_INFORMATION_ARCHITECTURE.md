# ADMIN.B — Information Architecture

**Date:** 2026-09-11  
**Principle:** Payload remains source of truth; owner sees business groups, not schema dump.

## Target menu (implemented)

| Group | Entities | Visibility |
|-------|----------|------------|
| *(Dashboard)* | BeforeDashboard | always |
| **Операционная работа** | Заявки, Экскурсии, Маршруты | owner |
| **Контент** | Статьи, Фото, Отзывы, События | owner |
| **Продукт** | Сувениры, Мастера, AR-открытки | owner |
| **Проект** | Гиды / профили, Профиль / контакты и настройки | owner |
| **Управление** | Пользователи | owner (admin only login) |
| **Система / разработчик** | Медиа, Места, Партнёры, Навигация | Media visible in group; Places/Partners/Navigation **hidden** |

## Classification inventory

| Entity | Class | Admin group | Notes |
|--------|-------|-------------|-------|
| leads | C Operational | Операционная работа | CRM thin → ADMIN.D |
| excursions | A Owner | Операционная работа | publish guard + auto-slug |
| routes | A Owner | Операционная работа | tabs + publish guard |
| articles | B Content | Контент | renamed Материалы→Статьи |
| photos | B Content | Контент | auto-slug |
| reviews | B Content | Контент | unhidden; status draft/published |
| events | B Content | Контент | dead fields hidden |
| products | A Product | Продукт | auto-slug |
| makers | A Product | Продукт | auto-slug |
| ar-postcards | A Product | Продукт | auto-slug + lock after publish |
| guides | A/F Project | Проект | unhidden; public access filtered |
| site-settings | A Project | Проект | tabs: profile / hero / SEO / legacy |
| users | Management | Управление | editor role clarified (dead for panel) |
| media | D System | Система | still needed for uploads |
| places | E Orphan | Система (hidden) | staff-only REST |
| partners | E Orphan | Система (hidden) | staff-only REST |
| navigation | F Hidden-but-CTA-used | Система (hidden) | mainNav unused; CTA live |

## Labels policy

- UI labels RU for owner; **API collection slugs unchanged**.
- Slug field label: «Ссылка на сайте» with auto-fill help.

## Guides / Reviews resolution

- **Reviews:** visible under Контент; `status` + `isFeatured`; public REST only `status=published`; home query requires both published + featured.
- **Guides:** visible under Проект; auto-slug; `isActive` default false for new; public REST excludes placeholder slugs; frontend readiness already fail-closes `slug=Slug`.
- **Production placeholder guide:** not mutated in ADMIN.B (read-only prod). Owner/CONTENT.1 should deactivate or replace with real profile. Until then public site remains fail-closed.

## Orphan fate

| Collection | ADMIN.B action | Future |
|------------|----------------|--------|
| places | hide + staff-only read | productize or drop in later gate |
| partners | hide + staff-only read | same |
| navigation.mainNav | hidden field | wire or delete after owner decision |
| excursion.content (Lexical) | admin.hidden | keep data |
| event.fullDescription / hasApplicationForm | admin.hidden | keep data |
