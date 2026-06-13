#!/usr/bin/env bash
# =============================================================================
# Одноразовый (и повторный) bootstrap polezno-pro-irkutsk на Beget VPS (Ubuntu 24.04)
# Домен: irkportal.ru | PostgreSQL локально на VPS (Neon/Supabase не используются)
#
# Запуск на сервере (от root или через sudo):
#   export DEPLOY_DB_PASSWORD='ваш_надёжный_пароль_postgres'
#   bash scripts/deploy-beget.sh
#
# Или скачать только скрипт после clone — обычно запускают из клонированного репо:
#   cd /var/www/polezno && bash scripts/deploy-beget.sh
#
# Секреты в репозиторий не кладите. DEPLOY_DB_PASSWORD — только в shell-сессии.
# =============================================================================

set -euo pipefail

# --- Константы деплоя (при необходимости измените перед запуском) ---
readonly APP_NAME="polezno"
readonly APP_DIR="/var/www/polezno"
readonly REPO_URL="https://github.com/vizuallarin-ai/polezno-pro-irkutsk.git"
readonly GIT_BRANCH="master"
readonly DOMAIN="irkportal.ru"
readonly WWW_DOMAIN="www.irkportal.ru"
readonly VPS_IP_HINT="90.156.170.182"
readonly DB_USER="polezno_irkutsk"
readonly DB_NAME="polezno_irkutsk"
readonly NODE_MAJOR="20"
readonly PM2_APP_NAME="polezno"
readonly NGINX_SITE="irkportal"

# Цвета для вывода (опционально)
if [[ -t 1 ]]; then
  readonly C_RESET='\033[0m'
  readonly C_BOLD='\033[1m'
  readonly C_YELLOW='\033[1;33m'
  readonly C_GREEN='\033[0;32m'
  readonly C_RED='\033[0;31m'
else
  readonly C_RESET='' C_BOLD='' C_YELLOW='' C_GREEN='' C_RED=''
fi

log() { echo -e "${C_GREEN}[deploy-beget]${C_RESET} $*"; }
warn() { echo -e "${C_YELLOW}[deploy-beget]${C_RESET} $*"; }
err() { echo -e "${C_RED}[deploy-beget]${C_RESET} $*" >&2; }

need_root() {
  if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
    err "Запустите скрипт от root или через: sudo bash scripts/deploy-beget.sh"
    exit 1
  fi
}

need_ubuntu() {
  if [[ ! -f /etc/os-release ]]; then
    warn "Не удалось определить ОС; продолжаем на свой риск."
    return
  fi
  # shellcheck source=/dev/null
  source /etc/os-release
  if [[ "${ID:-}" != "ubuntu" ]]; then
    warn "Скрипт рассчитан на Ubuntu 24.04; обнаружено: ${PRETTY_NAME:-unknown}"
  fi
}

read_db_password() {
  if [[ -n "${DEPLOY_DB_PASSWORD:-}" ]]; then
    return
  fi
  if [[ ! -t 0 ]]; then
    err "Задайте пароль БД через переменную DEPLOY_DB_PASSWORD (интерактивный ввод недоступен)."
    exit 1
  fi
  read -rsp "Пароль PostgreSQL для пользователя ${DB_USER}: " DEPLOY_DB_PASSWORD
  echo
  if [[ -z "${DEPLOY_DB_PASSWORD}" ]]; then
    err "Пароль не может быть пустым."
    exit 1
  fi
}

escape_sql_literal() {
  # Экранирование одинарных кавычек для SQL-литерала
  local s="$1"
  s="${s//\'/\'\'}"
  printf '%s' "$s"
}

env_has_placeholders() {
  local f="$1"
  if grep -qE 'ЗАМЕНИТЕ|случайн|CHANGE_ME|YOUR_|example\.com' "$f" 2>/dev/null; then
    return 0
  fi
  return 1
}

