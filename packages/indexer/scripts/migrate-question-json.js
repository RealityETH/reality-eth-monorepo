// One-shot migration: populate the question_json column for all existing rows.
//
// The column was added to schema.sql; sync.js now fills it for new questions.
// This script backfills existing rows by joining question with template and
// calling populatedJSONForTemplate — no resync required.
//
// Usage:
//   node scripts/migrate-question-json.js

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const __dir = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dir, '../../ponder/.env.local') });

// Import populatedJSONForTemplate from reality-eth-lib via ponder's node_modules.
const require = createRequire(join(__dir, '../../ponder/node_modules/.package-lock.json'));
const { populatedJSONForTemplate } = await import(
  join(__dir, '../../ponder/node_modules/@reality.eth/reality-eth-lib/formatters/question.js')
);
const { preloadedTemplateContents } = await import(
  join(__dir, '../../ponder/node_modules/@reality.eth/reality-eth-lib/formatters/template.js')
);

const BUILTIN_TEMPLATES = preloadedTemplateContents();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Add the column if it doesn't exist yet (idempotent).
await pool.query(`
  ALTER TABLE reality.question
  ADD COLUMN IF NOT EXISTS question_json text
`);

// Fetch all questions that still need question_json populated,
// joining with their template to get question_text.
const { rows } = await pool.query(`
  SELECT q.id, q.data, q.template_id, q.contract, q.chain_id,
         t.question_text
  FROM reality.question q
  LEFT JOIN reality.template t
    ON t.id = q.chain_id || '-' || q.contract || '-' || q.template_id::text
  WHERE q.question_json IS NULL
  ORDER BY q.created_timestamp
`);

console.log(`Backfilling question_json for ${rows.length} rows…`);

let updated = 0;
let skipped = 0;
const BATCH = 500;

for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const row of batch) {
      const tmplText = row.question_text
        ?? BUILTIN_TEMPLATES[row.template_id?.toString()]
        ?? null;

      let questionJson = null;
      if (tmplText) {
        try {
          const data = (row.data || '').replace(/\x00/g, '');
          const result = populatedJSONForTemplate(tmplText, data);
          questionJson = JSON.stringify(result);
        } catch {
          // Leave null — question data or template is malformed.
          skipped++;
          continue;
        }
      } else {
        // No template available; leave null.
        skipped++;
        continue;
      }

      await client.query(
        `UPDATE reality.question SET question_json = $1 WHERE id = $2`,
        [questionJson, row.id]
      );
      updated++;
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  if ((i + BATCH) % 5000 === 0 || i + BATCH >= rows.length) {
    console.log(`  ${Math.min(i + BATCH, rows.length)} / ${rows.length} processed`);
  }
}

await pool.end();
console.log(`Done. Updated: ${updated}, skipped (no template): ${skipped}`);
