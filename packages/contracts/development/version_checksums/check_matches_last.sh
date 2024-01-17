#!/bin/bash

# This script checks that we didn't change our audited code when refactoring.
# It runs solc with the --no-cbor-metadata flag to prevent solc from appending ipfs metadata, which includes a hash of the source code.
# It stores the hashes it finds along with the current commit hash.
# If it has already been run on that commit with a different hash, it will exit with an error.

DIR=`dirname "$0"`
COMMIT=`git rev-parse HEAD`

for contract in "RealityETH-3.0.sol" "RealityETH_ERC20-3.0.sol"; do
    NEW_HASH=`solc-0.8.20 --no-cbor-metadata --bin "$DIR/../contracts/$contract" | tail -n1 | sha256sum | head -c64`
    FILE="${contract}-${COMMIT}"
    if test -f "$FILE"; then
        ORIG_HASH=`cat $FILE`
        if [ "$NEW_HASH" != "$ORIG_HASH" ]; then
            echo "Hash mismatch"
            exit 1
        fi
    else
        echo "logging $contract for the first time"
        echo "$NEW_HASH" > $FILE
    fi
done

echo "OK"
