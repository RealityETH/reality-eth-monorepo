# Running your own indexer

The browse page is backed by a GraphQL API that queries an indexed copy of all reality.eth events. By default it uses the public instance at reality.eth, but you can run your own — useful if you want to self-host, index only the chains you care about, or guarantee availability for your own app.

## How it works

Three Node.js scripts run against a shared PostgreSQL database:

| Script | Role |
|---|---|
| `packages/indexer/sync.js` | Fetches events via `eth_getLogs`, decodes them, writes to the database |
| `packages/indexer/serve.js` | HTTP server (port 42070) serving the GraphQL API |
| `packages/indexer/log-watcher.js` | Optional: watches nginx logs to promote chains to active mode when traffic arrives |

`sync.js` can run as a persistent daemon (polling active chains every 30 s, lazy chains every 6 h) or in **one-shot mode**, where it syncs a named chain once and exits. One-shot mode is the simplest starting point.

## Prerequisites

- **Node.js 18+**
- **PostgreSQL 14+** — any local or remote instance works
- **An RPC URL** for each chain you want to index — a provider with archive access is required for historical sync (Alchemy, Infura, QuickNode, etc.). Public RPCs will rate-limit. Gnosis Chain's public RPC (`https://rpc.gnosischain.com`) is an exception and works fine.

## Install

```bash
git clone https://github.com/RealityETH/reality-eth-monorepo.git
cd reality-eth-monorepo

cd packages/ponder && npm install && cd -
cd packages/indexer && npm install && cd -
```

## Configure

Create `packages/ponder/.env.local`. Set `DATABASE_URL` and the RPC URL for each chain you want. **Only set the chains you care about** — chains without an RPC URL are automatically skipped.

```bash
# packages/ponder/.env.local

DATABASE_URL=postgresql://user:password@localhost:5432/reality_eth

# Pick one or more chains:

# Gnosis Chain — Omen prediction markets, Snapshot DAOs
PONDER_RPC_URL_100=https://rpc.gnosischain.com

# Ethereum Mainnet — large history (2019–present), expect a long first sync
PONDER_RPC_URL_1=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY

# Polygon
PONDER_RPC_URL_137=https://polygon-rpc.com

# Arbitrum One
PONDER_RPC_URL_42161=https://arb1.arbitrum.io/rpc

# Optimism
PONDER_RPC_URL_10=https://mainnet.optimism.io

# Base
PONDER_RPC_URL_8453=https://mainnet.base.org

# Sepolia testnet
PONDER_RPC_URL_11155111=https://rpc.sepolia.org
```

Chain names for use in commands: `mainnet`, `gnosis`, `polygon`, `arbitrum`, `optimism`, `base`, `unichain`, `bnb`, `sepolia`.

## Initialize the database

```bash
psql "$DATABASE_URL" -f packages/indexer/schema.sql
```

This is safe to run on an existing database — all statements use `CREATE TABLE IF NOT EXISTS`.

## Sync a chain

### One-shot (recommended for getting started)

Syncs the named chain once and exits:

```bash
cd packages/indexer
node sync.js gnosis
```

To sync multiple chains:

```bash
node sync.js gnosis polygon
```

For a chain far behind tip (e.g. after a gap), refresh the sparse block index first so only real event blocks are scanned:

```bash
node sync.js --refresh gnosis
```

Mainnet's history goes back to 2019. Expect several hours on first sync, less on subsequent runs.

### Daemon mode (keeps up with new blocks)

Running without chain arguments starts the daemon, which polls all chains whose RPC URLs are configured:

```bash
node sync.js
```

Active chains (mainnet and Gnosis by default) are polled every 30 seconds. All others sync every 6 hours. You can make any chain always-active by editing `watcher-config.json` — see `packages/indexer/SETUP.md` for details.

## Start the GraphQL server

In a separate terminal (or after the one-shot sync completes):

```bash
cd packages/indexer
node serve.js
```

This exposes the GraphQL API on `http://localhost:42070`. You can verify it's working:

```bash
curl -s -X POST http://localhost:42070/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ questions(limit:1) { items { id } } }"}' | head -c 200
```

## Point the website at your indexer

Click the **Ponder hexagon** (⬡) icon in the top-right of the browse page. In the panel that appears, enter your GraphQL URL:

```
http://localhost:42070/graphql
```

If your indexer is on a remote server, replace `localhost` with its address and make sure port 42070 is reachable, or proxy it via nginx. Save and reload — the browse page will now query your instance.

To reset to the public indexer, clear the field and save.

## Production setup

For a server deployment with nginx and systemd, see `packages/indexer/SETUP.md` in the monorepo. That document covers:

- nginx config to proxy `/graphql` and write the access log the log-watcher needs
- Three systemd service files (`reality-eth-indexer`, `reality-eth-serve`, `reality-eth-watcher`)
- Log file permissions for multi-user setups
