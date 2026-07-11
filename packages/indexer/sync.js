// sync.js — Reality.eth event indexer: catch-up and ongoing sync.
// Reads sync state from reality.sync_state, fetches events via eth_getLogs,
// updates reality.question / response / template / claim tables.
import { decodeEventLog, keccak256, encodePacked } from 'viem';
import pg from 'pg';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { createRequire } from 'module';

const __dir = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dir, '../ponder/.env.local') });

// CJS imports via createRequire (reality-eth-lib ships CommonJS)
const _require = createRequire(import.meta.url);
const { populatedJSONForTemplate } =
  _require('@reality.eth/reality-eth-lib/formatters/question.js');
const { preloadedTemplateContents } =
  _require('@reality.eth/reality-eth-lib/formatters/template.js');
const BUILTIN_TEMPLATES = preloadedTemplateContents();

const ABI = JSON.parse(
  readFileSync(join(__dir, '../contracts/abi/solc-0.8.6/RealityETH-3.2.abi.json'), 'utf8')
);

const POLL_MS          = Number(process.env.POLL_MS)          || 30_000;
const LAZY_INTERVAL_MS = Number(process.env.LAZY_INTERVAL_MS) || 24 * 60 * 60 * 1000;
const CONFIG_PATH      = join(__dir, 'sync-config.json');
const PID_PATH         = join(__dir, 'sync.pid');

let chainModes     = {}; // chainId (number) → 'active' | 'lazy'
let lastLazySyncAt = {}; // chainId → Date.now() of last completed lazy sync
const pendingRefresh = new Set(); // chainIds needing sparse index refresh before next sync

function loadConfig() {
  try {
    const cfg  = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
    const next = {};
    for (const [id, c] of Object.entries(cfg.chains || {})) {
      next[Number(id)] = c.mode || 'active';
    }
    for (const [id, mode] of Object.entries(next)) {
      if (mode === 'active' && chainModes[Number(id)] === 'lazy') {
        lastLazySyncAt[Number(id)] = 0; // force immediate sync on lazy→active transition
        pendingRefresh.add(Number(id));
      }
    }
    chainModes = next;
    console.log('Config loaded:', Object.entries(chainModes).map(([id, m]) => `${id}:${m}`).join(' '));
  } catch {
    // No config or parse error; all chains default to active.
  }
}

const FETCH_EVENT_BLOCKS = join(__dir, '../ponder/scripts/fetch-event-blocks.js');

async function refreshSparseIndex(chain) {
  console.log(`[${chain.name}] refreshing sparse index...`);
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [FETCH_EVENT_BLOCKS, chain.name], {
      stdio: 'inherit',
      env: process.env,
    });
    child.on('exit', code =>
      code === 0 ? resolve() : reject(new Error(`fetch-event-blocks exited ${code}`))
    );
  });
  SPARSE = loadSparseIndex();
  console.log(`[${chain.name}] sparse index reloaded`);
}

// ── Sparse block index ─────────────────────────────────────────────────────────
// Reuses ponder's known-event-blocks.json and known-event-blocks-meta.json.
// For historical ranges (below the HWM), if no known event block falls in the
// batch we skip the getLogs call entirely — avoiding ~99% of RPC calls on sparse
// chains. Above the HWM, getLogs is always called (live events not yet indexed).

function loadSparseIndex() {
  try {
    const blocks = JSON.parse(readFileSync(join(__dir, '../ponder/known-event-blocks.json'), 'utf8'));
    const meta   = JSON.parse(readFileSync(join(__dir, '../ponder/known-event-blocks-meta.json'), 'utf8'));
    // Compute min HWM per chain (worst-case across contracts)
    const hwm = Object.fromEntries(
      Object.entries(meta).map(([chain, contracts]) => [
        chain, Math.min(...Object.values(contracts)),
      ])
    );
    console.log('Sparse block index loaded:', Object.entries(blocks).map(
      ([c, b]) => `${c}:${b.length}`).join(' '));
    return { blocks, hwm };
  } catch {
    console.log('No sparse block index found — all ranges will use getLogs');
    return { blocks: {}, hwm: {} };
  }
}

let SPARSE = loadSparseIndex();

// Binary search: returns true if any known event block falls in [from, to].
function hasKnownBlock(sorted, from, to) {
  let lo = 0, hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] < from) lo = mid + 1; else hi = mid;
  }
  return lo < sorted.length && sorted[lo] <= to;
}

