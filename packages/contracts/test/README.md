# Foundry test suite (RealityETH)

A Foundry port of the Python suites (`tests/python/test.py` and
`tests/python/test_erc20.py`).

## Approach

Tests **run against the committed creation bytecode** under `../bytecode/`
rather than recompiling the historical sources — exactly like the Python suite
("test the bytecode, not the source"). Forge only compiles the harness,
interface and mocks here (solc 0.8.20); the contract under test is deployed as
raw bytecode and driven through [`src/IRealityETH.sol`](../src/IRealityETH.sol).

The contract under test is chosen with the `REALITYETH` env var (mirroring the
Python suite), defaulting to `RealityETH-3.0`. `RealityETHBase` sets per-version
feature flags (commit-reveal, answerer-assignment, reopen, min-bond) and
`RealityETHStd` provides the standard fixture (arbitrator with a 100 question
fee + one open "my question" with bounty 1000).

Both the **ETH and ERC20** contract families are supported from the same test
bodies: every paying operation goes through branching helpers
(`_ask` / `_submit` / `_fund` / `_submitFor` / `_reopen` and `*Revert`
variants), the Solidity equivalent of the Python `if ERC20:` branches.

## Setup

```bash
# from packages/contracts
forge install foundry-rs/forge-std --no-git   # populates ./lib (gitignored)
```

## Running

```bash
forge test                                   # default: RealityETH-3.0
REALITYETH=RealityETH-3.2      forge test
REALITYETH=RealityETH-4.0      forge test    # commit-reveal tests skip (removed in 4.0)
REALITYETH=RealityETH_ERC20-3.0 forge test   # ERC20 variant
```

## Coverage

57 test functions ported (54 shared + 3 ERC20-only), run against every released
version from 2.0 to 4.0, for both the ETH and ERC20 families. Tests that depend
on a feature a given version lacks are skipped (never failed), matching the
Python suite's skips.

| Target | Result |
|---|---|
| `RealityETH-2.0` | 41 pass (16 skip: assign/cancel/submitAnswerFor + reopen/min-bond/too-soon/null-arb) |
| `RealityETH-2.1` / `-2.2` | 48 pass (9 skip: reopen/min-bond/too-soon/null-arb) |
| `RealityETH-3.0` / `-3.2` | 54 pass (3 ERC20-only skip) |
| `RealityETH-4.0` | 41 pass (commit-reveal + ERC20-only skip) |
| `RealityETH_ERC20-2.0` | 44 pass (13 skip) |
| `RealityETH_ERC20-3.0` / `-3.2` | 57 pass |
| `RealityETH_ERC20-4.0` | 44 pass (commit-reveal skip) |

(`RealityETH_ERC20` was only released from 2.0 and 3.0+; there is no ERC20 2.1 /
2.2 bytecode.)

Test files map to the Python tests: `Core`, `Arbitration`, `CommitReveal`,
`BondClaim`, `Fees`, `Reopen`, `Misc`, `ERC20Specific`, plus `Smoke`.

### Version differences handled

- `questions()` returns 10 fields pre-3.0 and 11 from 3.0 on (the trailing
  `min_bond`); `_q()` decodes by version into a normalized struct.
- `question_id` formula gained `min_bond` + the contract address in 3.0;
  `_questionId()` branches on version.
- Feature flags gate per version: commit-reveal (removed in 4.0),
  assignWinner / submitAnswerFor / cancelArbitration (added in 2.1), and
  reopen / min-bond / settled-too-soon / null-arbitrator (added in 3.0).
- Pre-3.0 allows requesting arbitration on an unrevealed commitment; 3.0+ does
  not — `test_answer_commit_with_arbitration_pending` branches accordingly.

## Notes

- Gas-test thresholds are forge-calibrated (gasleft()-delta at the call site),
  not the Python `cumulativeGasUsed` numbers; the meaningful property (second
  answer cheaper than the first) is asserted directly.
- `forge-std` and build artifacts (`out/`, `cache/`, `lib/`) are gitignored.
