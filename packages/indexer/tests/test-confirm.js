// One-off test: seed real block hashes from the local node into processed_block,
// run confirmBlocks, verify they come out confirmed=true.
// Uses only the local node — no Alchemy/Infura calls.
//
// Usage:
//   node tests/test-confirm.js [mainnet|sepolia]

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dir, '../../ponder/.env.local') });

const target = process.argv[2] ?? 'mainnet';
const LOCAL_URL = target === 'sepolia' ? 'http://localhost:8546' : 'http://localhost:8545';
const CHAIN_ID  = target === 'sepolia' ? 11155111 : 1;

const chain = {
  chainId:    CHAIN_ID,
  name:       target,
  narrowUrls: [LOCAL_URL],
  wideUrls:   [LOCAL_URL],
  addresses:  [],
};

const { confirmBlocks } = await import('../sync.js');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

function log(...a) { console.log('[test-confirm]', ...a); }
function fail(msg) { console.error('[FAIL]', msg); process.exit(1); }

async function rpc(method, params = []) {
  const res = await fetch(LOCAL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(`${method}: ${json.error.message}`);
  return json.result;
}

// ── 1. Fetch real block hashes from local node ────────────────────────────────
const headHex = await rpc('eth_blockNumber');
const head    = parseInt(headHex, 16);
log(`${target} head: ${head}`);

// Pick 60 blocks 200+ behind head — safely beyond CONFIRM_DEPTH (100).
// confirmBlocks processes 50 at a time so we need >50 to exercise the loop.
const START = head - 260;
const END   = head - 201;
const blockNums = Array.from({ length: END - START + 1 }, (_, i) => START + i);

log(`Fetching hashes for blocks ${START}–${END} from ${LOCAL_URL} ...`);
const blocks = await Promise.all(
  blockNums.map(n => rpc('eth_getBlockByNumber', ['0x' + n.toString(16), false]))
);
const blockHashes = Object.fromEntries(
  blockNums.map((n, i) => [n, blocks[i].hash])
);
log(`Got ${blockNums.length} block hashes`);

// ── 2. Insert as unconfirmed processed_block rows ────────────────────────────
log('Inserting test rows into processed_block (confirmed=false)...');
const client = await pool.connect();
try {
  for (const [numStr, hash] of Object.entries(blockHashes)) {
    const num = Number(numStr);
    await client.query(
      `INSERT INTO reality.processed_block (chain_id, block_number, block_hash, confirmed)
       VALUES ($1, $2, $3, false)
       ON CONFLICT (chain_id, block_number) DO UPDATE
         SET block_hash = EXCLUDED.block_hash, confirmed = false`,
      [CHAIN_ID, num, hash]
    );
  }
  log(`Inserted ${blockNums.length} rows`);

  // Verify they're in the DB as unconfirmed
  const before = await client.query(
    `SELECT COUNT(*) FROM reality.processed_block
     WHERE chain_id = $1 AND NOT confirmed AND block_number BETWEEN $2 AND $3`,
    [CHAIN_ID, START, END]
  );
  log(`Unconfirmed rows before: ${before.rows[0].count}`);
} finally {
  client.release();
}

// ── 3. Run confirmBlocks (loop until all done — batch size is 50) ─────────────
log('Running confirmBlocks...');
for (let round = 0; round < 10; round++) {
  await confirmBlocks(pool, chain);
  const remaining = await pool.query(
    `SELECT COUNT(*) FROM reality.processed_block
     WHERE chain_id = $1 AND NOT confirmed AND block_number BETWEEN $2 AND $3`,
    [CHAIN_ID, START, END]
  );
  if (remaining.rows[0].count === '0') break;
  if (round === 9) fail('confirmBlocks did not finish in 10 rounds');
}

// ── 4. Verify rows are now confirmed ─────────────────────────────────────────
const check = await pool.query(
  `SELECT
     COUNT(*) FILTER (WHERE confirmed)     AS confirmed_count,
     COUNT(*) FILTER (WHERE NOT confirmed) AS unconfirmed_count
   FROM reality.processed_block
   WHERE chain_id = $1 AND block_number BETWEEN $2 AND $3`,
  [CHAIN_ID, START, END]
);
const { confirmed_count, unconfirmed_count } = check.rows[0];
log(`After: confirmed=${confirmed_count}, still_unconfirmed=${unconfirmed_count}`);

if (Number(confirmed_count) !== blockNums.length)
  fail(`Expected ${blockNums.length} confirmed, got ${confirmed_count}`);
if (Number(unconfirmed_count) !== 0)
  fail(`Expected 0 unconfirmed, got ${unconfirmed_count}`);

log('✓ All blocks confirmed correctly');

// ── 5. Clean up ───────────────────────────────────────────────────────────────
log('Cleaning up test rows...');
await pool.query(
  `DELETE FROM reality.processed_block WHERE chain_id = $1 AND block_number BETWEEN $2 AND $3`,
  [CHAIN_ID, START, END]
);
log('Done.');
await pool.end();