// ── Chain configuration ────────────────────────────────────────────────────────
// batchSize: proven getLogs range for each chain's wide (Infura/public) URL.
// Override per chain via BATCH_SIZE_{chainId} env var.

function mkChain(id, name, batchDefault, startBlock, addresses) {
  const narrow = process.env[`PONDER_RPC_URL_${id}`];
  const wide   = process.env[`PONDER_RPC_URL_${id}_WIDE`] || narrow;
  if (!narrow) return null;
  return {
    chainId: id, name,
    narrowUrl: narrow, wideUrl: wide,
    batchSize: Number(process.env[`BATCH_SIZE_${id}`]) || batchDefault,
    startBlock, addresses,
  };
}

const ACTIVE_CHAINS = Object.fromEntries(
  [
    mkChain(1, 'mainnet', 12_000, 6_531_265, [
      '0x325a2e0f3cca2ddbaebb4dfc38df8d19ca165b47', // v2.0
      '0x5b7dd1e86623548af054a4985f7fc8ccbb554e2c', // v3.0
      '0x6a2155613b68efb38d5c6074921f3f4281c8c177', // v3.2
      '0x3d3b51b1091d1f6491aeb1916c94bafe57f6cc9d', // ERC20 TRST v2.0
      '0x8f1cc53bf34932591177cda24723486205ca7510', // ERC20 GNO v2.0
      '0xf4585a9944a390615e7cec6756c1c082173b93eb', // ERC20 FOX v2.0
      '0x33aa365a53a4c9ba777fb5f450901a8eef73f0a9', // ERC20 GNO v3.0
      '0x867092a32bc16816f12fb326eff7a2865e1ec138', // ERC20 SWISE v3.0
    ]),
    mkChain(100, 'gnosis', 5_000, 14_005_802, [
      '0x79e32ae03fb27b07c89c0c568f80287c01ca2e57', // v2.1
      '0xe78996a233895be74a66f451f1019ca9734205cc', // v3.0
      '0xeb51d9d9717906c981c57af09c4a3449ef30705b', // v3.2
      '0x95b2b2b4b66a5a47df79bf07bebe72e9870fceb2', // ERC20 GNO
      '0xc9fbdf0df8de06ad8d2193f7fa28bda78c13a102', // ERC20 SWISE
      '0x934326a86a99dab25bb8329089ce73ed9c7c0e4a', // ERC20 POLK
    ]),
    mkChain(137, 'polygon', 5_000, 15_610_082, [
      '0xa75ae6d61dd9d55e8153a393e2fc859c6a0fc716', // v2.1
      '0x60573b8dce539ae5bf9ad7932310668997ef0428', // v3.0
      '0x83d3f4769a19f1b43337888b0290f5473cf508b2', // ERC20 POLK
    ]),
    mkChain(42161, 'arbitrum', 10_000, 112_029, [
      '0x0edb4cb0b12523749c56ff24c4a09c0c1417f691', // v2.1
      '0x5d18bd4dc5f1ac8e9bd9b666bd71cb35a327c4a9', // v3.0
    ]),
    mkChain(10, 'optimism', 10_000, 2_462_149, [
      '0x0ef940f7f053a2ef5d6578841072488af0c7d89a', // v3.0
    ]),
    mkChain(8453, 'base', 10_000, 26_260_675, [
      '0x2f39f464d16402ca3d8527da89617b73de2f60e8', // v3.0
    ]),
    mkChain(130, 'unichain', 10_000, 8_561_869, [
      '0xb920dbede88b42aa77ee55ebce3671132ee856fc', // v3.0
    ]),
    mkChain(43114, 'avalanche', 5_000, 4_090_592, [
      '0xd88cd78631ea0d068cedb0d1357a6eabe59d7502', // v3.0
    ]),
    mkChain(42220, 'celo', 5_000, 31_954_377, [
      '0x4c2863bb9969dd693ec487bed72bdfd83c0ca5b3', // v3.0
    ]),
    mkChain(11155111, 'sepolia', 10_000, 3_044_431, [
      '0xaf33dcb6e8c5c4d9ddf579f53031b514d19449ca', // v3.0
      '0xb7982f20cc159a40eba4b0ea86fd6cba6ff810e1', // v3.2
      '0x8a5f1c6361e280348a59dac10160a88428ffbd51', // ERC20 BOND
    ]),
  ].filter(Boolean).map(c => [c.chainId, c])
);

// ── Topic filter ───────────────────────────────────────────────────────────────

