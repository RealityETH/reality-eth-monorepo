#!/usr/bin/env node
// Backfill answer_count on all questions from the response table.
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env.local') });

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

console.log('Recomputing answer_count from response table...');

const { rows } = await pool.query(`
  UPDATE reality.question q
  SET answer_count = sub.cnt
  FROM (
    SELECT question_id, COUNT(*) AS cnt
    FROM reality.response
    GROUP BY question_id
  ) sub
  WHERE q.id = sub.question_id
  RETURNING q.id
`);

console.log(`Updated ${rows.length} questions with answer counts.`);

// Questions with no responses get 0 (the column default) — log how many those are.
const { rows: zeros } = await pool.query(`
  SELECT COUNT(*) AS cnt FROM reality.question WHERE answer_count = 0
`);
console.log(`Questions with 0 answers: ${zeros[0].cnt}`);

await pool.end();
