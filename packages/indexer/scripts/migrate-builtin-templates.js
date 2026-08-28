// One-shot migration: fetch and store built-in template (0-4) events that were
// emitted at contract deployment but never indexed.
//
// Root cause: several contracts had startBlock set to deploymentBlock+1 in
// fetch-event-blocks.js, causing the deployment block to be excluded from the
// sparse index and never scanned. Fixed in fetch-event-blocks.js; this script
// backfills the missing templates for contracts already past their startBlock.
// Idempotent: ON CONFLICT DO NOTHING.
//
// Usage:
//   node scripts/migrate-builtin-templates.js

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { decodeEventLog } from 'viem';
import { readFileSync } from 'fs';

const __dir = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dir, '../.env.local') });

const ABI = JSON.parse(readFileSync(join(__dir, '../../contracts/abi/solc-0.8.6/RealityETH-3.2.abi.json'), 'utf8'));

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Contracts where built-in templates were emitted at deployment but are missing
// from the DB because startBlock was set to deploymentBlock+1. Each entry
// specifies the actual deployment block to fetch.
const TARGETS = [
  // BNB: sparse index seeded at correct deployment blocks but sync_state was
  // pre-seeded past them, so these blocks were never scanned.
  { chainId: 56, name: 'bnb',      contract: '0xa75ae6d61dd9d55e8153a393e2fc859c6a0fc716', deployBlock: 7_962_044,  rpcEnv: 'PONDER_RPC_URL_56' },
  { chainId: 56, name: 'bnb',      contract: '0xa925646cae3721731f9a8c886e5d1a7b123151b9', deployBlock: 10_751_380, rpcEnv: 'PONDER_RPC_URL_56' },
  // Mainnet ERC20 contracts: startBlock was deploymentBlock+1 in fetch-event-blocks.js,
  // so their deployment blocks were never added to the sparse index.
  { chainId: 1,  name: 'mainnet',  contract: '0x8f1CC53bf34932591177CDA24723486205CA7510', deployBlock: 12_654_676, rpcEnv: 'PONDER_RPC_URL_1' },
  { chainId: 1,  name: 'mainnet',  contract: '0x867092A32bC16816F12Fb326EfF7A2865E1ec138', deployBlock: 14_485_576, rpcEnv: 'PONDER_RPC_URL_1' },
  // Optimism: same off-by-one issue, but eth_getLogs fails for old blocks on the
  // Alchemy free tier. Use the deployment tx receipt instead — same log structure.
  { chainId: 10, name: 'optimism', contract: '0x0eF940F7f053a2eF5D6578841072488aF0c7d89A', deployBlock: 2_462_148, rpcEnv: 'PONDER_RPC_URL_10',
    deployTx: '0x0341e95512495a7438215b3c305ddd850e797547e93f3c4a281e0cfb468f2024' },
  // Arbitrum: now fixed via sync_state reset + one-shot sync; entry retained as no-op.
  { chainId: 42161, name: 'arbitrum', contract: '0x5D18bD4dC5f1AC8e9bD9B666Bd71cB35A327C4A9', deployBlock: 459_973, rpcEnv: 'PONDER_RPC_URL_42161' },
];

const LOG_NEW_TEMPLATE_TOPIC = '0xb87fb721c0a557bb8dff89a86796466931d82ba530a66a239263eb8735ade2e4';
const tmplKey = (cid, addr, tid) => `${cid}-${addr.toLowerCase()}-${tid}`;

async function jsonrpc(url, method, params, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      });
      const r = await resp.json();
      if (r.error) throw new Error(`${method}: ${JSON.stringify(r.error)}`);
      return r.result;
    } catch (e) {
      if (attempt === retries) throw e;
      console.log(`  Retry ${attempt}/${retries} after error: ${e.message}`);
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }
}

let totalInserted = 0;

for (const target of TARGETS) {
  const rpcUrl = process.env[target.rpcEnv];
  if (!rpcUrl) {
    console.error(`Missing env var ${target.rpcEnv}, skipping ${target.contract}`);
    continue;
  }

  const blockHex = '0x' + target.deployBlock.toString(16);
  console.log(`\n[${target.name}] ${target.contract} — fetching block ${target.deployBlock}...`);

  let logs;
  try {
    if (target.deployTx) {
      const receipt = await jsonrpc(rpcUrl, 'eth_getTransactionReceipt', [target.deployTx]);
      logs = receipt.logs.filter(l =>
        l.address.toLowerCase() === target.contract.toLowerCase() &&
        l.topics[0] === LOG_NEW_TEMPLATE_TOPIC
      );
    } else {
      logs = await jsonrpc(rpcUrl, 'eth_getLogs', [{
        address: target.contract,
        fromBlock: blockHex,
        toBlock: blockHex,
        topics: [LOG_NEW_TEMPLATE_TOPIC],
      }]);
    }
  } catch (e) {
    console.error(`  RPC error — skipping: ${e.message}`);
    continue;
  }

  if (logs.length === 0) {
    console.log(`  No LogNewTemplate events found — nothing to insert`);
    continue;
  }

  const block = await jsonrpc(rpcUrl, 'eth_getBlockByNumber', [blockHex, false]);
  const blockTs = parseInt(block.timestamp, 16);

  let inserted = 0;
  for (const log of logs) {
    const { args } = decodeEventLog({ abi: ABI, data: log.data, topics: log.topics, eventName: 'LogNewTemplate' });
    const addr = log.address.toLowerCase();
    const key  = tmplKey(target.chainId, addr, args.template_id);

    const res = await pool.query(`
      INSERT INTO reality.template
        (id, template_id, contract, chain_id, "user", question_text,
         created_block, created_log_index, created_tx_hash, created_timestamp)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      ON CONFLICT (id) DO NOTHING
    `, [
      key,
      args.template_id.toString(),
      addr,
      target.chainId,
      args.user.toLowerCase(),
      args.question_text.replace(/\x00/g, ''),
      target.deployBlock,
      parseInt(log.logIndex, 16),
      log.transactionHash,
      blockTs,
    ]);
    if (res.rowCount > 0) {
      console.log(`  Inserted template_id=${args.template_id}`);
      inserted++;
    } else {
      console.log(`  template_id=${args.template_id} already exists — skipped`);
    }
  }
  console.log(`  ${inserted}/${logs.length} inserted for ${target.contract}`);
  totalInserted += inserted;
}

await pool.end();
console.log(`\nDone. Total inserted: ${totalInserted}`);
