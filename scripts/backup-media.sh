#!/usr/bin/env bash
# Archive local/shared Payload media for backup (ADMIN.E).
# Does not include .env secrets. Prefer running on VPS against shared media.
#
# Usage:
#   MEDIA_DIR=/var/www/polezno-shared/media \
#   OUT_DIR=/var/backups/polezno \
#   bash scripts/backup-media.sh
set -euo pipefail

MEDIA_DIR="${MEDIA_DIR:-public/media}"
OUT_DIR="${OUT_DIR:-/var/backups/polezno}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
RETENTION_DAYS="${MEDIA_RETENTION_DAYS:-14}"

if [ ! -d "$MEDIA_DIR" ]; then
  echo "ABORT: MEDIA_DIR not found: $MEDIA_DIR" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"
OUT="${OUT_DIR}/polezno_media_${STAMP}.tar.gz"

tar -czf "$OUT" -C "$(dirname "$MEDIA_DIR")" "$(basename "$MEDIA_DIR")"
test -s "$OUT"

if command -v sha256sum >/dev/null 2>&1; then
  sha256sum "$OUT" | tee "${OUT}.sha256"
elif command -v shasum >/dev/null 2>&1; then
  shasum -a 256 "$OUT" | tee "${OUT}.sha256"
fi

find "$OUT_DIR" -name 'polezno_media_*.tar.gz' -mtime "+${RETENTION_DAYS}" -delete 2>/dev/null || true
find "$OUT_DIR" -name 'polezno_media_*.tar.gz.sha256' -mtime "+${RETENTION_DAYS}" -delete 2>/dev/null || true

echo "Media backup OK: $OUT"
echo "exit=0"
