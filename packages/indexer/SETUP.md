# Indexer setup

The custom indexer replaces Ponder's built-in event-fetching with a faster, chain-aware sync process. It consists of two Node.js scripts (`sync.js` and `log-watcher.js`) that write to the same PostgreSQL database Ponder reads from.

See `packages/ponder/README.md` for a high-level architecture overview.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (same instance used by Ponder)
- RPC URLs for each chain set in `packages/ponder/.env.local`
- nginx proxying `/graphql` to Ponder's HTTP server (port 42070)

## 1. Database schema

If starting from a fresh database, apply the schema:

```bash
psql "$DATABASE_URL" -f schema.sql
```

`schema.sql` creates the `reality` schema with tables for questions, responses, templates, claims, and sync state. It is safe to run on an existing database (all statements use `CREATE TABLE IF NOT EXISTS`).

## 2. Seed initial data (optional)

The seed script pre-populates the sparse block index from block explorer APIs before the first sync. This avoids expensive full-range `eth_getLogs` scans on first run.

```bash
node seed.js <chain_id>
# e.g. node seed.js 137   (polygon)
```

You can also run `fetch-event-blocks.js` directly for any chain:

```bash
node ../ponder/scripts/fetch-event-blocks.js polygon
```

## 3. Start the indexer

```bash
node sync.js
```

`sync.js` reads RPC URLs from `packages/ponder/.env.local`, writes a PID file at `sync.pid`, and starts syncing all configured chains. On startup it refreshes the sparse block index for every currently-active chain before syncing.

Relevant environment variables (set in `.env.local`):

| Variable | Default | Description |
|---|---|---|
| `POLL_MS` | 30000 | How often (ms) active chains are polled |
| `LAZY_INTERVAL_MS` | 21600000 | How often (ms) lazy chains are synced (default 6 h) |
| `BATCH_SIZE_{chainId}` | per-chain default | Override `eth_getLogs` range size for a specific chain |
| `PONDER_RPC_URL_{chainId}_LOCAL` | — | Local node URL tried first; fallback on network errors only |
| `SPARSE_DELAY_{chainId}` | 0 | ms delay between per-block sparse fetches (throttle slow endpoints) |
| `BATCH_DELAY_{chainId}` | 0 | ms delay between `eth_getLogs` range batches |
| `LOCAL_TIMEOUT_MS` | 120000 | Abort timeout for localhost RPC requests (handles HDD stalls) |

## 4. Start the log watcher

```bash
node log-watcher.js
```

The log watcher tails the nginx access log, detects which chain IDs are being queried, and writes `sync-config.json` when a chain's mode should change. It then sends `SIGHUP` to `sync.js` so it reloads config without restarting.

### watcher-config.json

```json
{
  "log_path": "/path/to/logs/graphql-access.log",
  "always_active_chains": [1, 100],
  "active_duration_hours": 2,
  "min_requests_to_activate": 1,
  "min_distinct_ips": 1,
  "window_minutes": 60
}
```

| Field | Description |
|---|---|
| `always_active_chains` | Chain IDs that are always in active mode (mainnet, Gnosis) |
| `active_duration_hours` | How long a chain stays active after the last qualifying request |
| `min_requests_to_activate` | Minimum requests in the window before a chain is promoted to active |
| `min_distinct_ips` | Minimum distinct source IPs (helps filter automated/griefing traffic) |
| `window_minutes` | Sliding window for the request count and IP checks |

### sync-config.json

Written at runtime by `log-watcher.js`. Do not edit by hand while the watcher is running. It is gitignored. Example:

```json
{
  "chains": {
    "1":   { "mode": "active" },
    "100": { "mode": "active" },
    "137": { "mode": "active", "active_until": 1783771098182 }
  }
}
```

Chains not listed default to lazy mode. `active_until` is a millisecond timestamp; the watcher uses it to revert chains to lazy on expiry, and `sync.js` ignores it (mode is what matters).

