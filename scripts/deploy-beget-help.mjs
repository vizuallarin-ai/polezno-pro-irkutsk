#!/usr/bin/env node
/**
 * Подсказка по деплою на Beget VPS (локально, не на сервере).
 */
console.log(`
polezno-pro-irkutsk — деплой на Beget VPS (Ubuntu 24.04)

На VPS после SSH (root):

  export DEPLOY_DB_PASSWORD='надёжный_пароль_для_postgres'
  apt update && apt install -y git
  git clone https://github.com/vizuallarin-ai/polezno-pro-irkutsk.git /var/www/polezno
  cd /var/www/polezno
  bash scripts/deploy-beget.sh

Повторный запуск (обновление инфраструктуры + redeploy):

  cd /var/www/polezno && git pull origin master
  export DEPLOY_DB_PASSWORD='...'
  bash scripts/deploy-beget.sh

Секреты заранее (не в git):
  - DEPLOY_DB_PASSWORD — пароль пользователя PostgreSQL polezno_irkutsk
  - PAYLOAD_SECRET, REVALIDATE_SECRET — в .env.production на сервере
  - ADMIN_SEED_PASSWORD — для npm run create-admin

Полная инструкция: docs/DEPLOY-BEGET.md
`);
