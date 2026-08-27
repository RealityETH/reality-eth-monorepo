# reality.eth Ponder Indexer

Indexes reality.eth oracle events across multiple chains and serves a GraphQL API consumed by the browse and question pages.

## Architecture

Three processes share a single PostgreSQL database:

| Process | Command | Role |
|---|---|---|
| **sync.js** | `node ../indexer/sync.js` | Fetches events via `eth_getLogs`, decodes them, writes to `reality.*` in PostgreSQL |
| **serve.js** | `node ../indexer/serve.js` | HTTP server (port 42070) serving the GraphQL API from `reality.*` — no indexing |
| **log-watcher.js** | `node ../indexer/log-watcher.js` | Watches nginx access logs, promotes chains from lazy→active sync on real traffic |

`sync.js` replaced Ponder's own indexer because Ponder is too slow for historical catch-up on large chains (mainnet v2.0 history goes back to block 6.5M in 2019). `serve.js` replaced `ponder serve` so that the GraphQL API reads from the `reality.*` tables that `sync.js` maintains, rather than Ponder's internal `public.{hash}__*` tables. `serve.js` borrows Ponder's GraphQL schema builder and middleware from `node_modules/@ponder/core` — no extra dependencies.

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
| BNB Smart Chain | 56 | v2.1, v3.0, ERC20 (DEXE) |
| Avalanche | 43114 | v3.0 |
| Celo | 42220 | v3.0 |
| Sepolia | 11155111 | v3.0, v3.2, ERC20 (BOND) |

Avalanche and Celo are indexed by `sync.js` but **not** covered by `ponder.config.ts`. If you switch to running Ponder as the sole indexer those two chains will go dark.

## Lazy / active sync modes

Chains default to **lazy** mode: sync every 6 hours using the block explorer sparse index (only blocks known to have events are fetched, avoiding wide empty `eth_getLogs` ranges). Mainnet and Gnosis are always **active** (poll every 30 s).

The log-watcher promotes any chain to active for two hours after detecting real traffic to `/graphql/{chain_id}` in the nginx access log. This is configured in `packages/indexer/watcher-config.json`.

## Sparse block index

`packages/ponder/scripts/fetch-event-blocks.js` queries block explorer APIs (Etherscan, Blockscout, etc.) to build `known-event-blocks.json` — a compact list of every block that has a reality.eth event. `sync.js` uses this below the high-water mark to fetch only those specific blocks instead of scanning full ranges.

The index is refreshed automatically before each daily lazy sync and on each lazy→active transition.

## Running native Ponder as the sole indexer

If you want to run standard Ponder instead of sync.js (e.g. to avoid the custom indexer):

1. All chains except Avalanche and Celo are covered by `ponder.config.ts`.
2. Run `npm run start` (indexes into `public.{hash}__*`) and `npm run serve` (GraphQL server on port 42070).
3. Historical catch-up from a cold database will be significantly slower than sync.js for mainnet.
4. Use `reality-eth-ponder.service` for the serve process — do **not** enable `reality-eth-serve.service` at the same time.

## Prerequisites

- Node.js 18+

No database setup is required. Ponder uses an embedded [PGlite](https://pglite.dev/) database by default. PostgreSQL is optional — use it if you need higher performance or external access to the data.

## Setup

```bash
# 1. Install dependencies (--install-links copies file: deps instead of symlinking)
npm install --install-links

# 2. Copy and fill in .env.local
cp .env.example .env.local   # set RPC URLs; DATABASE_URL is optional (see below)

# 3. Initialise the database schema
psql "$DATABASE_URL" -f ../indexer/schema.sql

# 4. Seed known question data (optional but speeds up first sync)
node ../indexer/seed.js <chain_id>
```

Then start `sync.js`, `serve.js`, and `log-watcher.js` from `packages/indexer/` — see `packages/indexer/SETUP.md`.

For systemd, install and enable the three service files from `packages/indexer/`:

```bash
sudo cp ../indexer/reality-eth-{indexer,serve,watcher}.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now reality-eth-indexer reality-eth-serve reality-eth-watcher
```

## Environment variables

Set in `.env.local` (shared by Ponder and sync.js):

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string — optional; omit to use embedded PGlite |
| `PONDER_RPC_URL_{chainId}` | Narrow (Alchemy) RPC — used for `eth_blockNumber` and per-block fetches. If unset for a configured chain, Ponder v0.17 warns and silently falls back to a public thirdweb endpoint rather than erroring. |
| `PONDER_RPC_URL_{chainId}_WIDE` | Wide (Infura) RPC — used for `eth_getLogs` range queries |
| `PONDER_RPC_URL_{chainId}_LOCAL` | Local node URL (tried first; falls back to Alchemy on network errors) |
| `PONDER_RPC_MAX_RPS_{chainId}` | Optional RPC rate cap for specific chains |
| `PONDER_DISABLE` | Comma-separated chain names to exclude from Ponder (e.g. `polygon,unichain`) |
| `ETHERSCAN_API_KEY` | For `fetch-event-blocks.js` block explorer queries |
| `INFURA_API_KEY` | Used in wide RPC URLs |
| `SPARSE_DELAY_{chainId}` | ms delay between per-block sparse fetches (throttle slow/rate-limited endpoints) |
| `BATCH_DELAY_{chainId}` | ms delay between `eth_getLogs` range batches |

## Ponder binary patch

`scripts/patch-ponder-ui.js` patches `node_modules/@ponder/core/dist/bin/ponder.js` to make `createUi()` a no-op when `--log-format json` is used. Without this, Ponder renders a live Ink table to stdout even in JSON log mode, corrupting the log stream. The patch is applied automatically on `npm install` and is safe to re-run.
