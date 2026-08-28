# reality.eth — developer notes for Claude

## Repo layout

Lerna monorepo. The packages most likely to be edited:

| Package | What it is |
|---|---|
| `packages/website` | The main dapp UI — a static single-page app served from `webroot/` |
| `packages/contracts` | Solidity contracts and ABI files consumed by the UI |
| `packages/indexer` | Custom off-chain indexer — the one actually running in production |
| `packages/ponder` | Ponder-based indexer — not run in production; kept for self-hosters |
| `packages/reality-eth-lib` | Shared JS library (answer encoding, formatting, etc.) |

## Website package

The UI is a plain HTML/JS/CSS single-page app — no build step, no bundler. Files are served directly from `packages/website/webroot/`. The entry point is `index.html`, which route-detects in a synchronous inline script and lazily loads per-view JS modules (all `defer`).

Key JS files:

- `wallet.js` — shared wallet layer; supports injected wallets (MetaMask, Rabby) and WalletConnect v2. Exposes `window.RealityWallet`.
- `question.js` — question detail page
- `ask-view.js` — ask-a-question flow
- `template-view.js` — create/edit template flow
- `walletconnect.js` — prebuilt WC v2 IIFE bundle (do not edit directly)

Cache-busting: `index.html` has `var V = '?v=N'` (inline, early) and `const V = '?v=N'` (deferred) that are appended to script `src` URLs. `wallet.js` has its own separate `?v=N`. Bump all affected version strings after any JS edit.

The WC bundle (`walletconnect.js`) is loaded lazily — only when `reality-eth-wc-session` is present in `localStorage` (written only after the user explicitly chooses WalletConnect). Never load it proactively.

## Running the tests

The primary test suite is in `packages/website/tests/`:

```
cd packages/website/tests
npx playwright test
```

117 tests, runs in ~1 minute. Uses Playwright with a real Gnosis-chain Anvil fork (port 18545) and a lightweight static file server (port 8083). Tests run serially (1 worker) because they mutate on-chain state via `evm_snapshot`/`evm_revert`.

There is a separate older suite in `packages/dapp/tests/` (88 tests). It is not the active suite for current website work.

## Contracts package

After editing `chains/supported.json` or `contracts.json`, regenerate all derived files:

```bash
cd packages/contracts && npm run generate
```

To also push the updated `website-data.js` into the website webroot (required for chain/contract changes to show in the UI):

```bash
node scripts/generate_website_data.js --install
```

Then bump `website-data.js?v=N` in `index.html`.

## Custom indexer (packages/indexer)

Key files:

- `sync.js` — main process; polls chains via `eth_getLogs`, writes to PostgreSQL
- `active-chains.json` — auto-generated chain list (run `npm run generate` in packages/contracts to update)
- `scripts/chains-config.json` — auto-generated block explorer config for fetch-event-blocks.js
- `sync-config.json` — runtime chain modes (`active` polls every 30s, `lazy` polls hourly); reloaded on SIGHUP
- `.env.local` — RPC URLs and DB connection; uses `PONDER_RPC_URL_{chainId}` naming convention
- `known-event-blocks.json` / `known-event-blocks-meta.json` — sparse block index; do not delete
- `scripts/fetch-event-blocks.js` — refreshes sparse index from block explorers

To reload `sync-config.json` without restarting:

```bash
kill -HUP $(cat packages/indexer/sync.pid)
```

## Old dapp (packages/dapp and packages/template-generator)

These are the old webpack-based apps maintained at old.reality.eth. They require a build step before deployment.

Build:
```bash
tools/rebuild.sh
# (template-generator uses react-scripts which needs --openssl-legacy-provider on Node 23+)
```

Deploy (old version IPFS):
```bash
tools/ipfs_build_old.sh   # packages website + dapp/build + template-generator/build
tools/pin_ipfs_old.sh     # upload to Filebase
```

The dapp test suite is in `packages/dapp/tests/` (88 tests, older Playwright setup). Non-obvious implementation details are in `packages/dapp/DAPP_REBUILD_NOTES.md`.

## Infrastructure

The dev environment runs persistent local Ethereum nodes on ports 8545 (mainnet) and 8546 (Sepolia). Do not attempt to bind anything to those ports.

The website tests and the Anvil fork they start use port 18545.
