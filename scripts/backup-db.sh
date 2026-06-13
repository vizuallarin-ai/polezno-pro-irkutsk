#!/usr/bin/env bash
# Резервная копия PostgreSQL на VPS. Cron: 0 3 * * * /var/www/polezno/scripts/backup-db.sh
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/polezno}"
DB_NAME="${DB_NAME:-polezno_irkutsk}"
STAMP="$(date +%F_%H%M)"

mkdir -p "$BACKUP_DIR"
sudo -u postgres pg_dump -Fc "$DB_NAME" > "${BACKUP_DIR}/polezno_${STAMP}.dump"
find "$BACKUP_DIR" -name 'polezno_*.dump' -mtime +14 -delete 2>/dev/null || true
echo "Backup: ${BACKUP_DIR}/polezno_${STAMP}.dump"
