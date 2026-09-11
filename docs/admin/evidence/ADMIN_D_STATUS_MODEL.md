# ADMIN.D — Status model

**Canonical module:** `lib/leads/crm.ts`

## State machine (owner language)

```
Новая (new)
  → Нужно связаться (in_progress)
  → Обсуждение (replied)
  → Забронировано (booked)
  → Завершено (closed)

Любой активный → Отказ (declined)
Любой → Спам (spam)   [abuse / junk]
```

Hard sequence locks are **not** enforced in schema (owner UX). Soft guidance via labels/help text.

## Table

| Machine value | Owner label | Meaning | Terminal? | Follow-up expected? |
|---------------|-------------|---------|-----------|---------------------|
| `new` | Новая | Заявка получена, ещё не обработана | no | yes (unscheduled signal suppressed — covered by «Новая») |
| `in_progress` | Нужно связаться | Следующий шаг — контакт | no | yes |
| `replied` | Обсуждение | Контакт был, идёт согласование | no | yes |
| `booked` | Забронировано | Клиент подтвердил услугу; до услуги ещё может понадобиться контакт | **no** | yes |
| `closed` | Завершено | Услуга/сделка завершена | **yes** | no |
| `declined` | Отказ | Закрыто без продажи | **yes** | no |
| `spam` | Спам | Антиспам / junk bucket | **yes** | no |

## Why these machine values

1. Keep `new` / `in_progress` / `replied` / `closed` / `spam` so existing production rows remain readable without migration rewrite.
2. Add `booked` and `declined` for commercial vocabulary without colliding with review-email on `closed`.
3. **Never** map «Отказ» → `closed` (would send «как прошла экскурсия?» after refusal).

## Review email hook

Fires only on transition **into** `closed` when email+name present. Unchanged business meaning: successful completion.

## Closed reason (optional)

Shown when `status === declined`:

| Value | Label |
|-------|-------|
| `price` | Не подошла цена |
| `chose_other` | Выбрал другого |
| `plans_changed` | Изменились планы |
| `unreachable` | Не удалось связаться |
| `other` | Другое |

Not required to save. Optional `closedReasonNote` text.

## History decision

**No** embedded interaction array in ADMIN.D.

Rationale: for a solo owner, `status` + `adminComment` + `lastContactAt` + `nextContactAt` close the “forgotten lead” risk. Full history / versions → ADMIN.E if needed.
