#!/bin/bash
set -e

echo "Installing and linking @reality.eth/contracts..."
cd packages/contracts && npm install && npm link && cd ../..

echo "Installing and linking @reality.eth/reality-eth-lib..."
cd packages/reality-eth-lib && npm install && npm link @reality.eth/contracts && npm link && cd ../..

for dir in packages/*/; do
  [ -f "${dir}package.json" ] || continue
  name=$(node -p "require('./${dir}package.json').name")
  if [ "$name" = "@reality.eth/contracts" ] || [ "$name" = "@reality.eth/reality-eth-lib" ]; then
    continue
  fi
  echo "Installing $name..."
  cd "$dir"
  npm install
  if grep -q '"@reality.eth/contracts"' package.json; then
    npm link @reality.eth/contracts
  fi
  if grep -q '"@reality.eth/reality-eth-lib"' package.json; then
    npm link @reality.eth/reality-eth-lib
  fi
  cd ../..
done

echo "Done!"
