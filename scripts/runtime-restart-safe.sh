#!/usr/bin/env bash
# Canonical safe runtime reload for IrkPortal PM2 app `polezno`.
#
# Prefer over bare `pm2 restart`:
#   stop → verify :3000 free (or terminate expected orphan) → start → health/identity
#
# Usage (on VPS):
#   bash /var/www/polezno-current/scripts/runtime-restart-safe.sh
#   EXPECTED_SHA=<40hex> bash scripts/runtime-restart-safe.sh
#
# Does NOT switch polezno-current. Does NOT mutate DB/content/env secrets.
# Emergency SIGKILL only for verified expected orphan after graceful TERM timeout.
set -euo pipefail

APP_NAME="${PM2_APP_NAME:-polezno}"
PORT="${PORT:-3000}"
CURRENT_LINK="${POLEZNO_CURRENT:-/var/www/polezno-current}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:${PORT}/api/health}"
STOP_WAIT_SEC="${STOP_WAIT_SEC:-12}"
HEALTH_WAIT_SEC="${HEALTH_WAIT_SEC:-40}"
ECOSYSTEM="${ECOSYSTEM:-$CURRENT_LINK/ecosystem.config.cjs}"

log() { printf '[runtime-restart-safe] %s\n' "$*"; }
die() { log "FAIL: $*"; exit 1; }

require_cmd() { command -v "$1" >/dev/null 2>&1 || die "missing command: $1"; }

require_cmd pm2
require_cmd curl
require_cmd python3
require_cmd ss

EXPECTED_SHA="${EXPECTED_SHA:-}"
if [ -z "$EXPECTED_SHA" ]; then
  if [ -L "$CURRENT_LINK" ] || [ -d "$CURRENT_LINK" ]; then
    EXPECTED_SHA="$(basename "$(readlink -f "$CURRENT_LINK")")"
  fi
fi
echo "$EXPECTED_SHA" | grep -Eq '^[0-9a-f]{40}$' || die "EXPECTED_SHA must be 40-char hex (got: ${EXPECTED_SHA:-empty})"

port_pids() {
  ss -ltnp 2>/dev/null | grep -E ":${PORT}\\b" | sed -n 's/.*pid=\([0-9]*\).*/\1/p' | sort -u || true
}

cmdline_of() {
  local pid="$1"
  if [ -r "/proc/$pid/cmdline" ]; then
    tr '\0' ' ' < "/proc/$pid/cmdline"
  else
    ps -o cmd= -p "$pid" 2>/dev/null || true
  fi
}

cwd_of() {
  local pid="$1"
  readlink -f "/proc/$pid/cwd" 2>/dev/null || true
}

classify_pid() {
  # prints: free | expected | foreign
  local pids
  pids="$(port_pids)"
  if [ -z "$pids" ]; then
    echo free
    return 0
  fi
  local pid cmd cwd
  for pid in $pids; do
    cmd="$(cmdline_of "$pid")"
    cwd="$(cwd_of "$pid")"
    if echo "$cmd" | grep -Eq 'next-server|next start|dist/bin/next' \
      && echo "$cwd" | grep -Eq 'polezno-current|polezno-releases'; then
      echo "expected:$pid"
      return 0
    fi
    echo "foreign:$pid:${cmd:0:120}"
    return 0
  done
}

wait_port_free() {
  local i
  for i in $(seq 1 "$STOP_WAIT_SEC"); do
    if [ -z "$(port_pids)" ]; then
      log "port :$PORT free"
      return 0
    fi
    sleep 1
  done
  return 1
}

term_expected_orphan() {
  local class pid
  class="$(classify_pid)"
  case "$class" in
    free) return 0 ;;
    foreign:*)
      die "port :$PORT owned by foreign process ($class) — ABORT (will not kill)"
      ;;
    expected:*)
      pid="${class#expected:}"
      log "sending SIGTERM to expected listener pid=$pid"
      # PID reuse guard: re-check cmdline before signal
      echo "$(cmdline_of "$pid")" | grep -Eq 'next-server|next start|dist/bin/next' \
        || die "PID reuse guard: pid $pid cmdline no longer looks like Next"
      kill -TERM "$pid" 2>/dev/null || true
      if wait_port_free; then return 0; fi
      log "still listening after TERM — emergency SIGKILL pid=$pid"
      echo "$(cmdline_of "$pid")" | grep -Eq 'next-server|next start|dist/bin/next' \
        || die "PID reuse guard before KILL failed"
      kill -KILL "$pid" 2>/dev/null || true
      wait_port_free || die "port :$PORT still busy after SIGKILL"
      ;;
    *) die "unknown port class: $class" ;;
  esac
}

wait_health() {
  local i body sha
  for i in $(seq 1 "$HEALTH_WAIT_SEC"); do
    if body="$(curl -sf "$HEALTH_URL" 2>/dev/null)"; then
      sha="$(printf '%s' "$body" | python3 -c 'import sys,json; print(json.load(sys.stdin).get("commitSha",""))')"
      status="$(printf '%s' "$body" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("status"), d.get("app"), d.get("database"))')"
      log "health: $status commitSha=$sha"
      if [ "$sha" = "$EXPECTED_SHA" ]; then
        printf '%s' "$body" | python3 -c 'import sys,json; d=json.load(sys.stdin); assert d.get("status")=="ok" and d.get("app")=="up" and d.get("database")=="up"'
        return 0
      fi
      log "identity mismatch (want $EXPECTED_SHA)"
    fi
    sleep 1
  done
  return 1
}

log "EXPECTED_SHA=$EXPECTED_SHA"
log "stopping PM2 app $APP_NAME"
pm2 stop "$APP_NAME" >/dev/null || true
sleep 1

if ! wait_port_free; then
  log "port still busy after pm2 stop — evaluating owner"
  term_expected_orphan
fi

class="$(classify_pid)"
[ "$class" = "free" ] || die "refusing start: port not free ($class)"

# Prefer reload from ecosystem so direct-Next contract applies when dump is updated.
if [ -f "$ECOSYSTEM" ]; then
  if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
    log "pm2 delete $APP_NAME (reload ecosystem contract)"
    pm2 delete "$APP_NAME" >/dev/null
  fi
  log "pm2 start $ECOSYSTEM --only $APP_NAME --env production"
  pm2 start "$ECOSYSTEM" --only "$APP_NAME" --env production --update-env
else
  log "ecosystem missing — pm2 start $APP_NAME"
  pm2 start "$APP_NAME" --update-env
fi

wait_health || die "health/identity not ready within ${HEALTH_WAIT_SEC}s"
pm2 save >/dev/null 2>&1 || true
log "PASS"
exit 0