env_is_ready() {
  local f="$1"
  [[ -f "$f" ]] || return 1
  env_has_placeholders "$f" && return 1

  local url secret reval
  url=$(grep -E '^DATABASE_URL=' "$f" | head -1 | cut -d= -f2- || true)
  secret=$(grep -E '^PAYLOAD_SECRET=' "$f" | head -1 | cut -d= -f2- || true)
  reval=$(grep -E '^REVALIDATE_SECRET=' "$f" | head -1 | cut -d= -f2- || true)

  [[ -n "$url" && -n "$secret" && -n "$reval" ]] || return 1
  [[ ${#secret} -ge 32 ]] || return 1
  return 0
}

print_env_instructions() {
  local env_file="$1"
  err ""
  err "Файл ${env_file} не готов к production (есть шаблонные значения или пустые секреты)."
  err ""
  err "Сделайте вручную:"
  err "  1. nano ${env_file}"
  err "  2. Заполните DATABASE_URL (пароль = DEPLOY_DB_PASSWORD), PAYLOAD_SECRET (32+ символов), REVALIDATE_SECRET"
  err "  3. Проверьте NEXT_PUBLIC_SERVER_URL=https://${DOMAIN}"
  err "  4. ln -sf .env.production .env.local"
  err "  5. Снова: bash scripts/deploy-beget.sh"
  err ""
  err "Сгенерировать секреты локально:"
  err "  openssl rand -base64 32   # PAYLOAD_SECRET"
  err "  openssl rand -hex 24      # REVALIDATE_SECRET"
  exit 1
}

install_apt_packages() {
  log "Обновление пакетов..."
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -qq
  apt-get upgrade -y -qq || true

  log "Базовые пакеты..."
  apt-get install -y -qq ca-certificates curl gnupg git ufw

  if ! command -v node >/dev/null 2>&1 || ! node -v | grep -q "v${NODE_MAJOR}\."; then
    log "Установка Node.js ${NODE_MAJOR}..."
    curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
    apt-get install -y -qq nodejs
  else
    log "Node.js уже установлен: $(node -v)"
  fi

  log "PostgreSQL, Nginx, Certbot..."
  apt-get install -y -qq postgresql postgresql-contrib nginx certbot python3-certbot-nginx

  if ! command -v pm2 >/dev/null 2>&1; then
    log "Установка PM2..."
    npm install -g pm2
  else
    log "PM2 уже установлен: $(pm2 -v)"
  fi
}

configure_ufw() {
  log "Настройка UFW..."
  ufw allow OpenSSH >/dev/null 2>&1 || true
  ufw allow 'Nginx Full' >/dev/null 2>&1 || true
  if ufw status | grep -q inactive; then
    ufw --force enable
  fi
  ufw status || true
}

ensure_postgres_role_and_db() {
  read_db_password
  local pw_escaped
  pw_escaped=$(escape_sql_literal "${DEPLOY_DB_PASSWORD}")

  log "Пользователь и база PostgreSQL (${DB_NAME})..."
  sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${pw_escaped}';
  ELSE
    ALTER ROLE ${DB_USER} WITH PASSWORD '${pw_escaped}';
  END IF;
END
\$\$;
SQL

  if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
    sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
  else
    log "База ${DB_NAME} уже существует."
  fi

  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};" || true
}

clone_or_update_repo() {
  log "Код приложения в ${APP_DIR}..."
  mkdir -p /var/www
  if [[ -d "${APP_DIR}/.git" ]]; then
    log "git pull..."
    git -C "${APP_DIR}" fetch origin "${GIT_BRANCH}"
    git -C "${APP_DIR}" checkout "${GIT_BRANCH}"
    git -C "${APP_DIR}" pull --ff-only origin "${GIT_BRANCH}"
  else
    if [[ -d "${APP_DIR}" && -n "$(ls -A "${APP_DIR}" 2>/dev/null || true)" ]]; then
      err "Каталог ${APP_DIR} существует, но это не git-репозиторий. Уберите или переименуйте его."
      exit 1
    fi
    git clone --branch "${GIT_BRANCH}" "${REPO_URL}" "${APP_DIR}"
  fi
}

ensure_env_production() {
  local env_file="${APP_DIR}/.env.production"
  local example="${APP_DIR}/.env.production.example"

  if [[ ! -f "$env_file" ]]; then
    if [[ ! -f "$example" ]]; then
      err "Не найден ${example}. Проверьте clone репозитория."
      exit 1
    fi
    warn "Создаём ${env_file} из примера (с плейсхолдерами)..."
    cp "$example" "$env_file"
    chmod 600 "$env_file"
    print_env_instructions "$env_file"
  fi

  chmod 600 "$env_file" || true

  if ! env_is_ready "$env_file"; then
    print_env_instructions "$env_file"
  fi

  log "Симлинк .env.local -> .env.production для create-admin/seed"
  ln -sf .env.production "${APP_DIR}/.env.local"
}

ensure_swap_for_build() {
  # Next.js 16 + Payload на VPS 1 GB часто падает с «Killed» (OOM) без swap
  local swap_mb total_mb
  swap_mb=$(awk '/SwapTotal/ {print $2}' /proc/meminfo 2>/dev/null || echo 0)
  total_mb=$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo 2>/dev/null || echo 0)

  if [[ "${swap_mb:-0}" -lt 1048576 ]]; then
    if [[ ! -f /swapfile ]]; then
      log "Мало swap (${swap_mb} kB), RAM ~${total_mb} MB — создаём /swapfile 2G для сборки..."
      fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048 status=progress
      chmod 600 /swapfile
      mkswap /swapfile
      swapon /swapfile
      grep -q '/swapfile' /etc/fstab 2>/dev/null || echo '/swapfile none swap sw 0 0' >> /etc/fstab
    else
      swapon /swapfile 2>/dev/null || true
    fi
    free -h || true
  else
    log "Swap достаточен для сборки."
  fi
}

build_and_pm2() {
  log "Сборка и запуск приложения..."
  cd "${APP_DIR}"
  ensure_swap_for_build
  export NODE_ENV=production
  export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1536}"
  # devDependencies (typescript и др.) нужны для next build на VPS
  npm ci --include=dev
  npm run build

  if pm2 describe "${PM2_APP_NAME}" >/dev/null 2>&1; then
    pm2 restart "${PM2_APP_NAME}" --update-env
  else
    pm2 start npm --name "${PM2_APP_NAME}" -- start
  fi
  pm2 save

  if ! pm2 startup systemd -u root --hp /root 2>/dev/null | grep -q "already"; then
    warn "Если PM2 ещё не в автозагрузке, выполните команду, которую выведет:"
    warn "  pm2 startup"
  fi

  log "Проверка localhost:3000..."
  sleep 2
  curl -sfI http://127.0.0.1:3000 >/dev/null || warn "Приложение пока не отвечает на :3000 — смотрите: pm2 logs ${PM2_APP_NAME}"
}

