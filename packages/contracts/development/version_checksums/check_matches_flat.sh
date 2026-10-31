#!/bin/bash

# This script checks that we didn't change our audited code when refactoring.
# It compares the binary generated from the current source in src/ against the
# binary from the committed, audited flat file in flat/ (which we never
# regenerate). It uses --no-cbor-metadata so the trailing ipfs/metadata hash
# (which encodes file paths/source) is excluded and only the code is compared.
#
# Source now lives in src/. Only versions that exist in BOTH src/ and flat/ are
# checked; others are skipped (e.g. released versions whose source is no longer
# the current development source).

DIR=`dirname "$0"`
SRC="$DIR/../../src"
FLAT="$DIR/../../flat"
COMMIT=`git rev-parse HEAD`

for contract in "RealityETH-3.0.sol" "RealityETH_ERC20-3.0.sol"; do
    if [ ! -f "$SRC/$contract" ] || [ ! -f "$FLAT/$contract" ]; then
        echo "$contract: skipped (no matching src/ + flat/ pair)"
        continue
    fi
    HASH=`solc-0.8.20 --no-cbor-metadata --bin "$SRC/$contract" | tail -n1 | sha256sum | head -c64`
    ORIG_HASH=`solc-0.8.20 --no-cbor-metadata --bin "$FLAT/$contract" | tail -n1 | sha256sum | head -c64`
    if [ "$HASH" != "$ORIG_HASH" ]; then
        echo "Hash mismatch"
        exit 1
    fi
    echo "$contract: $HASH" >> $COMMIT
done
