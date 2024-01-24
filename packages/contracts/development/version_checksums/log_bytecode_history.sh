#!/bin/bash

# This script helps us checks that we didn't change our audited code when refactoring unless we intended to.
# It runs solc with the --no-cbor-metadata flag to prevent solc from appending ipfs metadata, which includes a hash of the source code.
# It will run back through the history up to the specified number of commits.
# It assumes they all use solc 0.8.20. You need that binary installed. Adjust the SOLC variable if it's installed but not called "solc-0.8.20"
# It will output a file for each version with the commit, the hash of the compiled code and whether we put in a comment to claim we didn't change it from the previous commit (on the next line)
# It should put you back at the head of the original branch once it's finished.

if [[ "$1" -lt "1" ]]; then
    echo "Usage: ./log_bytecode_history.sh <number of commits to go back>"
    exit 1
fi

DIR=`dirname "$0"`
COUNT=$1
ORIG_BRANCH=`git rev-parse --abbrev-ref HEAD`
SOLC="solc-0.8.20"


for i in $(seq $COUNT); do
    sleep 1
    git checkout HEAD^
    SAME_BYTECODE=`git log HEAD^..HEAD --oneline | grep -c "no bytecode change"`
    COMMIT=`git rev-parse HEAD`
    for contract in "RealityETH-3.0.sol" "RealityETH_ERC20-3.0.sol" "RealityETH-4.0.sol" "RealityETH_ERC20-4.0.sol"; do
        if [ ! -f "$DIR/../contracts/$contract" ]; then
            continue
        fi
        BIN_HEX=`${SOLC} --no-cbor-metadata --bin "$DIR/../contracts/$contract" | grep -A2 "${contract}:" | tail -n1`
        if [ -n "$BIN_HEX" ]; then
            NEW_HASH=`echo "$BIN_HEX" | sha256sum | head -c64`
        else
            NEW_HASH="COMPILE_FAILED"
        fi
        LOG="COMMIT_LOG_${contract}.log"
        echo "${COMMIT}:${NEW_HASH}:${SAME_BYTECODE}" >> $LOG
    done
done

git checkout $ORIG_BRANCH
