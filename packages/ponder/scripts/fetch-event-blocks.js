#!/usr/bin/env node
// Fetches block numbers where reality.eth events occurred from block explorers.
// Writes known-event-blocks.json which ponder.config.ts uses to skip empty
// ranges during historical sync — dramatically reducing RPC calls on sparse chains.
//
// Usage:
//   node scripts/fetch-event-blocks.js [chain...]
//
// If no chains are specified, all configured chains are fetched.
// Incremental: re-runs only fetch blocks since the last run (stored in
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

const OUTPUT      = path.join(__dirname, '..', 'known-event-blocks.json');
const META_OUTPUT = path.join(__dirname, '..', 'known-event-blocks-meta.json');

// Etherscan v2 unified API — one endpoint for all chains via chainid param.
// Get a free API key at https://etherscan.io/register (works for all chains).
const ETHERSCAN_V2  = 'https://api.etherscan.io/v2/api';
const ETHERSCAN_KEY = process.env.ETHERSCAN_API_KEY;

// BscScan free API key — register separately at https://bscscan.com/register
// Etherscan v2 free tier does not include BNB Smart Chain; BscScan's own free
// tier does, but uses the same Etherscan v2 endpoint with a BscScan-issued key.
const BSCSCAN_KEY = process.env.BSCSCAN_API_KEY;