## 5. nginx config

The nginx location block must:

1. Strip the optional chain-ID suffix before proxying (Ponder only listens on `/graphql`)
2. Write to a dedicated access log the watcher can read

```nginx
location ~ ^/graphql(?:/([\d,]+))?$ {
    rewrite ^/graphql(?:/[\d,]+)?$ /graphql break;
    proxy_pass http://127.0.0.1:42070;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    access_log /srv/rcdev/reality-eth-design/packages/indexer/logs/graphql-access.log;
}
```

The chain IDs in URLs like `/graphql/1,100` are extracted by the log watcher from this log. The rewrite strips them before they reach Ponder.

### Log file permissions

nginx writes as `www-data`. The log-watcher reads as the indexer user (`rcdev`). Set up permissions once:

```bash
sudo chown www-data:rcdev /srv/rcdev/reality-eth-design/packages/indexer/logs
sudo chmod 750 /srv/rcdev/reality-eth-design/packages/indexer/logs
sudo touch /srv/rcdev/reality-eth-design/packages/indexer/logs/graphql-access.log
sudo chown www-data:rcdev /srv/rcdev/reality-eth-design/packages/indexer/logs/graphql-access.log
sudo chmod 640 /srv/rcdev/reality-eth-design/packages/indexer/logs/graphql-access.log
```

Replace `rcdev` with the actual indexer user. The log is outside `/var/log/nginx/` so it is not subject to nginx's logrotate stanza.

## Systemd

Both processes should be managed by systemd. Use `packages/ponder/reality-eth-ponder.service` as a template. Key points:

- Both scripts read `packages/ponder/.env.local` at startup (dotenv).
- `sync.js` must start before `log-watcher.js` (the watcher needs `sync.pid` to signal it).
- `sync.js` handles `SIGHUP` gracefully (reloads `sync-config.json`); `SIGTERM` causes a clean exit.

## Sparse block index

`known-event-blocks.json` and `known-event-blocks-meta.json` (in `packages/ponder/`) list every block that has a reality.eth event per chain, plus a high-water mark per contract. `sync.js` uses these below the HWM to fetch only the specific blocks that had events, instead of scanning full 5000-block ranges.

The index is refreshed automatically:
- Before each 6 h lazy sync
- On each lazy→active transition (so catch-up after activation only hits real event blocks)
- On startup for every currently-active chain

To rebuild the index manually for a chain:

```bash
node ../ponder/scripts/fetch-event-blocks.js <chain_name>
# e.g. node ../ponder/scripts/fetch-event-blocks.js polygon
```

This queries block explorer APIs (Etherscan, Blockscout, etc.) and requires `ETHERSCAN_API_KEY` to be set in `.env.local`.

**BNB exception:** BscScan no longer offers a free API key, so `fetch-event-blocks.js` is skipped for `bnb`. The sparse index was seeded manually from CSV exports downloaded from BscScan in a browser. For future re-seeding, export transaction history CSVs for each contract and run:

```bash
awk -F',' 'FNR>1{gsub(/"/, "", $4); print $4}' *.csv | sort -nu > bsc_blocks.txt
```

Then add the blocks to `known-event-blocks.json` / `known-event-blocks-meta.json` by hand or via a one-off script.

## One-shot mode

To sync specific chains and exit (without starting the daemon or writing a PID file):

```bash
node sync.js <chain> [<chain2> ...]
# e.g. node sync.js sepolia mainnet
```

To refresh the sparse index first, then sync (recommended when a chain's HWM is far behind the current tip):

```bash
node sync.js --refresh <chain> [<chain2> ...]
# e.g. node sync.js --refresh arbitrum optimism
```

Without `--refresh`, everything above the stored HWM is scanned in full `eth_getLogs` ranges. With `--refresh`, the HWM is advanced to the current tip via the block explorer API first, so only the short tail needs range scanning.
