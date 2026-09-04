#!/bin/bash
# Drop pre-commit disposable DB only.
set -eu
: "${PHASE15_ROLE:?}"
: "${PHASE15_PRE_DB:?}"

ROLE="$PHASE15_ROLE"
PRE_DB="$PHASE15_PRE_DB"

if ! echo "$PRE_DB" | grep -qE '^irkportal_phase15_pre_[a-z0-9_]+$'; then echo "INVALID_DB"; exit 1; fi
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${PRE_DB}'" | grep -q 1; then
  echo "PRE_DB_ABSENT"
  exit 0
fi
owner=$(sudo -u postgres psql -tAc "SELECT pg_catalog.pg_get_userbyid(d.datdba) FROM pg_database d WHERE d.datname='${PRE_DB}'")
[ "$owner" = "$ROLE" ] || { echo "DROP_BLOCKED"; exit 1; }
sudo -u postgres psql -v ON_ERROR_STOP=1 -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='${PRE_DB}' AND pid <> pg_backend_pid();" >/dev/null 2>&1 || true
sudo -u postgres psql -v ON_ERROR_STOP=1 -c "DROP DATABASE \"${PRE_DB}\";"
echo "PRE_DB_DROPPED=$PRE_DB"
