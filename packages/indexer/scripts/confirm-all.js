// One-shot confirmation sweep for all active chains.
// Runs bulkConfirmOldBlocks (SQL only, no RPC) then confirmBlocks (RPC hash check)
// for every chain. Safe to run alongside the daemon — does not touch sync_state.
//
// Usage:
//   node scripts/confirm-all.js [chainName ...]
//   (no args = all active chains)

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dir, '../.env.local') });

const { confirmBlocks, bulkConfirmOldBlocks, ACTIVE_CHAINS } = await import('../sync.js');

const requested = process.argv.slice(2);
const chains = requested.length
  ? Object.values(ACTIVE_CHAINS).filter(c => requested.includes(c.name))
  : Object.values(ACTIVE_CHAINS);

if (requested.length && chains.length === 0) {
  console.error('No matching chains. Available:', Object.values(ACTIVE_CHAINS).map(c => c.name).join(', '));
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

for (const chain of chains) {
  console.log(`\n── ${chain.name} (chain ${chain.chainId}) ─────────────────`);
  await bulkConfirmOldBlocks(pool, chain).catch(e =>
    console.error(`[${chain.name}] bulkConfirmOldBlocks error:`, e.message)
  );
  // Drain all unconfirmed blocks in CONFIRM_BATCH-sized passes
  for (let round = 0; round < 1000; round++) {
    const before = await pool.query(
      `SELECT COUNT(*) FROM reality.processed_block WHERE chain_id = $1 AND NOT confirmed`,
      [chain.chainId]
    );
    if (before.rows[0].count === '0') break;
    await confirmBlocks(pool, chain).catch(e =>
      console.error(`[${chain.name}] confirmBlocks error:`, e.message)
    );
  }
}

await pool.end();
console.log('\nDone.');
