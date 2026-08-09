// Integration test for reorg contradiction detection.
// Forks from the local mainnet erigon node (:8545), submits a real on-chain
// question and answer, syncs the indexer, then injects a contradicting event to
// prove the rollback fires end-to-end.
//
// Usage:
//   node tests/reorg-integration.js
//
// Requires: anvil in PATH, erigon on http://localhost:8545, DATABASE_URL in env.

import { spawn } from 'child_process';
import { createPublicClient, createWalletClient, http, decodeEventLog,
         parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import pg from 'pg';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { onLogNewAnswer, ReorgDetected } from '../sync.js';

const __dir = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dir, '../../ponder/.env.local') });

const ANVIL_PORT  = 19999; // distinct from website-test port 18545
const ANVIL_URL   = `http://127.0.0.1:${ANVIL_PORT}`;
const MAINNET_RPC = 'http://localhost:8545';

// Anvil default account 0 — funded on any fork
const TEST_ACCOUNT = {
  address:    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
};

// reality.eth v3.0 on mainnet
const REALITY_ADDR = '0x5b7dd1e86623548af054a4985f7fc8ccbb554e2c';
const ABI = JSON.parse(
  readFileSync(join(__dir, '../../contracts/abi/solc-0.8.6/RealityETH-3.0.abi.json'), 'utf8')
);

let anvilProc = null;
let pool      = null;

function log(...args) { console.log('[integration]', ...args); }

function fail(msg) { console.error('[FAIL]', msg); process.exit(1); }

// viem receipt logs have bigint fields; sync.js expects raw JSON-RPC hex strings
function toRawLog(l) {
  return { ...l, blockNumber: '0x' + l.blockNumber.toString(16),
                  logIndex:    '0x' + l.logIndex.toString(16) };
}

function ok(msg) { log('✓', msg); }

// ── Anvil lifecycle ────────────────────────────────────────────────────────────

async function startAnvil() {
  const ANVIL_BIN = `${process.env.HOME}/.foundry/bin/anvil`;
  anvilProc = spawn(ANVIL_BIN, [
    '--fork-url',          MAINNET_RPC,
    '--port',              String(ANVIL_PORT),
    '--chain-id',          '1',
    '--retries',           '3',
    '--silent',
  ]);
  anvilProc.on('error', e => fail(`anvil: ${e.message}`));

  // Wait until responsive
  const client = createPublicClient({ transport: http(ANVIL_URL) });
  for (let i = 0; i < 30; i++) {
    try { await client.getBlockNumber(); return; } catch { /* not ready */ }
    await new Promise(r => setTimeout(r, 300));
  }
  fail('anvil did not start in time');
}

