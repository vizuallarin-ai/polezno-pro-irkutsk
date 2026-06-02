# Payload CMS на production (Vercel)

Панель администратора: **https://polezno-pro-irkutsk.vercel.app/admin**

Сейчас главная страница сайта открывается, а `/admin` может отдавать **ошибку 500** — чаще всего не хватает переменных окружения на Vercel или нет подключения к PostgreSQL.

Middleware и robots.txt **не блокируют** вход в `/admin` (robots только скрывает панель от поисковиков).

---

## Что нужно на Vercel (минимум для /admin)

| Переменная | Зачем |
|------------|--------|
| `DATABASE_URL` | PostgreSQL (рекомендуется [Neon](https://neon.tech)) |
| `PAYLOAD_SECRET` | Секрет Payload, **32+ символов**, один и тот же на всех деплоях |
| `NEXT_PUBLIC_SERVER_URL` | `https://polezno-pro-irkutsk.vercel.app` |
| `REVALIDATE_SECRET` | Секрет для ISR (любая длинная случайная строка) |

Остальные переменные — по `.env.example` (Stripe, Mapbox, Resend и т.д.).

**Не коммитьте** `DATABASE_URL`, `PAYLOAD_SECRET` и пароли в git.

---

## Путь A — Neon + Vercel (рекомендуется)

### 1. База данных в Neon

1. Зайдите на [neon.tech](https://neon.tech) → войдите (Google/GitHub).
2. **New Project** → имя, например `polezno-irkutsk` → регион ближе к пользователям (EU).
3. После создания откройте проект → **Dashboard** → блок **Connection string**.
4. Выберите **PostgreSQL** → скопируйте строку (кнопка **Copy**).  
   Она начинается с `postgresql://...` — это ваш `DATABASE_URL`.

### 2. Переменные в Vercel

1. [vercel.com](https://vercel.com) → ваш проект **polezno-pro-irkutsk**.
2. **Settings** → **Environment Variables**.
3. Добавьте (для **Production**, лучше и **Preview**):

| Name | Value |
|------|--------|
| `DATABASE_URL` | вставьте строку из Neon |
| `PAYLOAD_SECRET` | сгенерируйте: в PowerShell `openssl rand -base64 32` или любой пароль 32+ символов |
| `NEXT_PUBLIC_SERVER_URL` | `https://polezno-pro-irkutsk.vercel.app` |
| `REVALIDATE_SECRET` | ещё одна случайная строка |

4. **Save** для каждой переменной.

### 3. Пересборка

1. Вкладка **Deployments** → у последнего деплоя **⋯** → **Redeploy** → **Redeploy** (без кэша — надёжнее).
2. Дождитесь статуса **Ready**.

### 4. Первый администратор

**Вариант 1 — через браузер (если в БД ещё нет пользователей)**

1. Откройте https://polezno-pro-irkutsk.vercel.app/admin  
2. Если всё настроено, Payload покажет форму **создания первого пользователя** (email + пароль).  
3. Роль должна быть **Администратор** — иначе в панель не пустит (см. `payload/access.ts`).

**Вариант 2 — с вашего компьютера (скрипт)**

В `.env.local` на время подставьте **ту же** `DATABASE_URL`, что на Vercel (из Neon), и тот же `PAYLOAD_SECRET`:

```env
DATABASE_URL=postgresql://...из Neon...
PAYLOAD_SECRET=...тот же что на Vercel...
ADMIN_SEED_EMAIL=ваш@email.ru
ADMIN_SEED_PASSWORD=НадёжныйПароль123!
```

В корне проекта:

```bash
npm run create-admin
```

- Если увидите `ADMIN_CREATED` — войдите на production с этим email и паролем.  
- Если `ADMIN_EXISTS` — пользователь уже есть; используйте тот пароль, что задавали при создании, или сбросьте пароль через Neon/SQL (сложнее) / создайте другого admin через БД.  
- Если пароль не задавали (`ADMIN_SEED_PASSWORD` пустой), скрипт один раз выведет `password=...` — сохраните его.

После работы **не** оставляйте production `DATABASE_URL` в файлах, которые могут утечь; локально можно снова переключиться на локальную БД.

---

## Путь B — синхронизация env через CLI

Если проект уже настроен на Vercel и переменные там есть:

```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.local
```

Проверьте, что в `.env.local` появились `DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`.  
Затем при необходимости: `npm run create-admin` (см. выше).

В этой копии репозитория `vercel link` может быть ещё не выполнен — тогда используйте Путь A вручную через веб-интерфейс.

---

## Вход в CMS на production

1. https://polezno-pro-irkutsk.vercel.app/admin  
2. Email и пароль администратора (роль **admin**).  
3. Редакторы (`editor`) в панель **не** допускаются.

---

## Если /admin по-прежнему 500

1. **Vercel** → проект → **Deployments** → последний деплой → **Functions** / **Runtime Logs** — ищите ошибки про `DATABASE_URL`, `connect`, `PAYLOAD_SECRET`.
2. Убедитесь, что `DATABASE_URL` на Vercel **совпадает** с Neon (без лишних пробелов).
3. В Neon: проект не **Paused**; в connection string включён SSL, если Neon его требует.
4. `PAYLOAD_SECRET` не меняйте между деплоями без необходимости — иначе сессии сломаются.
5. `NEXT_PUBLIC_SERVER_URL` должен быть **без** слэша в конце: `https://polezno-pro-irkutsk.vercel.app`

Публичные страницы могут работать без БД; **админка всегда требует** рабочий PostgreSQL.

---

## Локальная разработка vs production

- Локальный `npm run dev` + `/admin` использует `.env.local`.  
- Production использует только переменные **Vercel → Environment Variables**.  
- Один Neon-проект = одна БД для production; локально можно подключаться к ней же строкой `DATABASE_URL`, чтобы создать admin скриптом.

Скрипт `npm run ensure-db` создаёт базу только для **локального** Postgres (не для Neon — там БД уже есть).

---

## Безопасность

- Не публикуйте `DATABASE_URL` и `PAYLOAD_SECRET` в чатах, скриншотах, git.  
- Пароль админа — отдельно, сложный; не используйте `admin123`.  
- В Neon включите ограничение IP только если понимаете настройку (Vercel использует динамические IP — обычно IP allowlist не включают).
