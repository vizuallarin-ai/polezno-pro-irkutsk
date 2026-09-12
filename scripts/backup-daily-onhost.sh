#!/usr/bin/env bash
# Canonical on-host daily backup pipeline (ADMIN.E final closeout).
#
# Sequence:
#   1) DB dump
#   2) Media archive
#   3) Local backup health (DB + media)
#
# Offsite: if /etc/polezno/offsite.env (or env) sets OFFSITE_MODE, copy after local
# archives. When OFFSITE_MODE is unset, backup-health-check exits 2 (NOT LIVE).
# Exit 2 is treated as SUCCESS for the on-host layer so local backups never
# depend on owner infra that is not yet provisioned.
#
# Install path on VPS (no app deploy required):
#   /var/www/polezno-shared/ops/scripts/backup-daily-onhost.sh
#
# Cron: scripts/cron/polezno-backup → /etc/cron.d/polezno-backup
set -euo pipefail

SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"

# Sibling scripts next to this wrapper (repo scripts/ or VPS shared ops/scripts).
DB_SCRIPT="${SCRIPTS_DIR}/backup-db.sh"
MEDIA_SCRIPT="${SCRIPTS_DIR}/backup-media.sh"
HEALTH_SCRIPT="${SCRIPTS_DIR}/backup-health-check.mjs"

BACKUP_DIR="${BACKUP_DIR:-/var/backups/polezno}"
MEDIA_DIR="${MEDIA_DIR:-/var/www/polezno-shared/media}"
export BACKUP_DIR
export MEDIA_DIR
export OUT_DIR="${OUT_DIR:-$BACKUP_DIR}"
export REQUIRE_MEDIA_BACKUP="${REQUIRE_MEDIA_BACKUP:-1}"

# Bound backup directory permissions (dumps contain DB/PII). Do not world-expose.
mkdir -p "$BACKUP_DIR"
chmod 750 "$BACKUP_DIR" 2>/dev/null || true

echo "=== ONHOST BACKUP START $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="

bash "$DB_SCRIPT"
bash "$MEDIA_SCRIPT"

# Optional LIVE offsite (ADMIN.F). Secrets only via host env file — never git.
OFFSITE_ENV_FILE="${OFFSITE_ENV_FILE:-/etc/polezno/offsite.env}"
if [ -f "$OFFSITE_ENV_FILE" ]; then
  # shellcheck disable=SC1090
  set -a
  # Presence-only source; do not echo values.
  source "$OFFSITE_ENV_FILE"
  set +a
fi

OFFSITE_SCRIPT="${SCRIPTS_DIR}/backup-offsite-copy.sh"
if [ -n "${OFFSITE_MODE:-}" ]; then
  LATEST_DB="$(ls -1t "$BACKUP_DIR"/polezno_*.dump 2>/dev/null | head -n1 || true)"
  LATEST_MEDIA="$(ls -1t "$BACKUP_DIR"/polezno_media_*.tar.gz 2>/dev/null | head -n1 || true)"
  if [ -z "$LATEST_DB" ] || [ ! -s "$LATEST_DB" ]; then
    echo "ABORT: no local DB dump for offsite copy" >&2
    exit 1
  fi
  echo "=== OFFSITE COPY START $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
  DUMP="$LATEST_DB" MEDIA_ARCHIVE="${LATEST_MEDIA:-}" bash "$OFFSITE_SCRIPT"
  echo "=== OFFSITE COPY OK $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
else
  echo "offsite: NOT LIVE (OFFSITE_MODE unset — owner infra required)"
fi

# Health: exit 0 = local+offsite OK; exit 2 = local OK / offsite deferred; exit 1 = fail
set +e
node "$HEALTH_SCRIPT"
HEALTH_EC=$?
set -e

case "$HEALTH_EC" in
  0)
    echo "backup-health: OK (local + offsite live)"
    ;;
  2)
    echo "backup-health: OK on-host; OFFSITE NOT LIVE / owner infra pending (exit 2)"
    ;;
  *)
    echo "ABORT: backup-health failed exit=$HEALTH_EC" >&2
    exit 1
    ;;
esac

echo "=== ONHOST BACKUP OK $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
echo "exit=0"
