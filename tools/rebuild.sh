pushd packages/dapp && npm run build
popd
cd packages/template-generator && NODE_OPTIONS=--openssl-legacy-provider npm run build
