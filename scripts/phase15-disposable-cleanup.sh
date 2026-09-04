#!/bin/bash
# Phase 15 disposable cleanup — exact names only, no wildcards.
set -eu

: "${PHASE15_ROLE:?PHASE15_ROLE required}"
: "${PHASE15_PRE_DB:?PHASE15_PRE_DB required}"
: "${PHASE15_POST_DB:?PHASE15_POST_DB required}"

ROLE="$PHASE15_ROLE"
PRE_DB="$PHASE15_PRE_DB"
POST_DB="$PHASE15_POST_DB"

verify_name() {
  local name="$1" pattern="$2"
  echo "$name" | grep -qE "$pattern" || { echo "INVALID_NAME:$name"; exit 1; }
}

verify_name "$ROLE" '^phase15_builder_[a-z0-9_]+$'
verify_name "$PRE_DB" '^irkportal_phase15_pre_[a-z0-9_]+$'
verify_name "$POST_DB" '^irkportal_phase15_post_[a-z0-9_]+$'

drop_db_if_exists() {
  local db="$1" expected_owner="$2"
  if sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${db}'" | grep -q 1; then
    local owner
    owner=$(sudo -u postgres psql -tAc "SELECT pg_catalog.pg_get_userbyid(d.datdba) FROM pg_database d WHERE d.datname='${db}'")
    [ "$owner" = "$expected_owner" ] || { echo "DROP_BLOCKED_OWNER:$db"; exit 1; }
    sudo -u postgres psql -v ON_ERROR_STOP=1 -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='${db}' AND pid <> pg_backend_pid();" >/dev/null 2>&1 || true
    sudo -u postgres psql -v ON_ERROR_STOP=1 -c "DROP DATABASE \"${db}\";"
    echo "DROPPED_DB=$db"
  else
    echo "DB_ABSENT=$db"
  fi
}

drop_db_if_exists "$POST_DB" "$ROLE"
drop_db_if_exists "$PRE_DB" "$ROLE"

if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${ROLE}'" | grep -q 1; then
  OWNED=$(sudo -u postgres psql -tAc "SELECT count(*) FROM pg_database WHERE pg_get_userbyid(datdba)='${ROLE}'")
  [ "$OWNED" = "0" ] || { echo "ROLE_STILL_OWNS_DB:$OWNED"; exit 1; }
  DEPS=$(sudo -u postgres psql -tAc "SELECT count(*) FROM pg_shdepend d JOIN pg_roles r ON d.refobjid=r.oid WHERE r.rolname='${ROLE}'")
  [ "$DEPS" = "0" ] || { echo "ROLE_HAS_DEPENDENCIES:$DEPS"; exit 1; }
  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "DROP ROLE \"${ROLE}\";"
  echo "DROPPED_ROLE=$ROLE"
else
  echo "ROLE_ABSENT=$ROLE"
fi

DB_HASH=$(sudo -u postgres psql -tAc "SELECT md5(string_agg(datname, ',' ORDER BY datname)) FROM pg_database WHERE datistemplate = false")
ROLE_HASH=$(sudo -u postgres psql -tAc "SELECT md5(string_agg(rolname, ',' ORDER BY rolname)) FROM pg_roles")
echo "DB_INVENTORY_HASH=$DB_HASH"
echo "ROLE_INVENTORY_HASH=$ROLE_HASH"
echo "CLEANUP=PASS"