function stopAnvil() {
  if (anvilProc) { anvilProc.kill(); anvilProc = null; }
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  log('Starting anvil fork from', MAINNET_RPC, '...');
  await startAnvil();
  log('Anvil ready');

  pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // everything rolled back at the end

    // ── 1. Create a fresh question on the forked chain ─────────────────────────
    const account    = privateKeyToAccount(TEST_ACCOUNT.privateKey);
    const publicCli  = createPublicClient({ transport: http(ANVIL_URL) });
    const walletCli  = createWalletClient({ account, transport: http(ANVIL_URL) });

    const CHAIN_ID = 1;
    const timeout  = 86400;
    const nonce    = Math.floor(Math.random() * 1_000_000); // random to avoid collisions

    // Fund the test account if needed (should already be funded on an anvil fork)
    const balance = await publicCli.getBalance({ address: TEST_ACCOUNT.address });
    if (balance === 0n) fail('test account has no ETH on the fork');

    log('Asking question...');
    const askHash = await walletCli.writeContract({
      address: REALITY_ADDR,
      abi: ABI,
      functionName: 'askQuestion',
      args: [
        0n,                        // template_id (bool)
        'Integration reorg test?', // question
        '0x0000000000000000000000000000000000000000', // arbitrator
        timeout,
        0,                         // opening_ts (immediate)
        nonce,
      ],
      value: parseEther('0.001'),
      chain: null,
    });
    const askReceipt = await publicCli.waitForTransactionReceipt({ hash: askHash });

    // Extract question_id from LogNewQuestion event
    let questionId;
    for (const l of askReceipt.logs) {
      try {
        const { eventName, args } = decodeEventLog({ abi: ABI, data: l.data, topics: l.topics, strict: false });
        if (eventName === 'LogNewQuestion') { questionId = args.question_id; break; }
      } catch { /* not this event */ }
    }
    if (!questionId) fail('LogNewQuestion not found in receipt');
    log('Question ID:', questionId);

    // ── 2. Submit first answer (the one that will be "stale" after the reorg) ──
    const bond = parseEther('0.001');
    log('Submitting answer...');
    const ansHash = await walletCli.writeContract({
      address: REALITY_ADDR,
      abi: ABI,
      functionName: 'submitAnswer',
      args: [questionId, '0x' + '00'.repeat(31) + '01', 0n],
      value: bond,
      chain: null,
    });
    const ansReceipt = await publicCli.waitForTransactionReceipt({ hash: ansHash });

    // Extract LogNewAnswer log
    let ansLog, ansArgs;
    for (const l of ansReceipt.logs) {
      try {
        const { eventName, args } = decodeEventLog({ abi: ABI, data: l.data, topics: l.topics, strict: false });
        if (eventName === 'LogNewAnswer') { ansLog = l; ansArgs = args; break; }
      } catch { /* not this event */ }
    }
    if (!ansLog) fail('LogNewAnswer not found in receipt');

    // ── 3. Seed DB with the question and the stale response ────────────────────
    const qDbId = `${REALITY_ADDR.toLowerCase()}-${questionId}`;
    const block  = Number(ansReceipt.blockNumber);
    const ts     = Number((await publicCli.getBlock({ blockNumber: ansReceipt.blockNumber })).timestamp);

    await client.query(`
      INSERT INTO reality.question (
        id, question_id, contract, chain_id, template_id, nonce, data,
        creator, arbitrator, opening_timestamp, timeout, content_hash,
        current_answer_bond, min_bond, last_bond, cumulative_bonds, bounty,
        is_pending_arbitration, arbitration_occurred, scheduled_finalization_timestamp,
        created_block, created_log_index, created_tx_hash, created_timestamp,
        updated_block, updated_timestamp
      ) VALUES (
        $1,$2,$3,$4,0,$5,'Integration reorg test?',
        $6,'0x0000000000000000000000000000000000000000',0,$7,'0xcontent',
        0,0,0,0,0,
        false,false,0,
        $8,0,$9,$10,
        $8,$10
      )
      ON CONFLICT (id) DO NOTHING
    `, [qDbId, questionId, REALITY_ADDR.toLowerCase(), CHAIN_ID,
        nonce, TEST_ACCOUNT.address.toLowerCase(), timeout,
        block - 1, askHash, ts - 1]);

    await client.query(`
      INSERT INTO reality.sync_state (chain_id, last_block) VALUES ($1, $2)
      ON CONFLICT (chain_id) DO UPDATE SET last_block = EXCLUDED.last_block
    `, [CHAIN_ID, block]);

    // Index the stale answer via the real handler (convert viem bigint fields to hex strings)
    await onLogNewAnswer(client, toRawLog(ansLog), ansArgs, CHAIN_ID, ts);
    log('Stale answer indexed at block', block, 'tx', ansHash.slice(0, 10) + '…');

    // Verify stale response is in DB
    const before = await client.query(
      `SELECT bond FROM reality.response WHERE question_id = $1`, [qDbId]);
    if (before.rows.length !== 1) fail(`expected 1 response, got ${before.rows.length}`);
    ok('Stale response present in DB');

    // ── 4. Inject the contradicting (canonical) event ──────────────────────────
    // Same question, same bond, different tx hash — exactly what a reorg produces.
    const fakeCanonicalLog = {
      ...toRawLog(ansLog),
      transactionHash: '0x' + 'cc'.repeat(32), // different tx
    };

    let caught = false;
    try {
      await onLogNewAnswer(client, fakeCanonicalLog, ansArgs, CHAIN_ID, ts + 1);
    } catch (e) {
      if (e instanceof ReorgDetected) caught = true;
      else throw e;
    }
    if (!caught) fail('ReorgDetected was not thrown');
    ok('ReorgDetected thrown correctly');

    // ── 5. Verify rollback ─────────────────────────────────────────────────────
    const after = await client.query(
      `SELECT COUNT(*) FROM reality.response WHERE question_id = $1`, [qDbId]);
    if (after.rows[0].count !== '0') fail(`expected 0 responses after rollback, got ${after.rows[0].count}`);
    ok('Stale response deleted');

    const syncRow = await client.query(
      `SELECT last_block FROM reality.sync_state WHERE chain_id = $1`, [CHAIN_ID]);
    if (Number(syncRow.rows[0].last_block) !== block - 1)
      fail(`expected sync_state.last_block = ${block - 1}, got ${syncRow.rows[0].last_block}`);
    ok(`sync_state rolled back to block ${block - 1}`);

    const qRow = await client.query(
      `SELECT cumulative_bonds, current_answer FROM reality.question WHERE id = $1`, [qDbId]);
    if (qRow.rows[0].cumulative_bonds !== '0')
      fail(`expected cumulative_bonds = 0, got ${qRow.rows[0].cumulative_bonds}`);
    if (qRow.rows[0].current_answer !== null)
      fail(`expected current_answer = null, got ${qRow.rows[0].current_answer}`);
    ok('Question state recomputed to pre-answer values');

    log('\n✅ All integration checks passed');

  } finally {
    await client.query('ROLLBACK');
    client.release();
    await pool.end();
    stopAnvil();
  }
}

main().catch(e => { console.error('Fatal:', e); stopAnvil(); process.exit(1); });
