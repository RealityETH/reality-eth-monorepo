#!/usr/bin/env node
// Generates generated/contract_token_lookup.json:
//   { chainId: { contractAddress: { symbol, decimals, approx_1_usd } } }
// Used by both the custom indexer and ponder to compute USD bond values.

'use strict';

const fs   = require('fs');
const path = require('path');

const GEN_DIR      = path.join(__dirname, '..', 'generated');
const CONTRACTS    = JSON.parse(fs.readFileSync(path.join(GEN_DIR, 'contracts.json'), 'utf8'));
const TOKENS       = JSON.parse(fs.readFileSync(path.join(GEN_DIR, 'tokens.json'), 'utf8'));

const lookup = {};

for (const [chainId, tokenMap] of Object.entries(CONTRACTS)) {
  for (const [symbol, contractMap] of Object.entries(tokenMap)) {
    const tokenInfo = TOKENS[symbol];
    if (!tokenInfo) {
      console.warn(`  Unknown token symbol: ${symbol} (chain ${chainId})`);
      continue;
    }
    const { decimals, approx_1_usd } = tokenInfo;
    if (approx_1_usd == null) {
      console.warn(`  No approx_1_usd for ${symbol} — run update_token_prices.js first`);
      continue;
    }
    if (!lookup[chainId]) lookup[chainId] = {};
    for (const contractDef of Object.values(contractMap)) {
      const addr = contractDef.address.toLowerCase();
      lookup[chainId][addr] = { symbol, decimals, approx_1_usd };
    }
  }
}

const outPath = path.join(GEN_DIR, 'contract_token_lookup.json');
fs.writeFileSync(outPath, JSON.stringify(lookup, null, 2) + '\n');
console.log(`Written: ${outPath}`);
console.log(`Chains: ${Object.keys(lookup).length}, contracts: ${Object.values(lookup).reduce((s, m) => s + Object.keys(m).length, 0)}`);
