#!/bin/bash
# Periodic health check for reality.eth services.
# Sends Telegram alerts on first failure, stays silent on repeat failures,
# sends recovery alert when condition clears.
# Run every 5 minutes via reality-eth-healthcheck.timer.

set -euo pipefail

NOTIFY=/srv/rcdev/reality-eth-design/packages/indexer/monitoring/notify.sh
STATE_DIR=/var/lib/reality-eth
STALE_THRESHOLD=3600  # seconds — alert if no questions updated within this window

source /srv/rcdev/reality-eth-design/packages/ponder/.env.local

# Edge-detect a condition: send alert on first bad check, recovery on first good check.
# check_edge NAME IS_OK MSG_DOWN MSG_UP
check_edge() {
  local name="$1" ok="$2" msg_down="$3" msg_up="$4"
  local flag="$STATE_DIR/down-${name}"
  if [ "$ok" != "1" ]; then
    if [ ! -f "$flag" ]; then
      touch "$flag"
      "$NOTIFY" "$msg_down"
    fi
  else
    if [ -f "$flag" ]; then
      rm "$flag"
      "$NOTIFY" "$msg_up"
    fi
  fi
}

# ── Check 1: serve.js HTTP health ────────────────────────────────────────────
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:42070/health || echo "000")
if [ "$HTTP_STATUS" = "200" ]; then
  SERVE_OK=1
else
  SERVE_OK=0
fi
check_edge "serve-health" "$SERVE_OK" \
  "reality.eth serve.js is not responding (HTTP ${HTTP_STATUS})" \
  "reality.eth serve.js recovered"

# ── Check 2: indexer staleness ───────────────────────────────────────────────
# If no questions have been updated in STALE_THRESHOLD seconds, the indexer
# is likely stalled or all RPCs are down.
RECENT=$(psql "$DATABASE_URL" -t -c \
  "SELECT COUNT(*) FROM reality.question WHERE updated_timestamp > EXTRACT(EPOCH FROM NOW() - INTERVAL '${STALE_THRESHOLD} seconds')::numeric" \
  2>/dev/null | tr -d ' \n' || echo "0")

if [ "${RECENT:-0}" -gt 0 ] 2>/dev/null; then
  INDEXER_OK=1
else
  INDEXER_OK=0
fi
check_edge "indexer-stale" "$INDEXER_OK" \
  "reality.eth indexer appears stalled: no questions updated in the last hour" \
  "reality.eth indexer recovered: questions are updating again"
