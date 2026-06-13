# Деплой на Beget VPS (Ubuntu 24.04) + irkportal.ru

Проект: **polezno-pro-irkutsk** (Next.js 16 + Payload CMS 3 + PostgreSQL).

**Важно:** база данных только **на вашем VPS** (локальный PostgreSQL). **Neon и Supabase не используются.**

Публичный URL production: **https://irkportal.ru**  
Админка: **https://irkportal.ru/admin**

---

---

## Автоматический bootstrap (один скрипт)

На **чистом** VPS Ubuntu 24.04 можно развернуть стек и приложение скриптом из репозитория:

```bash
ssh root@90.156.170.182
export DEPLOY_DB_PASSWORD='ваш_надёжный_пароль_postgres'
apt update && apt install -y git
git clone https://github.com/vizuallarin-ai/polezno-pro-irkutsk.git /var/www/polezno
cd /var/www/polezno
bash scripts/deploy-beget.sh
```

Скрипт `scripts/deploy-beget.sh` (идемпотентен насколько возможно):

- ставит Node 20, PostgreSQL, Nginx, Certbot, Git, PM2, UFW;
- создаёт пользователя и БД `polezno_irkutsk` (пароль из `DEPLOY_DB_PASSWORD` или интерактивный ввод);
- клонирует/обновляет `/var/www/polezno` с ветки `master`;
- требует заполненный `.env.production` (если файла нет — копирует из `.env.production.example` и **останавливается** с инструкцией);
- выполняет `npm ci`, `npm run build`, `pm2 start`/`restart`;
- пишет конфиг Nginx для `irkportal.ru` / `www`.

Подсказка локально (без VPS):

```bash
npm run deploy:beget-help
```

После успешного скрипта вручную: **DNS A** на IP VPS, **certbot**, **`npm run create-admin`**.

## Что купить / заказать (день «завтра»)

| Что | Рекомендация |
|-----|----------------|
| Домен | **irkportal.ru** (регистратор / панель Beget) |
| VPS | Beget VPS, **Ubuntu 24.04**, минимум **2 GB RAM**, 2 vCPU, 20+ GB SSD |
| Доступ | SSH по ключу (лучше) или пароль root |

Сразу сохраните в менеджер паролей (не в git):

- **IP VPS** (например `185.x.x.x`)
- **SSH:** `root@IP` или отдельный пользователь
- **План пароля PostgreSQL** для пользователя `polezno_irkutsk` (сгенерируйте заранее 20+ символов)
- Заготовки для **`PAYLOAD_SECRET`** и **`REVALIDATE_SECRET`** (см. ниже)

Секреты для production можно сгенерировать на своём ПК:

```bash
npm run setup-vercel-env
```

Скопируйте только `PAYLOAD_SECRET` и `REVALIDATE_SECRET` — Neon/Vercel из вывода игнорируйте.

---

## День 1: подключение по SSH и базовая настройка сервера

Подключение с вашего компьютера:

```bash
ssh root@ВАШ_IP
```

### 1. Обновление системы

```bash
apt update && apt upgrade -y
```

### 2. Node.js 20

```bash
apt install -y ca-certificates curl gnupg
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v   # v20.x
npm -v
```

### 3. PostgreSQL, Nginx, Certbot, PM2, Git

```bash
apt install -y postgresql postgresql-contrib nginx certbot python3-certbot-nginx git
npm install -g pm2
```

### 4. Файрвол (UFW)

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

---

## PostgreSQL: пользователь и база

Замените `ВАШ_НАДЁЖНЫЙ_ПАРОЛЬ` на пароль из менеджера паролей.

```bash
sudo -u postgres psql
```

В psql:

```sql
CREATE USER polezno_irkutsk WITH PASSWORD 'ВАШ_НАДЁЖНЫЙ_ПАРОЛЬ';
CREATE DATABASE polezno_irkutsk OWNER polezno_irkutsk;
\q
```

Проверка:

```bash
sudo -u postgres psql -d polezno_irkutsk -c '\conninfo'
```

Строка подключения для `.env.production`:

```env
DATABASE_URL=postgresql://polezno_irkutsk:ВАШ_НАДЁЖНЫЙ_ПАРОЛЬ@localhost:5432/polezno_irkutsk
```

---

## Клонирование репозитория

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/vizuallarin-ai/polezno-pro-irkutsk.git polezno
cd polezno
```

Приватный репозиторий: настройте Deploy Key в GitHub или `git clone` по HTTPS с токеном.

---

## Переменные окружения (production)

```bash
cp .env.production.example .env.production
nano .env.production
```

Обязательно заполните:

| Переменная | Пример / описание |
|------------|-------------------|
| `DATABASE_URL` | `postgresql://polezno_irkutsk:...@localhost:5432/polezno_irkutsk` |
| `PAYLOAD_SECRET` | 32+ случайных символов |
| `NEXT_PUBLIC_SERVER_URL` | `https://irkportal.ru` (без `/` в конце) |
| `REVALIDATE_SECRET` | случайная строка |

Скрипты `create-admin` и `seed` читают `.env.local`. Создайте симлинк:

```bash
ln -sf .env.production .env.local
```

Файлы `.env*` с секретами **не коммитьте**.

---

## Сборка и запуск через PM2

