// seed.js — Bootstrap reality.* tables from ponder's existing indexed data.
// Run once before starting sync.js. Safe to re-run: questions and templates use
// ON CONFLICT DO UPDATE so re-seeding refreshes stale derived state.
import pg from 'pg';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dir, '../ponder/.env.local') });

// Accept chain IDs as CLI args; default to mainnet + gnosis.
const CHAIN_IDS = process.argv.slice(2).length
  ? process.argv.slice(2).map(Number)
  : [1, 100];

// Map chain_id → ponder meta chain name (used to read sync position from _ponder_meta).
const CHAIN_META_NAME = { 1: 'mainnet', 100: 'gnosis', 137: 'polygon',
  42161: 'arbitrum', 10: 'optimism', 8453: 'base', 130: 'unichain',
  11155111: 'sepolia' };

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    console.log('Applying schema...');
    await client.query(readFileSync(join(__dir, 'schema.sql'), 'utf8'));

    // Read ponder's live sync position.
    const liveRow = await client.query(`SELECT value FROM _ponder_meta WHERE key = 'live'`);
    if (!liveRow.rows.length) throw new Error('_ponder_meta missing — is ponder configured?');
    const { instance_id } = liveRow.rows[0].value;
    const statusRow = await client.query(
      `SELECT value FROM _ponder_meta WHERE key = $1`,
      [`status_${instance_id}`]
    );
    const status = statusRow.rows[0].value;

    for (const chainId of CHAIN_IDS) {
      const metaName = CHAIN_META_NAME[chainId];
      if (!metaName) throw new Error(`Unknown chain ID ${chainId}`);
      const lastBlock = status[metaName]?.block?.number;
      if (!lastBlock) throw new Error(`No ${metaName} block in ponder status`);
      console.log(`\nSeeding chain ${chainId} (${metaName}), ponder at block ${lastBlock}...`);

      await client.query('BEGIN');

      const tRes = await client.query(`
        INSERT INTO reality.template (
          id, template_id, contract, chain_id, "user", question_text,
          created_block, created_log_index, created_tx_hash, created_timestamp
        )
        SELECT id, template_id, contract, chain_id, "user", question_text,
               created_block, created_log_index, created_tx_hash, created_timestamp
        FROM public.template WHERE chain_id = $1
        ON CONFLICT (id) DO NOTHING
      `, [chainId]);
      console.log(`  templates: ${tRes.rowCount}`);

      const qRes = await client.query(`
        INSERT INTO reality.question (
          id, question_id, contract, chain_id, template_id, nonce, data, title, type,
          category, lang, outcomes, creator, arbitrator, opening_timestamp, timeout,
          content_hash, current_answer, current_answer_bond, current_answer_timestamp,
          history_hash, min_bond, last_bond, cumulative_bonds, bounty,
          is_pending_arbitration, arbitration_occurred, arbitration_requested_timestamp,
          arbitration_requested_by, answer_finalized_timestamp,
          scheduled_finalization_timestamp, reopens_question_id,
          created_block, created_log_index, created_tx_hash, created_timestamp,
          updated_block, updated_timestamp
        )
        SELECT
          id, question_id, contract, chain_id, template_id, nonce, data, title, type,
          category, lang, outcomes, creator, arbitrator, opening_timestamp, timeout,
          content_hash, current_answer, current_answer_bond, current_answer_timestamp,
          history_hash, min_bond, last_bond, cumulative_bonds, bounty,
          is_pending_arbitration, arbitration_occurred, arbitration_requested_timestamp,
          arbitration_requested_by, answer_finalized_timestamp,
          scheduled_finalization_timestamp, reopens_question_id,
          created_block, created_log_index, created_tx_hash, created_timestamp,
          updated_block, updated_timestamp
        FROM public.question WHERE chain_id = $1
        ON CONFLICT (id) DO UPDATE SET
          current_answer                   = EXCLUDED.current_answer,
          current_answer_bond              = EXCLUDED.current_answer_bond,
          current_answer_timestamp         = EXCLUDED.current_answer_timestamp,
          history_hash                     = EXCLUDED.history_hash,
          min_bond                         = EXCLUDED.min_bond,
          last_bond                        = EXCLUDED.last_bond,
          cumulative_bonds                 = EXCLUDED.cumulative_bonds,
          bounty                           = EXCLUDED.bounty,
          is_pending_arbitration           = EXCLUDED.is_pending_arbitration,
          arbitration_occurred             = EXCLUDED.arbitration_occurred,
          arbitration_requested_timestamp  = EXCLUDED.arbitration_requested_timestamp,
          arbitration_requested_by         = EXCLUDED.arbitration_requested_by,
          answer_finalized_timestamp       = EXCLUDED.answer_finalized_timestamp,
          scheduled_finalization_timestamp = EXCLUDED.scheduled_finalization_timestamp,
          updated_block                    = EXCLUDED.updated_block,
          updated_timestamp                = EXCLUDED.updated_timestamp
      `, [chainId]);
      console.log(`  questions: ${qRes.rowCount}`);

      const rRes = await client.query(`
        INSERT INTO reality.response (
          id, question_id, answer, commitment_hash, bond, "user",
          history_hash, is_commitment, is_unrevealed, timestamp,
          created_block, created_log_index, created_tx_hash, revealed_block
        )
        SELECT r.id, r.question_id, r.answer, r.commitment_hash, r.bond, r."user",
               r.history_hash, r.is_commitment, r.is_unrevealed, r.timestamp,
               r.created_block, r.created_log_index, r.created_tx_hash, r.revealed_block
        FROM public.response r
        JOIN public.question q ON r.question_id = q.id
        WHERE q.chain_id = $1
        ON CONFLICT (id) DO NOTHING
      `, [chainId]);
      console.log(`  responses: ${rRes.rowCount}`);

      const cRes = await client.query(`
        INSERT INTO reality.claim (id, question_id, "user", amount, created_block, created_timestamp)
        SELECT c.id, c.question_id, c."user", c.amount, c.created_block, c.created_timestamp
        FROM public.claim c
        JOIN public.question q ON c.question_id = q.id
        WHERE q.chain_id = $1
        ON CONFLICT (id) DO NOTHING
      `, [chainId]);
      console.log(`  claims:    ${cRes.rowCount}`);

      await client.query(`
        INSERT INTO reality.sync_state (chain_id, last_block) VALUES ($1, $2)
        ON CONFLICT (chain_id) DO UPDATE SET last_block = EXCLUDED.last_block
      `, [chainId, lastBlock]);

      await client.query('COMMIT');
      console.log(`  → sync.js will start from block ${lastBlock + 1}`);
    }
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
