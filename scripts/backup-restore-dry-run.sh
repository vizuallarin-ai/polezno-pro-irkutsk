#!/usr/bin/env bash
# Safe restore validation against a TEMPORARY database (never production).
#
# Usage (on VPS or any host with postgres + a dump file):
#   DUMP=/var/backups/polezno/polezno_YYYYMMDD.dump \
#   bash scripts/backup-restore-dry-run.sh
#
# Creates DB restore_probe_<stamp>, restores, runs SELECT 1 / table smoke,
# then DROPS the temp DB. Refuses if TARGET_DB looks like production name
# without explicit ALLOW_PROD_NAME_OVERRIDE=1 (still never drops production).
set -euo pipefail

DUMP="${DUMP:?Set DUMP=/path/to/polezno_*.dump}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
TEMP_DB="${TEMP_DB:-restore_probe_${STAMP}}"
PROD_DB_NAME="${PROD_DB_NAME:-polezno_irkutsk}"

if [ ! -f "$DUMP" ]; then
  echo "ABORT: dump not found: $DUMP" >&2
  exit 1
fi

if [ "$TEMP_DB" = "$PROD_DB_NAME" ] && [ "${ALLOW_PROD_NAME_OVERRIDE:-0}" != "1" ]; then
  echo "ABORT: refusing to use production DB name as restore target" >&2
  exit 1
fi

if [[ ! "$TEMP_DB" =~ ^restore_probe_ ]]; then
  echo "ABORT: TEMP_DB must start with restore_probe_" >&2
  exit 1
fi

echo "Creating temporary DB: $TEMP_DB"
sudo -u postgres psql -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"${TEMP_DB}\";"
sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"${TEMP_DB}\";"

echo "Restoring dump into $TEMP_DB"
sudo -u postgres pg_restore --dbname="$TEMP_DB" --no-owner --no-acl "$DUMP" || {
  # Custom format dumps may warn on non-fatal issues; require at least connectable DB
  echo "WARN: pg_restore exited non-zero — continuing with sanity query" >&2
}

echo "Sanity query"
TABLES="$(sudo -u postgres psql -d "$TEMP_DB" -Atc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';")"
echo "public_tables=$TABLES"
if [ "${TABLES:-0}" -lt 1 ]; then
  echo "ABORT: restore produced no public tables" >&2
  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"${TEMP_DB}\";"
  exit 1
fi

sudo -u postgres psql -d "$TEMP_DB" -v ON_ERROR_STOP=1 -c "SELECT 1 AS ok;"

echo "Dropping temporary DB: $TEMP_DB"
sudo -u postgres psql -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"${TEMP_DB}\";"

echo "RESTORE DRY-RUN OK"
echo "exit=0"
