#!/usr/bin/env bash
# Offsite copy contract for IrkPortal backups (ADMIN.E / ADMIN.E.1).
#
# Does NOT invent credentials. Requires explicit destination env.
# Same-host dump remains scripts/backup-db.sh; this script copies an
# existing dump (+ optional media archive) to an S3-compatible endpoint
# or a second host via scp.
#
# After a successful copy, verifies remote object exists and size > 0
# (S3 head-object). Exit 0 only when verification passes for s3 mode.
#
# Retention:
#   - On-host dumps: RETENTION_DAYS in backup-db.sh (default 14)
#   - Offsite S3: configure bucket lifecycle to expire db/ and media/
#     prefixes after OFFSITE_RETENTION_DAYS (default 14). This script
#     documents the contract; infinite growth without lifecycle is not OK.
#   - Offsite scp: apply the same retention on the destination host.
#
# Status until credentials are configured:
#   OFFSITE BACKUP NOT LIVE
#
# Usage examples:
#   DUMP=/var/backups/polezno/polezno_YYYYMMDD.dump \
#   OFFSITE_MODE=s3 \
#   OFFSITE_S3_BUCKET=my-private-bucket \
#   OFFSITE_S3_ENDPOINT=https://s3.example \
#   AWS_ACCESS_KEY_ID=... AWS_SECRET_ACCESS_KEY=... \
#   bash scripts/backup-offsite-copy.sh
#
#   DUMP=... OFFSITE_MODE=scp OFFSITE_SCP_TARGET=user@host:/backups/polezno/ \
#   bash scripts/backup-offsite-copy.sh
set -euo pipefail

DUMP="${DUMP:?Set DUMP=/path/to/polezno_*.dump}"
OFFSITE_MODE="${OFFSITE_MODE:-}"
MEDIA_ARCHIVE="${MEDIA_ARCHIVE:-}"
OFFSITE_RETENTION_DAYS="${OFFSITE_RETENTION_DAYS:-14}"

if [ ! -f "$DUMP" ]; then
  echo "ABORT: dump not found: $DUMP" >&2
  exit 1
fi

LOCAL_BYTES="$(wc -c < "$DUMP" | tr -d ' ')"
if [ "${LOCAL_BYTES:-0}" -lt 1 ]; then
  echo "ABORT: dump is empty: $DUMP" >&2
  exit 1
fi

if [ -z "$OFFSITE_MODE" ]; then
  echo "OFFSITE BACKUP NOT LIVE"
  echo "Set OFFSITE_MODE=s3|scp and destination env (see script header)."
  echo "exit=2"
  exit 2
fi

case "$OFFSITE_MODE" in
  s3)
    : "${OFFSITE_S3_BUCKET:?OFFSITE_S3_BUCKET required}"
    if ! command -v aws >/dev/null 2>&1; then
      echo "ABORT: aws CLI required for OFFSITE_MODE=s3" >&2
      exit 1
    fi
    ENDPOINT_ARGS=()
    if [ -n "${OFFSITE_S3_ENDPOINT:-}" ]; then
      ENDPOINT_ARGS+=(--endpoint-url "$OFFSITE_S3_ENDPOINT")
    fi
    KEY="db/$(basename "$DUMP")"
    aws s3 cp "$DUMP" "s3://${OFFSITE_S3_BUCKET}/${KEY}" "${ENDPOINT_ARGS[@]}"
    if [ -f "${DUMP}.sha256" ]; then
      aws s3 cp "${DUMP}.sha256" "s3://${OFFSITE_S3_BUCKET}/${KEY}.sha256" "${ENDPOINT_ARGS[@]}"
    fi
    if [ -n "$MEDIA_ARCHIVE" ] && [ -f "$MEDIA_ARCHIVE" ]; then
      aws s3 cp "$MEDIA_ARCHIVE" "s3://${OFFSITE_S3_BUCKET}/media/$(basename "$MEDIA_ARCHIVE")" "${ENDPOINT_ARGS[@]}"
    fi

    # Verify remote object (authenticated metadata) — do not trust upload exit alone.
    HEAD_JSON="$(aws s3api head-object --bucket "$OFFSITE_S3_BUCKET" --key "$KEY" "${ENDPOINT_ARGS[@]}" --output json)"
    REMOTE_BYTES="$(printf '%s' "$HEAD_JSON" | sed -n 's/.*"ContentLength"[ ]*:[ ]*\([0-9][0-9]*\).*/\1/p' | head -n1)"
    if [ -z "${REMOTE_BYTES:-}" ] || [ "$REMOTE_BYTES" -lt 1 ]; then
      echo "ABORT: remote object missing or empty after upload: s3://${OFFSITE_S3_BUCKET}/${KEY}" >&2
      exit 1
    fi
    echo "OFFSITE VERIFY OK key=$KEY remoteBytes=$REMOTE_BYTES localBytes=$LOCAL_BYTES retentionDays=$OFFSITE_RETENTION_DAYS"
    echo "NOTE: Configure S3 lifecycle expire for prefixes db/ and media/ at ${OFFSITE_RETENTION_DAYS}d (bucket must stay private)."
    ;;
  scp)
    : "${OFFSITE_SCP_TARGET:?OFFSITE_SCP_TARGET required e.g. user@host:/path/}"
    scp "$DUMP" "$OFFSITE_SCP_TARGET"
    if [ -f "${DUMP}.sha256" ]; then
      scp "${DUMP}.sha256" "$OFFSITE_SCP_TARGET"
    fi
    if [ -n "$MEDIA_ARCHIVE" ] && [ -f "$MEDIA_ARCHIVE" ]; then
      scp "$MEDIA_ARCHIVE" "$OFFSITE_SCP_TARGET"
    fi
    echo "OFFSITE COPY OK mode=scp dump=$(basename "$DUMP") localBytes=$LOCAL_BYTES"
    echo "NOTE: Verify remote file size on destination host; set remote retention=${OFFSITE_RETENTION_DAYS}d."
    ;;
  *)
    echo "ABORT: unknown OFFSITE_MODE=$OFFSITE_MODE (use s3|scp)" >&2
    exit 1
    ;;
esac

echo "OFFSITE COPY OK mode=$OFFSITE_MODE dump=$(basename "$DUMP")"
echo "exit=0"
