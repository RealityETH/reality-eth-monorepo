#!/usr/bin/env node
// AUTO-GENERATES two files from contracts.json + chains.json:
//   packages/indexer/active-chains.json      — chain list for sync.js ACTIVE_CHAINS
//   packages/indexer/scripts/chains-config.json — chain/explorer config for fetch-event-blocks.js
//
// Reads realityETHIndexerSupport, indexer_batch_size, indexer_name, and explorer_api_*
// fields from supported.json to drive generation.

'use strict';

const fs   = require('fs');
const path = require('path');

const contractsDir = path.resolve(__dirname, '..');
const contracts    = JSON.parse(fs.readFileSync(path.join(contractsDir, 'generated/contracts.json'), 'utf8'));
const chains       = JSON.parse(fs.readFileSync(path.join(contractsDir, 'generated/chains.json'), 'utf8'));
const supported    = JSON.parse(fs.readFileSync(path.join(contractsDir, 'chains/supported.json'), 'utf8'));

const ETHERSCAN_V2  = 'https://api.etherscan.io/v2/api';
const DEFAULT_BATCH = 5_000;

// Skip arbitrators and pre-release versions.
function isSkipped(ver) {
  return ver.startsWith('Arbitrator') || ver.endsWith('-rc1') || ver.endsWith('-rc2');
}

// Name used in indexer logs and as the fetch-event-blocks.js CHAINS key.
// Prefers supported.json indexer_name, then normalized network_name.
function indexerName(id) {
  const sup = supported[String(id)] || {};
  if (sup.indexer_name) return sup.indexer_name;
  const nn = chains[String(id)]?.network_name;
  if (!nn) return `chain_${id}`;
  return nn.toLowerCase().replace(/[-\s]+/g, '_');
}

// Short label for the contracts[] name field in chains-config.json.
// Must be unique within each chain since it's used as a meta key for HWM tracking.
function contractLabel(token, ver) {
  const m = ver.match(/-(\d+\.\d+)$/);
  const v = m ? m[1] : '?';
  return ver.startsWith('RealityETH_ERC20-') ? `ERC20-${token}-v${v}` : `v${v}`;
}

// Chain IDs that have realityETHIndexerSupport set in chains.json.
const indexedIds = Object.keys(chains)
  .map(Number)
  .filter(id => chains[String(id)]?.realityETHIndexerSupport)
  .sort((a, b) => a - b);

const activeChains = [];
const chainsConfig = {};

for (const chainId of indexedIds) {
  const sup     = supported[String(chainId)] || {};
  const byToken = contracts[String(chainId)] || {};
  const name    = indexerName(chainId);

  // Collect all non-skipped contract addresses with their start blocks.
  const entries = [];
  for (const [token, byVersion] of Object.entries(byToken)) {
    for (const [ver, data] of Object.entries(byVersion)) {
      if (isSkipped(ver)) continue;
      const addrs = Array.isArray(data.address) ? data.address : [data.address];
      for (const addr of addrs.filter(Boolean)) {
        entries.push({
          address:    addr.toLowerCase(),
          startBlock: data.block || 0,
          label:      contractLabel(token, ver),
        });
      }
    }
  }
  if (!entries.length) continue;
  entries.sort((a, b) => a.startBlock - b.startBlock);

  // active-chains.json entry (consumed by sync.js mkChain).
  activeChains.push({
    id:             chainId,
    name,
    batchSize:      sup.indexer_batch_size || DEFAULT_BATCH,
    noExplorerRefresh: !!sup.no_explorer_refresh,
    startBlock:     entries[0].startBlock,
    addresses:      entries.map(e => e.address),
  });

  // chains-config.json entry (consumed by fetch-event-blocks.js).
  // Default: Etherscan V2 with chainId param and ETHERSCAN_API_KEY.
  // Overrides come from explorer_api_* fields in supported.json.
  const apiUrl     = sup.explorer_api_url || ETHERSCAN_V2;
  const apiKeyEnv  = 'explorer_api_key_env' in sup ? sup.explorer_api_key_env : 'ETHERSCAN_API_KEY';
  const apiKeyReq  = sup.explorer_api_key_required || false;
  const apiChainId = sup.explorer_api_no_chain_id ? null : chainId;

  chainsConfig[name] = {
    chainId:        apiChainId,
    apiUrl,
    apiKeyEnv,
    apiKeyRequired: apiKeyReq,
    contracts:      entries.map(e => ({ address: e.address, startBlock: e.startBlock, name: e.label })),
  };
}

const activeChainPath  = path.resolve(contractsDir, '../indexer/active-chains.json');
const chainsConfigPath = path.resolve(contractsDir, '../indexer/scripts/chains-config.json');

fs.writeFileSync(activeChainPath,  JSON.stringify(activeChains,  null, 2) + '\n');
console.log('Wrote', activeChainPath);

fs.writeFileSync(chainsConfigPath, JSON.stringify(chainsConfig, null, 2) + '\n');
console.log('Wrote', chainsConfigPath);
