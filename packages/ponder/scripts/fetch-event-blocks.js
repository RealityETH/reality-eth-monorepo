#!/usr/bin/env node
// Fetches block numbers where reality.eth events occurred from block explorers.
// Builds the sparse block index used by sync.js to skip empty getLogs ranges.
//
// Usage:
//   node scripts/fetch-event-blocks.js [chain...]
//
// If no chains are specified, all configured chains are fetched.
// Incremental: only fetches blocks since the last run (stored in
// known-event-blocks-meta.json). Delete that file to force a full re-fetch.

'use strict';

const fs   = require('fs');
const path = require('path');

// Load .env.local so ETHERSCAN_API_KEY etc. are available without manual export.
try {
  const envFile = path.join(__dirname, '..', '.env.local');
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
} catch {}

const OUTPUT      = path.join(__dirname, '..', '..', 'indexer', 'known-event-blocks.json');
const META_OUTPUT = path.join(__dirname, '..', '..', 'indexer', 'known-event-blocks-meta.json');

// AUTO-GENERATED from packages/contracts/generated/contracts.json via
// packages/contracts/scripts/generate_indexer_config.js — do not edit manually.
// apiKeyRequired: true chains are omitted if the required env var is not set.
// Etherscan v2 key (ETHERSCAN_API_KEY) is optional — API works without it at lower rate limits.
// BNB Smart Chain (BSCSCAN_API_KEY): requires a free key from https://bscscan.com/register
const _chainSpecs = JSON.parse(fs.readFileSync(path.join(__dirname, 'chains-config.json'), 'utf8'));
const CHAINS = {};
for (const [name, spec] of Object.entries(_chainSpecs)) {
  const apiKey = spec.apiKeyEnv ? process.env[spec.apiKeyEnv] : null;
  if (spec.apiKeyRequired && !apiKey) continue;
  CHAINS[name] = { apiUrl: spec.apiUrl, chainId: spec.chainId, apiKey, contracts: spec.contracts };
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Get the current tip block number for a chain.
// For Etherscan v2 (chainId set): uses the proxy module.
// For Blockscout instances (chainId null): uses the Blockscout v2 REST API.
async function getCurrentBlock(apiUrl, chainId, apiKey) {
  if (!chainId) {
    // Blockscout v2 REST endpoint: /api/v2/blocks?type=block
    const v2Url = apiUrl.replace(/\/api$/, '/api/v2') + '/blocks?type=block';
    const resp = await fetch(v2Url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    const height = data?.items?.[0]?.height;
    if (!height) throw new Error(`Unexpected response: ${JSON.stringify(data).slice(0, 100)}`);
    return height;
  }
  const params = new URLSearchParams({
    module: 'proxy',
    action: 'eth_blockNumber',
    ...(chainId ? { chainid: String(chainId) } : {}),
    ...(apiKey  ? { apikey: apiKey }           : {}),
  });
  const resp = await fetch(`${apiUrl}?${params}`);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data = await resp.json();
  if (!data.result) throw new Error(`Unexpected response: ${JSON.stringify(data)}`);
  return parseInt(data.result, 16);
}

// Maximum block range per Etherscan query. The API times out when queried over a
// very large range on active contracts (e.g. gnosis v2.1). Chunking keeps each
// request small enough to complete while still accumulating all event blocks.
const MAX_RANGE = 200_000;

async function fetchPage(apiUrl, chainId, address, fromBlock, apiKey, toBlock = 'latest') {
  const params = new URLSearchParams({
    module:    'logs',
    action:    'getLogs',
    address,
    fromBlock: String(fromBlock),
    toBlock:   typeof toBlock === 'number' ? String(toBlock) : toBlock,
    ...(chainId ? { chainid: String(chainId) } : {}),
    ...(apiKey  ? { apikey: apiKey }           : {}),
  });
  const resp = await fetch(`${apiUrl}?${params}`);
  if (!resp.ok) throw new Error(`HTTP ${resp.status} from ${apiUrl}`);
  return resp.json();
}

async function fetchContractBlocks(apiUrl, chainId, address, startBlock, apiKey, endBlock) {
  const blocks = new Set();
  const useChunks = endBlock != null;

  let rangeStart = startBlock;
  const rangeEnd   = endBlock ?? Infinity; // sentinel when unknown (toBlock='latest')

  for (;;) {
    const chunkEnd = useChunks
      ? Math.min(rangeStart + MAX_RANGE - 1, endBlock)
      : null; // null → toBlock='latest'

    let fromBlock = rangeStart;

    for (;;) {
      process.stdout.write(`    from block ${fromBlock.toLocaleString()}...`);
      let data;
      for (let attempt = 0; attempt < 5; attempt++) {
        data = await fetchPage(apiUrl, chainId, address, fromBlock, apiKey, chunkEnd ?? 'latest');
        if (!data.result?.includes?.('rate limit')) break;
        process.stdout.write(` rate limited, waiting 6s...`);
        await sleep(6000);
      }

      if (data.status === '0') {
        const isEmpty = Array.isArray(data.result) && data.result.length === 0;
        if (isEmpty) { process.stdout.write(` done (${data.message})\n`); break; }
        throw new Error(`API error: ${data.message} — ${JSON.stringify(data.result)}`);
      }

      const logs = data.result;
      for (const log of logs) blocks.add(parseInt(log.blockNumber, 16));
      process.stdout.write(` ${logs.length} logs\n`);

      if (logs.length < 1000) break;

      // Paginate within the current chunk from the block after the last result.
      fromBlock = parseInt(logs[logs.length - 1].blockNumber, 16) + 1;
      if (chunkEnd != null && fromBlock > chunkEnd) break;
      await sleep(apiKey ? 250 : 5500);
    }

    if (!useChunks) break; // single toBlock='latest' query — done

    rangeStart = chunkEnd + 1;
    if (rangeStart > endBlock) break;
    await sleep(apiKey ? 250 : 5500);
  }

  return [...blocks];
}

async function main() {
  const requested = process.argv.slice(2);
  const chains = requested.length
    ? Object.fromEntries(requested.map(c => [c, CHAINS[c]]).filter(([, v]) => v))
    : CHAINS;

  if (!Object.keys(chains).length) {
    console.error('No matching chains found. Available:', Object.keys(CHAINS).join(', '));
    process.exit(1);
  }

  // Load existing data and high-water marks from previous runs.
  let existing = {};
  let meta = {};
  try { existing = JSON.parse(fs.readFileSync(OUTPUT,      'utf8')); } catch {}
  try { meta     = JSON.parse(fs.readFileSync(META_OUTPUT, 'utf8')); } catch {}

  for (const [chain, config] of Object.entries(chains)) {
    console.log(`\n${chain}:`);
    if (!config.apiKey) console.log(`  (no API key — rate limited to ~1 req/5s)`);

    // Get current block once per chain; used as the new high-water mark after fetching.
    let currentBlock = null;
    try {
      currentBlock = await getCurrentBlock(config.apiUrl, config.chainId, config.apiKey);
      console.log(`  Current block: ${currentBlock.toLocaleString()}`);
      await sleep(config.apiKey ? 250 : 5500);
    } catch (e) {
      console.warn(`  Warning: could not get current block (${e.message}) — hwm will not be updated`);
    }

    if (!meta[chain]) meta[chain] = {};
    // Seed from existing data so incremental runs keep accumulated blocks.
    const allBlocks = new Set(existing[chain] ?? []);

    for (const contract of config.contracts) {
      const hwm       = meta[chain][contract.address];
      const fetchFrom = hwm != null ? hwm + 1 : contract.startBlock;

      if (hwm != null && currentBlock != null && hwm >= currentBlock) {
        console.log(`  ${contract.name}: already up to date (hwm ${hwm.toLocaleString()})`);
        continue;
      }

      const label = hwm != null
        ? `${contract.name} (${contract.address}) — incremental from ${fetchFrom.toLocaleString()}`
        : `${contract.name} (${contract.address})`;
      console.log(`  ${label}`);

      const blocks = await fetchContractBlocks(config.apiUrl, config.chainId, contract.address, fetchFrom, config.apiKey, currentBlock ?? undefined);
      console.log(`  → ${blocks.length} new event blocks`);
      blocks.forEach(b => allBlocks.add(b));

      if (currentBlock != null) {
        meta[chain][contract.address] = currentBlock;
      }

      const contractIdx = config.contracts.indexOf(contract);
      if (contractIdx < config.contracts.length - 1) {
        await sleep(config.apiKey ? 250 : 5500);
      }
    }

    const sorted = [...allBlocks].sort((a, b) => a - b);
    console.log(`  Total unique blocks: ${sorted.length}`);
    existing[chain] = sorted;
  }

  fs.writeFileSync(OUTPUT,      JSON.stringify(existing, null, 2) + '\n');
  fs.writeFileSync(META_OUTPUT, JSON.stringify(meta,     null, 2) + '\n');
  console.log(`\nWritten to ${OUTPUT}`);
  console.log(`High-water marks written to ${META_OUTPUT}`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
