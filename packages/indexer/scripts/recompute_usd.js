// Recomputes USD bond columns for all existing questions.
// Run this after updating token prices (update_token_prices.js) or after
// initially adding the USD columns to an existing database.
//
// Usage:
//   node scripts/recompute_usd.js

import pg from 'pg';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dir, '../../ponder/.env.local') });

const LOOKUP = JSON.parse(
  readFileSync(join(__dir, '../../contracts/generated/contract_token_lookup.json'), 'utf8')
);

function bondToUsdBigInt(bondBigInt, contractAddr, chainId) {
  const byChain = LOOKUP[String(chainId)];
  if (!byChain) return 0n;
  const info = byChain[contractAddr.toLowerCase()];
  if (!info || !info.approx_1_usd) return 0n;
  const convFactor = BigInt(Math.round(1e18 / info.approx_1_usd));
  return bondBigInt * convFactor / BigInt(10 ** info.decimals);
}

const db = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const { rows } = await db.query(`
  SELECT id, contract, chain_id,
         current_answer_bond, cumulative_bonds, bounty
  FROM reality.question
`);

console.log(`Recomputing USD values for ${rows.length} questions...`);

let updated = 0;
for (const row of rows) {
  const currentBondUsd = bondToUsdBigInt(BigInt(row.current_answer_bond), row.contract, row.chain_id).toString();
  const cumBondsUsd    = bondToUsdBigInt(BigInt(row.cumulative_bonds),    row.contract, row.chain_id).toString();
  const bountyUsd      = bondToUsdBigInt(BigInt(row.bounty),              row.contract, row.chain_id).toString();

  await db.query(`
    UPDATE reality.question SET
      current_answer_bond_usd = $1,
      cumulative_bonds_usd    = $2,
      bounty_usd              = $3
    WHERE id = $4
  `, [currentBondUsd, cumBondsUsd, bountyUsd, row.id]);
  updated++;
}

console.log(`Done. Updated ${updated} questions.`);
await db.end();