const HANDLED_EVENTS = new Set([
  'LogNewTemplate', 'LogNewQuestion', 'LogNewAnswer', 'LogAnswerReveal',
  'LogNotifyOfArbitrationRequest', 'LogCancelArbitration', 'LogFinalize',
  'LogFundAnswerBounty', 'LogClaim', 'LogReopenQuestion', 'LogMinimumBond',
]);

const enc = new TextEncoder();
const TOPIC0_FILTER = ABI
  .filter(item => item.type === 'event' && HANDLED_EVENTS.has(item.name))
  .map(item => keccak256(enc.encode(
    `${item.name}(${item.inputs.map(i => i.type).join(',')})`
  )));

// ── RPC helpers ────────────────────────────────────────────────────────────────

async function jsonrpc(url, method, params) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  if (!res.ok) throw new Error(`${method}: HTTP ${res.status}`);
  const body = await res.json();
  if (body.error) throw new Error(`${method}: ${JSON.stringify(body.error)}`);
  return body.result;
}

async function fetchLogs(chain, from, to) {
  return jsonrpc(chain.wideUrl, 'eth_getLogs', [{
    fromBlock: '0x' + from.toString(16),
    toBlock:   '0x' + to.toString(16),
    address:   chain.addresses,
    topics:    [TOPIC0_FILTER],
  }]);
}

async function getBlockNumber(chain) {
  return parseInt(await jsonrpc(chain.narrowUrl, 'eth_blockNumber', []), 16);
}

// Fetch timestamps for a set of block numbers, 5 at a time to avoid hammering.
async function fetchBlockTimestamps(chain, blockNums) {
  const ts = {};
  for (let i = 0; i < blockNums.length; i += 5) {
    const chunk = blockNums.slice(i, i + 5);
    const blocks = await Promise.all(
      chunk.map(n => jsonrpc(chain.narrowUrl, 'eth_getBlockByNumber',
        ['0x' + n.toString(16), false]))
    );
    for (let j = 0; j < chunk.length; j++) {
      ts[chunk[j]] = parseInt(blocks[j].timestamp, 16);
    }
  }
  return ts;
}

// ── Question text parsing ──────────────────────────────────────────────────────

function parseQuestion(tmplText, rawData) {
  const data = (rawData || '').replace(/\x00/g, '');
  if (!tmplText) return { title: data.split('␟')[0] || null };
  try {
    const result = populatedJSONForTemplate(tmplText, data);
    return {
      title:    result.title    ?? null,
      type:     result.type     ?? null,
      category: result.category ?? null,
      lang:     result.lang     ?? null,
      outcomes: Array.isArray(result.outcomes) ? JSON.stringify(result.outcomes) : null,
    };
  } catch {
    return { title: data.split('␟')[0] || null };
  }
}

// ── ID helpers ─────────────────────────────────────────────────────────────────

const qId       = (addr, qid)          => `${addr.toLowerCase()}-${qid}`;
const tmplKey   = (cid, addr, tid)     => `${cid}-${addr.toLowerCase()}-${tid}`;

// ── Event handlers ─────────────────────────────────────────────────────────────

async function onLogNewTemplate(db, log, args, chainId, blockTs) {
  const addr  = log.address.toLowerCase();
  const block = parseInt(log.blockNumber, 16);
  await db.query(`
    INSERT INTO reality.template
      (id, template_id, contract, chain_id, "user", question_text,
       created_block, created_log_index, created_tx_hash, created_timestamp)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    ON CONFLICT (id) DO NOTHING
  `, [
    tmplKey(chainId, addr, args.template_id),
    args.template_id.toString(), addr, chainId,
    args.user.toLowerCase(),
    args.question_text.replace(/\x00/g, ''),
    block, parseInt(log.logIndex, 16), log.transactionHash, blockTs,
  ]);
}

