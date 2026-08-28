# Dapp Rebuild Notes

Non-obvious implementation details discovered by tracing the current dapp's behaviour during end-to-end test development. Intended for an agent rebuilding the dapp from scratch. Does not duplicate what's in `tests/TESTING_INFRASTRUCTURE.md` or the architecture memory files.

---

## Arbitration UI decision tree

The dapp determines which arbitration UI to show via a two-step fallback (see `rpc.js` around line 4038):

1. Call `getDisputeFee(questionId)` on the arbitrator contract.
   - **Success** → show `.arbitration-button` (direct, single-chain arbitration; user pays the fee on this chain).
   - **Revert** → fall through to step 2.

2. Call `loadArbitratorMetaData(arbitratorAddress)`, which:
   - First checks `ARBITRATOR_METADATA` (pre-loaded from `arbitrator_metadata_legacy.json` at startup, line 53). This file hard-codes metadata for 4 old contracts. If the arbitrator is found here, that metadata is returned without any on-chain call.
   - Then calls `arb.functions.metadata()` on-chain and parses the JSON response.
   - If the JSON contains `foreignProxy: true` → read `foreignProxy()` and `foreignChainId()` from the contract and show `.arbitration-button-foreign-proxy` (cross-chain).
   - Otherwise → call `markArbitratorFailed` (arbitrator is unusable).

**Key implication for Kleros on Gnosis:** The Kleros ForeignArbitrationProxy (`0x29f39...`) **always reverts** on `getDisputeFee`. This is by design — it is a cross-chain bridge, not a local court. Every question with this arbitrator will always reach the foreign-proxy path. Do not implement a direct arbitration flow for it.

---

## `ProxiedArbitratorNew.json` ABI is incomplete

`packages/dapp/src/scripts/abi/kleros/ProxiedArbitratorNew.json` does not include a `metadata()` function even though the real deployed contract at the Gnosis fork block implements it. The dapp calls `arb.functions.metadata()` via a generic `ARBITRATOR_INSTANCE` that has this method in its own ABI. Any new implementation that builds a contract interface solely from `ProxiedArbitratorNew.json` will fail to call `metadata()` and the foreign-proxy path will never activate.

---

## `isFinalized()` uses the browser clock, not chain time

```javascript
// rpc.js:1319
function isFinalized(question) {
  if (isArbitrationPending(question)) return false;
  const fin = question.finalization_ts.toNumber();
  return fin > 1 && fin * 1000 < new Date().getTime();
}
```

`new Date().getTime()` is the browser's system clock. A question appears finalized as soon as the user's machine's clock passes `finalization_ts`. The chain's block timestamp is never consulted for this check.

**Implication for new dapp:** If you replace this with a chain-time check the behaviour will differ on machines with clock skew, or in test environments where the fork block timestamp is in the past (or future). The current approach is intentional — it gives the user immediate feedback without waiting for the next block.

**Implication for tests:** The Gnosis fork at block 46600000 has a timestamp of approximately June 9 2026. Any test question with `finalization_ts` earlier than the test machine's clock (even by seconds) will immediately appear finalized. Questions needing the arbitration UI must have `timeout` large enough that `finalization_ts` stays in the future. reality.eth v3.0 enforces `timeout < 365 days` (31 536 000 seconds).

---

## Bond requirement before showing the arbitration button

The arbitration code block is only entered when:
```
!isArbitrationPending(question_detail) && !isFinalized(question_detail)
```

But even then, the click handler for `.arbitration-button-foreign-proxy` bails out if `question_latest.bond.eq(0)` (rpc.js:4104). The UX implies that at least one answer must be on-chain before the user can request arbitration. In tests, you must submit an answer (with a non-zero bond) before the arbitration button becomes functional.

---

## `data-last-seen-bond` has an intentional 2-second delay

```javascript
// rpc.js:3868
window.setTimeout(function () {
  rcqa.find('.arbitration-button').attr('data-last-seen-bond', ...);
}, 2000);
```

