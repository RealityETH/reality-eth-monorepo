#!/bin/bash

# Reproduce the executable bytecode (the code region, excluding the cbor/ipfs
# metadata trailer that encodes file paths) for the current src/ contracts,
# using the pinned settings the committed artifacts were built with
# (solc 0.8.20, --optimize --optimize-runs=200). Prints a sha256 per contract.
#
# Use it to prove a refactor/move did not change any contract's code:
#   ./scripts/verify_bytecode.sh > before.txt
#   ...make the change...
#   ./scripts/verify_bytecode.sh > after.txt && diff before.txt after.txt
#
# (Interfaces compile to empty bytecode and all hash to the sha256 of "".)

set -euo pipefail

DIR=`dirname "$0"`
SRC="$DIR/../src"

# Locate solc 0.8.20: prefer solc-0.8.20 on PATH, else foundry's svm cache.
SOLC=`command -v solc-0.8.20 || true`
if [ -z "$SOLC" ]; then
    SVM="$HOME/.local/share/svm/0.8.20/solc-0.8.20"
    [ -x "$SVM" ] && SOLC="$SVM"
fi
if [ -z "$SOLC" ]; then
    echo "solc 0.8.20 not found (need solc-0.8.20 on PATH or foundry's svm cache)" >&2
    exit 1
fi

# Default to the deployable v4 contracts; override by passing file names.
CONTRACTS=${*:-"RealityETH-4.0.sol RealityETH_ERC20-4.0.sol RealityETH_ERC20_Factory.sol Arbitrator.sol"}

TMP=`mktemp -d`
trap 'rm -rf "$TMP"' EXIT
( cd "$SRC" && "$SOLC" --optimize --optimize-runs=200 --no-cbor-metadata --bin --overwrite -o "$TMP" $CONTRACTS >/dev/null 2>&1 )
sha256sum "$TMP"/*.bin | sed "s#$TMP/##" | sort -k2