async function onLogNewQuestion(db, log, args, chainId, blockTs) {
  const addr  = log.address.toLowerCase();
  const block = parseInt(log.blockNumber, 16);
  const id    = qId(addr, args.question_id);

  const tmplRow = await db.query(
    `SELECT question_text FROM reality.template WHERE id = $1`,
    [tmplKey(chainId, addr, args.template_id)]
  );
  const tmplText = tmplRow.rows[0]?.question_text
    ?? BUILTIN_TEMPLATES[args.template_id.toString()]
    ?? null;
  const p = parseQuestion(tmplText, args.question);

  await db.query(`
    INSERT INTO reality.question (
      id, question_id, contract, chain_id, template_id, nonce, data,
      title, type, category, lang, outcomes,
      creator, arbitrator, opening_timestamp, timeout, content_hash,
      current_answer_bond, min_bond, last_bond, cumulative_bonds, bounty,
      is_pending_arbitration, arbitration_occurred, scheduled_finalization_timestamp,
      created_block, created_log_index, created_tx_hash, created_timestamp,
      updated_block, updated_timestamp
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,
      $8,$9,$10,$11,$12,
      $13,$14,$15,$16,$17,
      0,0,0,0,0,
      false,false,0,
      $18,$19,$20,$21,
      $18,$22
    )
    ON CONFLICT (id) DO NOTHING
  `, [
    id, args.question_id, addr, chainId,
    args.template_id.toString(), args.nonce.toString(),
    args.question.replace(/\x00/g, ''),
    p.title, p.type, p.category, p.lang, p.outcomes,
    args.user.toLowerCase(), args.arbitrator.toLowerCase(),
    args.opening_ts.toString(), args.timeout.toString(), args.content_hash,
    block, parseInt(log.logIndex, 16), log.transactionHash,
    args.created.toString(),
    blockTs,
  ]);
}

async function onLogNewAnswer(db, log, args, chainId, blockTs) {
  const addr  = log.address.toLowerCase();
  const block = parseInt(log.blockNumber, 16);
  const id    = qId(addr, args.question_id);
  const logIdx = parseInt(log.logIndex, 16);

  const responseId = args.is_commitment
    ? `${id}-${args.answer}`
    : `${id}-${log.transactionHash}-${logIdx}`;

  const ins = await db.query(`
    INSERT INTO reality.response
      (id, question_id, answer, commitment_hash, bond, "user",
       history_hash, is_commitment, is_unrevealed, timestamp,
       created_block, created_log_index, created_tx_hash)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    ON CONFLICT (id) DO NOTHING
  `, [
    responseId, id,
    args.is_commitment ? null : args.answer,
    args.is_commitment ? args.answer : null,
    args.bond.toString(), args.user.toLowerCase(),
    args.history_hash, args.is_commitment, args.is_commitment,
    args.ts.toString(), block, logIdx, log.transactionHash,
  ]);

  // Only update question state if this response is new (guards against replay).
  if (ins.rowCount > 0) {
    const bond = args.bond.toString();
    const ts   = args.ts.toString();
    if (args.is_commitment) {
      await db.query(`
        UPDATE reality.question SET
          current_answer_bond              = $1,
          current_answer_timestamp         = $2,
          history_hash                     = $3,
          last_bond                        = $1,
          cumulative_bonds                 = cumulative_bonds + $1::numeric,
          scheduled_finalization_timestamp = $2::numeric + timeout,
          updated_block = $4, updated_timestamp = $5
        WHERE id = $6
      `, [bond, ts, args.history_hash, block, blockTs, id]);
    } else {
      await db.query(`
        UPDATE reality.question SET
          current_answer                   = $1,
          current_answer_bond              = $2,
          current_answer_timestamp         = $3,
          history_hash                     = $4,
          last_bond                        = $2,
          cumulative_bonds                 = cumulative_bonds + $2::numeric,
          scheduled_finalization_timestamp = $3::numeric + timeout,
          updated_block = $5, updated_timestamp = $6
        WHERE id = $7
      `, [args.answer, bond, ts, args.history_hash, block, blockTs, id]);
    }
  }
}

async function onLogAnswerReveal(db, log, args, chainId, blockTs) {
  const addr  = log.address.toLowerCase();
  const block = parseInt(log.blockNumber, 16);
  const id    = qId(addr, args.question_id);

  // Commitment ID = keccak256(abi.encodePacked(question_id, answer_hash, bond))
  const commitmentId = keccak256(encodePacked(
    ['bytes32', 'bytes32', 'uint256'],
    [args.question_id, args.answer_hash, args.bond]
  ));
  await db.query(`
    UPDATE reality.response
    SET answer = $1, is_unrevealed = false, revealed_block = $2
    WHERE id = $3
  `, [args.answer, block, `${id}-${commitmentId}`]);

  await db.query(`
    UPDATE reality.question SET
      current_answer = $1, updated_block = $2, updated_timestamp = $3
    WHERE id = $4
  `, [args.answer, block, blockTs, id]);
}

async function onLogMinimumBond(db, log, args, chainId, blockTs) {
  const id = qId(log.address.toLowerCase(), args.question_id);
  await db.query(
    `UPDATE reality.question SET min_bond = $1 WHERE id = $2`,
    [args.min_bond.toString(), id]
  );
}