The delay exists so that the user sees the updated bond value before the button activates, reducing the chance of a race where they click at the same bond they were responding to. Any code or test that clicks `.arbitration-button` must wait for `data-last-seen-bond` to be set.

---

## `data-foreign-proxy` is set after two async RPC calls

The foreign-proxy button's `data-foreign-proxy` attribute is set only after both `foreignProxy()` and `foreignChainId()` return (rpc.js:4121-4124). These are separate `eth_call`s to the proxy contract. In a test environment, both must succeed before the test clicks the button. Wait for:

```javascript
btn.getAttribute('data-foreign-proxy')  // truthy once both calls complete
```

---

## Cross-chain Kleros flow: complete sequence

1. **Gnosis chain:** User clicks `.arbitration-button-foreign-proxy`.
2. Dapp calls `ensureQuestionDetailFetched()` to get the latest question state.
3. Dapp calls `window.open('index.html#!/foreign-proxy/' + encodeURIComponent(JSON.stringify(url_data)))` — a **new window**, not an in-page navigation.
4. `url_data` is the full `question_detail` object with two extra fields appended:
   - `network_id` — target chain ID (from `foreignChainId()` on the Gnosis proxy, e.g. `1` for Ethereum mainnet)
   - `foreign_proxy` — proxy address on the target chain (from `foreignProxy()` on the Gnosis proxy, e.g. `0x2F0895732bfacdCF2fdB19962fE609D0dA695F21`)
5. **Target chain (Ethereum):** The new window loads the foreign-proxy UI, where the user pays the Kleros arbitration deposit to the Ethereum-side proxy.
6. The Ethereum proxy sends a cross-chain message via the Gnosis AMB bridge.
7. **Back on Gnosis:** The Gnosis proxy receives the ruling and calls:
   - `notifyOfArbitrationRequest(questionId, requester, maxPrevious)` — marks the question as pending arbitration
   - `submitAnswerByArbitrator(questionId, answer, answerer)` — delivers the ruling

Steps 6–7 are done by the proxy contracts, not by the dapp or the user.

**Important:** `submitAnswerByArbitrator` immediately finalizes the question — there is no further timeout wait after an arbitrator ruling. `notifyOfArbitrationRequest` must be called first or the `submitAnswerByArbitrator` call will revert.

---

## Claim flow: `history_hash` chain reconstruction

`claimMultipleAndWithdrawBalance` requires the full answer history reconstructed from `LogNewAnswer` events (see `possibleClaimableItems`, rpc.js:4210). The history arrays are built by iterating the event history **newest-to-oldest** and then the `history_hashes` array is shifted by one:

```javascript
// Each event's history_hash is the running hash BEFORE that answer was added.
// claimMultipleAndWithdrawBalance expects, for each answer, the hash that existed
// just before that answer — i.e., the previous answer's hash.
// The shift-and-push-zero pattern achieves this:
claimable_history_hashes.shift();                       // drop the current top-of-chain hash
claimable_history_hashes.push('0x000...000');           // add zero as the "before-first" hash
```

If `question.history_hash == 0`, everything has already been claimed — `possibleClaimableItems` returns `{total: 0}` and the claim button will not appear.

`claimMultipleAndWithdrawBalance` is **atomic**: it distributes bond winnings to each participant's internal reality.eth balance AND withdraws the caller's balance to their wallet in the same transaction. Users do not need a separate "withdraw" step.

---

## No-arbitrator questions are NOT the same as address(0) arbitrator

The dapp adds the `no-arbitrator` CSS class only when `arbitrator == contract` (the reality.eth contract address itself). Questions created with `ethers.constants.AddressZero` as the arbitrator do **not** get `no-arbitrator` — they go through the full `getDisputeFee` → `loadArbitratorMetaData` path, which will eventually call `markArbitratorFailed` since `address(0)` has no callable interface.
