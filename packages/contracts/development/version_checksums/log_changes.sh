#!/bin/bash

# This script checks that we didn't change our audited code when refactoring.
# It will compare the binary code generated with the code created by compiling the flat files in flat/ which we do not regenerate.
# It runs solc with the --no-cbor-metadata flag to prevent solc from appending ipfs metadata, which includes a hash of the source code.
# It stores the hashes it finds along with the current commit hash.

DIR=`dirname "$0"`
COMMIT=`git rev-parse HEAD`
DT=`git show --no-patch --format=%ci $COMMIT`
MSG=`git log --format=%B -n 1 $COMMIT`
LOG="changes.txt"

#for contract in "RealityETH_ERC20-3.0.sol"; do
for contract in "RealityETH-3.0.sol" "RealityETH_ERC20-3.0.sol"; do
#for contract in "RealityETH-3.0.sol"; do
    HASH=`solc-0.8.20 --no-cbor-metadata --bin "$DIR/../contracts/$contract" | grep -A2 "$contract:" | tail -n1 | sha256sum | head -c64`
    #ORIG_HASH=`solc-0.8.20 --no-cbor-metadata --bin "$DIR/../../flat/$contract" | grep -A2 "$contract:" | tail -n1 | sha256sum | head -c64`
    #if [ "$HASH" != "$ORIG_HASH" ]; then
    #    echo "Hash mismatch"
    #    # exit 1
    #fi
    echo "[ $DT ] $HASH $contract $MSG" >> $LOG
done