const CHAINS = {
  mainnet: {
    apiUrl:  ETHERSCAN_V2,
    chainId: 1,
    apiKey:  ETHERSCAN_KEY,
    contracts: [
      { address: '0x325a2e0F3CCA2ddbaeBB4DfC38Df8D19ca165b47', startBlock: 6531265,  name: 'v2.0' },
      { address: '0x5b7dD1E86623548AF054A4985F7fc8Ccbb554E2c', startBlock: 13194676, name: 'v3.0' },
      { address: '0x6a2155613b68eFB38D5c6074921F3F4281c8c177', startBlock: 22100226, name: 'v3.2' },
      { address: '0x3D3B51b1091d1F6491AeB1916C94BAfe57f6Cc9d', startBlock: 8050824,  name: 'ERC20-TRST' },
      { address: '0x8f1CC53bf34932591177CDA24723486205CA7510', startBlock: 12654676, name: 'ERC20-GNO-v2' },
      { address: '0xf4585A9944A390615E7cec6756C1c082173B93eB', startBlock: 12821080, name: 'ERC20-FOX' },
      { address: '0x33aa365a53a4c9ba777fb5f450901a8eef73f0a9', startBlock: 13201169, name: 'ERC20-GNO-v3' },
      { address: '0x867092A32bC16816F12Fb326EfF7A2865E1ec138', startBlock: 14485576, name: 'ERC20-SWISE' },
    ],
  },
  gnosis: {
    apiUrl:  ETHERSCAN_V2,
    chainId: 100,
    apiKey:  ETHERSCAN_KEY,
    contracts: [
      { address: '0x79e32aE03fb27B07C89c0c568F80287C01ca2E57', startBlock: 14005802, name: 'v2.1' },
      { address: '0xE78996A233895bE74a66F451f1019cA9734205cc', startBlock: 17997262, name: 'v3.0' },
      { address: '0xEb51d9d9717906c981C57af09C4a3449eF30705b', startBlock: 39142627, name: 'v3.2' },
      { address: '0x95b2b2b4b66A5a47Df79bF07BEBe72E9870fceb2', startBlock: 20882108, name: 'ERC20-GNO' },
      { address: '0xC9FbdF0df8dE06Ad8d2193F7FA28bdA78c13a102', startBlock: 21371853, name: 'ERC20-SWISE' },
      { address: '0x934326a86A99DaB25bB8329089ce73ed9c7c0E4a', startBlock: 34578493, name: 'ERC20-POLK' },
    ],
  },
  arbitrum: {
    apiUrl:  ETHERSCAN_V2,
    chainId: 42161,
    apiKey:  ETHERSCAN_KEY,
    contracts: [
      { address: '0x0EDB4CB0B12523749c56Ff24C4a09c0c1417f691', startBlock: 112029,  name: 'v2.1' },
      { address: '0x5D18bD4dC5f1AC8e9bD9B666Bd71cB35A327C4A9', startBlock: 459973,  name: 'v3.0' },
    ],
  },
  sepolia: {
    apiUrl:  ETHERSCAN_V2,
    chainId: 11155111,
    apiKey:  ETHERSCAN_KEY,
    contracts: [
      { address: '0xaf33DcB6E8c5c4D9dDF579f53031b514d19449CA', startBlock: 3044431,  name: 'v3.0' },
      { address: '0xB7982f20CC159a40eba4b0eA86fd6cbA6Ff810e1', startBlock: 7898415,  name: 'v3.2' },
      { address: '0x8A5f1C6361E280348a59daC10160A88428FFBd51', startBlock: 8526475,  name: 'ERC20-BOND' },
    ],
  },
  polygon: {
    apiUrl:  ETHERSCAN_V2,
    chainId: 137,
    apiKey:  ETHERSCAN_KEY,
    contracts: [
      { address: '0xA75AE6D61Dd9d55e8153A393E2fc859c6a0FC716', startBlock: 15610082, name: 'v2.1' },
      { address: '0x60573B8DcE539aE5bF9aD7932310668997ef0428', startBlock: 18901674, name: 'v3.0' },
      { address: '0x83d3f4769a19f1b43337888b0290f5473cf508b2', startBlock: 42899867, name: 'ERC20-POLK' },
    ],
  },
  base: {
    apiUrl:  'https://base.blockscout.com/api',
    chainId: null,  // Blockscout instances are chain-specific; no chainid param needed
    apiKey:  null,
    contracts: [
      { address: '0x2F39f464d16402Ca3D8527dA89617b73DE2F60e8', startBlock: 26260675, name: 'v3.0' },
    ],
  },
  optimism: {
    apiUrl:  'https://explorer.optimism.io/api',
    chainId: null,
    apiKey:  null,
    contracts: [
      { address: '0x0eF940F7f053a2eF5D6578841072488aF0c7d89A', startBlock: 2462148, name: 'v3.0' },
    ],
  },
  unichain: {
    apiUrl:  ETHERSCAN_V2,
    chainId: 130,
    apiKey:  ETHERSCAN_KEY,
    contracts: [
      { address: '0xB920dBedE88B42aA77eE55ebcE3671132ee856fC', startBlock: 8561869, name: 'v3.0' },
    ],
  },
  // Avalanche: Snowtrace API (no key required; chainid param accepted but ignored)
  avalanche: {
    apiUrl:  'https://api.snowtrace.io/api',
    chainId: 43114,
    apiKey:  null,
    contracts: [
      { address: '0xD88cd78631Ea0D068cedB0d1357a6eabe59D7502', startBlock: 4090592, name: 'v3.0' },
    ],
  },
  // Celo: Etherscan v2 (free tier supported)
  celo: {
    apiUrl:  ETHERSCAN_V2,
    chainId: 42220,
    apiKey:  ETHERSCAN_KEY,
    contracts: [
      { address: '0x4C2863bb9969dD693Ec487bED72BDfD83C0cA5b3', startBlock: 31954377, name: 'v3.0' },
    ],
  },
  // Monad Mainnet: Etherscan v2 (free tier supported)
  monad: {
    apiUrl:  ETHERSCAN_V2,
    chainId: 143,
    apiKey:  ETHERSCAN_KEY,
    contracts: [
      { address: '0xa317A7B24d72e3C6cD55c8F244AE01398A8D97e1', startBlock: 48537242, name: 'v3.2' },
    ],
  },
  // zkSync Era: Blockscout instance (same pattern as base/optimism)
  zksync: {
    apiUrl:  'https://zksync.blockscout.com/api',
    chainId: null,
    apiKey:  null,
    contracts: [
      { address: '0xA8AC760332770FcF2056040B1f964750e4bEf808', startBlock: 9691, name: 'v3.0' },
    ],
  },
  // BNB Smart Chain: requires a free BscScan API key from https://bscscan.com/register
  // Set BSCSCAN_API_KEY in .env.local — Etherscan v2 free tier does not cover BSC.
  ...(BSCSCAN_KEY && { bnb: {
    apiUrl:  ETHERSCAN_V2,
    chainId: 56,
    apiKey:  BSCSCAN_KEY,
    contracts: [
      { address: '0xa75ae6d61dd9d55e8153a393e2fc859c6a0fc716', startBlock: 7962044,  name: 'v2.1' },
      { address: '0xa925646Cae3721731F9a8C886E5D1A7B123151B9', startBlock: 10751380, name: 'v3.0' },
      { address: '0x95f8fc16C7Bd5a5b24CaE629471c6cCC3916826A', startBlock: 13749748, name: 'ERC20-DEXE' },
    ],
  }}),
};

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
