#!/usr/bin/env bash
# Canonical on-host daily backup pipeline (ADMIN.E final closeout).
#
# Sequence:
#   1) DB dump
#   2) Media archive
#   3) Local backup health (DB + media)
#
# Offsite copy is intentionally NOT required here.
# LIVE offsite is deferred to ADMIN.F by owner decision.
# When OFFSITE_MODE is unset, backup-health-check exits 2 (contract ready, not live).
# That exit is treated as SUCCESS for the on-host pipeline.
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
    echo "backup-health: OK on-host; OFFSITE LIVE deferred (exit 2 expected until ADMIN.F)"
    ;;
  *)
    echo "ABORT: backup-health failed exit=$HEALTH_EC" >&2
    exit 1
    ;;
esac

echo "=== ONHOST BACKUP OK $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
echo "exit=0"
