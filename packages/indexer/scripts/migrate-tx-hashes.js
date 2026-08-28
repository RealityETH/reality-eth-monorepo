// One-shot migration: add revealed_tx_hash to response and created_tx_hash to claim.
//
// Both columns were added to schema.sql; sync.js now fills them for new events.
// This script backfills existing rows — no resync required.
//
// claim.created_tx_hash: extracted from the existing id column, which has the
// format "{contract}-{questionId}-{txHash}-{logIndex}".
//
// response.revealed_tx_hash: cannot be backfilled from stored data — the reveal
// tx hash was never persisted. Existing unrevealed→revealed rows will remain NULL.
// Only reveals processed after this migration will have the field populated.
//
// Usage:
//   node scripts/migrate-tx-hashes.js

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dir, '../.env.local') });

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

try {
  await client.query('BEGIN');

  // 1. Add revealed_tx_hash to response (nullable; historical reveals can't be backfilled)
  await client.query(`
    ALTER TABLE reality.response
      ADD COLUMN IF NOT EXISTS revealed_tx_hash text
  `);
  console.log('Added response.revealed_tx_hash');

  // 2. Add created_tx_hash to claim (nullable for migration; NOT NULL in schema for new DBs)
  await client.query(`
    ALTER TABLE reality.claim
      ADD COLUMN IF NOT EXISTS created_tx_hash text
  `);
  console.log('Added claim.created_tx_hash');

  // 3. Backfill claim.created_tx_hash from the id column.
  //    id format: "{contract}-{questionId}-{txHash}-{logIndex}"
  //    SPLIT_PART(..., '-', 3) extracts the third dash-delimited segment = txHash.
  const { rowCount } = await client.query(`
    UPDATE reality.claim
      SET created_tx_hash = SPLIT_PART(id, '-', 3)
      WHERE created_tx_hash IS NULL
  `);
  console.log(`Backfilled created_tx_hash for ${rowCount} claim rows`);

  await client.query('COMMIT');
  console.log('Migration complete.');
} catch (err) {
  await client.query('ROLLBACK');
  console.error('Migration failed, rolled back:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
