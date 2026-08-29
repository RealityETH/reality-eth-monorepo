# Running your own indexer

The browse page is backed by a GraphQL API that queries an indexed copy of all reality.eth events. Other pages also use the indexer but will fall back on your RPC node if the indexer is unavailable. The question display page will also check the data it gets from the indexer against the local RPC node.

By default the indexer uses a public instance run by reality.eth, but you can also run your own indexing whichever chains you care about.

## How it works

`packages/ponder` uses [Ponder](https://ponder.sh/) to fetch events from the chain and serve a GraphQL API directly on port 42069, so no separate server process is needed.

## Prerequisites

- **Node.js 22+**
- **An RPC URL** for each chain you want to index — a provider with archive access is required for historical sync (Alchemy, Infura, QuickNode, etc.). Public RPCs will work but may rate-limit. Gnosis Chain's public RPC (`https://rpc.gnosischain.com`) is an exception and works fine.

No database setup is needed. Ponder uses an embedded [PGlite](https://pglite.dev/) database by default, stored in `.ponder/`. If you need higher performance or want to store data externally, you can point it at a PostgreSQL instance instead — see [Configure](#configure) below.

## Install

```bash
git clone https://github.com/RealityETH/reality-eth-monorepo.git
cd reality-eth-monorepo/packages/ponder
npm install --install-links
```

## Configure

Create `packages/ponder/.env.local` and set the RPC URL for each chain you want. **Only set the chains you care about** — contracts for unconfigured chains are not indexed.

```bash
# packages/ponder/.env.local

# Required — Ponder uses this as the schema name in its embedded database.
# Any name works; the schema is created automatically.
DATABASE_SCHEMA=ponder

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

**Note:** if a chain's RPC URL is unset, Ponder v0.17 does not error — it logs a warning and silently falls back to a public endpoint (thirdweb). If you need to guarantee that no third-party RPC calls are made, verify that every chain you care about has an explicit URL set.

If you only want one chain, just set that chain's RPC URL and leave the rest blank.

### Optional: PostgreSQL

To use PostgreSQL instead of the embedded database, add `DATABASE_URL`:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/reality_eth
```

PostgreSQL is worth using if you're running on a machine where disk I/O is a bottleneck, or if you want the indexed data accessible to other tools.

## Sync and serve

Run Ponder in the foreground. It will sync historical events and then keep up with new blocks, while serving the GraphQL API:

```bash
npm start
```

First-time sync time varies by chain. Sepolia takes around 15 minutes against a local node. Gnosis Chain and mainnet have longer histories and will take longer.

If you see bursts of `WARN Unable to find available JSON-RPC provider within expected time` during backfill, Ponder is briefly outpacing your node's request capacity — it self-recovers, but you can throttle it by adding `PONDER_RPC_MAX_RPS_<chainId>=25` (or lower) to `.env.local`.

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

If your indexer is on a remote server, or if you are accessing the website over HTTPS (e.g. from `reality.gwei.site`), you need an HTTPS endpoint — browsers block HTTP requests from HTTPS pages. See [HTTPS with Caddy](#https-with-caddy) below.

To reset to the public indexer, clear the field and save.

## Production setup

For a server deployment, run `ponder start` as a systemd service. A minimal unit file:

```ini
[Unit]
Description=Reality.eth Ponder indexer
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/reality-eth-monorepo/packages/ponder
# Set PATH to include the directory containing your node binary.
# Run `dirname $(which node)` to find it — essential if you installed Node
# via nvm or fnm, where /usr/bin/node won't exist.
Environment=PATH=/usr/local/bin:/usr/bin:/bin
EnvironmentFile=/path/to/reality-eth-monorepo/packages/ponder/.env.local
ExecStart=node node_modules/.bin/ponder start --log-format json
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

## HTTPS with Caddy

If you're loading the website locally over IPFS, for example accessing `reality.gwei` or `reality.eth` in [Freedom Browser](https://freedombrowser.eth.limo/), you can connect directly to your indexer over http. However, if you're using a gateway like `reality.gwei.site` or `reality.eth.link` you will be using https, and your browser will insist that the indexer also use https. 

To serve the indexer over https you can use [Caddy](https://caddyserver.com). Caddy provisions a Let's Encrypt certificate automatically; no manual cert setup needed.

A `Caddyfile` template is included at `packages/ponder/Caddyfile`. Edit it to replace `your.domain.com` with your domain, then:

```bash
caddy start --config /path/to/reality-eth-monorepo/packages/ponder/Caddyfile
```

Once running, enter `https://your.domain.com/graphql` as the GraphQL URL in the website.

The template also has two commented-out lines (`root` and `file_server`). Uncomment them if you want Caddy to serve the reality.eth website itself from this host, instead of using the public hosted version.
