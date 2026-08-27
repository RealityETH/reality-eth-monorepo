# Running your own indexer

The browse page is backed by a GraphQL API that queries an indexed copy of all reality.eth events. By default it uses the public instance at reality.eth, but you can run your own — useful if you want to self-host, index only the chains you care about, or guarantee availability for your own app.

## How it works

`packages/ponder` uses [Ponder](https://ponder.sh/) to fetch events from the chain and write them to PostgreSQL. Ponder also serves a GraphQL API directly on port 42069, so no separate server process is needed.

## Prerequisites

- **Node.js 20+**
- **PostgreSQL 14+** — any local or remote instance works
- **An RPC URL** for each chain you want to index — a provider with archive access is required for historical sync (Alchemy, Infura, QuickNode, etc.). Public RPCs will work but may rate-limit. Gnosis Chain's public RPC (`https://rpc.gnosischain.com`) is an exception and works fine.

## Install

```bash
git clone https://github.com/RealityETH/reality-eth-monorepo.git
cd reality-eth-monorepo/packages/ponder
npm install --install-links
```

## Configure

Create `packages/ponder/.env.local`. Set `DATABASE_URL`, `DATABASE_SCHEMA`, and the RPC URL for each chain you want. **Only set the chains you care about** — contracts for unconfigured chains are not indexed.

```bash
# packages/ponder/.env.local

DATABASE_URL=postgresql://user:password@localhost:5432/reality_eth
DATABASE_SCHEMA=ponder_sepolia   # Choose any schema name; Ponder creates it automatically

# Pick one or more chains (identified by chain ID):

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

# BNB Chain
PONDER_RPC_URL_56=https://bsc-dataseed.binance.org

# Unichain
PONDER_RPC_URL_130=https://mainnet.unichain.org

# Sepolia testnet
PONDER_RPC_URL_11155111=https://rpc.sepolia.org
```

If you only want one chain, just set that chain's RPC URL and leave the rest blank.

## Sync and serve

Run Ponder in the foreground. It will sync historical events and then keep up with new blocks, while serving the GraphQL API:

```bash
npm start
```

First-time sync time varies by chain. Sepolia takes around 15 minutes against a local node. Gnosis Chain and mainnet have longer histories and will take longer.

You can verify the API is working:

```bash
curl -s -X POST http://localhost:42069/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ questions(limit:1) { items { id title } } }"}' | head -c 200
```

## Point the website at your indexer

Click the **Ponder hexagon** (⬡) icon in the top-right of the browse page. In the panel that appears, enter your GraphQL URL:

```
http://localhost:42069/graphql
```

If your indexer is on a remote server, replace `localhost` with its address and make sure port 42069 is reachable, or proxy it via nginx. Save and reload — the browse page will now query your instance.

To reset to the public indexer, clear the field and save.

## Production setup

For a server deployment, run `ponder start` as a systemd service. A minimal unit file:

```ini
[Unit]
Description=Reality.eth Ponder indexer
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/reality-eth-monorepo/packages/ponder
EnvironmentFile=/path/to/reality-eth-monorepo/packages/ponder/.env.local
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Proxy the GraphQL port via nginx if you want it accessible over HTTPS:

```nginx
location /graphql {
    proxy_pass http://localhost:42069/graphql;
    proxy_set_header Host $host;
}
```