```bash
cd /var/www/polezno
export NODE_ENV=production
npm ci
npm run build
pm2 start npm --name polezno -- start
pm2 save
pm2 startup
```

Выполните команду, которую выведет `pm2 startup` (с `sudo`).

Проверка:

```bash
pm2 status
pm2 logs polezno --lines 50
curl -I http://127.0.0.1:3000
```

Приложение слушает **порт 3000** на localhost.

---

## Nginx: reverse proxy

```bash
nano /etc/nginx/sites-available/irkportal
```

```nginx
server {
    listen 80;
    server_name irkportal.ru www.irkportal.ru;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
    }
}
```

```bash
ln -sf /etc/nginx/sites-available/irkportal /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## SSL (Let's Encrypt)

После того как DNS указывает на VPS (см. ниже):

```bash
certbot --nginx -d irkportal.ru -d www.irkportal.ru
```

Проверка автообновления:

```bash
certbot renew --dry-run
```

---

## DNS в панели Beget

В управлении доменом **irkportal.ru**:

| Тип | Имя | Значение |
|-----|-----|----------|
| A | `@` | IP вашего VPS |
| A | `www` | тот же IP |

Распространение DNS: от нескольких минут до 24 часов. До появления A-записи certbot может не выдать сертификат.

Проверка с ПК:

```bash
dig +short irkportal.ru
```

---

## Первый администратор и демо-контент

```bash
cd /var/www/polezno
# В .env.production задайте ADMIN_SEED_EMAIL и ADMIN_SEED_PASSWORD
npm run create-admin
```

- Сообщение `ADMIN_CREATED` — вход на https://irkportal.ru/admin  
- `ADMIN_EXISTS` — пользователь уже есть  

Опционально демо-данные:

```bash
npm run seed
```

---

## Обновление после изменений в GitHub

```bash
cd /var/www/polezno
git pull origin master
npm ci
npm run build
pm2 restart polezno
```

---

## Резервное копирование БД

Ежедневный дамп (пример cron):

```bash
mkdir -p /var/backups/polezno
sudo -u postgres pg_dump -Fc polezno_irkutsk > /var/backups/polezno/polezno_$(date +%F).dump
```

Восстановление:

```bash
sudo -u postgres pg_restore -d polezno_irkutsk --clean /var/backups/polezno/ИМЯ_ФАЙЛА.dump
```

Храните бэкапы **вне** VPS (Beget S3, другой сервер, локальный ПК).

---

## Сборка падает с «Killed»

Next.js 16 + Payload на VPS **1 GB RAM** часто обрывает `npm run build` без текста ошибки — это OOM-killer.

**Решение:** скрипт `deploy-beget.sh` (актуальный `master`) сам создаёт **swap 2 GB**. Вручную:

```bash
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
free -h
cd /var/www/polezno && NODE_OPTIONS='--max-old-space-size=1536' npm run build
```

Если снова `Killed` — увеличьте VPS до **2 GB RAM**.

---

## Устранение неполадок: `/admin` отдаёт 502

**502 Bad Gateway** — Nginx не получает ответ от Node на `:3000`.

| Проверка | Команда / действие |
|----------|-------------------|
| PM2 запущен? | `pm2 status` → `online` |
| Логи приложения | `pm2 logs polezno --lines 100` |
| Порт 3000 | `curl -I http://127.0.0.1:3000/admin` |
| Ошибки Nginx | `tail -f /var/log/nginx/error.log` |
| Переменные окружения | `DATABASE_URL`, `PAYLOAD_SECRET` в `.env.production` |
| Сборка | `npm run build` без ошибок |
| Память | `free -h` — при OOM перезапуск: `pm2 restart polezno` |
| PostgreSQL | `sudo systemctl status postgresql` |
| После смены `.env` | `pm2 restart polezno` |

Типичные причины:

1. **Приложение упало** — смотрите `pm2 logs` (нет `DATABASE_URL`, неверный пароль Postgres).
2. **Не пересобрали** после `git pull` — снова `npm run build` и `pm2 restart`.
3. **DNS/SSL ещё не готовы** — сайт по HTTP может работать, а вы заходите по HTTPS до certbot.
4. **Нехватка RAM на 1 GB** — для Next + Payload нужны **2 GB**.

Если публичные страницы открываются, а `/admin` — **500** (не 502): проверьте `DATABASE_URL` и что БД доступна (`psql` под пользователем `polezno_irkutsk`).

---

## Чеклист «завтра, когда VPS уже выдан»

1. Записать **IP**, войти по **SSH**.
2. `apt update`, установить **Node 20**, **PostgreSQL**, **Nginx**, **certbot**, **pm2**, **git**, включить **ufw**.
3. Создать БД **`polezno_irkutsk`** и пользователя.
4. `git clone` → `/var/www/polezno`.
5. Заполнить **`.env.production`**, симлинк **`.env.local`**.
6. `npm ci` → `npm run build` → **pm2 start**.
7. Настроить **Nginx** для `irkportal.ru` / `www`.
8. В Beget: **A-запись** на IP VPS.
9. **`certbot --nginx`** после DNS.
10. **`npm run create-admin`**, при необходимости **`npm run seed`**.

---

## См. также

- Локальная разработка: `README.md`, `.env.example`
- Деплой на Vercel + Neon (альтернатива): `docs/DEPLOY-ADMIN.md` — **не используется** на Beget-VPS схеме из этого файла.