write_nginx_config() {
  local conf="/etc/nginx/sites-available/${NGINX_SITE}"
  log "Конфиг Nginx: ${conf}"

  cat > "$conf" <<NGINX
# polezno-pro-irkutsk — сгенерировано scripts/deploy-beget.sh
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} ${WWW_DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
    }
}
NGINX

  ln -sf "${conf}" "/etc/nginx/sites-enabled/${NGINX_SITE}"
  if [[ -f /etc/nginx/sites-enabled/default ]]; then
    rm -f /etc/nginx/sites-enabled/default
  fi
  nginx -t
  systemctl reload nginx
}

print_next_steps() {
  echo ""
  echo -e "${C_BOLD}========== Следующие шаги ==========${C_RESET}"
  echo ""
  echo "1. DNS в панели Beget для ${DOMAIN}:"
  echo "   A  @    -> ${VPS_IP_HINT}"
  echo "   A  www  -> ${VPS_IP_HINT}"
  echo ""
  echo "2. После пропагации DNS (проверка: dig +short ${DOMAIN}):"
  echo "   certbot --nginx -d ${DOMAIN} -d ${WWW_DOMAIN}"
  echo ""
  echo "3. Первый администратор CMS:"
  echo "   cd ${APP_DIR}"
  echo "   # задайте ADMIN_SEED_EMAIL и ADMIN_SEED_PASSWORD в .env.production"
  echo "   npm run create-admin"
  echo ""
  echo "4. Опционально демо-контент: npm run seed"
  echo ""
  echo "5. Обновление после push в GitHub:"
  echo "   cd ${APP_DIR} && git pull origin ${GIT_BRANCH} && npm ci && npm run build && pm2 restart ${PM2_APP_NAME}"
  echo ""
  echo "Документация: docs/DEPLOY-BEGET.md"
  echo -e "${C_BOLD}====================================${C_RESET}"
}

main() {
  need_root
  need_ubuntu
  install_apt_packages
  configure_ufw
  ensure_postgres_role_and_db
  clone_or_update_repo
  ensure_env_production
  build_and_pm2
  write_nginx_config
  print_next_steps
  log "Готово."
}

main "$@"