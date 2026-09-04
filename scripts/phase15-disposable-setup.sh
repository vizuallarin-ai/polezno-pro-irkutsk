#!/bin/bash
# Create Phase 15 disposable role + pre DB. Password via PHASE15_TEMP_PASSWORD env (never echo).
set -eu

: "${PHASE15_ROLE:?PHASE15_ROLE required}"
: "${PHASE15_PRE_DB:?PHASE15_PRE_DB required}"
if [ -z "${PHASE15_TEMP_PASSWORD:-}" ]; then read -r PHASE15_TEMP_PASSWORD; fi
: "${PHASE15_TEMP_PASSWORD:?PHASE15_TEMP_PASSWORD required}"

ROLE="$PHASE15_ROLE"
PRE_DB="$PHASE15_PRE_DB"
PASS="$PHASE15_TEMP_PASSWORD"

if ! echo "$ROLE" | grep -qE '^phase15_builder_[a-z0-9_]+$'; then echo "INVALID_ROLE"; exit 1; fi
if ! echo "$PRE_DB" | grep -qE '^irkportal_phase15_pre_[a-z0-9_]+$'; then echo "INVALID_DB"; exit 1; fi
if [ ${#ROLE} -gt 62 ] || [ ${#PRE_DB} -gt 62 ]; then echo "NAME_TOO_LONG"; exit 1; fi

# Fail if names already exist
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${ROLE}'" | grep -q 1; then echo "ROLE_EXISTS"; exit 1; fi
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${PRE_DB}'" | grep -q 1; then echo "DB_EXISTS"; exit 1; fi

VALID_UNTIL="$(date -u -d '+4 hours' '+%Y-%m-%d %H:%M:%S+00')"

sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
CREATE ROLE "${ROLE}" WITH
  LOGIN PASSWORD '${PASS}'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS
  CONNECTION LIMIT 20
  VALID UNTIL '${VALID_UNTIL}';
ALTER ROLE "${ROLE}" SET search_path = pg_catalog;
ALTER ROLE "${ROLE}" SET statement_timeout = '10min';
ALTER ROLE "${ROLE}" SET lock_timeout = '30s';
ALTER ROLE "${ROLE}" SET idle_in_transaction_session_timeout = '60s';
SQL

# Verify role attributes
ROLE_OK=$(sudo -u postgres psql -tAc "
SELECT CASE WHEN
  rolsuper=false AND rolcreatedb=false AND rolcreaterole=false
  AND rolinherit=false AND rolreplication=false AND rolbypassrls=false
  AND rolcanlogin=true
THEN 'PASS' ELSE 'FAIL' END
FROM pg_roles WHERE rolname='${ROLE}'")
[ "$ROLE_OK" = "PASS" ] || { echo "ROLE_ATTR_FAIL"; exit 1; }

MEMBERS=$(sudo -u postgres psql -tAc "
SELECT count(*) FROM pg_auth_members m JOIN pg_roles r ON m.member=r.oid WHERE r.rolname='${ROLE}'")
[ "$MEMBERS" = "0" ] || { echo "ROLE_MEMBER_FAIL"; exit 1; }

# Production isolation — read prod DB name internally, never print
PROD_DB=$(grep -E '^DATABASE_URL=' /var/www/polezno/.env.production | head -1 | sed -E 's|^DATABASE_URL=.*://[^/]+/([^?]+).*|\1|' | tr -d $'\r"')
PROD_DB=$(echo "$PROD_DB" | xargs)

IS_OWNER=$(sudo -u postgres psql -tAc "SELECT CASE WHEN pg_catalog.pg_get_userbyid(d.datdba)='${ROLE}' THEN 1 ELSE 0 END FROM pg_database d WHERE d.datname='${PROD_DB}'")
[ "$IS_OWNER" = "0" ] || { echo "ISOLATION_OWNER_FAIL"; exit 1; }

HAS_CREATE=$(sudo -u postgres psql -tAc "SELECT has_database_privilege('${ROLE}', '${PROD_DB}', 'CREATE')")
[ "$HAS_CREATE" = "f" ] || { echo "ISOLATION_CREATE_DB_FAIL"; exit 1; }

TABLE_WRITE=$(sudo -u postgres psql -d "$PROD_DB" -tAc "
SELECT count(*) FROM information_schema.table_privileges
WHERE grantee='${ROLE}' AND privilege_type IN ('INSERT','UPDATE','DELETE','TRUNCATE','TRIGGER','REFERENCES')
")
[ "$TABLE_WRITE" = "0" ] || { echo "ISOLATION_TABLE_WRITE_FAIL"; exit 1; }

echo "ISOLATION=PASS"

# Create pre-commit DB (no schema grants in postgres database)
sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
CREATE DATABASE "${PRE_DB}"
  OWNER "${ROLE}"
  TEMPLATE template0
  ENCODING 'UTF8'
  CONNECTION LIMIT 20;
SQL

sudo -u postgres psql -d "$PRE_DB" -v ON_ERROR_STOP=1 <<SQL
SELECT current_database();
ALTER ROLE "${ROLE}" IN DATABASE "${PRE_DB}" SET search_path = public, pg_catalog;
GRANT USAGE, CREATE ON SCHEMA public TO "${ROLE}";
SQL

CURRENT_DB=$(sudo -u postgres psql -d "$PRE_DB" -tAc "SELECT current_database()")
[ "$CURRENT_DB" = "$PRE_DB" ] || { echo "DB_CONTEXT_FAIL"; exit 1; }

POSTGRES_PUBLIC_ACL=$(sudo -u postgres psql -d postgres -tAc "
SELECT pg_catalog.array_to_string(n.nspacl, ',') LIKE '%${ROLE}%' FROM pg_namespace n WHERE n.nspname='public'
")
[ "$POSTGRES_PUBLIC_ACL" = "f" ] || { echo "POSTGRES_PUBLIC_GRANT_FAIL"; exit 1; }

DB_OWNER=$(sudo -u postgres psql -tAc "SELECT pg_catalog.pg_get_userbyid(d.datdba) FROM pg_database d WHERE d.datname='${PRE_DB}'")
[ "$DB_OWNER" = "$ROLE" ] || { echo "DB_OWNER_FAIL"; exit 1; }

USER_TABLES=$(sudo -u postgres psql -d "$PRE_DB" -tAc "
SELECT count(*) FROM pg_tables WHERE schemaname NOT IN ('pg_catalog','information_schema')
")
[ "$USER_TABLES" = "0" ] || { echo "DB_NOT_EMPTY"; exit 1; }

echo "ROLE_CREATED=$ROLE"
echo "PRE_DB_CREATED=$PRE_DB"
echo "SETUP=PASS"
