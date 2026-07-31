# reality.eth Ponder Indexer

Indexes reality.eth oracle events across multiple chains and serves a GraphQL API consumed by the browse and question pages.

## Architecture

Three processes share a single PostgreSQL database:

| Process | Command | Role |
|---|---|---|
| **sync.js** | `node ../indexer/sync.js` | Fetches events via `eth_getLogs`, decodes them, writes to PostgreSQL |
| **log-watcher.js** | `node ../indexer/log-watcher.js` | Watches nginx access logs, promotes chains from lazy→active sync on real traffic |
| **Ponder (serve)** | `npm run serve` | HTTP server (port 42070) serving the GraphQL API from PostgreSQL — no indexing |

`sync.js` replaced Ponder's own indexer because Ponder is too slow for historical catch-up on large chains (mainnet v2.0 history goes back to block 6.5M in 2019). Ponder is kept purely for its GraphQL server; its event handlers in `src/index.ts` are not used for live indexing.

See `packages/indexer/SETUP.md` for full setup instructions.

## Chains indexed

| Chain | Chain ID | Contracts |
|---|---|---|
| Mainnet | 1 | v2.0, v3.0, v3.2, ERC20 (TRST/GNO/FOX/SWISE) |
| Gnosis | 100 | v2.1, v3.0, v3.2, ERC20 (GNO/SWISE/POLK) |
| Polygon | 137 | v2.1, v3.0, ERC20 (POLK) |
| Arbitrum | 42161 | v2.1, v3.0 |
| Optimism | 10 | v3.0 |
| Base | 8453 | v3.0 |
| Unichain | 130 | v3.0 |
| Avalanche | 43114 | v3.0 |
| Celo | 42220 | v3.0 |
| Sepolia | 11155111 | v3.0, v3.2, ERC20 (BOND) |

Avalanche and Celo are indexed by `sync.js` but **not** covered by `ponder.config.ts`. If you switch to running Ponder as the sole indexer those two chains will go dark.

## Lazy / active sync modes

Chains default to **lazy** mode: sync once a day using the block explorer sparse index (only blocks known to have events are fetched, avoiding wide empty `eth_getLogs` ranges). Mainnet and Gnosis are always **active** (poll every 30 s).

The log-watcher promotes any chain to active for two hours after detecting real traffic to `/graphql/{chain_id}` in the nginx access log. This is configured in `packages/indexer/watcher-config.json`.

## Sparse block index

`packages/ponder/scripts/fetch-event-blocks.js` queries block explorer APIs (Etherscan, Blockscout, etc.) to build `known-event-blocks.json` — a compact list of every block that has a reality.eth event. `sync.js` uses this below the high-water mark to fetch only those specific blocks instead of scanning full ranges.

The index is refreshed automatically before each daily lazy sync and on each lazy→active transition.

## Running Ponder as the sole indexer

If you want to run standard Ponder instead of sync.js (e.g. to avoid running the custom indexer):

1. All eight chains except Avalanche and Celo are covered by `ponder.config.ts`.
2. Uncomment the Celo/Avalanche entries in `ponder.config.ts` if you add Infura/Alchemy support for them.
3. Run `npm run start` (indexer) and `npm run serve` (GraphQL server) instead of the three-process setup above.
4. Historical catch-up from a cold database will be significantly slower than sync.js for mainnet.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in .env.local
cp .env.example .env.local   # set DATABASE_URL and RPC URLs

# 3. Initialise the database schema
psql "$DATABASE_URL" -f ../indexer/schema.sql

# 4. Seed known question data (optional but speeds up first sync)
node ../indexer/seed.js <chain_id>

# 5. Start Ponder (GraphQL server only)
npm run serve
```

Then start `sync.js` and `log-watcher.js` from `packages/indexer/` — see `packages/indexer/SETUP.md`.

## Environment variables

Set in `.env.local` (shared by Ponder and sync.js):

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `PONDER_RPC_URL_{chainId}` | Narrow (Alchemy) RPC — used for `eth_blockNumber` and per-block fetches |
| `PONDER_RPC_URL_{chainId}_WIDE` | Wide (Infura) RPC — used for `eth_getLogs` range queries |
| `PONDER_RPC_MAX_RPS_{chainId}` | Optional RPC rate cap for specific chains |
| `PONDER_DISABLE` | Comma-separated chain names to exclude from Ponder (e.g. `polygon,unichain`) |
| `ETHERSCAN_API_KEY` | For `fetch-event-blocks.js` block explorer queries |
| `INFURA_API_KEY` | Used in wide RPC URLs |

## Ponder binary patch

`scripts/patch-ponder-ui.js` patches `node_modules/@ponder/core/dist/bin/ponder.js` to make `createUi()` a no-op when `--log-format json` is used. Without this, Ponder renders a live Ink table to stdout even in JSON log mode, corrupting the log stream. The patch is applied automatically on `npm install` and is safe to re-run.
