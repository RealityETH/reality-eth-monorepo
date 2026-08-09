// Unit tests for reorg contradiction detection.
// Everything runs inside a DB transaction that is always rolled back, so no
// production data is touched.  Uses fake chain_id 9999 to avoid collisions.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { onLogNewAnswer, recomputeQuestionState, ReorgDetected } from '../sync.js';

const __dir = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dir, '../../ponder/.env.local') });

const CHAIN_ID   = 9999;                                         // fake — no production collision
const CONTRACT   = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
const QUESTION_H = '0x' + '11'.repeat(32);                      // fake bytes32 question_id
const Q_ID       = `${CONTRACT}-${QUESTION_H}`;                 // DB id field
const ZERO_HASH  = '0x' + '00'.repeat(32);
const YES        = '0x' + '00'.repeat(31) + '01';

let pool;
before(() => { pool = new pg.Pool({ connectionString: process.env.DATABASE_URL }); });
after(async () => pool.end());

// ── helpers ────────────────────────────────────────────────────────────────────

function makeLog(txHash, blockNum, logIdx = 0) {
  return {
    address:         CONTRACT,
    blockNumber:     '0x' + blockNum.toString(16),
    logIndex:        '0x' + logIdx.toString(16),
    transactionHash: txHash,
  };
}

function makeArgs({ answer = YES, bond = 1_000n, ts = 1_700_000_000n,
                    historyHash = ZERO_HASH, isCommitment = false } = {}) {
  return {
    question_id:  QUESTION_H,
    answer,
    history_hash: historyHash,
    user:         '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    bond,
    ts,
    is_commitment: isCommitment,
  };
}

async function insertQuestion(db, { timeout = 86400n } = {}) {
  await db.query(`
    INSERT INTO reality.question (
      id, question_id, contract, chain_id, template_id, nonce, data,
      creator, arbitrator, opening_timestamp, timeout, content_hash,
      current_answer_bond, min_bond, last_bond, cumulative_bonds, bounty,
      is_pending_arbitration, arbitration_occurred, scheduled_finalization_timestamp,
      created_block, created_log_index, created_tx_hash, created_timestamp,
      updated_block, updated_timestamp
    ) VALUES (
      $1,$2,$3,$4, 0,0,'test data',
      '0xaaaa','0xbbbb', 0,$5,'0xcontent',
      0,0,0,0,0,
      false,false,0,
      1,0,'0xgenesis',1000000,
      1,1000000
    )
    ON CONFLICT (id) DO NOTHING
  `, [Q_ID, QUESTION_H, CONTRACT, CHAIN_ID, timeout.toString()]);
}

// ── tests ──────────────────────────────────────────────────────────────────────

test('normal answer is inserted and question state updated', async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await insertQuestion(client);

    const log  = makeLog('0x' + 'aa'.repeat(32), 100);
    const args = makeArgs({ bond: 1000n, ts: 1_700_000_100n });
    await onLogNewAnswer(client, log, args, CHAIN_ID, 1_700_000_100);

    const r = await client.query(`SELECT bond FROM reality.response WHERE question_id = $1`, [Q_ID]);
    assert.equal(r.rows.length, 1);
    assert.equal(r.rows[0].bond, '1000');

    const q = await client.query(`SELECT cumulative_bonds, current_answer FROM reality.question WHERE id = $1`, [Q_ID]);
    assert.equal(q.rows[0].cumulative_bonds, '1000');
    assert.equal(q.rows[0].current_answer, YES);
  } finally {
    await client.query('ROLLBACK');
    client.release();
  }
});

test('replay of same event (same tx hash) is ignored', async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await insertQuestion(client);

    const log  = makeLog('0x' + 'aa'.repeat(32), 100);
    const args = makeArgs({ bond: 1000n });
    await onLogNewAnswer(client, log, args, CHAIN_ID, 1_700_000_100);
    await onLogNewAnswer(client, log, args, CHAIN_ID, 1_700_000_100); // replay

    const r = await client.query(`SELECT COUNT(*) FROM reality.response WHERE question_id = $1`, [Q_ID]);
    assert.equal(r.rows[0].count, '1'); // only one row despite two calls
  } finally {
    await client.query('ROLLBACK');
    client.release();
  }
});

