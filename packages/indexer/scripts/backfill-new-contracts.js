#!/usr/bin/env node
// Finds contracts in active-chains.json that have no log events in the DB,
// rolls the chain's last_block back to the earliest such contract's deploy block,
// and sends SIGHUP to the indexer to reload.

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const __dir = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dir, '../.env.local') });

const CHAINS_FILE    = join(__dir, '../active-chains.json');
const CONTRACTS_FILE = join(__dir, '../../contracts/generated/contracts.json');
const PID_FILE       = join(__dir, '../sync.pid');

const chains    = JSON.parse(readFileSync(CHAINS_FILE, 'utf8'));
const contracts = JSON.parse(readFileSync(CONTRACTS_FILE, 'utf8'));

// Build lookup: lowercase address → deploy block, keyed by chain id
// contracts.json: { chainId: { token: { version: { address, block } } } }
const deployBlock = {}; // chainId → { address → block }
for (const [chainId, tokens] of Object.entries(contracts)) {
  for (const versions of Object.values(tokens)) {
    for (const info of Object.values(versions)) {
      if (!info.address || !info.block) continue;
      if (!deployBlock[chainId]) deployBlock[chainId] = {};
      deployBlock[chainId][info.address.toLowerCase()] = info.block;
    }
  }
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  let anyAdjusted = false;

  // Chains whose nodes don't retain old logs — skip backfill, would always fail
  const NO_HISTORY = new Set([56]); // BNB

  for (const chain of chains) {
    const chainId   = chain.id;
    const chainName = chain.name;

    if (NO_HISTORY.has(chainId)) {
      console.log(`[${chainName}] skipping — node does not retain old logs`);
      continue;
    }
    const addrMap   = deployBlock[String(chainId)] ?? {};

    // Find current last_block for this chain
    const stateRes = await pool.query(
      `SELECT last_block FROM reality.sync_state WHERE chain_id = $1`,
      [chainId]
    );
    const currentLastBlock = stateRes.rows.length ? Number(stateRes.rows[0].last_block) : null;

    // For each address on this chain, check if any log events exist
    let earliestMissingBlock = null;
    for (const addr of chain.addresses) {
      const lower = addr.toLowerCase();

      // Check questions, responses, templates — any event referencing this contract
      const tRes = await pool.query(
        `SELECT 1 FROM reality.template WHERE contract = $1 LIMIT 1`, [lower]
      );
      if (tRes.rows.length > 0) continue; // has data, skip

      const deployedAt = addrMap[lower];
      if (!deployedAt) {
        console.log(`  [${chainName}] ${addr} — no events, but no deploy block in contracts.json (skipping)`);
        continue;
      }

      console.log(`  [${chainName}] ${addr} — no events, deployed at block ${deployedAt}`);
      if (earliestMissingBlock === null || deployedAt < earliestMissingBlock) {
        earliestMissingBlock = deployedAt;
      }
    }

    if (earliestMissingBlock === null) {
      console.log(`[${chainName}] all contracts have events — no adjustment needed`);
      continue;
    }

    // Roll last_block back to one before the earliest missing deploy block
    const newLastBlock = earliestMissingBlock - 1;

    if (currentLastBlock !== null && currentLastBlock <= newLastBlock) {
      console.log(`[${chainName}] last_block ${currentLastBlock} is already at or before deploy block — no adjustment needed`);
      continue;
    }

    console.log(`[${chainName}] rolling last_block from ${currentLastBlock ?? '(none)'} → ${newLastBlock}`);
    await pool.query(
      `INSERT INTO reality.sync_state (chain_id, last_block) VALUES ($1, $2)
       ON CONFLICT (chain_id) DO UPDATE SET last_block = EXCLUDED.last_block`,
      [chainId, newLastBlock]
    );
    anyAdjusted = true;
  }

  await pool.end();

  if (!anyAdjusted) {
    console.log('\nNo adjustments made — indexer reload not needed.');
    return;
  }

  // Send SIGHUP to indexer
  let pid;
  try {
    pid = parseInt(readFileSync(PID_FILE, 'utf8').trim(), 10);
  } catch {
    console.log('\nCould not read sync.pid — start the indexer manually or send SIGHUP yourself.');
    return;
  }

  try {
    process.kill(pid, 'SIGHUP');
    console.log(`\nSent SIGHUP to indexer (pid ${pid}) — it will reload and rescan from the adjusted blocks.`);
  } catch (e) {
    console.log(`\nFailed to signal pid ${pid}: ${e.message}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
