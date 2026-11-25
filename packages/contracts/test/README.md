# Foundry test suite (RealityETH)

Work-in-progress migration of the Python suite (`tests/python/`) to Foundry.

## Approach

These tests **run against the committed creation bytecode** under `../bytecode/`
rather than recompiling the historical sources — exactly like the Python suite
("test the bytecode, not the source"). Forge only compiles the harness,
interface and mocks here (solc 0.8.20); the contract under test is deployed as
raw bytecode and driven through [`src/IRealityETH.sol`](../src/IRealityETH.sol).

The version under test is chosen with the `REALITYETH` env var (mirroring the
Python suite), defaulting to `RealityETH-3.0`. `RealityETHBase` sets per-version
feature flags (commit-reveal, answerer-assignment, reopen, min-bond) that gate
tests the same way the Python suite prints `Skipping …`.

## Setup

```bash
# from packages/contracts
forge install foundry-rs/forge-std --no-git   # populates ./lib (gitignored)
```

## Running

```bash
forge test                                  # default: RealityETH-3.0
REALITYETH=RealityETH-3.2 forge test        # a specific version
REALITYETH=RealityETH_ERC20-3.0 forge test  # ERC20 variant
```

Validated targets: `RealityETH-{2.0,3.0,3.2,4.0}` and `RealityETH_ERC20-3.0`.
