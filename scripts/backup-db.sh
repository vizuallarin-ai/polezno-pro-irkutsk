#!/usr/bin/env bash
# Canonical same-host PostgreSQL backup for IrkPortal (VPS).
# Cron example: 0 3 * * * /var/www/polezno-current/scripts/backup-db.sh
#
# Does NOT mutate application data. Does NOT deploy.
# Offsite copy remains a separate owner step (see docs/offsite-backup.md).
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/polezno}"
DB_NAME="${DB_NAME:-polezno_irkutsk}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

mkdir -p "$BACKUP_DIR"
chmod 750 "$BACKUP_DIR" 2>/dev/null || true
OUT="${BACKUP_DIR}/polezno_${STAMP}.dump"

sudo -u postgres pg_dump -Fc "$DB_NAME" > "$OUT"
test -s "$OUT"
chmod 640 "$OUT" 2>/dev/null || true

if command -v sha256sum >/dev/null 2>&1; then
  sha256sum "$OUT" | tee "${OUT}.sha256"
elif command -v shasum >/dev/null 2>&1; then
  shasum -a 256 "$OUT" | tee "${OUT}.sha256"
else
  echo "WARN: no sha256 tool; checksum skipped" >&2
fi

find "$BACKUP_DIR" -name 'polezno_*.dump' -mtime "+${RETENTION_DAYS}" -delete 2>/dev/null || true
find "$BACKUP_DIR" -name 'polezno_*.dump.sha256' -mtime "+${RETENTION_DAYS}" -delete 2>/dev/null || true

echo "Backup OK: $OUT"
echo "exit=0"