test('contradiction throws ReorgDetected and rolls back stale response', async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await insertQuestion(client);
    await client.query(
      `INSERT INTO reality.sync_state (chain_id, last_block) VALUES ($1, $2)
       ON CONFLICT (chain_id) DO UPDATE SET last_block = EXCLUDED.last_block`,
      [CHAIN_ID, 100]
    );

    // Stale response: block 100, tx = tx1, bond = 1000
    const staleLog  = makeLog('0x' + 'a1'.repeat(32), 100);
    const staleArgs = makeArgs({ bond: 1000n, ts: 1_700_000_000n });
    await onLogNewAnswer(client, staleLog, staleArgs, CHAIN_ID, 1_700_000_000);

    // Canonical response arrives: same question, same bond, different tx (reorg signal)
    const canonLog  = makeLog('0x' + 'b2'.repeat(32), 100);
    const canonArgs = makeArgs({ bond: 1000n, ts: 1_700_000_001n,
                                 historyHash: '0x' + 'cc'.repeat(32) });

    await assert.rejects(
      () => onLogNewAnswer(client, canonLog, canonArgs, CHAIN_ID, 1_700_000_001),
      ReorgDetected
    );

    // Stale response deleted, canonical not yet inserted (thrown before insert)
    const r = await client.query(`SELECT COUNT(*) FROM reality.response WHERE question_id = $1`, [Q_ID]);
    assert.equal(r.rows[0].count, '0');

    // sync_state rolled back to block 99
    const s = await client.query(`SELECT last_block FROM reality.sync_state WHERE chain_id = $1`, [CHAIN_ID]);
    assert.equal(Number(s.rows[0].last_block), 99);

    // Question state reset (no responses remain)
    const q = await client.query(`SELECT cumulative_bonds, current_answer FROM reality.question WHERE id = $1`, [Q_ID]);
    assert.equal(q.rows[0].cumulative_bonds, '0');
    assert.equal(q.rows[0].current_answer, null);
  } finally {
    await client.query('ROLLBACK');
    client.release();
  }
});

test('rollback only removes responses at or after conflict block, earlier ones survive', async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await insertQuestion(client);

    // Block 50: first answer at bond 500 — pre-reorg, canonical on both branches
    const log1  = makeLog('0x' + 'a0'.repeat(32), 50);
    const args1 = makeArgs({ bond: 500n, ts: 1_700_000_000n, historyHash: '0x' + '11'.repeat(32) });
    await onLogNewAnswer(client, log1, args1, CHAIN_ID, 1_700_000_000);

    // Block 100: stale answer at bond 1000 (tx1)
    const log2  = makeLog('0x' + 'a1'.repeat(32), 100);
    const args2 = makeArgs({ bond: 1000n, ts: 1_700_000_100n, historyHash: '0x' + '22'.repeat(32) });
    await onLogNewAnswer(client, log2, args2, CHAIN_ID, 1_700_000_100);

    // Block 100: canonical answer at bond 1000 (tx2) → contradiction
    const log3  = makeLog('0x' + 'b2'.repeat(32), 100);
    const args3 = makeArgs({ bond: 1000n, ts: 1_700_000_101n, historyHash: '0x' + '33'.repeat(32) });
    await assert.rejects(
      () => onLogNewAnswer(client, log3, args3, CHAIN_ID, 1_700_000_101),
      ReorgDetected
    );

    // Block-50 response must still be present
    const r = await client.query(
      `SELECT bond FROM reality.response WHERE question_id = $1`, [Q_ID]);
    assert.equal(r.rows.length, 1);
    assert.equal(r.rows[0].bond, '500');

    // Question state recomputed from the surviving block-50 response
    const q = await client.query(
      `SELECT cumulative_bonds, current_answer_bond FROM reality.question WHERE id = $1`, [Q_ID]);
    assert.equal(q.rows[0].cumulative_bonds, '500');
    assert.equal(q.rows[0].current_answer_bond, '500');
  } finally {
    await client.query('ROLLBACK');
    client.release();
  }
});

