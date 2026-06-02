# Payload CMS на production (Vercel + Neon)

**Админка:** https://polezno-pro-irkutsk.vercel.app/admin

Публичный сайт может открываться без БД; **`/admin` всегда требует** PostgreSQL и секреты на Vercel. Ошибка **500** на `/admin` — почти всегда нет `DATABASE_URL` / `PAYLOAD_SECRET` или БД недоступна.

---

## Быстрый путь (~5 минут): Neon + Vercel

### Шаг 0 — сгенерировать секреты локально

В корне репозитория (ничего не пишет в файлы, только в терминал):

```bash
npm run setup-vercel-env
```

Скопируйте из вывода **`PAYLOAD_SECRET`** и **`REVALIDATE_SECRET`** в менеджер паролей — повторный запуск создаст **новые** значения.

### Шаг 1 — база Neon

1. [neon.tech](https://neon.tech) → войти (Google/GitHub).
2. **New Project** → имя `polezno-pro-irkutsk` (или `polezno-irkutsk`) → регион **EU** (ближе к РФ).
3. **Dashboard** → **Connection string** → **PostgreSQL** → **Copy** (`postgresql://...`).

Это **`DATABASE_URL`**. В git и в чаты **не** вставлять.

### Шаг 2 — переменные в Vercel (вручную, без обхода)

1. [vercel.com](https://vercel.com) → проект **polezno-pro-irkutsk**.
2. **Settings** → **Environment Variables**.
3. Для **Production** и **Preview** добавить:

| Переменная | Значение |
|------------|----------|
| `DATABASE_URL` | строка из Neon |
| `PAYLOAD_SECRET` | из `npm run setup-vercel-env` (32+ символов) |
| `REVALIDATE_SECRET` | из того же вывода |
| `NEXT_PUBLIC_SERVER_URL` | `https://polezno-pro-irkutsk.vercel.app` (без `/` в конце) |

Остальное — по `.env.example` (Stripe, Mapbox, Resend), когда понадобится.

**Автоматически подставить секреты в Vercel из этого репозитория нельзя** — только через Dashboard (или `vercel env add` с вашего ПК после `vercel login`).

### Шаг 3 — пересборка

**Deployments** → последний деплой → **⋯** → **Redeploy** → включить **без кэша** → дождаться **Ready**.

### Шаг 4 — первый администратор

**Вариант A — в браузере** (если в БД ещё нет пользователей):

1. https://polezno-pro-irkutsk.vercel.app/admin  
2. Форма создания первого пользователя → роль **Администратор** (`payload/access.ts`).

**Вариант B — скрипт с ПК**

```bash
vercel login
vercel link    # выбрать polezno-pro-irkutsk
vercel env pull .env.local
```

В `.env.local` добавить (не коммитить):

```env
ADMIN_SEED_EMAIL=ваш@email.ru
ADMIN_SEED_PASSWORD=НадёжныйПароль123!
```

```bash
npm run create-admin
```

- `ADMIN_CREATED` — войти на production с этим email/паролем.  
- `ADMIN_EXISTS` — пользователь уже есть.

---

## CLI: кто залогинен и link

```bash
vercel whoami          # ожидается: vizuallarin-ai
vercel link            # если нет .vercel/project.json
vercel env pull .env.local
```

В этой копии репозитория **`vercel link` может быть не выполнен** — переменные всё равно задаются в Dashboard (шаг 2).

---

## Neon MCP в Cursor (опционально)

Сервер MCP **Neon** в Cursor по умолчанию **не авторизован**. Доступен только инструмент `mcp_auth`.

1. **Cursor** → **Settings** → **MCP** → **Neon** (`plugin-neon-postgres-neon`).
2. **Authenticate** / **Connect** → OAuth в браузере Neon.
3. После успеха агент может вызывать `list_projects`, `create_project` и т.д.

Без OAuth: создайте проект вручную на neon.tech (шаг 1). Connection string — **только** в Vercel Dashboard.

---

## `vercel.json` не нужен

Payload подключён через `@payloadcms/next/withPayload` в `next.config.ts`. Маршруты `/admin` и `/api/*` обрабатывает Next.js App Router — отдельный `vercel.json` для Payload **не требуется**.

---

## Вход в CMS

1. https://polezno-pro-irkutsk.vercel.app/admin  
2. Email и пароль **admin**. Роль **editor** в панель не пускает.

---

## Если `/admin` всё ещё 500

1. **Vercel** → **Deployments** → **Runtime Logs** — `DATABASE_URL`, `connect`, `PAYLOAD_SECRET`.
2. `DATABASE_URL` без пробелов, совпадает с Neon.
3. Проект Neon не **Paused**; в строке обычно есть `?sslmode=require`.
4. `PAYLOAD_SECRET` не менять без нужды (сессии слетят).
5. `NEXT_PUBLIC_SERVER_URL` без завершающего `/`.

---

## Локально vs production

| | Локально | Production |
|---|----------|------------|
| Env | `.env.local` | Vercel → Environment Variables |
| БД | локальный Postgres или та же Neon-строка | Neon `DATABASE_URL` на Vercel |

`npm run ensure-db` — только для **локального** Postgres; для Neon БД уже создана.

---

## Безопасность

- Не коммитить `DATABASE_URL`, `PAYLOAD_SECRET`, пароли admin.
- Не публиковать секреты в чатах и скриншотах.
- IP allowlist в Neon для Vercel обычно **не** включают (динамические IP).
