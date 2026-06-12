# reality.eth Ponder Indexer

Indexes reality.eth oracle events across mainnet, Gnosis, and Sepolia using [Ponder](https://ponder.sh). Serves a GraphQL API consumed by the browse and question pages.

## Architecture

Two processes share a PostgreSQL database:

- **`npm run start`** — indexer + optional HTTP server (port 42069). Polls RPC endpoints, processes events, writes to PostgreSQL.
- **`npm run serve`** — HTTP server only (port 42070), no indexer. Reads from the same PostgreSQL database. Run this behind your reverse proxy for query traffic.

Separating the processes lets indexing and query serving use different CPU cores.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Setup

### 1. PostgreSQL

```bash
sudo apt install postgresql
sudo -u postgres createuser ponder
sudo -u postgres createdb ponder -O ponder
sudo -u postgres psql -c "ALTER USER ponder WITH PASSWORD 'your-password-here';"
```

### 2. Environment

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

At minimum, set `DATABASE_URL`:

```
DATABASE_URL=postgresql://ponder:your-password-here@localhost/ponder
```

RPC URL variables (`PONDER_RPC_URL_1`, `PONDER_RPC_URL_100`, etc.) are optional — public endpoints are configured as defaults, but a private RPC for mainnet is strongly recommended to avoid rate limits during the initial sync.

### 3. Install dependencies

```bash
npm install
```

The `postinstall` script patches the Ponder binary to suppress its Ink live-table UI when `--log-format json` is used.

## Running

### Development (hot reload)

```bash
npm run dev
```

### Production

Run both processes, each in its own terminal or systemd unit:

```bash
# Terminal 1 — indexer
npm run start

# Terminal 2 — HTTP server (point reverse proxy here)
npm run serve
```

## Initial sync

On first run against a fresh PostgreSQL database, Ponder replays events from its local sync-store cache (`.ponder/` directory — raw RPC events fetched previously). This takes minutes, not hours, and requires no RPC traffic. If the sync-store cache is also absent, Ponder fetches events from the configured RPC endpoints — expect several hours for mainnet due to the v2.0 history starting at block ~6.5M (2019).

## Chains indexed

| Chain    | Chain ID | Contracts                              |
|----------|----------|----------------------------------------|
| Mainnet  | 1        | v2.0, v3.0, v3.2, ERC20 variants      |
| Gnosis   | 100      | v2.1, v3.0, v3.2, ERC20 variants      |
| Sepolia  | 11155111 | v3.0, v3.2, ERC20 (BOND token)        |

Arbitrum, Optimism, Base, Celo, and Avalanche are configured but commented out. Base requires a private RPC (public endpoints return inconsistent log data). The fast-block chains (Arbitrum, Celo, Avalanche) cause high CPU load during sync.

## Ponder binary patch

`scripts/patch-ponder-ui.js` patches `node_modules/@ponder/core/dist/bin/ponder.js` to make `createUi()` a no-op when `--log-format json` is active. Without this, Ponder renders a live Ink table to stdout even in JSON log mode, corrupting the log stream. The patch is applied automatically on `npm install` via the `postinstall` hook and is safe to re-run (idempotent).