test('rollback un-reveals commitment responses whose reveal was in the reorged range', async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await insertQuestion(client);
    await client.query(
      `INSERT INTO reality.sync_state (chain_id, last_block) VALUES ($1, $2)
       ON CONFLICT (chain_id) DO UPDATE SET last_block = EXCLUDED.last_block`,
      [CHAIN_ID, 100]
    );

    // Insert a commitment response at block 50 (pre-reorg), already revealed at block 100
    const commitId = `${Q_ID}-commit1`;
    await client.query(`
      INSERT INTO reality.response
        (id, question_id, answer, commitment_hash, bond, "user",
         history_hash, is_commitment, is_unrevealed, timestamp,
         created_block, created_log_index, created_tx_hash, revealed_block)
      VALUES ($1,$2,$3,$4,'1000','0xaaaa','${ZERO_HASH}',true,false,'1700000000',50,0,'0xtx-commit',100)
    `, [commitId, Q_ID, YES, '0x' + 'ab'.repeat(32)]);

    // Also index a plain answer at block 100 (the stale response)
    const staleLog  = makeLog('0x' + 'a1'.repeat(32), 100);
    const staleArgs = makeArgs({ bond: 2000n, ts: 1_700_000_100n });
    await onLogNewAnswer(client, staleLog, staleArgs, CHAIN_ID, 1_700_000_100);

    // Canonical contradicting answer at block 100 triggers reorg
    const canonLog  = makeLog('0x' + 'b2'.repeat(32), 100);
    const canonArgs = makeArgs({ bond: 2000n, ts: 1_700_000_101n });
    await assert.rejects(
      () => onLogNewAnswer(client, canonLog, canonArgs, CHAIN_ID, 1_700_000_101),
      ReorgDetected
    );

    // Commitment row survives (created_block=50 < conflictBlock=100) but must be un-revealed
    const r = await client.query(
      `SELECT answer, is_unrevealed, revealed_block FROM reality.response WHERE id = $1`,
      [commitId]
    );
    assert.equal(r.rows.length, 1, 'commitment row must survive');
    assert.equal(r.rows[0].answer, null,     'answer must be null after un-reveal');
    assert.equal(r.rows[0].is_unrevealed, true, 'is_unrevealed must be true after un-reveal');
    assert.equal(r.rows[0].revealed_block, null, 'revealed_block must be null after un-reveal');
  } finally {
    await client.query('ROLLBACK');
    client.release();
  }
});

test('recomputeQuestionState rebuilds cumulative_bonds and scheduled_finalization_timestamp', async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const TIMEOUT = 86400n;
    await insertQuestion(client, { timeout: TIMEOUT });

    // Insert two responses directly, bypassing the handler
    await client.query(`
      INSERT INTO reality.response
        (id, question_id, answer, commitment_hash, bond, "user",
         history_hash, is_commitment, is_unrevealed, timestamp,
         created_block, created_log_index, created_tx_hash)
      VALUES
        ('${Q_ID}-r1','${Q_ID}','${YES}',null,'500','0xaaaa','${ZERO_HASH}',false,false,'1700000000',50,0,'0xtx1'),
        ('${Q_ID}-r2','${Q_ID}','${YES}',null,'1000','0xaaaa','${ZERO_HASH}',false,false,'1700001000',100,0,'0xtx2')
    `);

    await recomputeQuestionState(client, Q_ID);

    const q = await client.query(
      `SELECT cumulative_bonds, current_answer_bond, scheduled_finalization_timestamp
       FROM reality.question WHERE id = $1`, [Q_ID]);
    assert.equal(q.rows[0].cumulative_bonds, '1500');
    assert.equal(q.rows[0].current_answer_bond, '1000');
    assert.equal(q.rows[0].scheduled_finalization_timestamp,
                 String(1700001000n + TIMEOUT));
  } finally {
    await client.query('ROLLBACK');
    client.release();
  }
});