async function onLogNotifyOfArbitrationRequest(db, log, args, chainId, blockTs) {
  const block = parseInt(log.blockNumber, 16);
  const id    = qId(log.address.toLowerCase(), args.question_id);
  await db.query(`
    UPDATE reality.question SET
      is_pending_arbitration          = true,
      arbitration_requested_timestamp = $1,
      arbitration_requested_by        = $2,
      updated_block = $3, updated_timestamp = $1
    WHERE id = $4
  `, [blockTs, args.user.toLowerCase(), block, id]);
}

async function onLogCancelArbitration(db, log, args, chainId, blockTs) {
  const block = parseInt(log.blockNumber, 16);
  const id    = qId(log.address.toLowerCase(), args.question_id);
  await db.query(`
    UPDATE reality.question SET
      is_pending_arbitration          = false,
      arbitration_requested_timestamp = null,
      arbitration_requested_by        = null,
      updated_block = $1, updated_timestamp = $2
    WHERE id = $3
  `, [block, blockTs, id]);
}

async function onLogFinalize(db, log, args, chainId, blockTs) {
  const block = parseInt(log.blockNumber, 16);
  const id    = qId(log.address.toLowerCase(), args.question_id);
  await db.query(`
    UPDATE reality.question SET
      current_answer             = $1,
      answer_finalized_timestamp = $2,
      is_pending_arbitration     = false,
      arbitration_occurred       = true,
      updated_block = $3, updated_timestamp = $2
    WHERE id = $4
  `, [args.answer, blockTs, block, id]);
}

async function onLogFundAnswerBounty(db, log, args, chainId, blockTs) {
  const block = parseInt(log.blockNumber, 16);
  const id    = qId(log.address.toLowerCase(), args.question_id);
  await db.query(`
    UPDATE reality.question SET
      bounty = $1, updated_block = $2, updated_timestamp = $3
    WHERE id = $4
  `, [args.bounty.toString(), block, blockTs, id]);
}

async function onLogClaim(db, log, args, chainId, blockTs) {
  const addr   = log.address.toLowerCase();
  const block  = parseInt(log.blockNumber, 16);
  const logIdx = parseInt(log.logIndex, 16);
  const id     = qId(addr, args.question_id);
  await db.query(`
    INSERT INTO reality.claim (id, question_id, "user", amount, created_block, created_timestamp)
    VALUES ($1,$2,$3,$4,$5,$6)
    ON CONFLICT (id) DO NOTHING
  `, [
    `${id}-${log.transactionHash}-${logIdx}`,
    id, args.user.toLowerCase(), args.amount.toString(), block, blockTs,
  ]);
}

async function onLogReopenQuestion(db, log, args, chainId, blockTs) {
  const block = parseInt(log.blockNumber, 16);
  const addr  = log.address.toLowerCase();
  const id    = qId(addr, args.question_id);
  await db.query(`
    UPDATE reality.question SET
      reopens_question_id = $1,
      updated_block = $2, updated_timestamp = $3
    WHERE id = $4
  `, [qId(addr, args.reopened_question_id), block, blockTs, id]);
}

const HANDLERS = {
  LogNewTemplate:                  onLogNewTemplate,
  LogNewQuestion:                  onLogNewQuestion,
  LogNewAnswer:                    onLogNewAnswer,
  LogAnswerReveal:                 onLogAnswerReveal,
  LogMinimumBond:                  onLogMinimumBond,
  LogNotifyOfArbitrationRequest:   onLogNotifyOfArbitrationRequest,
  LogCancelArbitration:            onLogCancelArbitration,
  LogFinalize:                     onLogFinalize,
  LogFundAnswerBounty:             onLogFundAnswerBounty,
  LogClaim:                        onLogClaim,
  LogReopenQuestion:               onLogReopenQuestion,
};

// ── Sync loop ──────────────────────────────────────────────────────────────────

