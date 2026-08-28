#!/bin/bash
# Send a Telegram notification, with optional per-key cooldown to suppress repeats.
# Usage: notify.sh "message" [cooldown_key] [cooldown_seconds]
#
# If cooldown_key is given, the message is suppressed if one was already sent
# with that key within cooldown_seconds (default 3600).

set -euo pipefail

SECRETS=/srv/rcdev/reality-eth-design/packages/indexer/monitoring/.telegram.env
STATE_DIR=/var/lib/reality-eth

source "$SECRETS"

MESSAGE="$1"
COOLDOWN_KEY="${2:-}"
COOLDOWN_SECS="${3:-3600}"

if [ -n "$COOLDOWN_KEY" ]; then
  STATE_FILE="$STATE_DIR/cooldown-${COOLDOWN_KEY}"
  if [ -f "$STATE_FILE" ]; then
    LAST=$(cat "$STATE_FILE")
    NOW=$(date +%s)
    if [ $(( NOW - LAST )) -lt "$COOLDOWN_SECS" ]; then
      exit 0
    fi
  fi
  date +%s > "$STATE_FILE"
fi

curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage" \
  -d "chat_id=${TELEGRAM_CHAT_ID}" \
  --data-urlencode "text=${MESSAGE}" \
  > /dev/null
