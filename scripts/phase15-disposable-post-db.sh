#!/bin/bash
# Create post-commit disposable DB after pre DB dropped.
set -eu
: "${PHASE15_ROLE:?}"
: "${PHASE15_POST_DB:?}"
if [ -z "${PHASE15_TEMP_PASSWORD:-}" ]; then read -r PHASE15_TEMP_PASSWORD; fi
: "${PHASE15_TEMP_PASSWORD:?}"

ROLE="$PHASE15_ROLE"
POST_DB="$PHASE15_POST_DB"

if ! echo "$POST_DB" | grep -qE '^irkportal_phase15_post_[a-z0-9_]+$'; then echo "INVALID_DB"; exit 1; fi
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${POST_DB}'" | grep -q 1; then echo "DB_EXISTS"; exit 1; fi
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${ROLE}'" | grep -q 1; then echo "ROLE_MISSING"; exit 1; fi

sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
CREATE DATABASE "${POST_DB}"
  OWNER "${ROLE}"
  TEMPLATE template0
  ENCODING 'UTF8'
  CONNECTION LIMIT 20;
SQL

sudo -u postgres psql -d "$POST_DB" -v ON_ERROR_STOP=1 <<SQL
SELECT current_database();
ALTER ROLE "${ROLE}" IN DATABASE "${POST_DB}" SET search_path = public, pg_catalog;
GRANT USAGE, CREATE ON SCHEMA public TO "${ROLE}";
SQL

CURRENT_DB=$(sudo -u postgres psql -d "$POST_DB" -tAc "SELECT current_database()")
[ "$CURRENT_DB" = "$POST_DB" ] || { echo "DB_CONTEXT_FAIL"; exit 1; }

POSTGRES_PUBLIC_ACL=$(sudo -u postgres psql -d postgres -tAc "
SELECT pg_catalog.array_to_string(n.nspacl, ',') LIKE '%${ROLE}%' FROM pg_namespace n WHERE n.nspname='public'
")
[ "$POSTGRES_PUBLIC_ACL" = "f" ] || { echo "POSTGRES_PUBLIC_GRANT_FAIL"; exit 1; }

DB_OWNER=$(sudo -u postgres psql -tAc "SELECT pg_catalog.pg_get_userbyid(d.datdba) FROM pg_database d WHERE d.datname='${POST_DB}'")
[ "$DB_OWNER" = "$ROLE" ] || { echo "DB_OWNER_FAIL"; exit 1; }
echo "POST_DB_CREATED=$POST_DB"
echo "POST_SETUP=PASS"
