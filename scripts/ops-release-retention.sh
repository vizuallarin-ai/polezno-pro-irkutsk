#!/usr/bin/env bash
# OPS.1 — IrkPortal release retention (manual / post-deploy).
# Keeps CURRENT + N previous release dirs under /var/www/polezno-releases.
# NEVER touches shared media/env, DB, or active symlink target incorrectly.
#
# Usage (on VPS as root):
#   KEEP=2 bash /path/to/ops-release-retention.sh            # dry-run
#   KEEP=2 EXECUTE=1 bash /path/to/ops-release-retention.sh  # delete
#
# Default KEEP=2 means: current + 1 previous (2 dirs total).
set -euo pipefail

RELEASES_DIR="${RELEASES_DIR:-/var/www/polezno-releases}"
CURRENT_LINK="${CURRENT_LINK:-/var/www/polezno-current}"
SHARED_MEDIA="${SHARED_MEDIA:-/var/www/polezno-shared/media}"
KEEP="${KEEP:-2}"
EXECUTE="${EXECUTE:-0}"

if ! [[ "$KEEP" =~ ^[0-9]+$ ]] || [ "$KEEP" -lt 2 ]; then
  echo "KEEP must be an integer >= 2 (current + at least one rollback)" >&2
  exit 2
fi

CURRENT="$(readlink -f "$CURRENT_LINK")"
if [ -z "$CURRENT" ] || [ ! -d "$CURRENT" ]; then
  echo "Cannot resolve current release from $CURRENT_LINK" >&2
  exit 1
fi

if [ ! -d "$SHARED_MEDIA" ]; then
  echo "Refusing to run: shared media missing at $SHARED_MEDIA" >&2
  exit 1
fi

mapfile -t ALL < <(find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' | sort -nr | awk '{print $2}')

KEEP_LIST=()
DELETE_LIST=()
kept=0
for dir in "${ALL[@]}"; do
  base="$(basename "$dir")"
  if ! [[ "$base" =~ ^[0-9a-f]{40}$ ]]; then
    echo "SKIP non-sha dir: $dir"
    continue
  fi
  if [ "$(readlink -f "$dir")" = "$CURRENT" ]; then
    KEEP_LIST+=("$dir")
    kept=$((kept + 1))
    continue
  fi
  if [ "$kept" -lt "$KEEP" ]; then
    KEEP_LIST+=("$dir")
    kept=$((kept + 1))
  else
    DELETE_LIST+=("$dir")
  fi
done

echo "CURRENT=$CURRENT"
echo "KEEP=$KEEP"
echo "=== keep ==="
printf '%s\n' "${KEEP_LIST[@]:-}"
echo "=== delete candidates ==="
printf '%s\n' "${DELETE_LIST[@]:-(none)}"

if [ "${#DELETE_LIST[@]}" -eq 0 ]; then
  echo "Nothing to delete."
  exit 0
fi

if [ "$EXECUTE" != "1" ]; then
  echo "Dry-run only. Re-run with EXECUTE=1 to delete listed paths."
  exit 0
fi

for dir in "${DELETE_LIST[@]}"; do
  resolved="$(readlink -f "$dir")"
  if [ "$resolved" = "$CURRENT" ]; then
    echo "REFUSE delete current: $dir" >&2
    exit 1
  fi
  if [[ "$resolved" != "$RELEASES_DIR"/* ]]; then
    echo "REFUSE path outside releases: $resolved" >&2
    exit 1
  fi
  echo "rm -rf --one-file-system $resolved"
  rm -rf --one-file-system "$resolved"
done

echo "Done. Releases left:"
ls -la "$RELEASES_DIR"
df -h / | tail -1
