# ADMIN.E — Delete safety

## Principle

Daily owner workflow must **not** rely on hard delete for business-critical objects.

Authoritative enforcement: Payload **access** + **beforeDelete** hooks (`payload/hooks/delete-guards.ts`). UI confirmation alone is insufficient.

## Preferred lifecycle (archive / unpublish / CRM)

| Entity | Prefer | Hard delete |
|---|---|---|
| Excursions / Routes / Articles / Reviews / Photos / Events / Products / Makers / AR | Set `status` to draft / hidden / **archived** | Owner/Editor only after non-published; Developer always |
| Guides | Uncheck `isActive` | Then Owner/Editor may delete; Developer always |
| Leads | Terminal CRM: Завершено / Отказ / Спам | **Developer only** |
| Media | Replace file on parent / leave unused | **Developer only** (relational safety) |
| Places / Partners | Developer maintenance | Developer |
| Users | Disable via process / contact developer | Lockout guards; no self-delete; no last privileged delete |

## Server messages (RU)

Guards throw clear Russian errors directing owners to archive/CRM instead of delete.

## Script bypass

Local ops scripts may pass `context: { bypassDeleteGuards: true }` with `overrideAccess: true`. This is **not** available to browser Admin sessions.

## Relational notes

Media hard delete blocked for Owner/Editor to avoid broken uploads on excursions/routes/articles. Cascade delete of business content is intentionally not introduced.
