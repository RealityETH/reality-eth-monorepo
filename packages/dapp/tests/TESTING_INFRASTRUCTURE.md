# Dapp Integration Test Infrastructure

Playwright end-to-end tests for the reality.eth dapp. Each test drives a real browser against a local Gnosis chain fork, with a mocked `window.ethereum` wallet.

## Prerequisites

- **Node.js** — v18 or later
- **Foundry/Anvil** — installed at `~/.foundry/bin/anvil` (v1.7.1 tested). Install with `curl -L https://foundry.paradigm.xyz | bash && foundryup`
- **Chromium** — installed by Playwright. If missing, run `npx playwright install chromium` from the `tests/` directory
- **npm dependencies** — run `npm install` in both `packages/dapp/` and `packages/dapp/tests/`

## Running the tests

All commands are run from `packages/dapp/tests/`:

```bash
cd /srv/rcdev/reality-eth-design/packages/dapp/tests

# Run the full suite (6 tests, ~40 seconds)
npm test

# Equivalent explicit form
npx playwright test

# Run a single test file
npx playwright test claim.test.js
npx playwright test commit-reveal.test.js
npx playwright test submit-answer.test.js

# Interactive UI mode (useful for debugging)
npm run test:ui
```

> **Important**: do NOT run `npx playwright test` from `packages/dapp/` — the wrong version of Playwright is picked up. Always run from `packages/dapp/tests/`.

## What the tests cover

| File | Tests |
|---|---|
| `claim.test.js` | Calldata for `claimMultipleAndWithdrawBalance`; ETH balance increases after claim |
| `commit-reveal.test.js` | Calldata for `submitAnswerCommitment` + `submitAnswerReveal`; revealed answer lands on chain |
| `submit-answer.test.js` | Calldata for `submitAnswer`; answer appears on chain via `getBestAnswer` |

Each describe block has two tests: one that checks calldata and one that checks the on-chain effect.

## Architecture

### Global setup (`global-setup.js` / `global-teardown.js`)
1. **Anvil** starts, forking Gnosis mainnet at block 46600000 with chain ID 100. This block is in the past so finalization timestamps are always in the past from real-browser time, making `isFinalized()` return true without any chain-time manipulation.
2. **webpack-dev-server** starts the dapp bundle at `http://localhost:8082`.

### Per-describe fixtures (`setup/fixtures.js`)
`beforeAll` creates the on-chain state needed for the suite — questions, answers, time skips — using a direct ethers.js connection to anvil. These run before any snapshot is taken.

### Per-test isolation (`evm_snapshot` / `evm_revert`)
`beforeEach` takes a snapshot; `afterEach` reverts to it and takes a fresh one. This keeps each test independent even though they share a single chain.

**Critical rule**: if a test's calldata-check interceptor fires before `eth_sendTransaction` is sent to anvil, the TX can race `evm_revert` in `afterEach` and mine on the *restored* state (overwriting `history_hash` with 0). All interceptors must resolve the test promise **after** `await orig(args)` completes, not before:

```javascript
// Correct — resolves after TX mines
window.ethereum.request = async (args) => {
  const result = await orig(args);
  if (args.method === 'eth_sendTransaction') resolve(args.params[0]);
  return result;
};

// Wrong — resolves before TX reaches anvil, enabling the race
window.ethereum.request = async (args) => {
  if (args.method === 'eth_sendTransaction') resolve(args.params[0]);
  return orig(args);
};
```

### Wallet mock (`setup/wallet-mock.js`)
Injected via `page.addInitScript()`. Implements EIP-1193 (`window.ethereum`) backed by anvil:

- **`eth_call` to reality.eth v3.0** — forwarded to anvil, returns local fork state
- **`eth_call` to any other address** — throws `'execution reverted'` immediately. The dapp's `loadArbitratorMetaData` and `populateArbitratorSelect` both have try-catch blocks that handle this gracefully. Without this, those functions would queue archive requests and stall `updateClaimableDisplay`.
- **`eth_getLogs`** — clipped: if `fromBlock < FORK_BLOCK+1` and `toBlock >= FORK_BLOCK+1`, fromBlock is rewritten to `FORK_BLOCK+1`. This prevents continuous event scans from touching the Gnosis archive (which rate-limits at 429). Historical point-queries (`fromBlock == toBlock == old_block`, used for template fetching) are not clipped.
- **`eth_estimateGas`** — uses real anvil for local contracts; returns 300 000 gas as a fallback for non-local.
- **`eth_sendTransaction`** — uses `anvil_impersonateAccount` to send without a private key.
- **graph cookie** — each test sets `{name: 'graph', value: '0'}` to disable the Graph API and force the dapp to load questions from `eth_getLogs` only.

### Anvil flags
`--fork-url https://rpc.gnosischain.com` — forks Gnosis mainnet.  
`--fork-block-number 46600000` — pins the fork block.  
`--retries 2` — gives archive lookups during mining 3 total attempts.

## Adding new tests

1. Create `your-feature.test.js` in `packages/dapp/tests/`
2. Import `snapshot`, `revert`, `ANVIL_URL` from `./setup/anvil.js`
3. Import `walletMockScript` from `./setup/wallet-mock.js`
4. Follow the `beforeAll` (fixtures) / `beforeEach` (snapshot) / `afterEach` (revert) pattern
5. Set the `graph` cookie to `'0'` before navigation
6. Add any new contract addresses that should be treated as local to `KNOWN_LOCAL_CONTRACTS` in `wallet-mock.js`
7. Use the "resolve after `await orig(args)`" interceptor pattern (see above)

## Known limitations

- The test account (`0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`) is the first default Anvil account, pre-funded with 10 000 ETH on the fork.
- Only reality.eth v3.0 (`0xE78996A233895bE74a66F451f1019cA9734205cc`) is treated as a local contract. Calls to v3.2 or any arbitrator contract return `execution reverted`.
- The Gnosis public RPC (`rpc.gnosischain.com`) is used for archive access during mining. If it is rate-limited, tests slow down but should still pass thanks to `--retries 2`.
- Test files must be run from `packages/dapp/tests/` — running from the parent package picks up the wrong Playwright version.