async function syncChain(pool, chain) {
  const stateRow = await pool.query(
    `SELECT last_block FROM reality.sync_state WHERE chain_id = $1`,
    [chain.chainId]
  );
  const fromBlock = stateRow.rows.length
    ? Number(stateRow.rows[0].last_block) + 1
    : chain.startBlock;

  const headBlock = await getBlockNumber(chain);
  if (fromBlock > headBlock) return; // nothing new

  const knownBlocks = SPARSE.blocks[chain.name] ?? [];
  const hwm         = SPARSE.hwm[chain.name]    ?? 0;

  let synced = fromBlock;
  while (synced <= headBlock) {
    const to = Math.min(synced + chain.batchSize - 1, headBlock);

    // Skip ranges that are fully below the HWM and contain no known event blocks.
    if (to <= hwm && !hasKnownBlock(knownBlocks, synced, to)) {
      await pool.query(
        `INSERT INTO reality.sync_state (chain_id, last_block) VALUES ($1,$2)
         ON CONFLICT (chain_id) DO UPDATE SET last_block = EXCLUDED.last_block`,
        [chain.chainId, to]
      );
      synced = to + 1;
      continue;
    }

    const logs = await fetchLogs(chain, synced, to);

    if (logs.length > 0) {
      // Fetch timestamps only for blocks that have events (reality.eth is sparse).
      const blockNums = [...new Set(logs.map(l => parseInt(l.blockNumber, 16)))];
      const timestamps = await fetchBlockTimestamps(chain, blockNums);

      // Sort by block then log index for correct state application order.
      logs.sort((a, b) => {
        const bn = parseInt(a.blockNumber, 16) - parseInt(b.blockNumber, 16);
        return bn !== 0 ? bn : parseInt(a.logIndex, 16) - parseInt(b.logIndex, 16);
      });

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        for (const log of logs) {
          let decoded;
          try {
            decoded = decodeEventLog({ abi: ABI, data: log.data, topics: log.topics });
          } catch (e) {
            console.warn(`Failed to decode log at ${log.blockNumber}:${log.logIndex}:`, e.message);
            continue;
          }
          const handler = HANDLERS[decoded.eventName];
          if (!handler) continue;
          const blockTs = timestamps[parseInt(log.blockNumber, 16)];
          await handler(client, log, decoded.args, chain.chainId, blockTs);
        }
        await client.query(
          `INSERT INTO reality.sync_state (chain_id, last_block) VALUES ($1,$2)
           ON CONFLICT (chain_id) DO UPDATE SET last_block = EXCLUDED.last_block`,
          [chain.chainId, to]
        );
        await client.query('COMMIT');
        console.log(`[${chain.name}] ${synced}–${to}: ${logs.length} events`);
      } catch (e) {
        await client.query('ROLLBACK').catch(() => {});
        throw e;
      } finally {
        client.release();
      }
    } else {
      // No events: update sync state without a full transaction.
      await pool.query(
        `INSERT INTO reality.sync_state (chain_id, last_block) VALUES ($1,$2)
         ON CONFLICT (chain_id) DO UPDATE SET last_block = EXCLUDED.last_block`,
        [chain.chainId, to]
      );
      if (to === headBlock || (to - synced) >= chain.batchSize - 1) {
        console.log(`[${chain.name}] ${synced}–${to}: 0 events`);
      }
    }
    synced = to + 1;
  }
}

async function main() {
  writeFileSync(PID_PATH, String(process.pid));
  const cleanup = () => { try { unlinkSync(PID_PATH); } catch {} };
  process.on('exit',   cleanup);
  process.on('SIGTERM', () => process.exit(0));
  process.on('SIGINT',  () => process.exit(0));
  process.on('SIGHUP',  loadConfig);
  loadConfig();

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  console.log('Starting indexer. Poll interval:', POLL_MS, 'ms');
  console.log('Active chains:', Object.values(ACTIVE_CHAINS).map(c => c.name).join(', '));

  while (true) {
    for (const chain of Object.values(ACTIVE_CHAINS)) {
      const mode = chainModes[chain.chainId] ?? 'lazy';
      if (mode === 'lazy') {
        const last = lastLazySyncAt[chain.chainId] ?? 0;
        if (Date.now() - last < LAZY_INTERVAL_MS) continue;
        // Refresh sparse index before each lazy sync so we only hit blocks with events.
        await refreshSparseIndex(chain).catch(e =>
          console.error(`[${chain.name}] sparse refresh error:`, e.message)
        );
      } else if (pendingRefresh.has(chain.chainId)) {
        // Refresh once on lazy→active transition before catching up.
        pendingRefresh.delete(chain.chainId);
        await refreshSparseIndex(chain).catch(e =>
          console.error(`[${chain.name}] sparse refresh error:`, e.message)
        );
      }
      await syncChain(pool, chain).catch(e =>
        console.error(`[${chain.name}] sync error:`, e.message)
      );
      if ((chainModes[chain.chainId] ?? 'lazy') === 'lazy') {
        lastLazySyncAt[chain.chainId] = Date.now();
      }
    }
    await new Promise(r => setTimeout(r, POLL_MS));
  }
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
