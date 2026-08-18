(function () {
'use strict';
console.log('[question.js] v19');

// ── Constants ─────────────────────────────────────────────────────────────────
const INVALID   = RealityLib.getInvalidValue();
const TOO_SOON  = RealityLib.getAnsweredTooSoonValue();
const INVALID_LC  = INVALID.toLowerCase();
const TOO_SOON_LC = TOO_SOON.toLowerCase();
const ZERO_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000';
const FORK_BLOCK = 46600000;

// Map contract address → major version integer
const CONTRACT_MAJOR = {
  '0x79e32ae03fb27b07c89c0c568f80287c01ca2e57': 2,
  '0xe78996a233895be74a66f451f1019ca9734205cc': 3,
  '0xeb51d9d9717906c981c57af09c4a3449ef30705b': 3,
};

// Map contract address → deployment block (for targeted log queries in RPC fallback).
// Unknown contracts fall back to FORK_BLOCK so the test suite still works.
const CONTRACT_START_BLOCK = {
  // Gnosis
  '0x79e32ae03fb27b07c89c0c568f80287c01ca2e57': 14005802,  // v2.1
  '0xe78996a233895be74a66f451f1019ca9734205cc': 17997262,  // v3.0
  '0xeb51d9d9717906c981c57af09c4a3449ef30705b': 39142627,  // v3.2
  // Mainnet
  '0x325a2e0f3cca2ddbaebb4dfc38df8d19ca165b47':  6531265,  // v2.0
  '0x5b7dd1e86623548af054a4985f7fc8ccbb554e2c': 13194676,  // v3.0
  '0x6a2155613b68efb38d5c6074921f3f4281c8c177': 22100226,  // v3.2
  // Arbitrum
  '0x5d18bd4dc5f1ac8e9bd9b666bd71cb35a327c4a9':   459975,  // v3.0
  // Celo
  '0x4c2863bb9969dd693ec487bed72bdfd83c0ca5b3': 31954377,  // v3.0
  // Avalanche
  '0xd88cd78631ea0d068cedb0d1357a6eabe59d7502':  4090592,  // v3.0
};

function chainName(id) { return window.RealityChains?.name(id) || `Chain ${id}`; }
const CHAIN_TOKEN   = { 1:'ETH', 10:'OETH', 56:'BNB', 100:'XDAI', 130:'ETH', 137:'POL', 42161:'ETH', 8453:'ETH', 43114:'AVAX', 42220:'CELO', 11155111:'ETH' };
// Minimum stake below which the "low reward" warning fires, in wei (native-chain values).
// ERC20 contracts use 1 token (10^metaDecimals) as the threshold instead.
const SMALL_BOND    = { 1:10n**16n, 10:10n**16n, 56:10n**16n, 100:10n**18n, 130:10n**16n, 137:10n**18n, 42161:10n**16n, 8453:10n**16n, 43114:10n**16n, 42220:10n**18n, 11155111:10n**16n };
const EXPLORER      = { 1:'https://etherscan.io', 10:'https://optimistic.etherscan.io', 100:'https://gnosisscan.io', 130:'https://uniscan.xyz', 137:'https://polygonscan.com', 42161:'https://arbiscan.io', 8453:'https://basescan.org', 43114:'https://snowtrace.io', 42220:'https://celoscan.io', 11155111:'https://sepolia.etherscan.io' };
const PUBLIC_RPC    = { 1:'https://ethereum-rpc.publicnode.com', 10:'https://optimism-rpc.publicnode.com', 100:'https://rpc.gnosischain.com', 130:'https://mainnet.unichain.org', 137:'https://polygon-rpc.com', 42161:'https://arbitrum-one-rpc.publicnode.com', 8453:'https://base-rpc.publicnode.com', 43114:'https://avalanche-c-chain-rpc.publicnode.com', 42220:'https://celo-rpc.publicnode.com', 11155111:'https://ethereum-sepolia-rpc.publicnode.com' };
// Params for chains MetaMask may not know natively (wallet_addEthereumChain fallback)
const CHAIN_ADD_PARAMS = {
  100: {
    chainId: '0x64', chainName: 'Gnosis',
    nativeCurrency: { name: 'xDAI', symbol: 'XDAI', decimals: 18 },
    rpcUrls: ['https://rpc.gnosischain.com'],
    blockExplorerUrls: ['https://gnosisscan.io'],
  },
  130: {
    chainId: '0x82', chainName: 'Unichain',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.unichain.org'],
    blockExplorerUrls: ['https://uniscan.xyz'],
  },
  11155111: {
    chainId: '0xaa36a7', chainName: 'Sepolia',
    nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },
};

const BUILTIN_TEMPLATES = {
  0: '{"title": "%s", "type": "bool", "category": "%s", "lang": "%s"}',
  1: '{"title": "%s", "type": "uint", "decimals": 18, "category": "%s", "lang": "%s"}',
  2: '{"title": "%s", "type": "single-select", "outcomes": [%s], "category": "%s", "lang": "%s"}',
  3: '{"title": "%s", "type": "multiple-select", "outcomes": [%s], "category": "%s", "lang": "%s"}',
  4: '{"title": "%s", "type": "datetime", "category": "%s", "lang": "%s"}',
};

const REALITY_ABI = [
  'function getBond(bytes32) view returns (uint256)',
  'function getBestAnswer(bytes32) view returns (bytes32)',
  'function getContentHash(bytes32) view returns (bytes32)',
  'function getFinalizeTS(bytes32) view returns (uint32)',
  'function getOpeningTS(bytes32) view returns (uint32)',
  'function getHistoryHash(bytes32) view returns (bytes32)',
  'function getMinBond(bytes32) view returns (uint256)',
  'function getTimeout(bytes32) view returns (uint32)',
  'function getArbitrator(bytes32) view returns (address)',
  'function isSettledTooSoon(bytes32) view returns (bool)',
  'function reopened_questions(bytes32) view returns (bytes32)',
  'function template_hashes(uint256) view returns (bytes32)',
  'function templates(uint256) view returns (uint256)',
  'function submitAnswer(bytes32 question_id, bytes32 answer, uint256 max_previous) payable',
  'function submitAnswerERC20(bytes32 question_id, bytes32 answer, uint256 max_previous, uint256 tokens)',
  'function submitAnswerCommitment(bytes32 question_id, bytes32 answer_hash, uint256 max_previous, address _answerer) payable',
  'function submitAnswerCommitmentERC20(bytes32 question_id, bytes32 answer_hash, uint256 max_previous, address _answerer, uint256 tokens)',
  'function submitAnswerReveal(bytes32 question_id, bytes32 answer, uint256 nonce, uint256 bond)',
  'function claimMultipleAndWithdrawBalance(bytes32[] question_ids, uint256[] lengths, bytes32[] hist_hashes, address[] addrs, uint256[] bonds, bytes32[] answers)',
  'function reopenQuestion(uint256 template_id, string question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce, uint256 min_bond, bytes32 reopens_question_id) payable',
  'event LogNewQuestion(bytes32 indexed question_id, address indexed user, uint256 template_id, string question, bytes32 indexed content_hash, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce, uint256 timestamp)',
  'event LogNewAnswer(bytes32 answer, bytes32 indexed question_id, bytes32 history_hash, address indexed user, uint256 bond, uint256 ts, bool is_commitment)',
  'event LogAnswerReveal(bytes32 indexed question_id, address indexed user, bytes32 indexed answer_hash, bytes32 answer, uint256 nonce, uint256 bond)',
  'function commitments(bytes32) view returns (uint32 reveal_ts, bool is_revealed, bytes32 revealed_answer)',
  'event LogNewTemplate(uint256 indexed template_id, address indexed user, string question_text)',
];

window.RealityQuestion = window.RealityQuestion || {};
window.RealityQuestion.mount = async function () {

// ── URL parsing ───────────────────────────────────────────────────────────────
// Hash format: #!/network/{chainId}/question/{contract}-{questionId}
let CONTRACT, QUESTION_ID, CHAIN_ID;
let _autoStarFn = null; // set in main() once question data is loaded
const hashMatch = location.hash.match(/\/network\/(\d+)\/question\/(0x[0-9a-fA-F]+)-(0x[0-9a-fA-F]+)/);
CHAIN_ID    = hashMatch ? parseInt(hashMatch[1], 10) : 100;
CONTRACT    = hashMatch?.[2];
QUESTION_ID = hashMatch?.[3];
const qPage = document.getElementById('question-page');
if (!CONTRACT || !QUESTION_ID || !qPage) return;

// Chain badge — known from URL, no async needed
const chainBadge = document.getElementById('chain-badge');
if (chainBadge) {
  const label = chainName(CHAIN_ID);
  chainBadge.textContent = label;
  chainBadge.style.display = '';
}

// ── Provider ──────────────────────────────────────────────────────────────────
// readProvider is always available for the correct chain (no wallet needed).
// reality / realityRW are set in main() once we know the wallet's chain.
const majorVersion = CONTRACT_MAJOR[CONTRACT.toLowerCase()] || 3;
let reality = null, realityRW = null;

const publicRpcUrl = window.RealitySettings?.getRpcUrl(CHAIN_ID) || PUBLIC_RPC[CHAIN_ID];
const readProvider = publicRpcUrl
  ? new ethers.JsonRpcProvider(publicRpcUrl, CHAIN_ID, { staticNetwork: true })
  : null;

// ── Data-source indicators ────────────────────────────────────────────────────
const ponderInd = document.getElementById('ind-ponder');
const rpcInd    = document.getElementById('ind-rpc');
const cacheInd  = document.getElementById('ind-cache');
const indGroup  = document.getElementById('data-ind-group');
if (cacheInd && !cacheInd._qPanelAttached) {
  cacheInd._qPanelAttached = true;
  QCache.attachPanel(cacheInd);
}


async function withIndicator(el, fn) {
  el?.classList.add('active');
  const start = Date.now();
  try { return await fn(); }
  finally {
    const wait = Math.max(0, 1000 - (Date.now() - start));
    setTimeout(() => el?.classList.remove('active'), wait);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
async function safeCall(fn, fallback) {
  try { return await fn(); } catch { return fallback; }
}

// Fetch the full question struct in one eth_call. Handles v2 (10 fields, no min_bond)
// and v3 (11 fields) by trying the longer decode first, falling back to the shorter one.
async function questionsStruct(provider, contractAddr, questionId) {
  const selector = ethers.id('questions(bytes32)').slice(0, 10);
  const raw = await safeCall(() => provider.call({
    to: contractAddr,
    data: selector + ethers.zeroPadValue(ethers.toBeHex(questionId), 32).slice(2),
  }), null);
  if (!raw || raw === '0x') return null;
  const T11 = ['bytes32','address','uint32','uint32','uint32','bool','uint256','bytes32','bytes32','uint256','uint256'];
  const T10 = T11.slice(0, 10);
  let d;
  try       { d = ethers.AbiCoder.defaultAbiCoder().decode(T11, raw); }
  catch     { d = await safeCall(() => ethers.AbiCoder.defaultAbiCoder().decode(T10, raw), null); }
  if (!d) return null;
  return {
    content_hash:        d[0],
    arbitrator:          d[1],
    opening_ts:          Number(d[2]),
    timeout:             Number(d[3]),
    finalize_ts:         Number(d[4]),
    is_pending_arbitration: d[5],
    bounty:              d[6],
    best_answer:         d[7],
    history_hash:        d[8],
    bond:                d[9],
    min_bond:            d.length > 10 ? d[10] : 0n,
  };
}

// Render an address as a link to our account page plus an ↗ emoji to the explorer.
function addrLinks(addr, chainId = CHAIN_ID) {
  if (!addr || /^0x0+$/.test(addr)) return null;
  const short = addr.slice(0, 6) + '…' + addr.slice(-4);
  const exp   = EXPLORER[chainId] || '';
  const acct  = `<a class="bond-addr-link" href="#!/account/${addr}">${short}</a>`;
  const extLk = exp ? ` <a class="bond-addr-ext" href="${exp}/address/${addr}" target="_blank" rel="noopener noreferrer">↗</a>` : '';
  return acct + extLk;
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}


function formatEth(bn) {
  if (!bn) return '0';
  return ethers.formatUnits(bn, metaDecimals).replace(/\.0+$/, '');
}

const LETTER_MAP = { yes: 'Y', no: 'N', inv: '?', other: '·' };

function formatBond(wei, tok = metaToken) {
  return `${formatEth(wei)} ${tok}`;
}

// ── Ponder data loading ───────────────────────────────────────────────────────
const PONDER_QUESTION_ID = `${CONTRACT}-${QUESTION_ID}`;

function ponderFetch(url, body) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  return fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body), signal: ctrl.signal,
  }).finally(() => clearTimeout(timer));
}

async function fetchPonderData() {
  const qid = JSON.stringify(PONDER_QUESTION_ID);
  // responses and reopeners are separate top-level queries (no nested relations in Ponder)
  const query = `{
    question(id: ${qid}) {
      templateId data title type category lang outcomes questionJson creator
      arbitrator openingTimestamp timeout
      currentAnswer currentAnswerBond
      minBond bounty scheduledFinalizationTimestamp
      arbitrationOccurred isPendingArbitration
      createdBlock createdLogIndex createdTxHash createdTimestamp
      reopensQuestionId
    }
    responses(where: { questionId: ${qid} }, orderBy: "timestamp", orderDirection: "asc", limit: 1000) {
      items { answer commitmentHash bond user historyHash isCommitment isUnrevealed timestamp createdBlock createdLogIndex createdTxHash }
    }
    claims(where: { questionId: ${qid} }, orderBy: "createdTimestamp", orderDirection: "asc", limit: 100) {
      items { user amount createdTimestamp }
    }
    reopeners: questions(where: { reopensQuestionId: ${qid} }, limit: 1) {
      items { id currentAnswer }
    }
  }`;
  const ponderUrl = window.RealitySettings?.getPonderUrl(CHAIN_ID) || `/graphql/${CHAIN_ID}`;
  let resp;
  try {
    resp = await withIndicator(ponderInd, () => ponderFetch(ponderUrl, { query }));
  } catch {
    if (ponderInd) { ponderInd.classList.add('offline'); ponderInd.title = 'Ponder unreachable'; ponderInd.dataset.lastError = 'Ponder unreachable'; ponderInd.dataset.ponderUrl = ponderUrl; }
    throw new Error('Ponder unreachable');
  }
  if (!resp.ok) {
    if (ponderInd) { ponderInd.classList.add('offline'); ponderInd.title = 'Ponder server error'; ponderInd.dataset.lastError = 'Ponder server error'; ponderInd.dataset.ponderUrl = ponderUrl; }
    throw new Error('GraphQL unavailable');
  }
  const json = await resp.json();
  if (!json.data?.question) {
    if (ponderInd) { ponderInd.classList.add('offline'); ponderInd.title = 'Question not in Ponder index'; ponderInd.dataset.lastError = 'Question not in Ponder index'; ponderInd.dataset.ponderUrl = ponderUrl; }
    throw new Error('Question not in Ponder');
  }
  return json.data;
}

async function fetchTemplateStr(templateId) {
  const builtin = BUILTIN_TEMPLATES[templateId];
  if (builtin) return builtin;
  const tid = JSON.stringify(`${CHAIN_ID}-${CONTRACT.toLowerCase()}-${templateId}`);
  try {
    const ponderUrl = window.RealitySettings?.getPonderUrl(CHAIN_ID) || `/graphql/${CHAIN_ID}`;
    const resp = await withIndicator(ponderInd, () =>
      ponderFetch(ponderUrl, { query: `{ template(id: ${tid}) { questionText } }` })
    );
    const { data } = await resp.json();
    return data?.template?.questionText || BUILTIN_TEMPLATES[0];
  } catch { return BUILTIN_TEMPLATES[0]; }
}

// Fetch contract events with chunked fallback for restrictive public RPCs.
// Tries the full range first; if it fails, scans in 50k-block chunks sequentially.
// stopOnFirst=true exits as soon as any results are found (for single-event lookups).
async function queryFilterRobust(contract, filter, from, to, stopOnFirst = false) {
  const full = await safeCall(() => contract.queryFilter(filter, from, to), null);
  if (full !== null) return full;
  const CHUNK = 50000;
  const results = [];
  for (let s = from; s <= to; s += CHUNK) {
    const chunk = await safeCall(() => contract.queryFilter(filter, s, Math.min(s + CHUNK - 1, to)), []);
    results.push(...chunk);
    if (stopOnFirst && results.length > 0) break;
  }
  return results;
}

// Binary-search block timestamps: returns the lowest block number where block.timestamp > ts.
async function blockAfterTimestamp(provider, ts, lo, hi) {
  let iters = 0;
  while (hi - lo > 5) {
    const mid = Math.floor((lo + hi) / 2);
    const blk = await safeCall(() => provider.getBlock(mid), null);
    if (!blk) { hi = mid; continue; }
    if (blk.timestamp <= ts) lo = mid + 1;
    else hi = mid;
    iters++;
  }
  console.log(`[reality] blockAfterTimestamp: ts=${ts} → block ~${hi} (${iters} iterations)`);
  return hi;
}

// Locate a LogNewQuestion event using a multi-stage strategy:
//  1. Quick 10-block scan from chain tip — nearly free, handles recent questions.
//  2. If upperBoundTs is known, binary-search block timestamps to get a tight upper
//     bound (question must precede that timestamp), then scan a window backwards from
//     there before falling back to a wider chunked scan up to that bound.
//  3. Full chunked scan from startBlock to currentBlock as last resort.
// Returns { events, currentBlock } so callers can reuse currentBlock.
async function findLogNewQuestion(reality, filter, startBlock, upperBoundTs) {
  const tip = await safeCall(() => reality.runner.getBlock('latest'), null);
  const currentBlock = tip?.number ?? startBlock + 5_000_000;
  console.log(`[reality] findLogNewQuestion: startBlock=${startBlock} currentBlock=${currentBlock} upperBoundTs=${upperBoundTs}`);

  // Stage 1: quick recent scan
  const recent = await safeCall(
    () => reality.queryFilter(filter, Math.max(startBlock, currentBlock - 10), currentBlock), null);
  if (recent?.length) {
    console.log(`[reality] findLogNewQuestion: found in stage 1 (recent tip scan) at block ${recent[0].blockNumber}`);
    return { events: recent, currentBlock };
  }

  if (tip && upperBoundTs > 0 && upperBoundTs < tip.timestamp) {
    // Stage 2: binary-search timestamps → refBlock is the first block after upperBoundTs.
    const refBlock = await blockAfterTimestamp(reality.runner, upperBoundTs, startBlock, currentBlock);
    console.log(`[reality] findLogNewQuestion: stage 2 — refBlock=${refBlock}, scanning window [${Math.max(startBlock, refBlock - 200_000)}, ${refBlock}]`);

    // Try a 200k-block window backwards from refBlock first.
    const winStart = Math.max(startBlock, refBlock - 200_000);
    const winEvents = await queryFilterRobust(reality, filter, winStart, refBlock, true);
    if (winEvents.length) {
      console.log(`[reality] findLogNewQuestion: found in stage 2 window at block ${winEvents[0].blockNumber}`);
      return { events: winEvents, currentBlock };
    }

    // Widen to the full bounded range if the window missed it.
    if (winStart > startBlock) {
      console.log(`[reality] findLogNewQuestion: stage 2 window missed, scanning [${startBlock}, ${winStart}]`);
      const bounded = await queryFilterRobust(reality, filter, startBlock, winStart, true);
      if (bounded.length) {
        console.log(`[reality] findLogNewQuestion: found in stage 2 bounded scan at block ${bounded[0].blockNumber}`);
        return { events: bounded, currentBlock };
      }
    }
  }

  // Stage 3: full fallback
  console.log(`[reality] findLogNewQuestion: stage 3 — full scan [${startBlock}, ${currentBlock}]`);
  const events = await queryFilterRobust(reality, filter, startBlock, currentBlock, true);
  if (events.length) console.log(`[reality] findLogNewQuestion: found in stage 3 at block ${events[0].blockNumber}`);
  else               console.log(`[reality] findLogNewQuestion: not found`);
  return { events, currentBlock };
}

function adaptPonderData(ponderData) {
  const { question: pq, responses: responsePage, claims: claimsPage, reopeners } = ponderData;
  const responses = (responsePage?.items || [])
    .sort((a, b) => (Number(a.timestamp) < Number(b.timestamp) ? -1 : 1));
  // revealMap: commitmentHash (lowercase) → revealed answer bytes32
  // Populated from Ponder when its LogAnswerReveal handler works; verifyWithRpc fills gaps.
  const revealMap = {};
  const answerEvents = responses.map(r => {
    if (r.isCommitment && r.commitmentHash && r.answer) {
      revealMap[r.commitmentHash.toLowerCase()] = r.answer;
    }
    return {
      blockNumber:     r.createdBlock     ? Number(r.createdBlock)     : undefined,
      logIndex:        r.createdLogIndex  ? Number(r.createdLogIndex)  : undefined,
      transactionHash: r.createdTxHash    ?? undefined,
      args: {
        // For history-hash computation: use the commitment hash for commitments
        // (that's the value actually hashed on-chain), actual answer otherwise
        answer:          r.isCommitment ? (r.commitmentHash || ZERO_HASH) : (r.answer || ZERO_HASH),
        question_id:     QUESTION_ID,
        history_hash:    r.historyHash,
        user:            r.user,
        bond:            BigInt(r.bond.toString()),
        ts:              Number(r.timestamp),
        is_commitment:   r.isCommitment,
      }
    };
  });
  return {
    bond:          BigInt((pq.currentAnswerBond || '0').toString()),
    finalizeTS:    Number(pq.scheduledFinalizationTimestamp || 0),
    openingTS:     Number(pq.openingTimestamp || 0),
    timeout:       Number(pq.timeout || 0),
    arbitrator:    pq.arbitrator,
    nonce:         0n,
    templateId:    Number(pq.templateId || 0),
    questionStr:   pq.data,
    createdBlock:     pq.createdBlock     ? Number(pq.createdBlock)     : undefined,
    createdTimestamp: pq.createdTimestamp ? Number(pq.createdTimestamp) : undefined,
    createdTxHash:    pq.createdTxHash    || undefined,
    qjson:         null,
    minBond:       BigInt((pq.minBond || '0').toString()),
    bounty:        BigInt((pq.bounty  || '0').toString()),
    settledTooSoon:       (pq.currentAnswer || '').toLowerCase() === TOO_SOON_LC,
    reopenedBy:              (reopeners?.items?.length || 0) > 0 ? '0x01' : ZERO_HASH,
    reopenerQuestionId:      reopeners?.items?.[0]?.id || null,
    reopenerAnsweredTooSoon: (reopeners?.items?.[0]?.currentAnswer || '').toLowerCase() === TOO_SOON_LC,
    reopensQuestionId:       pq.reopensQuestionId || null,
    arbitrationOccurred:  !!pq.arbitrationOccurred,
    isPendingArbitration: !!pq.isPendingArbitration,
    creator:              (pq.creator || '').toLowerCase(),
    answerEvents,
    revealMap,
    currentAnswer: pq.currentAnswer || null,
    claims: (claimsPage?.items || []).map(c => ({
      user:   c.user,
      amount: BigInt(c.amount),
      ts:     Number(c.createdTimestamp),
    })),
  };
}

// ── Template parsing ──────────────────────────────────────────────────────────
function populateTemplate(templateStr, questionStr) {
  return RealityLib.populatedJSONForTemplate(templateStr, questionStr);
}

// ── State detection ───────────────────────────────────────────────────────────
function isFinalized(finalizeTS) {
  // finalizeTS=1 is a sentinel meaning "answered but countdown not yet started"; treat as not finalized.
  return finalizeTS > 1 && finalizeTS * 1000 < Date.now();
}
function isBeforeOpening(openingTS) {
  return openingTS > 0 && openingTS * 1000 > Date.now();
}

// ── Answer encoding ───────────────────────────────────────────────────────────
function answerToBytes32(raw, qjson) {
  const norm = typeof raw === 'string' ? raw.toLowerCase() : String(raw);
  if (norm === INVALID_LC) return INVALID;
  if (norm === TOO_SOON_LC) return TOO_SOON;

  const type = qjson?.type || 'bool';
  if (type === 'datetime') {
    // UI passes a date string; convert to unix timestamp before encoding.
    const ts = Math.floor(new Date(raw).getTime() / 1000);
    return '0x' + BigInt(ts).toString(16).padStart(64, '0');
  }
  if (type === 'multiple-select') {
    // UI passes a numeric bitmask, not boolean[]; encode directly.
    return '0x' + BigInt(raw).toString(16).padStart(64, '0');
  }
  return RealityLib.answerToBytes32(raw, qjson);
}

function bytes32ToLabel(bytes32, qjson) {
  if (bytes32 === null || bytes32 === undefined || bytes32 === '') return null;
  const label = RealityLib.getAnswerString(qjson, bytes32);
  return label === '' ? null : label;
}

function answerColorClass(bytes32, qjson) {
  if (!bytes32 || bytes32.toLowerCase() === INVALID_LC) return 'inv';
  if (bytes32.toLowerCase() === TOO_SOON_LC) return 'inv';
  const label = bytes32ToLabel(bytes32, qjson);
  if (!label) return 'other';
  const l = label.toLowerCase();
  if (l === 'yes')     return 'yes';
  if (l === 'no')      return 'no';
  if (l === 'invalid') return 'inv';
  return 'other';
}

// ── Transaction UX ───────────────────────────────────────────────────────────
function txErrorMessage(err) {
  if (err?.code === 4001 || err?.code === 'ACTION_REJECTED') return 'Cancelled';
  if (err?.reason)          return String(err.reason).slice(0, 160);
  if (err?.data?.message)   return String(err.data.message).slice(0, 160);
  if (err?.message)         return String(err.message).slice(0, 160);
  return 'Transaction failed';
}

function showTxError(btn, msg) {
  btn.parentElement?.querySelector('.tx-error')?.remove();
  const p = el('p', 'tx-error', msg);
  btn.after(p);
  setTimeout(() => p.remove(), 8000);
}

const ERC20_TOKEN_ABI = [
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
];

const ARBITRATOR_ABI = [
  'function getDisputeFee(bytes32 question_id) view returns (uint256)',
  'function requestArbitration(bytes32 question_id, uint256 max_previous) payable',
];

// Switch MetaMask to the question's chain if needed, then refresh realityRW.
async function ensureCorrectChain() {
  if (!window.ethereum) throw new Error('No wallet connected');
  const currentHex = await window.ethereum.request({ method: 'eth_chainId' });
  if (parseInt(currentHex, 16) === CHAIN_ID) return;
  const targetHex = '0x' + CHAIN_ID.toString(16);
  try {
    await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: targetHex }] });
  } catch (err) {
    if ((err.code === 4902 || err.code === -32603) && CHAIN_ADD_PARAMS[CHAIN_ID]) {
      await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [CHAIN_ADD_PARAMS[CHAIN_ID]] });
    } else {
      throw err;
    }
  }
  // Refresh write contract on the now-correct chain
  const wp = new ethers.BrowserProvider(window.ethereum);
  realityRW = new ethers.Contract(CONTRACT, REALITY_ABI, await wp.getSigner());
}

async function runTxWithERC20Approval(btn, originalText, walletAddr, tokenAddr, spender, amountWei, txFn, onSubmitted) {
  btn.disabled = true;
  try {
    await ensureCorrectChain();
    const wp = new ethers.BrowserProvider(window.ethereum);
    const tokenRead = new ethers.Contract(tokenAddr, ERC20_TOKEN_ABI, wp);
    const allowance = await tokenRead.allowance(walletAddr, spender);
    if (allowance < amountWei) {
      btn.textContent = `Approve ${metaToken} in wallet…`;
      const tokenRW = new ethers.Contract(tokenAddr, ERC20_TOKEN_ABI, await wp.getSigner());
      const approveTx = await tokenRW.approve(spender, amountWei);
      btn.textContent = `Approving ${metaToken}…`;
      await approveTx.wait();
    }
    btn.textContent = 'Waiting for wallet…';
    const tx = await txFn();
    btn.textContent = 'Pending…';
    if (onSubmitted) onSubmitted();
    await tx.wait();
    _autoStarFn?.();
    btn.textContent = '✓ Done';
    setTimeout(() => location.reload(), 1500);
  } catch (err) {
    btn.disabled = false;
    btn.textContent = originalText;
    showTxError(btn, txErrorMessage(err));
  }
}

async function runTx(btn, originalText, txFn, onSubmitted) {
  btn.disabled = true;
  btn.textContent = 'Waiting for wallet…';
  try {
    await ensureCorrectChain();
    const tx = await txFn();
    btn.textContent = 'Pending…';
    if (onSubmitted) onSubmitted();
    await tx.wait();
    _autoStarFn?.();
    btn.textContent = '✓ Done';
    setTimeout(() => location.reload(), 1500);
  } catch (err) {
    btn.disabled = false;
    btn.textContent = originalText;
    showTxError(btn, txErrorMessage(err));
  }
}

// ── Bond validation ───────────────────────────────────────────────────────────
function validateBond(bondWrap, bondInput, minRequired) {
  const val = parseFloat(bondInput.value);
  const minF = minRequired > 0n ? parseFloat(ethers.formatUnits(minRequired, metaDecimals)) : 0;
  const minAmountEl = bondWrap.querySelector('.min-amount');
  if (isNaN(val) || val < minF) {
    bondWrap.classList.add('is-error');
    if (minAmountEl) minAmountEl.textContent = formatEth(minRequired);
    return false;
  }
  bondWrap.classList.remove('is-error');
  return true;
}

// ── Claim helpers ─────────────────────────────────────────────────────────────
function buildClaimArgs(questionId, answerEvents) {
  const n = answerEvents.length;
  const answers = [], addrs = [], bonds = [], hist_hashes = [];
  for (let i = 0; i < n; i++) {
    const idx = n - 1 - i; // newest → oldest
    const ev = answerEvents[idx];
    answers.push(ev.args.answer);
    addrs.push(ev.args.user);
    bonds.push(ev.args.bond);
    hist_hashes.push(idx > 0 ? answerEvents[idx - 1].args.history_hash : ZERO_HASH);
  }
  return { question_ids: [questionId], lengths: [n], hist_hashes, addrs, bonds, answers };
}

// ── Commit-reveal helpers ─────────────────────────────────────────────────────
function makeRevealNonce() {
  return ethers.hexlify(ethers.randomBytes(32));
}

function computeCommitHash(ansBytes, nonce) {
  // Matches soliditySHA3(["uint256","uint256"], [answer, nonce]) in the contracts lib
  return ethers.solidityPackedKeccak256(['uint256', 'uint256'], [ansBytes, nonce]);
}

const PENDING_REVEAL_KEY = `cr-${CHAIN_ID}-${CONTRACT.toLowerCase()}-${QUESTION_ID}`;

function storePendingReveal(walletAddr, ansBytes, nonce, bondWei) {
  try {
    localStorage.setItem(PENDING_REVEAL_KEY, JSON.stringify({
      wallet: walletAddr.toLowerCase(), answer: ansBytes, nonce, bond: '0x' + bondWei.toString(16),
    }));
  } catch {}
}

function clearPendingReveal() {
  try { localStorage.removeItem(PENDING_REVEAL_KEY); } catch {}
}

function loadPendingReveal(walletAddr) {
  try {
    const item = JSON.parse(localStorage.getItem(PENDING_REVEAL_KEY) || 'null');
    if (item?.wallet === walletAddr?.toLowerCase()) return item;
  } catch {}
  return null;
}

async function runCommitReveal(btn, walletAddr, ansBytes, bondWei, maxPrev, qjson) {
  const originalText = btn.textContent;
  const nonce = makeRevealNonce();
  const answerHash = computeCommitHash(ansBytes, nonce);
  storePendingReveal(walletAddr, ansBytes, nonce, bondWei);

  btn.disabled = true;
  try {
    await ensureCorrectChain();
    const wp = new ethers.BrowserProvider(window.ethereum);
    const rc = new ethers.Contract(CONTRACT, REALITY_ABI, await wp.getSigner());

    if (metaTokenAddress) {
      btn.textContent = `Approve ${metaToken} in wallet…`;
      const tokenRead = new ethers.Contract(metaTokenAddress, ERC20_TOKEN_ABI, wp);
      const allowance = await tokenRead.allowance(walletAddr, CONTRACT);
      if (allowance < bondWei) {
        const tokenRW = new ethers.Contract(metaTokenAddress, ERC20_TOKEN_ABI, await wp.getSigner());
        const approveTx = await tokenRW.approve(CONTRACT, bondWei);
        btn.textContent = `Approving ${metaToken}…`;
        await approveTx.wait();
      }
    }

    btn.textContent = 'Waiting for wallet (commit)…';
    const commitTx = metaTokenAddress
      ? await rc.submitAnswerCommitmentERC20(QUESTION_ID, answerHash, maxPrev, walletAddr, bondWei)
      : await rc.submitAnswerCommitment(QUESTION_ID, answerHash, maxPrev, walletAddr, { value: bondWei });
    btn.textContent = 'Committing…';
    addOptimisticEntry(ansBytes, bondWei, walletAddr, qjson);
    await commitTx.wait();

    btn.textContent = 'Waiting for wallet (reveal)…';
    const revealTx = await rc.submitAnswerReveal(QUESTION_ID, ansBytes, nonce, bondWei);
    btn.textContent = 'Revealing…';
    await revealTx.wait();

    clearPendingReveal();
    btn.textContent = '✓ Done';
    setTimeout(() => location.reload(), 1500);
  } catch (err) {
    btn.disabled = false;
    btn.textContent = originalText;
    showTxError(btn, txErrorMessage(err));
    // If commit confirmed but reveal failed, storePendingReveal remains for the next page load
  }
}

// ── Form builder helpers ──────────────────────────────────────────────────────
function getRevealedAnswer(commitHash, revealMap) {
  return commitHash ? (revealMap[commitHash.toLowerCase()] || null) : null;
}

function buildSpecialAnswerLinks() {
  const inv = el('div', 'invalid-switch-container');
  inv.innerHTML = `<a class="invalid-text-link" href="#" data-special="${INVALID}" data-label="Mark as Invalid" data-active-label="✓ Invalid — undo">Mark as Invalid</a>`;
  const ts = el('div', 'too-soon-switch-container');
  ts.innerHTML = `<a class="too-soon-text-link" href="#" data-special="${TOO_SOON}" data-label="Mark as Answered Too Soon" data-active-label="✓ Answered too soon — undo">Mark as Answered Too Soon</a>`;
  return { inv, ts };
}

// ── Form builder ──────────────────────────────────────────────────────────────
function buildAnswerForm(data, walletAddr) {
  const { qjson, minBond, openingTS, finalizeTS, answerEvents, isPendingArbitration } = data;
  const bond = answerEvents.reduce((mx, ev) => ev.args.bond > mx ? ev.args.bond : mx, 0n);
  // Pending arbitration blocks new answers; the arbitration section covers the display.
  if (isPendingArbitration) return null;
  const finalized    = isFinalized(finalizeTS);
  const beforeOpen   = isBeforeOpening(openingTS);
  const type         = qjson.type || 'bool';
  const isSelectType = type === 'bool' || type === 'single-select';
  const isMulti      = type === 'multiple-select';
  const isUint       = type === 'uint' || type === 'int';
  const isDatetime   = type === 'datetime';

  // Before-opening: show disabled options (if any) and a notice with opening time
  if (beforeOpen) {
    const card = el('div', 'card');
    card.appendChild(el('div', 'card-title', 'Answer'));
    if (isSelectType || isMulti) {
      const inputWrap = el('div', 'answer-input-wrap');
      if (isMulti) {
        (qjson.outcomes || []).forEach((o, i) => {
          const lbl = el('label', 'multi-option');
          const cb = document.createElement('input');
          cb.type = 'checkbox'; cb.value = String(i);
          lbl.appendChild(cb);
          lbl.appendChild(document.createTextNode(' ' + o));
          inputWrap.appendChild(lbl);
        });
      } else if (type === 'single-select') {
        const select = document.createElement('select');
        select.className = 'answer-select';
        const def = el('option'); def.value = ''; def.textContent = '— Select —'; def.selected = true;
        select.appendChild(def);
        (qjson.outcomes || []).forEach((o, i) => {
          const opt = el('option'); opt.value = String(i); opt.textContent = o;
          select.appendChild(opt);
        });
        inputWrap.appendChild(select);
      }
      card.appendChild(inputWrap);
    }
    const bf = document.createElement('div');
    bf.className = 'answer-form-container before-opening is-open';
    const p = el('p', null, 'This question is not yet open for answers.');
    const ot = el('div', 'opening-time-label',
      new Date(openingTS * 1000).toLocaleString());
    bf.appendChild(p);
    bf.appendChild(ot);
    card.appendChild(bf);
    return card;
  }

  // Finalized select/multi with named outcomes: show read-only options list with winner marked.
  if (finalized && (type === 'single-select' || isMulti)) {
    const n = answerEvents.length;
    const latest = n > 0 ? answerEvents[n - 1] : null;
    const revealMap = data.revealMap || {};
    const commitHash = latest?.args.is_commitment ? latest.args.answer?.toLowerCase() : null;
    const latestReveal = getRevealedAnswer(commitHash, revealMap);
    // When the winning answer was a commit-reveal, prefer the revealed answer; fall back to
    // currentAnswer (on-chain finalized value) if the reveal event isn't in our local log.
    const winnerBytes = commitHash
      ? (latestReveal || data.currentAnswer || null)
      : (latest?.args.answer ?? null);
    const lo = winnerBytes ? winnerBytes.toLowerCase() : null;
    const isSpecial = lo && (lo === INVALID_LC || lo === TOO_SOON_LC);

    const outcomes = (qjson.outcomes || []).map((o, i) => ({ label: o, idx: i }));

    let winIdx = null, winMask = null;
    if (!isSpecial && winnerBytes) {
      const bn = BigInt(winnerBytes);
      if (isMulti) winMask = Number(bn);
      else         winIdx  = Number(bn);
    }

    const card = el('div', 'card');
    const list = el('div', 'finalized-options');
    for (const { label, idx } of outcomes) {
      const chosen = isSpecial ? false
        : isMulti ? !!(winMask !== null && (winMask & (1 << idx)))
        : winIdx === idx;
      const row = el('div', 'finalized-option' + (chosen ? ' finalized-option-chosen' : ''));
      const mark = el('span', 'finalized-option-mark', chosen ? '✓' : '');
      row.appendChild(mark);
      row.appendChild(document.createTextNode(label));
      list.appendChild(row);
    }
    if (isSpecial) {
      const specialLabel = lo === INVALID_LC ? 'Invalid' : 'Answered too soon';
      const row = el('div', 'finalized-option finalized-option-chosen');
      row.appendChild(el('span', 'finalized-option-mark', '✓'));
      row.appendChild(document.createTextNode(specialLabel));
      list.appendChild(row);
    }
    card.appendChild(list);
    return card;
  }

  // Finalized bool/uint/int/datetime: answer shown in status card, nothing to add.
  if (finalized) return null;

  // Compute minimum required bond
  const minRequired = minBond > 0n && bond === 0n
    ? minBond
    : bond > 0n ? bond * 2n : (minBond > 0n ? minBond : 0n);

  const prefill = minRequired > 0n
    ? ethers.formatUnits(minRequired, metaDecimals).replace(/\.0+$/, '')
    : ethers.formatUnits(10n ** BigInt(Math.max(0, metaDecimals - 3)), metaDecimals);

  // Broken question: type unknown, so only offer marking invalid.
  if (type === 'broken-question') {
    const card = el('div', 'card');
    card.appendChild(el('div', 'card-title', 'Answer'));
    const form = document.createElement('div');
    form.className = 'answer-form-open';
    const bondWrap = el('div', 'input-container--bond');
    const bondInput = document.createElement('input');
    bondInput.type = 'number'; bondInput.name = 'questionBond';
    bondInput.className = 'bond-input-field'; bondInput.step = 'any'; bondInput.min = '0';
    bondInput.value = prefill;
    bondWrap.appendChild(bondInput);
    bondWrap.appendChild(el('span', 'min-amount', formatEth(minRequired)));
    form.appendChild(bondWrap);
    bondInput.addEventListener('keyup', () => validateBond(bondWrap, bondInput, minRequired));
    const btn = el('button', 'post-answer-button btn-post', 'Mark invalid');
    btn.type = 'button';
    btn.addEventListener('click', () => {
      if (!validateBond(bondWrap, bondInput, minRequired)) return;
      if (!realityRW) { console.error('No wallet connected'); return; }
      const ansBytes = INVALID_ANS;
      const bondWei  = ethers.parseUnits(bondInput.value, metaDecimals);
      if (metaTokenAddress) {
        runTxWithERC20Approval(
          btn, 'Mark invalid', walletAddr,
          metaTokenAddress, CONTRACT, bondWei,
          () => realityRW.submitAnswerERC20(QUESTION_ID, ansBytes, bond, bondWei),
          () => addOptimisticEntry(ansBytes, bondWei, walletAddr, qjson)
        );
      } else {
        runTx(btn, 'Mark invalid',
          () => realityRW.submitAnswer(QUESTION_ID, ansBytes, bond, { value: bondWei }),
          () => addOptimisticEntry(ansBytes, bondWei, walletAddr, qjson)
        );
      }
    });
    form.appendChild(btn);
    card.appendChild(form);
    return card;
  }

  const hasInvalid = !('has_invalid' in qjson && !qjson.has_invalid);
  const hasTooSoon = majorVersion >= 3;

  // ── Build form wrapper ──
  const form = document.createElement('div');
  form.className = 'answer-form-open';

  // ── Answer input ──
  const inputWrap = el('div', 'answer-input-wrap');
  form.appendChild(inputWrap);

  if (isSelectType) {
    const select = document.createElement('select');
    select.name = 'input-answer';
    select.className = 'answer-select';
    const def = el('option'); def.value = ''; def.textContent = '— Select —';
    def.disabled = true; def.selected = true;
    select.appendChild(def);

    if (type === 'bool') {
      const no  = el('option'); no.value  = '0'; no.textContent  = 'No';
      const yes = el('option'); yes.value = '1'; yes.textContent = 'Yes';
      select.appendChild(no);
      select.appendChild(yes);
    } else {
      (qjson.outcomes || []).forEach((o, i) => {
        const opt = el('option'); opt.value = String(i); opt.textContent = o;
        select.appendChild(opt);
      });
    }
    if (hasInvalid) {
      const opt = el('option'); opt.value = INVALID;
      opt.textContent = 'Invalid'; opt.className = 'invalid-select';
      select.appendChild(opt);
    }
    if (hasTooSoon) {
      const opt = el('option'); opt.value = TOO_SOON;
      opt.textContent = 'Answered too soon'; opt.className = 'too-soon-select';
      select.appendChild(opt);
    }
    inputWrap.appendChild(select);

  } else if (isMulti) {
    (qjson.outcomes || []).forEach((o, i) => {
      const lbl = el('label', 'multi-option');
      const cb  = document.createElement('input');
      cb.type = 'checkbox'; cb.name = 'input-answer'; cb.value = String(i);
      lbl.appendChild(cb);
      lbl.appendChild(document.createTextNode(' ' + o));
      inputWrap.appendChild(lbl);
    });
    const { inv, ts } = buildSpecialAnswerLinks();
    if (!hasInvalid) inv.style.display = 'none';
    inputWrap.appendChild(inv);
    if (!hasTooSoon) ts.style.display = 'none';
    inputWrap.appendChild(ts);

  } else if (isUint) {
    const input = document.createElement('input');
    input.type = 'number'; input.name = 'input-answer';
    input.step = 'any'; input.min = '0'; input.placeholder = '0'; input.className = 'uint-input';
    inputWrap.appendChild(input);
    const { inv, ts } = buildSpecialAnswerLinks();
    if (!hasInvalid) inv.style.display = 'none';
    inputWrap.appendChild(inv);
    if (!hasTooSoon) ts.style.display = 'none';
    inputWrap.appendChild(ts);

  } else if (isDatetime) {
    const input = document.createElement('input');
    input.type = 'date'; input.className = 'datetime-input-date';
    input.name = 'input-answer';
    inputWrap.appendChild(input);
    const { inv, ts } = buildSpecialAnswerLinks();
    if (!hasInvalid) inv.style.display = 'none';
    inputWrap.appendChild(inv);
    if (!hasTooSoon) ts.style.display = 'none';
    inputWrap.appendChild(ts);
  }

  // ── Bond row ──
  const bondWrap = el('div', 'input-container--bond');
  const bondInput = document.createElement('input');
  bondInput.type = 'number'; bondInput.name = 'questionBond';
  bondInput.className = 'bond-input-field'; bondInput.step = 'any'; bondInput.min = '0';
  bondInput.value = prefill;
  const minEl = el('span', 'min-amount', formatEth(minRequired));
  bondWrap.appendChild(bondInput);
  bondWrap.appendChild(minEl);
  form.appendChild(bondWrap);

  // ── Submit button ──
  const btn = el('button', 'post-answer-button btn-post', 'Post answer');
  btn.type = 'button';
  form.appendChild(btn);

  // ── Commit-reveal toggle ──
  const crLabel = el('label', 'cr-toggle');
  const crCb    = document.createElement('input');
  crCb.type = 'checkbox';
  crLabel.appendChild(crCb);
  crLabel.appendChild(document.createTextNode(' Use commit-reveal'));
  form.appendChild(crLabel);

  crCb.addEventListener('change', () => {
    btn.textContent = crCb.checked ? 'Commit then reveal' : 'Post answer';
  });

  // ── Bond keyup validation ──
  bondInput.addEventListener('keyup', () => validateBond(bondWrap, bondInput, minRequired));

  // ── Special answer links ──
  form.addEventListener('click', e => {
    const link = e.target.closest('[data-special]');
    if (!link) return;
    e.preventDefault();

    const alreadyActive = link.classList.contains('active');

    // Reset all: restore link labels, clear stored answer
    form.querySelectorAll('[data-special]').forEach(a => {
      a.classList.remove('active');
      if (a.dataset.label) a.textContent = a.dataset.label;
    });
    delete form.dataset.specialAnswer;

    // Restore frozen text/date input if any
    const answerInput = form.querySelector(
      'input[name="input-answer"]:not([type="checkbox"]), .datetime-input-date'
    );
    if (answerInput) {
      answerInput.readOnly = false;
      if (answerInput.dataset.specialSaved !== undefined) {
        answerInput.value       = answerInput.dataset.specialSaved;
        answerInput.placeholder = answerInput.dataset.specialSavedPlaceholder || '';
        delete answerInput.dataset.specialSaved;
        delete answerInput.dataset.specialSavedPlaceholder;
      }
      answerInput.classList.remove('special-selected');
    }

    // Re-enable checkboxes
    form.querySelectorAll('input[name="input-answer"][type="checkbox"]')
        .forEach(cb => { cb.disabled = false; });

    if (alreadyActive) return; // toggled off — done

    // Activate this link
    form.dataset.specialAnswer = link.dataset.special;
    link.classList.add('active');
    if (link.dataset.activeLabel) link.textContent = link.dataset.activeLabel;

    // Freeze text/date input
    if (answerInput) {
      answerInput.dataset.specialSaved            = answerInput.value;
      answerInput.dataset.specialSavedPlaceholder = answerInput.placeholder;
      answerInput.value       = '';
      answerInput.readOnly    = true;
      answerInput.placeholder = link.dataset.special === INVALID ? 'Invalid' : 'Answered too soon';
      answerInput.classList.add('special-selected');
    }

    // Disable checkboxes
    form.querySelectorAll('input[name="input-answer"][type="checkbox"]')
        .forEach(cb => { cb.disabled = true; });
  });

  // ── Submit handler ──
  btn.addEventListener('click', () => {
    let rawAnswer = form.dataset.specialAnswer || '';
    if (!rawAnswer) {
      if (isSelectType) {
        rawAnswer = form.querySelector('select[name="input-answer"]')?.value || '';
      } else if (isMulti) {
        let mask = 0;
        form.querySelectorAll('input[name="input-answer"]:checked')
            .forEach(cb => { mask |= (1 << parseInt(cb.value)); });
        rawAnswer = String(mask);
      } else if (isUint) {
        rawAnswer = form.querySelector('input[name="input-answer"]')?.value || '';
      } else if (isDatetime) {
        rawAnswer = form.querySelector('.datetime-input-date')?.value || '';
      }
    }

    if (rawAnswer === '' || rawAnswer === undefined) return;
    if (!validateBond(bondWrap, bondInput, minRequired)) return;
    if (!realityRW) { console.error('No wallet connected'); return; }

    const ansBytes = answerToBytes32(rawAnswer, qjson);
    const bondWei  = ethers.parseUnits(bondInput.value, metaDecimals);
    const maxPrev  = data.bond;

    if (crCb.checked) {
      runCommitReveal(btn, walletAddr, ansBytes, bondWei, maxPrev, qjson);
    } else if (metaTokenAddress) {
      runTxWithERC20Approval(
        btn, 'Post answer', walletAddr,
        metaTokenAddress, CONTRACT, bondWei,
        () => realityRW.submitAnswerERC20(QUESTION_ID, ansBytes, maxPrev, bondWei),
        () => addOptimisticEntry(ansBytes, bondWei, walletAddr, qjson)
      );
    } else {
      runTx(btn, 'Post answer',
        () => realityRW.submitAnswer(QUESTION_ID, ansBytes, maxPrev, { value: bondWei }),
        () => addOptimisticEntry(ansBytes, bondWei, walletAddr, qjson)
      );
    }
  });

  const card = el('div', 'card');
  card.appendChild(el('div', 'card-title', 'Answer'));

  // ── Pending-reveal notice ──
  // If the latest answer is our unrevealed commitment and we have the nonce stored, show a Reveal button.
  if (walletAddr) {
    const pending = loadPendingReveal(walletAddr);
    const lastEv  = data.answerEvents[data.answerEvents.length - 1];
    const lastIsUnrevealedCommit = lastEv?.args.is_commitment
      && !getRevealedAnswer(lastEv.args.answer, data.revealMap || {});
    if (pending && lastIsUnrevealedCommit &&
        lastEv.args.user?.toLowerCase() === walletAddr.toLowerCase()) {
      const expiryTs  = lastEv.args.ts + Math.floor(data.timeout / 8);
      const remaining = expiryTs - Math.floor(Date.now() / 1000);
      const expiryStr = remaining > 0 ? `Expires in ${formatDuration(remaining)}.` : 'Commitment has expired.';

      const notice = el('div', 'pending-reveal-notice');
      notice.innerHTML = `<strong>Unrevealed commitment</strong>${expiryStr} Complete your reveal to finalise your answer.`;
      const revealBtn = el('button', 'reveal-btn', 'Reveal my answer');
      revealBtn.type = 'button';
      notice.appendChild(revealBtn);
      card.appendChild(notice);

      revealBtn.addEventListener('click', async () => {
        revealBtn.disabled = true;
        revealBtn.textContent = 'Waiting for wallet…';
        try {
          await ensureCorrectChain();
          const wp = new ethers.BrowserProvider(window.ethereum);
          const rc = new ethers.Contract(CONTRACT, REALITY_ABI, await wp.getSigner());
          const ansBytes = pending.answer;
          const nonce    = pending.nonce;
          const bondWei  = BigInt(pending.bond);
          const tx = await rc.submitAnswerReveal(QUESTION_ID, ansBytes, nonce, bondWei);
          revealBtn.textContent = 'Revealing…';
          await tx.wait();
          _autoStarFn?.();
          clearPendingReveal();
          revealBtn.textContent = '✓ Done';
          setTimeout(() => location.reload(), 1500);
        } catch (err) {
          revealBtn.disabled = false;
          revealBtn.textContent = 'Reveal my answer';
          showTxError(revealBtn, txErrorMessage(err));
        }
      });
    }
  }

  card.appendChild(form);
  return card;
}

// ── Contracts metadata (arbitrators + start block + version) ─────────────────

let knownArbitrators = null; // Set of lowercase addresses, or null if not yet loaded
let metaStartBlock   = null; // Deployment block for CONTRACT on CHAIN_ID (from contracts.json)
let metaMajorVersion = null; // Major version (2 or 3) for CONTRACT on CHAIN_ID
let metaToken        = CHAIN_TOKEN[CHAIN_ID] || 'ETH'; // Bond/reward token symbol
let metaDecimals     = 18;                             // Token decimal places (18 for all native tokens)
let metaTokenAddress = null; // ERC20 token address, or null for native-token contracts

// Kick off immediately so it loads in parallel with Ponder
const contractsMetaPromise = (async () => {
  try {
    const data = window.RealityWebsiteData?.contracts || {};
    const chainData = data[String(CHAIN_ID)] || {};
    const addrs = new Set();
    for (const [tokenSym, versions] of Object.entries(chainData)) {
      for (const [ver, info] of Object.entries(versions)) {
        for (const addr of Object.keys(info.arbitrators || {})) {
          addrs.add(addr.toLowerCase());
        }
        if (info.address?.toLowerCase() === CONTRACT.toLowerCase()) {
          metaStartBlock   = info.block ?? null;
          // Version key is like "RealityETH-3.2" or "RealityETH_ERC20-3.2"
          const major = ver.match(/[-_](\d+)\./)?.[1];
          metaMajorVersion = major ? parseInt(major) : null;
          metaTokenAddress = info.token_address || null;
          if (metaTokenAddress) {
            metaToken = tokenSym;
            if (readProvider) {
              const dec = await new ethers.Contract(
                metaTokenAddress, ERC20_TOKEN_ABI, readProvider
              ).decimals().catch(() => 18);
              metaDecimals = Number(dec);
            }
          }
        }
      }
    }
    knownArbitrators = addrs;
  } catch {
    knownArbitrators = null;
  }
})();

function isSelfArbitrator(arbitrator) {
  if (!arbitrator || /^0x0+$/.test(arbitrator)) return true;
  return arbitrator.toLowerCase() === CONTRACT.toLowerCase();
}

function renderWarnings(data) {
  const container = document.getElementById('warnings-container');
  if (!container) return;
  container.innerHTML = '';

  const warnings = [];

  // Errors flagged by reality-eth-lib during question JSON parsing
  const errs = data.qjson?.errors || {};
  if (errs.suspicious_extra_data) {
    warnings.push({ level: 'danger', title: 'Suspicious extra data',
      body: 'This question\'s data field contains extra data that will not be used in the question. This may indicate a potential attack, which should be settled as invalid.' });
  }
  if (errs.json_parse_failed) {
    warnings.push({ level: 'danger', title: 'Malformed question data',
      body: 'The question data could not be parsed as valid JSON. The question type and title are unknown.' });
  }
  if (errs.too_many_outcomes) {
    warnings.push({ level: 'warn', title: 'Too many outcomes',
      body: 'This question has more answer options than the contract supports. Some outcomes may be unreachable.' });
  }
  if (errs.invalid_precision) {
    warnings.push({ level: 'warn', title: 'Invalid date precision',
      body: 'The datetime precision value is not a recognised format. The date display may be incorrect.' });
  }
  if (errs.unsafe_markdown) {
    warnings.push({ level: 'warn', title: 'Unsafe markdown content',
      body: 'The question title contained unsafe HTML that was stripped for your protection. The displayed title may differ from what was submitted.' });
  }

  // Unknown arbitrator — only warn if we successfully loaded the list for this chain
  if (knownArbitrators && knownArbitrators.size > 0 &&
      !isSelfArbitrator(data.arbitrator) &&
      !knownArbitrators.has(data.arbitrator.toLowerCase())) {
    warnings.push({ level: 'danger', title: 'Unrecognised arbitrator',
      body: 'We do not recognise this arbitrator. Do not rely on this information unless you trust them.' });
  }

  // Low timeout
  if (data.timeout > 0 && data.timeout < 86400) {
    warnings.push({ level: 'warn', title: 'Very short dispute window',
      body: 'The timeout is less than 24 hours. There may not be enough time for people to correct mistakes or lies.' });
  }

  // Low reward — only meaningful once the question is finalized
  if (isFinalized(data.finalizeTS)) {
    const topBond = (data.answerEvents || []).reduce(
      (mx, ev) => ev.args.bond > mx ? ev.args.bond : mx, 0n);
    const totalStake = (data.bounty ?? 0n) + topBond;
    const smallBond = metaTokenAddress
      ? 10n ** BigInt(metaDecimals)
      : (SMALL_BOND[CHAIN_ID] ?? 10n ** 16n);
    if (totalStake < smallBond) {
      warnings.push({ level: 'warn', title: 'Low reward and bond',
        body: 'The reward was very low and no substantial bond was posted. There may not have been enough incentive to post accurate information.' });
    }
  }

  const warnIcon = `<svg class="q-warning-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

  for (const w of warnings) {
    const div = document.createElement('div');
    div.className = `q-warning ${w.level}`;
    div.innerHTML = `${warnIcon}<div class="q-warning-text"><strong>${w.title}</strong><span>${w.body}</span></div>`;
    container.appendChild(div);
  }
}

// ── Answer display ────────────────────────────────────────────────────────────
function getAnswerDisplay(bytes32, qjson) {
  const label = bytes32ToLabel(bytes32, qjson) || '?';
  const color = answerColorClass(bytes32, qjson);
  return { label, color };
}

// ── Optimistic answer entry ───────────────────────────────────────────────────
function addOptimisticEntry(ansBytes, bondWei, walletAddr, qjson) {
  const bondList = qPage.querySelector('.bond-list');
  if (!bondList) return;

  const { label, color } = getAnswerDisplay(ansBytes, qjson);
  const bondStr  = formatBond(bondWei);
  const letter   = LETTER_MAP[color] || '·';
  const addrHtml = walletAddr ? (addrLinks(walletAddr) || '') : '';

  const entry = document.createElement('div');
  entry.className = 'optimistic-entry';
  entry.innerHTML = `
    <div class="bond-connector"><div class="answer-dot dot-${color}">${letter}</div></div>
    <div class="bond-main">
      <div class="bond-answer-label ${color}"><span class="label-text"></span><span class="bond-tag tag-pending">Submitting…</span></div>
      <div class="bond-submeta">${addrHtml}${addrHtml ? ' · ' : ''}<span>Unconfirmed</span></div>
    </div>
    <div class="bond-right"><div class="bond-amount">${bondStr}</div></div>`;
  entry.querySelector('.label-text').textContent = label;

  bondList.insertBefore(entry, bondList.firstChild);
  qPage.classList.add('has-history');
}

// ── Render ────────────────────────────────────────────────────────────────────
function formatRelTime(ts) {
  const diff = Math.floor(Date.now() / 1000) - Number(ts);
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const dt = new Date(Number(ts) * 1000);
  return dt.toLocaleString(undefined, { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

// Returns "in Xh Ym" if the reveal deadline is in the future, or "deadline passed".
// reveal_ts = commitment submission timestamp + timeout/8
function formatRevealDeadline(revealTs) {
  const remaining = Number(revealTs) - Math.floor(Date.now() / 1000);
  if (remaining <= 0) return 'deadline passed';
  return `in ${formatDuration(remaining)}`;
}

// ── Snapshot panel ────────────────────────────────────────────────────────────
function parseSnapshotRef(title) {
  // Matches both "with the id X" and "with id X" (SafeSnap template variants)
  const m = title.match(/Did the Snapshot proposal with (?:the )?id\s+(\S+)\s+in the\s+(\S+)\s+space/i);
  if (!m) return null;
  return { proposalId: m[1], space: m[2] };
}

async function renderSnapshotPanel(title) {
  const panel = document.getElementById('snapshot-panel');
  if (!panel) return;

  const ref = parseSnapshotRef(title);
  if (!ref) return;

  const { proposalId, space } = ref;
  const snapshotUrl = `https://snapshot.org/#/${space}/proposal/${proposalId}`;

  // Show immediately with just the link
  const card = el('div', 'snapshot-card');
  const hdr = el('div', 'snapshot-header');

  // Snapshot logo (S mark as inline SVG)
  hdr.innerHTML = `<svg class="snapshot-logo" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M155.8 104.3c0 34.7-25.3 61.2-56.1 61.2S43.7 139 43.7 104.3c0-20.5 9.5-38.7 24.4-50.6C54 62.8 43.7 79.7 43.7 99c0 34.7 25.3 61.2 56.1 61.2s56.1-26.6 56.1-61.2c0-14-4.5-27-12.2-37.3 7.8 11.2 12.1 24.7 12.1 42.6z" fill="currentColor"/><path d="M99.7 38.5C70.5 38.5 47 62 47 91.2c0 29.1 23.4 52.7 52.7 52.7 29.2 0 52.7-23.6 52.7-52.7 0-29.2-23.5-52.7-52.7-52.7z" fill="currentColor" opacity=".4"/></svg>`;
  const spaceLbl = el('span', 'snapshot-space', space);
  const lnk = el('a', 'snapshot-link', 'View on Snapshot ↗');
  lnk.href = snapshotUrl;
  lnk.target = '_blank';
  lnk.rel = 'noopener noreferrer';
  hdr.appendChild(spaceLbl);
  const spacer = el('span');
  spacer.style.flex = '1';
  hdr.appendChild(spacer);
  hdr.appendChild(lnk);
  card.appendChild(hdr);

  const loadingEl = el('div', null, 'Loading proposal…');
  loadingEl.style.cssText = 'font-size:12px;color:var(--text-dim)';
  card.appendChild(loadingEl);

  panel.appendChild(card);
  panel.style.display = '';

  // Only fetch for real proposal IDs (0x hex or Qm IPFS CID)
  const looksReal = /^0x[0-9a-fA-F]{10,}$/.test(proposalId) || /^Qm[1-9A-Za-z]{30,}$/.test(proposalId);
  if (!looksReal) {
    loadingEl.remove();
    return;
  }

  try {
    const resp = await fetch('https://hub.snapshot.org/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `{
        proposal(id: "${proposalId}") {
          title body state choices scores scores_total
        }
      }` }),
    });
    const json = await resp.json();
    const p = json?.data?.proposal;
    loadingEl.remove();
    if (!p) return; // proposal not found — link still visible

    // Title + state badge
    const titleEl = el('div', 'snapshot-title');
    titleEl.textContent = p.title;
    const stateCls = { active:'snapshot-state-active', closed:'snapshot-state-closed', pending:'snapshot-state-pending' }[p.state] || 'snapshot-state-closed';
    const stateBadge = el('span', `snapshot-state ${stateCls}`, p.state || '');
    titleEl.appendChild(stateBadge);
    card.insertBefore(titleEl, card.children[1]); // after header

    // Choices with vote bars
    if (p.choices?.length) {
      const total = p.scores_total || p.scores?.reduce((s, x) => s + x, 0) || 0;
      const choicesEl = el('div', 'snapshot-choices');
      p.choices.forEach((choice, i) => {
        const score = p.scores?.[i] || 0;
        const pct = total > 0 ? Math.round((score / total) * 100) : 0;
        const row = el('div', 'snapshot-choice');
        const lbl = el('span', 'snapshot-choice-label', choice);
        const barWrap = el('div', 'snapshot-choice-bar-wrap');
        const bar = el('div', 'snapshot-choice-bar');
        bar.style.width = pct + '%';
        barWrap.appendChild(bar);
        const pctEl = el('span', 'snapshot-choice-pct', pct + '%');
        row.appendChild(lbl);
        row.appendChild(barWrap);
        row.appendChild(pctEl);
        choicesEl.appendChild(row);
      });
      card.appendChild(choicesEl);
    }

    // Body (collapsible)
    if (p.body?.trim()) {
      const bodySection = el('div', 'snapshot-body');
      const toggle = el('button', 'snapshot-body-toggle', 'Show proposal ▾');
      const bodyContent = el('div', 'snapshot-body-content');
      // Render markdown if marked is available
      if (typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
        bodyContent.innerHTML = DOMPurify.sanitize(marked.parse(p.body));
      } else {
        bodyContent.textContent = p.body;
      }
      toggle.addEventListener('click', () => {
        const expanded = bodyContent.classList.toggle('expanded');
        toggle.textContent = expanded ? 'Hide proposal ▴' : 'Show proposal ▾';
      });
      bodySection.appendChild(toggle);
      bodySection.appendChild(bodyContent);
      card.appendChild(bodySection);
    }
  } catch {
    loadingEl.remove(); // fail silently — link still shows
  }
}

function formatDuration(secs) {
  secs = Number(secs);
  if (secs <= 0)    return 'Any moment';
  if (secs < 3600)  return `${Math.floor(secs / 60)}m`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`;
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  return h > 0 ? `${d}d ${h}h` : `${d}d`;
}

// Walk answerEvents + revealMap to find the last meaningful (non-commitment or revealed) answer.
// Used for the banner when the latest event is an unrevealed commitment.
function updateCurrentAnswer(data) {
  const revealMap = data.revealMap || {};
  for (let i = data.answerEvents.length - 1; i >= 0; i--) {
    const ev = data.answerEvents[i];
    if (!ev.args.is_commitment) { data.currentAnswer = ev.args.answer; return; }
    const r = revealMap[ev.args.answer?.toLowerCase()];
    if (r) { data.currentAnswer = r; return; }
  }
}

function renderHistory(data) {
  const { answerEvents, qjson, arbitrationOccurred } = data;
  const revealMap = data.revealMap || {};
  const n        = answerEvents.length;

  // Max bond across all answers — used to scale bar widths
  const maxBond = answerEvents.reduce((mx, ev) => ev.args.bond > mx ? ev.args.bond : mx, 0n);

  // Build a reveal-only entry (no bond) to show below the corresponding commit
  function buildRevealItem(revealedAnswer) {
    const { label, color } = getAnswerDisplay(revealedAnswer, qjson);
    const letter = LETTER_MAP[color] || '·';
    const item   = el('div', 'answered-history-item');
    const conn   = el('div', 'bond-connector');
    conn.appendChild(el('div', `answer-dot dot-${color}`, letter));
    const main = el('div', 'bond-main');
    const labelEl = el('div', `bond-answer-label ${color} current-answer`);
    labelEl.appendChild(document.createTextNode(label));
    labelEl.appendChild(el('span', 'bond-tag tag-reveal', 'reveal'));
    main.appendChild(labelEl);
    item.appendChild(conn);
    item.appendChild(main);
    item.appendChild(el('div', 'bond-right'));  // empty — reveals have no bond
    return item;
  }

  function buildEntryContents(ev, tag, isCurrent) {
    const isCommitment = ev.args.is_commitment;
    const commitHash   = isCommitment ? ev.args.answer?.toLowerCase() : null;
    const revealedAns  = getRevealedAnswer(commitHash, revealMap);
    // Current entry: show revealed answer when available; history entries always show "Commitment"
    const showLabel    = isCommitment && (!isCurrent || !revealedAns) ? 'Commitment'
      : bytes32ToLabel(isCommitment ? revealedAns : ev.args.answer, qjson) || '?';
    const displayAns   = isCommitment ? revealedAns : ev.args.answer;
    const color   = (!isCommitment || displayAns) ? answerColorClass(displayAns, qjson) : 'other';
    const label   = showLabel;
    const bondStr = formatBond(ev.args.bond);
    const letter  = color === 'other' ? '?' : (LETTER_MAP[color] || '·');

    // Connector + dot
    const connector = el('div', 'bond-connector');
    connector.appendChild(el('div', `answer-dot dot-${color}`, letter));

    // Main: label + submeta
    const main      = el('div', 'bond-main');
    const isHex = /^0x[0-9a-f]{20,}$/i.test(label);
    const labelEl   = el('div', `bond-answer-label ${color} current-answer${isHex ? ' hex' : ''}`);
    labelEl.appendChild(document.createTextNode(label));
    if (tag) labelEl.appendChild(el('span', `bond-tag tag-${tag}`, tag));
    main.appendChild(labelEl);

    const submeta = el('div', 'bond-submeta');
    if (ev.args.user && !/^0x0+$/.test(ev.args.user)) {
      const links = addrLinks(ev.args.user);
      if (links) {
        const wrap = document.createElement('span');
        wrap.innerHTML = links;
        submeta.appendChild(wrap);
      }
      submeta.appendChild(document.createTextNode(' · '));
    }
    if (ev.args.ts) submeta.appendChild(document.createTextNode(formatRelTime(ev.args.ts)));
    // For unrevealed commitments, append the reveal deadline to the submeta line
    if (isCommitment && !revealedAns && ev.args.ts && data.timeout) {
      const revealTs = ev.args.ts + Math.floor(data.timeout / 8);
      submeta.appendChild(document.createTextNode(` · reveal ${formatRevealDeadline(revealTs)}`));
    }
    main.appendChild(submeta);

    // Right: bond amount + bar (omitted for arbitrated answers where bond is meaningless)
    const right = el('div', 'bond-right');
    if (tag !== 'arbitrated') {
      right.appendChild(el('div', `bond-amount answer-bond-value`, bondStr));
      const barWrap = el('div', 'bond-bar-wrap');
      const bar     = el('div', `bond-bar bar-${color}`);
      if (maxBond > 0n) {
        bar.style.width = Math.round(Number(ev.args.bond * 100n / maxBond)) + '%';
      }
      barWrap.appendChild(bar);
      right.appendChild(barWrap);
    }

    return { connector, main, right };
  }

  const curContainer = qPage.querySelector('.current-answer-container');
  if (!curContainer) return;

  if (n === 0) return;

  // Build current answer entry (latest)
  const latestIsArbitrated = arbitrationOccurred && answerEvents[n - 1].args.bond === 0n;
  const currentTag = latestIsArbitrated ? 'arbitrated' : 'current';
  const { connector, main, right } = buildEntryContents(answerEvents[n - 1], currentTag, true);
  curContainer.innerHTML = '';
  curContainer.appendChild(connector);
  curContainer.appendChild(main);
  curContainer.appendChild(right);

  if (n < 2) return;
  qPage.classList.add('has-history');
  const histContainer = qPage.querySelector('.answered-history-container');
  if (!histContainer) return;
  histContainer.innerHTML = '';

  // History: show from second-latest down to oldest (newest at top).
  // For each commitment that has been revealed, show the reveal as a separate entry
  // above the commitment (reveals are newer than the commits they follow).
  for (let i = n - 2; i >= 0; i--) {
    const ev = answerEvents[i];
    const isArbitrated = arbitrationOccurred && ev.args.bond === 0n;
    const tag  = isArbitrated ? 'arbitrated' : (i === n - 2 ? 'disputed' : null);
    const commitHash = ev.args.is_commitment ? ev.args.answer?.toLowerCase() : null;
    const revealedAns = getRevealedAnswer(commitHash, revealMap);
    if (revealedAns) histContainer.appendChild(buildRevealItem(revealedAns));
    const { connector, main, right } = buildEntryContents(ev, tag, false);
    const item = el('div', 'answered-history-item');
    item.appendChild(connector);
    item.appendChild(main);
    item.appendChild(right);
    histContainer.appendChild(item);
  }
}

// ── Arbitration section ───────────────────────────────────────────────────────
async function renderArbitrationSection(data, walletAddr) {
  const section = document.getElementById('arbitration-section');
  if (!section) return;

  const { arbitrator, bond, isPendingArbitration } = data;
  const finalized  = isFinalized(data.finalizeTS);
  const beforeOpen = isBeforeOpening(data.openingTS);
  const hasArbitrator = !isSelfArbitrator(arbitrator);

  if (!hasArbitrator) return;

  if (isPendingArbitration) {
    section.innerHTML = `
      <div class="card-title">Arbitration</div>
      <div class="arb-pending-notice" id="arb-pending-notice">Arbitration has been requested and is awaiting resolution by the arbitrator.</div>`;
    section.style.display = '';

    // Asynchronously refine the notice for Kleros foreign-proxy arbitrators.
    (async () => {
      try {
        const prov = reality?.provider || readProvider;
        const homeAbi = [
          'function metadata() view returns (string)',
          'function foreignProxy() view returns (address)',
          'function foreignChainId() view returns (uint256)',
        ];
        const home = new ethers.Contract(arbitrator, homeAbi, prov);
        let meta = {};
        try { meta = JSON.parse(await home.metadata()); } catch {}
        if (!meta.foreignProxy) return;

        const [fpAddr, fpChainBN] = await Promise.all([home.foreignProxy(), home.foreignChainId()]);
        const fpChainId = Number(fpChainBN);
        const fpRpcUrl = PUBLIC_RPC[fpChainId];
        if (!fpRpcUrl) return;
        const fpProv = new ethers.JsonRpcProvider(fpRpcUrl, fpChainId, { staticNetwork: true });
        const fpChainName = chainName(fpChainId);

        // Check whether a Kleros dispute already exists (new API, then old API fallback).
        let disputeExists = false;
        try {
          disputeExists = await new ethers.Contract(fpAddr,
            ['function arbitrationIDToDisputeExists(uint256) view returns (bool)'], fpProv)
            .arbitrationIDToDisputeExists(BigInt(QUESTION_ID));
        } catch {
          try {
            disputeExists = await new ethers.Contract(fpAddr,
              ['function questionIDToDisputeExists(bytes32) view returns (bool)'], fpProv)
              .questionIDToDisputeExists(QUESTION_ID);
          } catch {}
        }

        // If no dispute yet, check for an in-progress arbitration request via events.
        if (!disputeExists) {
          try {
            const reqFp = new ethers.Contract(fpAddr,
              ['event ArbitrationRequested(bytes32 indexed _questionID, address indexed _requester)'], fpProv);
            const evts = await reqFp.queryFilter(reqFp.filters.ArbitrationRequested(QUESTION_ID));
            for (const evt of evts) {
              let status = 0;
              try {
                [status] = await new ethers.Contract(fpAddr,
                  ['function arbitrationRequests(uint256, address) view returns (uint8, uint248, uint256, uint256)'], fpProv)
                  .arbitrationRequests(BigInt(QUESTION_ID), evt.args._requester);
              } catch {
                try {
                  [status] = await new ethers.Contract(fpAddr,
                    ['function arbitrationRequests(bytes32, address) view returns (uint8, uint248)'], fpProv)
                    .arbitrationRequests(QUESTION_ID, evt.args._requester);
                } catch {}
              }
              if (status > 0 && status < 4) { disputeExists = true; break; }
            }
          } catch {}
        }

        const el = document.getElementById('arb-pending-notice');
        if (!el) return;
        if (disputeExists) {
          el.textContent = `Dispute submitted to Kleros on ${fpChainName} and awaiting a ruling.`;
        } else {
          el.textContent = `Arbitration requested via Kleros. Waiting for the dispute to be registered on ${fpChainName}.`;
        }
      } catch {
        // Silently fail — generic notice remains
      }
    })();

    return;
  }

  if (finalized || beforeOpen || bond === 0n || !walletAddr) return;

  section.innerHTML = `
    <div class="card-title">Arbitration</div>
    <p class="arb-note" id="arb-note">Dispute the current answer by requesting arbitration.</p>
    <button class="arb-btn" id="arb-btn" disabled>Loading fee…</button>`;
  section.style.display = '';

  const btn     = document.getElementById('arb-btn');
  const noteEl  = document.getElementById('arb-note');
  const prov    = reality?.provider || readProvider;

  // Step 1: try direct arbitration (getDisputeFee on the question's arbitrator).
  // Step 2: on failure, detect Kleros foreign-proxy pattern and switch to the
  //         fee/TX on the foreign chain (typically Ethereum mainnet).
  let fee, arbContractAddr = arbitrator, txChainId = CHAIN_ID;

  try {
    fee = await new ethers.Contract(arbitrator, ARBITRATOR_ABI, prov).getDisputeFee(QUESTION_ID);
  } catch {
    // Kleros home proxy (e.g. Gnosis) always reverts getDisputeFee — it's a bridge.
    // Detect via metadata() → foreignProxy + foreignChainId, then query the foreign side.
    try {
      const homeAbi = [
        'function metadata() view returns (string)',
        'function foreignProxy() view returns (address)',
        'function foreignChainId() view returns (uint256)',
      ];
      const home = new ethers.Contract(arbitrator, homeAbi, prov);
      let meta = {};
      try { meta = JSON.parse(await home.metadata()); } catch {}
      if (!meta.foreignProxy) throw new Error('unknown arbitrator');

      const [fpAddr, fpChainBN] = await Promise.all([home.foreignProxy(), home.foreignChainId()]);
      txChainId = Number(fpChainBN);

      const fpRpcUrl = PUBLIC_RPC[txChainId];
      if (!fpRpcUrl) throw new Error(`No RPC for chain ${txChainId}`);
      const fpProv = new ethers.JsonRpcProvider(fpRpcUrl, txChainId, { staticNetwork: true });
      fee = await new ethers.Contract(fpAddr, ARBITRATOR_ABI, fpProv).getDisputeFee(QUESTION_ID);
      arbContractAddr = fpAddr;

      noteEl.textContent = `Dispute the current answer via Kleros. Your wallet will switch to ${chainName(txChainId)} to pay the arbitration fee.`;
    } catch {
      btn.textContent = 'Fee unavailable — arbitrator may not be responding';
      return;
    }
  }

  const nativeToken = CHAIN_TOKEN[txChainId] || 'ETH';
  const btnLabel = fee === 0n
    ? 'Request arbitration (free)'
    : `Request arbitration — costs ${formatEth(fee)} ${nativeToken}`;
  btn.textContent = btnLabel;
  btn.disabled = false;

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    try {
      if (!window.ethereum) throw new Error('No wallet connected');

      // Switch to the correct chain (question chain for direct, foreign chain for Kleros)
      const targetHex = '0x' + txChainId.toString(16);
      const currentHex = await window.ethereum.request({ method: 'eth_chainId' });
      if (parseInt(currentHex, 16) !== txChainId) {
        btn.textContent = `Switching to ${chainName(txChainId)}…`;
        try {
          await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: targetHex }] });
        } catch (switchErr) {
          if ((switchErr.code === 4902 || switchErr.code === -32603) && CHAIN_ADD_PARAMS?.[txChainId]) {
            await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [CHAIN_ADD_PARAMS[txChainId]] });
          } else {
            throw switchErr;
          }
        }
      }

      btn.textContent = 'Waiting for wallet…';
      const wp = new ethers.BrowserProvider(window.ethereum);
      const tx = await new ethers.Contract(arbContractAddr, ARBITRATOR_ABI, await wp.getSigner())
        .requestArbitration(QUESTION_ID, bond, { value: fee });
      btn.textContent = 'Pending…';
      await tx.wait();
      _autoStarFn?.();
      btn.textContent = '✓ Done';
      setTimeout(() => location.reload(), 1500);
    } catch (err) {
      btn.disabled = false;
      btn.textContent = btnLabel;
      showTxError(btn, txErrorMessage(err));
    }
  });
}

function renderClaimHistory(data) {
  const section = qPage.querySelector('#claim-history');
  if (!section || !data.claims || data.claims.length === 0) return;
  const list = section.querySelector('.claim-history-list');
  list.innerHTML = '';
  data.claims.forEach(c => {
    const row = el('div', 'claim-history-row');
    const addr = el('span', 'claim-addr');
    addr.innerHTML = addrLinks(c.user) || (c.user.slice(0,6) + '…' + c.user.slice(-4));
    const amt  = el('span', 'claim-amount', formatEth(c.amount) + ' ' + metaToken);
    const date = el('span', 'claim-date', new Date(c.ts * 1000).toLocaleDateString());
    row.appendChild(addr);
    row.appendChild(amt);
    row.appendChild(date);
    list.appendChild(row);
  });
  section.style.display = '';
}

function renderStatusCard(data) {
  const card   = qPage.querySelector('#status-card');
  const banner = qPage.querySelector('#answer-banner');
  if (!card) return;

  const { answerEvents, qjson, bond, finalizeTS, timeout, minBond, arbitrator, isPendingArbitration } = data;
  const n        = answerEvents.length;
  // Pending arbitration blocks on-chain finalization regardless of elapsed time.
  const finalized = isFinalized(finalizeTS) && !isPendingArbitration;

  function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  // Current answer banner in col-main
  if (banner && n > 0) {
    const latest     = answerEvents[n - 1];
    const revealMap  = data.revealMap || {};
    const commitHash = latest.args.is_commitment ? latest.args.answer?.toLowerCase() : null;
    const latestReveal = getRevealedAnswer(commitHash, revealMap);

    let displayAns = null, pendingReveal = false;
    if (commitHash && !latestReveal) {
      // Unrevealed commitment: show the answer the contract currently holds (set before the commit).
      pendingReveal = true;
      displayAns = data.currentAnswer || null;
    } else {
      displayAns = latestReveal ?? latest.args.answer ?? null;
    }

    const label   = (displayAns && bytes32ToLabel(displayAns, qjson)) || '?';
    const color   = displayAns ? answerColorClass(displayAns, qjson) : 'other';
    const bgCls   = color === 'yes' ? 'answer-banner-yes' : color === 'no' ? 'answer-banner-no' : 'answer-banner-inv';
    const isHex   = /^0x[0-9a-f]{20,}$/i.test(label);
    const topBond = answerEvents.reduce((mx, ev) => ev.args.bond > mx ? ev.args.bond : mx, 0n);
    const bondStr = formatBond(topBond);
    let pendingBadge = '';
    if (pendingReveal) {
      const revealTs = latest.args.ts && timeout ? latest.args.ts + Math.floor(timeout / 8) : 0;
      const dlStr = revealTs ? formatRevealDeadline(revealTs) : null;
      if (dlStr !== 'deadline passed') {
        const badgeText = dlStr ? `pending reveal · ${dlStr}` : 'pending reveal';
        pendingBadge = `<span class="bond-tag tag-pending">${esc(badgeText)}</span>`;
      }
    }
    banner.innerHTML = `
      <div class="card-title">${finalized ? 'Final answer' : 'Current answer'}</div>
      <span class="answer-banner-value ${bgCls}${isHex ? ' hex' : ''}">${esc(label)}${pendingBadge}</span>
      <div class="answer-banner-meta">Top bond: <strong>${esc(bondStr)}</strong></div>`;
    banner.style.display = '';
  }

  let html = '<div class="card-title">Status</div>';

  // Timer — suppressed while arbitration is pending (finalization is blocked on-chain).
  const now = Math.floor(Date.now() / 1000);
  if (finalized) {
    html += `
      <div class="timer-row">
        <span class="timer-val finalized">Finalized</span>
      </div>`;
  } else if (!isPendingArbitration && finalizeTS > 0) {
    const remaining = Math.max(0, finalizeTS - now);
    const barPct = timeout > 0 ? Math.max(0, Math.min(100, Math.round((1 - remaining / timeout) * 100))) : 0;
    html += `
      <div class="timer-row">
        <span class="timer-label">Finalizes in</span>
        <span class="timer-val" id="timer-val">${esc(formatDuration(remaining))}</span>
      </div>
      <div class="timer-bar-wrap"><div class="timer-bar" id="timer-bar" style="width:${barPct}%"></div></div>`;
  }

  // Stats grid
  const totalBond = answerEvents.reduce((sum, ev) => sum + ev.args.bond, 0n);
  const arbHtml = isSelfArbitrator(arbitrator)
    ? 'No arbitrator'
    : (addrLinks(arbitrator) || `${arbitrator.slice(0,6)}…${arbitrator.slice(-4)}`);
  const minBondStr = (minBond ?? 0n) > 0n ? formatBond(minBond) : '—';
  const totalStr   = totalBond > 0n ? formatBond(totalBond) : '—';

  html += `
    <div class="status-grid">
      <div class="sg-item">
        <span class="sg-label">Answers</span>
        <span class="sg-val">${n}</span>
      </div>
      <div class="sg-item">
        <span class="sg-label">Total bonds</span>
        <span class="sg-val">${esc(totalStr)}</span>
      </div>
      <div class="sg-item">
        <span class="sg-label">Arbitrator</span>
        <span class="sg-val">${arbHtml}</span>
      </div>
      <div class="sg-item">
        <span class="sg-label">Min bond</span>
        <span class="sg-val">${esc(minBondStr)}</span>
      </div>
    </div>`;

  card.innerHTML = html;
  card.style.display = '';
}

// ── Details card ─────────────────────────────────────────────────────────────
// ── Live countdown + new-answer detection ──────────────────────────────────

function showUpdateBanner(msg) {
  if (document.getElementById('q-update-banner')) return;
  const b = document.createElement('div');
  b.id = 'q-update-banner';
  b.style.cssText = [
    'position:fixed;bottom:20px;left:50%;transform:translateX(-50%)',
    'background:#1c2330;border:1px solid #30363d;border-radius:8px',
    'padding:11px 16px;display:flex;align-items:center;gap:12px',
    'font-size:13px;color:#e6edf3;z-index:9000;white-space:nowrap',
    'box-shadow:0 4px 16px rgba(0,0,0,0.6)',
  ].join(';');
  const span = document.createElement('span');
  span.textContent = msg;
  const reload = document.createElement('button');
  reload.textContent = 'Reload';
  reload.style.cssText = 'padding:4px 11px;background:#58a6ff;border:none;border-radius:5px;color:#0d1117;cursor:pointer;font-size:12px;font-weight:600;font-family:inherit';
  reload.onclick = () => location.reload();
  const dismiss = document.createElement('button');
  dismiss.textContent = '×';
  dismiss.style.cssText = 'background:none;border:none;color:#8b949e;cursor:pointer;font-size:16px;line-height:1;padding:0 2px;font-family:inherit';
  dismiss.onclick = () => b.remove();
  b.appendChild(span); b.appendChild(reload); b.appendChild(dismiss);
  document.body.appendChild(b);
}

function startCountdown(finalizeTS, timeout) {
  const valEl = document.getElementById('timer-val');
  const barEl = document.getElementById('timer-bar');
  if (!valEl) return;
  const id = setInterval(() => {
    if (isFinalized(finalizeTS)) {
      clearInterval(id);
      showUpdateBanner('This question has finalized.');
      _renderDynamic?.();
      return;
    }
    const now = Math.floor(Date.now() / 1000);
    const rem = Math.max(0, finalizeTS - now);
    valEl.textContent = formatDuration(rem);
    if (barEl && timeout > 0) {
      barEl.style.width = `${Math.max(0, Math.min(100, Math.round((1 - rem / timeout) * 100)))}%`;
    }
  }, 1000);
}

function startPoll(initialFinalizeTS) {
  if (isFinalized(initialFinalizeTS)) return;
  const ponderUrl = window.RealitySettings?.getPonderUrl(CHAIN_ID) || `/graphql/${CHAIN_ID}`;
  const qid   = JSON.stringify(PONDER_QUESTION_ID);
  const query  = `{ question(id: ${qid}) { scheduledFinalizationTimestamp } }`;
  const id = setInterval(async () => {
    try {
      const resp = await ponderFetch(ponderUrl, { query });
      if (!resp.ok) return;
      const json = await resp.json();
      const newFinTS = Number(json.data?.question?.scheduledFinalizationTimestamp || 0);
      if (newFinTS !== initialFinalizeTS) {
        clearInterval(id);
        showUpdateBanner('A new answer has been posted.');
      }
    } catch {}
  }, 30_000);
}

function buildDetailsCard(data, chainId) {
  const token = CHAIN_TOKEN[chainId] || 'ETH';

  function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  function addrHtml(a) {
    return addrLinks(a, chainId);
  }

  function dur(s) {
    s = Number(s);
    if (s < 3600)   return `${Math.floor(s/60)} min`;
    if (s < 86400)  return `${Math.floor(s/3600)}h`;
    if (s < 604800) return `${Math.floor(s/86400)}d`;
    return `${Math.floor(s/604800)}w`;
  }

  function date(ts) {
    return new Date(Number(ts)*1000).toLocaleString(undefined, {
      month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit'
    });
  }

  const rows = [];
  function row(key, val) {
    if (val) rows.push(`<div class="meta-row"><span class="meta-key">${esc(key)}</span><span class="meta-val">${val}</span></div>`);
  }

  const TYPE_LABEL = { bool:'Yes / No', uint:'Number', int:'Number', 'single-select':'Single choice', 'multiple-select':'Multiple choice', datetime:'Date / time' };
  row('Type', esc(TYPE_LABEL[data.qjson?.type] || data.qjson?.type || ''));
  if (data.qjson?.category) row('Category', esc(data.qjson.category));
  if (data.qjson?.lang && data.qjson.lang !== 'en') row('Language', esc(data.qjson.lang));
  if (data.openingTS > 0) {
    const past = data.openingTS * 1000 < Date.now();
    row(past ? 'Opened' : 'Opens', esc(date(data.openingTS)));
  }
  if (data.timeout > 0) row('Resolution window', esc(dur(data.timeout)));
  if ((data.minBond ?? 0n) > 0n) row('Min bond', esc(formatBond(data.minBond, token)));
  if ((data.bond ?? 0n) > 0n)    row('Current bond', esc(formatBond(data.bond, token)));
  row('Arbitrator', isSelfArbitrator(data.arbitrator) ? 'No arbitrator' : addrHtml(data.arbitrator));
  if (data.creator) row('Creator', addrHtml(data.creator));
  if (data.createdTimestamp && data.createdTxHash) {
    const _exp = EXPLORER[chainId] || '';
    const _txUrl = _exp ? `${_exp}/tx/${esc(data.createdTxHash)}` : '';
    const _dateStr = esc(date(data.createdTimestamp));
    row('Created', _txUrl
      ? `<a href="${_txUrl}" target="_blank" rel="noopener noreferrer">${_dateStr} ↗</a>`
      : _dateStr);
  }
  const _exp = EXPLORER[chainId] || '';
  const _expLink = _exp ? ` <a class="bond-addr-ext" href="${_exp}/address/${esc(CONTRACT)}" target="_blank" rel="noopener noreferrer">↗</a>` : '';
  row('Contract', `<a href="#!/network/${chainId}/contract/${esc(CONTRACT)}">${esc(CONTRACT.slice(0,8))}…${esc(CONTRACT.slice(-6))}</a>${_expLink}`);
  row('Question ID', `<span class="meta-val mono">${QUESTION_ID.slice(0,10)}…${QUESTION_ID.slice(-8)}</span><button class="copy-btn" title="Copy full ID" onclick="var b=this;navigator.clipboard.writeText('${QUESTION_ID}').then(function(){b.textContent='✓';setTimeout(function(){b.textContent='⎘'},1500)})">⎘</button>`);

  const card = el('div', 'card');
  card.innerHTML = `<div class="card-title">Details</div><div class="meta-list">${rows.join('')}</div>`;
  return card;
}

// ── Locked interact state ─────────────────────────────────────────────────────
function buildLockedState(data) {
  const { bond, minBond, qjson } = data;
  const b = bond ?? 0n;
  const mb = minBond ?? 0n;
  const minRequired = mb > 0n && b === 0n
    ? mb
    : b > 0n ? b * 2n : (mb > 0n ? mb : 0n);
  const nextBondStr = minRequired > 0n ? formatBond(minRequired) : null;

  const type = qjson?.type || 'bool';
  const isMulti  = type === 'multiple-select';
  const isSelect = type === 'single-select' || isMulti;
  const outcomes = isSelect ? (qjson?.outcomes || []) : [];

  const card = el('div', 'card');
  card.appendChild(el('div', 'card-title', 'Answer'));

  if (outcomes.length) {
    const inputWrap = el('div', 'answer-input-wrap');
    if (isMulti) {
      outcomes.forEach((o, i) => {
        const lbl = el('label', 'multi-option');
        const cb = document.createElement('input');
        cb.type = 'checkbox'; cb.value = String(i);
        lbl.appendChild(cb);
        lbl.appendChild(document.createTextNode(' ' + o));
        inputWrap.appendChild(lbl);
      });
    } else {
      const select = document.createElement('select');
      select.className = 'answer-select';
      const def = el('option'); def.value = ''; def.textContent = '— Select —'; def.selected = true;
      select.appendChild(def);
      outcomes.forEach((o, i) => {
        const opt = el('option'); opt.value = String(i); opt.textContent = o;
        select.appendChild(opt);
      });
      inputWrap.appendChild(select);
    }
    card.appendChild(inputWrap);
  }

  const locked = el('div', 'interact-locked');
  const lockIcon = el('div', 'lock-icon');
  lockIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
  locked.appendChild(lockIcon);
  locked.appendChild(el('div', 'lock-text', 'Connect your wallet to answer this question or dispute the current answer.'));
  card.appendChild(locked);

  const btn = document.createElement('button');
  btn.className = 'btn-connect'; btn.textContent = 'Connect wallet';
  btn.addEventListener('click', () => {
    if (typeof RealityWallet !== 'undefined') RealityWallet.connectWallet(addr => window._globalWalletChange?.(addr));
  });
  card.appendChild(btn);

  if (nextBondStr) {
    const hint = el('div', 'interact-hint');
    hint.innerHTML = `Next valid bond: <strong>${nextBondStr}</strong>`;
    card.appendChild(hint);
  }

  return card;
}

// ── RPC verification ─────────────────────────────────────────────────────────
async function verifyWithRpc(data) {
  if (!reality) return;

  console.log(`[reality.eth] verifyWithRpc: ponder events=${data.answerEvents.length} currentAnswer=${data.currentAnswer} finalizeTS=${data.finalizeTS}`);

  const errors = [];
  let liveStateUpdated = false;
  let newEntryPushed = false;
  let needsEventFetch = false;

  const connEl = document.getElementById('ind-connector');
  indGroup?.classList.add('verifying');
  if (connEl) {
    connEl.removeAttribute('aria-hidden');
    connEl.title = 'Verifying Ponder data against RPC…';
  }
  await withIndicator(rpcInd, async () => {
    // questionsStruct reads the public questions() mapping directly — works on v2 and v3.
    // Individual getter functions (getBestAnswer, getFinalizeTS, etc.) were only added in v3
    // and revert on v2.x contracts, so we avoid them here.
    const [q, templateHash] = await Promise.all([
      questionsStruct(reality.runner, CONTRACT, QUESTION_ID),
      data.templateId > 4 ? safeCall(() => reality.template_hashes(data.templateId), null) : Promise.resolve(null),
    ]);

    const bestAnswer  = q?.best_answer  ?? null;
    const historyHash = q?.history_hash ?? null;
    const bond        = q?.bond         ?? null;
    const finalizeTS  = q !== null ? q.finalize_ts : null;
    const timeout     = q !== null ? q.timeout     : null;
    const arbitrator  = q?.arbitrator   ?? null;
    const contentHash = q?.content_hash ?? null;
    console.log(`[reality.eth] verifyWithRpc: struct bestAnswer=${bestAnswer} finalizeTS=${finalizeTS} bond=${bond} q=${q ? 'ok' : 'null'}`);

    // Content hash covers templateId + openingTs + question data in one shot
    if (contentHash) {
      const computed = ethers.solidityPackedKeccak256(
        ['uint256', 'uint32', 'string'],
        [data.templateId, data.openingTS, data.questionStr]
      );
      if (computed.toLowerCase() !== contentHash.toLowerCase())
        errors.push('content hash mismatch');
    }

    // Template text (custom templates only)
    if (templateHash && data.templateStr) {
      const computed = ethers.keccak256(ethers.toUtf8Bytes(data.templateStr));
      if (computed.toLowerCase() !== templateHash.toLowerCase())
        errors.push('template hash mismatch');
    }

    // Reconstruct history hash from the answer list.
    // Skip for finalized questions: claiming rewinds the on-chain hash, so a
    // mismatch is expected and tells us nothing useful once settled.
    const histHashFinalized = isFinalized(data.finalizeTS) || isFinalized(Number(finalizeTS ?? 0n));
    // Skip for finalized questions that already have Ponder events: claiming rewinds the
    // on-chain hash, so a mismatch against indexed events would be a false positive.
    // When Ponder has zero events, a non-zero on-chain hash unambiguously means indexer lag —
    // run the check regardless of finalization.
    const skipHistCheck = histHashFinalized && data.answerEvents.length > 0;
    if (historyHash !== null && !skipHistCheck) {
      let computed = ZERO_HASH;
      for (const ev of data.answerEvents) {
        computed = ethers.solidityPackedKeccak256(
          ['bytes32', 'bytes32', 'uint256', 'address', 'bool'],
          [computed, ev.args.answer, ev.args.bond, ev.args.user, ev.args.is_commitment]
        );
      }
      const histMatch = computed.toLowerCase() === historyHash.toLowerCase();
      console.log(`[reality.eth] verifyWithRpc: historyHash check — computed=${computed.slice(0,10)} onchain=${historyHash.slice(0,10)} match=${histMatch}`);
      if (!histMatch)
        needsEventFetch = true; // Ponder history is incomplete; repair from RPC
    } else {
      console.log(`[reality.eth] verifyWithRpc: historyHash check skipped — finalized=${histHashFinalized} ponderEvents=${data.answerEvents.length} historyHash=${historyHash ? 'present' : 'null'}`);
    }

    // Fill revealMap from on-chain commitments() for any commitment entries missing from Ponder
    // (e.g. indexing lag, or commitment submitted after Ponder last synced).
    if (!data.revealMap) data.revealMap = {};
    const allCommitEntries = data.answerEvents.filter(
      ev => ev.args.is_commitment && ev.args.answer && ev.args.answer !== ZERO_HASH
    );
    if (allCommitEntries.length > 0) {
      const commitmentResults = await Promise.all(
        allCommitEntries.map(ev => safeCall(() => reality.commitments(ev.args.answer), null))
      );
      let mapChanged = false;
      for (let i = 0; i < allCommitEntries.length; i++) {
        const c = commitmentResults[i];
        if (c?.is_revealed) {
          const key = allCommitEntries[i].args.answer.toLowerCase();
          if (!data.revealMap[key]) {
            data.revealMap[key] = c.revealed_answer;
            mapChanged = true;
          }
        }
      }
      if (mapChanged) {
        const latest = data.answerEvents[data.answerEvents.length - 1];
        const latestKey = latest.args.is_commitment ? latest.args.answer?.toLowerCase() : null;
        if (latestKey && data.revealMap[latestKey]) {
          // Latest commitment has now been revealed — update finalizeTS and clear pending notice
          if (finalizeTS !== null) data.finalizeTS = Number(finalizeTS);
          qPage.querySelector('.pending-reveal-notice')?.remove();
        }
        // Recompute currentAnswer now that revealMap is fuller
        updateCurrentAnswer(data);
        _renderDynamic?.();
      }
    }

    // For the RPC path, data.currentAnswer starts null; derive it now from events + revealMap.
    if (data.currentAnswer === null) updateCurrentAnswer(data);

    // Apply live state from RPC — always authoritative regardless of Ponder sync status.
    if (bond !== null && bond !== data.bond) { data.bond = bond; liveStateUpdated = true; }
    if (finalizeTS !== null && Number(finalizeTS) !== data.finalizeTS) { data.finalizeTS = Number(finalizeTS); liveStateUpdated = true; }

    // Detect on-chain answer that Ponder hasn't indexed yet.
    let hasUnrevealedTopCommit = false;
    if (bestAnswer !== null && bestAnswer !== ZERO_HASH) {
      const n = data.answerEvents.length;
      let expectedAnswer = ZERO_HASH;
      if (n > 0) {
        const latest = data.answerEvents[n - 1];
        const latestKey = latest.args.is_commitment ? latest.args.answer?.toLowerCase() : null;
        const latestReveal = latestKey ? (data.revealMap[latestKey] || null) : null;
        hasUnrevealedTopCommit = !!(latestKey && !latestReveal);
        console.log(`[reality.eth] verifyWithRpc: bestAnswer check — n=${n} latestAnswer=${latest.args.answer?.slice(0,10)} hasUnrevealedTop=${hasUnrevealedTopCommit}`);
        // reality.eth only updates best_answer on reveal (not on commit), so an unrevealed
        // commitment at the top means getBestAnswer() still reflects the prior confirmed answer.
        expectedAnswer = hasUnrevealedTopCommit
          ? (data.currentAnswer?.toLowerCase() || ZERO_HASH)
          : (latestReveal?.toLowerCase() || latest.args.answer?.toLowerCase() || ZERO_HASH);
      }
      console.log(`[reality.eth] verifyWithRpc: bestAnswer=${bestAnswer.slice(0,10)} expectedAnswer=${expectedAnswer.slice(0,10)} match=${bestAnswer.toLowerCase() === expectedAnswer.toLowerCase()}`);
      if (bestAnswer.toLowerCase() !== expectedAnswer.toLowerCase()) {
        const newCommit = await safeCall(() => reality.commitments(bestAnswer), null);
        if (newCommit !== null && Number(newCommit.reveal_ts) > 0 && !newCommit.is_revealed) {
          // New unrevealed commitment not yet in Ponder
          data.answerEvents.push({
            args: { is_commitment: true, answer: bestAnswer, bond: data.bond, user: null, ts: 0 }
          });
          newEntryPushed = true;
        } else {
          // Direct answer not yet in Ponder — synthesize for immediate display;
          // a background log fetch below will replace this with the real event(s).
          // _synthetic marks this so the fetch knows to replace rather than merge.
          const synthTs = data.finalizeTS > data.timeout ? data.finalizeTS - data.timeout : 0;
          data.answerEvents.push({
            _synthetic: true,
            args: { is_commitment: false, answer: bestAnswer, bond: data.bond, user: null, ts: synthTs }
          });
          data.currentAnswer = bestAnswer;
          newEntryPushed = true;
          needsEventFetch = true;
        }
      }
    }

    // bond > 0 with no Ponder events = the question was answered but history is missing from
    // the index.  This catches three cases:
    //   • historyHash mismatch already set needsEventFetch (unclaimed, hash mismatch)
    //   • bestAnswer mismatch already set needsEventFetch (non-zero missed answer)
    //   • Fully claimed: claimWinnings rewinds history_hash to ZERO_HASH, so it matches
    //     our computed ZERO_HASH — neither earlier check fires.  bond is the only survivor
    //     that proves an answer exists.
    if (data.answerEvents.length === 0 && bond !== null && BigInt(bond) > 0n) {
      needsEventFetch = true;
      if (!newEntryPushed) {
        const synthTs = data.finalizeTS > data.timeout ? data.finalizeTS - data.timeout : 0;
        data.answerEvents.push({
          _synthetic: true,
          args: { is_commitment: false, answer: bestAnswer ?? ZERO_HASH, bond, user: null, ts: synthTs }
        });
        data.currentAnswer = bestAnswer ?? ZERO_HASH;
        newEntryPushed = true;
      }
    }

    if (timeout !== null && Number(timeout) !== data.timeout)
      errors.push('timeout mismatch');
    if (arbitrator !== null && data.arbitrator &&
        arbitrator.toLowerCase() !== data.arbitrator.toLowerCase())
      errors.push('arbitrator mismatch');

    if (liveStateUpdated || newEntryPushed) {
      _renderDynamic?.();
    }
  });

  indGroup?.classList.remove('verifying');
  const ind = ponderInd;
  if (!ind) return;
  if (errors.length === 0) {
    indGroup?.classList.add('verified');
    const rpcSupplemented = liveStateUpdated || newEntryPushed || needsEventFetch;
    ind.title = rpcSupplemented
      ? 'Ponder (indexed data) — display updated from live RPC'
      : 'Ponder (indexed data) — RPC verified ✓';
    if (connEl) {
      connEl.title = rpcSupplemented
        ? 'Ponder index is behind — display updated from live RPC — click for details'
        : 'Ponder data verified against RPC — click for details';
      connEl.style.cursor = 'pointer';
      connEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!window.RealitySettings) return;
        RealitySettings.openPanel(connEl, 300, (panel) => {
          panel.innerHTML = rpcSupplemented ? `
            <div class="sp-title">Live RPC Data</div>
            <p class="sp-body">The Ponder index has not yet caught up with this chain. The answer, bond, and finalization status shown are fetched directly from the blockchain.</p>
          ` : `
            <div class="sp-title">RPC Verification ✓</div>
            <p class="sp-body">The indexed data from Ponder was cross-checked directly against the blockchain RPC. Content hash, answer history, current answer, bond, and finalization timestamp all match on-chain state — the index is consistent.</p>
          `;
        });
      }, { once: true });
    }
    // Warm the events cache in the background using pinpoint single-block fetches.
    // Ponder tells us the exact createdBlock for each event, so we don't need
    // a range scan at all — just one eth_getLogs call per unique block.
    // Only runs if the cache is empty.
    (async () => {
      try {
        const existing = await QCache.get(CHAIN_ID, CONTRACT, QUESTION_ID);
        if (existing.qEvent) return;
        const currentBlock = await safeCall(() => reality.runner.getBlockNumber(), null);
        if (!currentBlock) return;

        // LogNewQuestion — fetch from its exact block
        let qEv = null;
        if (data.createdBlock) {
          const qEvs = await safeCall(() => reality.queryFilter(
            reality.filters.LogNewQuestion(QUESTION_ID), data.createdBlock, data.createdBlock), []);
          qEv = qEvs[0] ?? null;
        }
        if (!qEv) return;

        // LogNewAnswer — one query per unique block, fetched 5 at a time to avoid RPC bursts.
        const uniqueBlocks = [...new Set(data.answerEvents.map(ev => ev.blockNumber).filter(Number.isInteger))];
        const answerChunks = [];
        for (let i = 0; i < uniqueBlocks.length; i += 5) {
          const chunk = await Promise.all(uniqueBlocks.slice(i, i + 5).map(b =>
            safeCall(() => reality.queryFilter(
              reality.filters.LogNewAnswer(null, QUESTION_ID), b, b), [])));
          answerChunks.push(...chunk);
        }
        const answers = answerChunks.flat()
          .sort((a, b) => a.blockNumber - b.blockNumber || a.logIndex - b.logIndex);

        await withIndicator(cacheInd, () => QCache.put(CHAIN_ID, CONTRACT, QUESTION_ID, qEv, answers, currentBlock));
        cacheInd?.classList.add('hit');
        setTimeout(() => cacheInd?.classList.remove('hit'), 2000);
      } catch { /* best-effort — never block the UI */ }
    })();
  } else {
    ind.classList.add('fail');
    const failMsg = `Inconsistency: ${errors.join('; ')}`;
    ind.title = `Ponder — WARNING: ${failMsg}`;
    ind.dataset.lastError = failMsg;
    ind.dataset.ponderUrl = window.RealitySettings?.getPonderUrl(CHAIN_ID) || `/graphql/${CHAIN_ID}`;
    console.warn('[reality.eth] RPC verification discrepancies:', errors);
  }

  console.log(`[reality.eth] verifyWithRpc: done — needsEventFetch=${needsEventFetch} liveStateUpdated=${liveStateUpdated} newEntryPushed=${newEntryPushed}`);

  // Background: fetch real LogNewAnswer events when Ponder missed them.
  // Scans from the question creation block up to the finalization block — all answers
  // must fall within that window, so we never need to scan beyond it.
  if (needsEventFetch && reality) {
    (async () => {
      try {
        const currentBlock = await safeCall(() => reality.runner.getBlockNumber(), null);
        if (currentBlock === null) return;

        const startBlock = data.createdBlock || CONTRACT_START_BLOCK[CONTRACT.toLowerCase()] || 0;

        // For finalized questions, limit the scan to the approximate finalization block
        // to avoid scanning months of irrelevant chain history beyond the answer window.
        // Approximate block times (seconds/block) keyed by chain ID.
        const BT = { 1:12, 10:2, 56:3, 100:5, 137:2, 42161:2, 8453:2, 43114:2, 42220:5, 11155111:12 };
        const blockTime = BT[CHAIN_ID] || 5;
        let endBlock = currentBlock;
        if (isFinalized(data.finalizeTS)) {
          const secondsSinceFinalize = Math.floor(Date.now() / 1000) - data.finalizeTS;
          const blocksAgo = Math.ceil(secondsSinceFinalize / blockTime);
          const estimatedFinalizeBlock = currentBlock - blocksAgo;
          if (estimatedFinalizeBlock > startBlock) {
            // 500-block buffer accounts for block time estimation variance
            endBlock = Math.min(currentBlock, estimatedFinalizeBlock + 500);
          }
          // else: estimate is before startBlock (e.g. test env) — fall back to currentBlock
        }

        console.log(`[reality.eth] eventFetch: scanning LogNewAnswer from block ${startBlock} to ${endBlock} (currentBlock=${currentBlock} finalizeTS=${data.finalizeTS})`);
        const rawEvents = await queryFilterRobust(
          reality, reality.filters.LogNewAnswer(null, QUESTION_ID), startBlock, endBlock);
        console.log(`[reality.eth] eventFetch: found ${rawEvents.length} events`);
        if (rawEvents.length === 0) return;
        data.answerEvents = rawEvents.map(ev => ({
          blockNumber:     ev.blockNumber,
          logIndex:        ev.logIndex,
          transactionHash: ev.transactionHash,
          args: {
            answer:        ev.args.answer,
            question_id:   ev.args.question_id,
            history_hash:  ev.args.history_hash,
            user:          ev.args.user,
            bond:          ev.args.bond,
            ts:            Number(ev.args.ts),
            is_commitment: ev.args.is_commitment,
          },
        }));
        // Resolve any commit entries so revealMap has the actual answer before rendering.
        // Without this, commit events set currentAnswer to the commitment hash, not the
        // revealed answer (e.g. "No" = ZERO_HASH would show as the raw commitment id).
        const bgCommitEvs = data.answerEvents.filter(
          ev => ev.args.is_commitment && ev.args.answer && ev.args.answer !== ZERO_HASH
        );
        if (bgCommitEvs.length > 0) {
          if (!data.revealMap) data.revealMap = {};
          const bgCommitResults = await Promise.all(
            bgCommitEvs.map(ev => safeCall(() => reality.commitments(ev.args.answer), null))
          );
          for (let i = 0; i < bgCommitEvs.length; i++) {
            const c = bgCommitResults[i];
            if (c?.is_revealed)
              data.revealMap[bgCommitEvs[i].args.answer.toLowerCase()] = c.revealed_answer;
          }
        }
        updateCurrentAnswer(data);
        _renderDynamic?.();
      } catch {}
    })();
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
// Set by main() once data is loaded; called by verifyWithRpc and startCountdown
// whenever data changes so all state-dependent UI stays in sync.
let _renderDynamic = null;

async function main(hintAddr) {
  const BN0 = 0n;

  // contractsMetaPromise already started at module load; awaited before renderWarnings
  // (and also awaited in the RPC fallback path to get the deployment block)

  // 1. Wallet setup — check chain ID so reads always go to the right chain
  let walletAddr = null;
  if (window.ethereum) {
    try {
      const [accounts, chainHex] = await Promise.all([
        window.ethereum.request({ method: 'eth_accounts' }),
        window.ethereum.request({ method: 'eth_chainId' }),
      ]);
      walletAddr = (accounts && accounts[0]) || null;
      const walletChainId = parseInt(chainHex, 16);
      const _wp = new ethers.BrowserProvider(window.ethereum);
      // Use wallet for reads when on the right chain and user hasn't disabled it
      if (walletChainId === CHAIN_ID && (window.RealitySettings?.getUseBrowserRpc() ?? true)) {
        reality = new ethers.Contract(CONTRACT, REALITY_ABI, _wp);
      }
      // Wallet is always the write provider (user must switch chain themselves)
      realityRW = new ethers.Contract(CONTRACT, REALITY_ABI, await _wp.getSigner());
    } catch {}
  }
  // If eth_accounts returned nothing but the router already has a connected wallet
  // (e.g. WalletConnect session not yet ready, or SPA navigation mid-session),
  // use the hint for the initial render. realityRW will be wired up when
  // _setQuestionWallet fires once the provider is fully initialised.
  if (!walletAddr && hintAddr) {
    walletAddr = hintAddr;
    if (window.ethereum) {
      try {
        const _wp = new ethers.BrowserProvider(window.ethereum);
        realityRW = new ethers.Contract(CONTRACT, REALITY_ABI, await _wp.getSigner());
      } catch {}
    }
  }
  // Fall back to public RPC for reads if wallet is absent or on wrong chain
  if (!reality && readProvider) {
    reality = new ethers.Contract(CONTRACT, REALITY_ABI, readProvider);
  }

  // 2. Load question data — Ponder first (production), RPC fallback (test env)
  let data;
  try {
    const ponderResult = await fetchPonderData();
    const pq = ponderResult.question;
    data = adaptPonderData(ponderResult);
    if (pq.questionJson) {
      // Fast-path: indexer pre-computed the full qjson including has_invalid, decimals, precision.
      data.qjson = RealityLib.parseQuestionJSON(pq.questionJson);
      // Still fetch template for markdown title rendering (title_html).
      let templateStr;
      try {
        templateStr = await fetchTemplateStr(Number(pq.templateId || 0));
        data.templateStr = templateStr;
        const full = populateTemplate(templateStr, pq.data);
        if (full.title_html) {
          data.qjson.title_html = full.title_html;
          data.qjson.title_text = full.title_text;
        }
      } catch (e) {
        console.warn('[question] template render error:', e);
      }
      // Fallback markdown render when title_html wasn't produced (e.g. pq.data is null).
      if (pq.title && !data.qjson.title_html && templateStr) {
        const isMd = /"format"\s*:\s*"text\/markdown"/.test(templateStr);
        if (isMd) {
          try {
            const fakeJson = JSON.stringify({ title: pq.title, type: data.qjson.type || 'bool', format: 'text/markdown' });
            const mdFull = populateTemplate(fakeJson, '');
            if (mdFull.title_html) {
              data.qjson.title_html = mdFull.title_html;
              data.qjson.title_text = mdFull.title_text;
            }
          } catch {}
        }
      }
    } else if (pq.title != null || pq.type != null) {
      // Legacy fallback: Ponder supplied pre-parsed fields but no questionJson.
      // Missing has_invalid and decimals here, but this path is only hit for old
      // index data before the questionJson column existed.
      let outcomes;
      try { outcomes = pq.outcomes ? JSON.parse(pq.outcomes) : undefined; } catch {}
      data.qjson = {
        title:    pq.title    ?? undefined,
        type:     pq.type     ?? undefined,
        category: pq.category ?? undefined,
        lang:     pq.lang     ?? undefined,
        ...(outcomes != null && { outcomes }),
      };
      let templateStr;
      try {
        templateStr = await fetchTemplateStr(Number(pq.templateId || 0));
        data.templateStr = templateStr;
        if (data.qjson.type == null) {
          const typeMatch = /"type"\s*:\s*"([^"]+)"/.exec(templateStr);
          if (typeMatch) data.qjson.type = typeMatch[1];
        }
        const full = populateTemplate(templateStr, pq.data);
        data.qjson.format = full.format;
        if (full.decimals != null) data.qjson.decimals = full.decimals;
        if (full.title_html) {
          data.qjson.title_html = full.title_html;
          data.qjson.title_text = full.title_text;
        }
      } catch (e) {
        console.warn('[question] template render error:', e);
      }
      if (pq.title && !data.qjson.title_html && templateStr) {
        const isMd = /"format"\s*:\s*"text\/markdown"/.test(templateStr);
        if (isMd) {
          data.qjson.format = 'text/markdown';
          try {
            const fakeJson = JSON.stringify({ title: pq.title, type: data.qjson.type || 'bool', format: 'text/markdown' });
            const mdFull = populateTemplate(fakeJson, '');
            if (mdFull.title_html) {
              data.qjson.title_html = mdFull.title_html;
              data.qjson.title_text = mdFull.title_text;
            }
          } catch {}
        }
      }
    } else {
      const templateStr = await fetchTemplateStr(Number(pq.templateId || 0));
      data.qjson = populateTemplate(templateStr, pq.data);
      data.templateStr = templateStr;
    }
    data.fromPonder = true;
  } catch {
    if (!reality) {
      const titleEl = document.getElementById('question-title');
      if (titleEl) titleEl.textContent = 'Failed to load question (no data source available).';
      return;
    }
    document.getElementById('rpc-loading-note')?.style.removeProperty('display');
    // RPC path — await meta so we have the correct deployment block and version
    await contractsMetaPromise;
    const effectiveMajor = metaMajorVersion ?? (CONTRACT_MAJOR[CONTRACT.toLowerCase()] || 3);
    const startBlock     = metaStartBlock   ?? CONTRACT_START_BLOCK[CONTRACT.toLowerCase()] ?? 0;

    data = await withIndicator(rpcInd, async () => {
      // One call for all question struct fields; fall back to individual getters if it fails.
      const q = await questionsStruct(reality.runner, CONTRACT, QUESTION_ID);
      let bond, finalizeTS, upperBoundTs, bounty, isPendingArbitration;
      if (q) {
        bond                 = q.bond;
        finalizeTS           = q.finalize_ts;
        upperBoundTs         = q.opening_ts || q.finalize_ts;
        bounty               = q.bounty;
        isPendingArbitration = q.is_pending_arbitration;
      } else {
        [bond, finalizeTS, upperBoundTs, bounty, isPendingArbitration] = await Promise.all([
          safeCall(() => reality.getBond(QUESTION_ID), BN0),
          safeCall(() => reality.getFinalizeTS(QUESTION_ID), 0),
          safeCall(() => reality.getOpeningTS(QUESTION_ID), 0),
          safeCall(() => reality.getBounty(QUESTION_ID), BN0),
          safeCall(() => reality.isPendingArbitration(QUESTION_ID), false),
        ]);
        upperBoundTs = Number(upperBoundTs) || Number(finalizeTS);
      }

      // Check IndexedDB for previously-fetched RPC events.
      // On a cache hit we skip the expensive full log scan and only fetch events
      // from lastBlock+1 onwards, which is fast even for old questions.
      const cached = await QCache.get(CHAIN_ID, CONTRACT, QUESTION_ID);
      let qEv, currentBlock, rawAnswerEvents;

      if (cached.qEvent && cached.lastBlock !== null) {
        await withIndicator(cacheInd, async () => {
          currentBlock    = await safeCall(() => reality.runner.getBlockNumber(), cached.lastBlock);
          qEv             = cached.qEvent;
          const fromBlock = cached.lastBlock + 1;
          const newAnswers = (fromBlock <= currentBlock)
            ? await queryFilterRobust(reality, reality.filters.LogNewAnswer(null, QUESTION_ID), fromBlock, currentBlock)
            : [];
          rawAnswerEvents = [...cached.answerEvents, ...newAnswers];
          await QCache.put(CHAIN_ID, CONTRACT, QUESTION_ID, null, newAnswers, currentBlock);
        });
        cacheInd?.classList.add('hit');
        setTimeout(() => cacheInd?.classList.remove('hit'), 2000);
      } else {
        const found = await findLogNewQuestion(
          reality, reality.filters.LogNewQuestion(QUESTION_ID), startBlock, upperBoundTs);
        currentBlock    = found.currentBlock;
        qEv             = found.events[0] ?? null;
        const answerStartBlock = qEv ? qEv.blockNumber : startBlock;
        rawAnswerEvents = await queryFilterRobust(
          reality, reality.filters.LogNewAnswer(null, QUESTION_ID), answerStartBlock, currentBlock);
        await QCache.put(CHAIN_ID, CONTRACT, QUESTION_ID, qEv, rawAnswerEvents, currentBlock);
      }

      const templateId  = qEv ? Number(qEv.args.template_id) : 0;
      const questionStr = qEv ? qEv.args.question : '';
      const openingTS   = Number(qEv?.args.opening_ts  ?? q?.opening_ts  ?? 0);
      const qTimeout    = Number(qEv?.args.timeout      ?? q?.timeout     ?? 0);
      const arbitrator  = qEv?.args.arbitrator   ?? q?.arbitrator  ?? ethers.ZeroAddress;
      const nonce       = qEv?.args.nonce ?? BN0;
      let rpcTemplateStr = BUILTIN_TEMPLATES[templateId];
      if (!rpcTemplateStr) {
        const templateBlock = await safeCall(() => reality.templates(templateId), null);
        if (templateBlock) {
          const tBlockNum = Number(templateBlock);
          const tevents = await safeCall(
            () => reality.queryFilter(reality.filters.LogNewTemplate(templateId), tBlockNum, tBlockNum), []);
          rpcTemplateStr = tevents[0]?.args.question_text;
        }
        rpcTemplateStr = rpcTemplateStr || '{"type":"bool","title":"%s"}';
      }
      const minBond      = q?.min_bond ?? BN0;
      let settledTooSoon = false, reopenedBy = ZERO_HASH, reopensQuestionId = null;
      if (effectiveMajor >= 3) {
        [settledTooSoon, reopenedBy] = await Promise.all([
          safeCall(() => reality.isSettledTooSoon(QUESTION_ID), false),
          safeCall(() => reality.reopened_questions(QUESTION_ID), ZERO_HASH),
        ]);
        // If this question's nonce is itself a question ID, check whether it's the
        // reopener of that question (i.e. reopened_questions(nonce) === QUESTION_ID).
        // The reopenQuestion() function sets nonce = reopens_question_id.
        const nonceHex = ethers.zeroPadValue(ethers.toBeHex(nonce), 32);
        if (nonceHex !== ZERO_HASH) {
          const check = await safeCall(() => reality.reopened_questions(nonceHex), ZERO_HASH);
          if (check && check.toLowerCase() === QUESTION_ID.toLowerCase()) {
            reopensQuestionId = `${CONTRACT.toLowerCase()}-${nonceHex}`;
          }
        }
      }
      // Normalise raw ethers events to the same shape as adaptPonderData output
      const answerEvents = rawAnswerEvents.map(ev => ({
        args: {
          answer:         ev.args.answer,
          question_id:    ev.args.question_id,
          history_hash:   ev.args.history_hash,
          user:           ev.args.user,
          bond:           ev.args.bond,
          ts:             Number(ev.args.ts),
          is_commitment:  ev.args.is_commitment,
        },
      }));
      const arbitrationOccurred = answerEvents.some(ev => ev.args.bond === 0n);
      return {
        bond, finalizeTS, openingTS, timeout: qTimeout, arbitrator, nonce,
        templateId, questionStr, qjson: populateTemplate(rpcTemplateStr, questionStr),
        minBond, bounty: bounty ?? BN0, settledTooSoon, reopenedBy, arbitrationOccurred,
        isPendingArbitration: isPendingArbitration ?? false,
        reopenerQuestionId: (reopenedBy && reopenedBy !== ZERO_HASH) ? `${CONTRACT.toLowerCase()}-${reopenedBy}` : null,
        reopenerAnsweredTooSoon: false,
        reopensQuestionId,
        answerEvents,
        revealMap: {},
        currentAnswer: bond > 0n ? q.best_answer : null,
      };
    });
  }

  // 3. Update question title and status + type badges
  document.getElementById('rpc-loading-note')?.style.setProperty('display', 'none');
  const titleEl = document.getElementById('question-title');
  if (titleEl) {
    if (data.qjson?.title_html) {
      titleEl.innerHTML = data.qjson.title_html;
      titleEl.classList.add('q-text-md');
    } else {
      titleEl.textContent = data.qjson?.title || '';
    }
  }

  const badgesEl = qPage.querySelector('.q-badges');
  if (badgesEl && data.qjson?.type) {
    const TYPE_SHORT = { bool:'Yes / No', uint:'Number', int:'Number', 'single-select':'Choice', 'multiple-select':'Multi-choice', datetime:'Date' };
    const typeLbl = TYPE_SHORT[data.qjson.type] || data.qjson.type;
    badgesEl.appendChild(el('span', 'badge badge-type', typeLbl));
    if (data.qjson.category) badgesEl.appendChild(el('span', 'badge badge-app', data.qjson.category));
  }

  // Star / watch UI
  const starBtn = qPage.querySelector('#star-btn');
  if (starBtn && window.RealityWatches) {
    const ponderQId = `${CONTRACT.toLowerCase()}-${QUESTION_ID}`;
    const questionMeta = {
      id:         ponderQId,
      chainId:    CHAIN_ID,
      templateId: String(data.templateId || ''),
      title:      data.qjson?.title_text || data.qjson?.title || '',
    };
    _autoStarFn = () => RealityWatches.starQuestion(questionMeta);

    const updateStarUI = async () => {
      const starred = await RealityWatches.isStarred(ponderQId);
      const svg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="' + (starred ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
      starBtn.innerHTML = svg + (starred ? ' Watching' : ' Watch');
      starBtn.classList.toggle('starred', starred);
      const prompt  = qPage.querySelector('#watch-similar-prompt');
      const simLink = qPage.querySelector('#watch-similar-link');
      if (prompt && simLink) {
        if (starred) {
          simLink.href = `#!/watch-configure?chainId=${CHAIN_ID}&templateId=${encodeURIComponent(String(data.templateId || ''))}&questionId=${encodeURIComponent(ponderQId)}&contract=${CONTRACT.toLowerCase()}`;
          prompt.style.display = '';
        } else {
          prompt.style.display = 'none';
        }
      }
    };

    starBtn.style.display = '';
    updateStarUI();
    starBtn.addEventListener('click', async () => {
      const starred = await RealityWatches.isStarred(ponderQId);
      if (starred) {
        await RealityWatches.unstarQuestion(ponderQId);
      } else {
        await RealityWatches.starQuestion(questionMeta);
      }
      updateStarUI();
    });
  }

  // 4. One-time stable setup: details card, raw data disclosure
  const sideCol = qPage.querySelector('.col-side');
  const detailsPlaceholder = qPage.querySelector('#details-card');
  if (detailsPlaceholder) {
    detailsPlaceholder.innerHTML = buildDetailsCard(data, CHAIN_ID).innerHTML;
  } else if (sideCol) {
    sideCol.appendChild(buildDetailsCard(data, CHAIN_ID));
  }

  const rawSection = qPage.querySelector('#raw-data-section');
  const rawBody    = qPage.querySelector('#raw-data-body');
  if (rawSection && rawBody) {
    function rawRow(label, text) {
      return `<div class="raw-row"><div class="raw-label">${label}</div><div class="raw-value">${text}</div></div>`;
    }
    let contentHash = '';
    try {
      contentHash = ethers.solidityPackedKeccak256(
        ['uint256', 'uint32', 'string'],
        [data.templateId, data.openingTS, data.questionStr]
      );
    } catch {}
    const templateUrl = `#!/template/${CHAIN_ID}-${CONTRACT.toLowerCase()}-${data.templateId}`;
    const templateLink = `<a href="${esc(templateUrl)}" style="color:var(--accent);text-decoration:none">${esc(data.templateId)}</a>`;
    rawBody.innerHTML = [
      rawRow('Question ID',   esc(QUESTION_ID)),
      rawRow('Template ID',   templateLink),
      rawRow('Question data', esc(data.questionStr || '')),
      data.templateStr ? rawRow('Template',     esc(data.templateStr)) : '',
      contentHash      ? rawRow('Content hash', esc(contentHash))      : '',
    ].join('');
    rawSection.style.display = '';
  }

  // 5. Dynamic rendering — all state-dependent UI, re-called whenever data changes.
  // Tracks per-call state in the closure so each piece is safe to call repeatedly.
  let formAreaEl    = qPage.querySelector('#answer-form-container');
  let lastFormState = null;   // tracks what state the form was last built for
  let claimWired    = false;
  let countdownPollStarted = false;
  let walletHookSet = false;

  _renderDynamic = function() {
    const finalized  = isFinalized(data.finalizeTS) && !data.isPendingArbitration;
    const beforeOpen = isBeforeOpening(data.openingTS);
    const effectiveVersion = metaMajorVersion ?? majorVersion;
    const isReopenable = finalized && data.settledTooSoon && effectiveVersion >= 3
      && (data.reopenedBy === ZERO_HASH || data.reopenerAnsweredTooSoon)
      && !data.reopensQuestionId;
    const isReopened   = finalized && data.settledTooSoon && effectiveVersion >= 3
      && data.reopenedBy !== ZERO_HASH && !data.reopenerAnsweredTooSoon;

    // Status badge
    const statusBadge = document.getElementById('status-badge');
    if (statusBadge) {
      if (data.isPendingArbitration)      { statusBadge.textContent = 'Pending Arbitration'; statusBadge.className = 'badge badge-arb'; }
      else if (finalized)                 { statusBadge.textContent = '✓ Finalized';          statusBadge.className = 'badge badge-final'; }
      else if (beforeOpen)                { statusBadge.textContent = 'Upcoming';             statusBadge.className = 'badge badge-upcoming'; }
      else                                { statusBadge.textContent = '● Open';               statusBadge.className = 'badge badge-open'; }
    }

    // State classes — toggle so repeated calls reconcile correctly
    qPage.classList.toggle('question-state-finalized',           finalized && !data.isPendingArbitration);
    qPage.classList.toggle('question-state-open',                !finalized && !data.isPendingArbitration);
    qPage.classList.toggle('question-state-pending-arbitration', !!data.isPendingArbitration);
    qPage.classList.toggle('reopenable', isReopenable);
    qPage.classList.toggle('reopened',   isReopened);

    // Core re-renders
    renderHistory(data);
    renderClaimHistory(data);
    renderStatusCard(data);

    // Answer form — rebuild only when the question state changes so in-progress
    // user input isn't wiped on routine updates (e.g. background event fetches).
    const formState = data.isPendingArbitration ? 'pending-arb'
      : finalized ? 'finalized' : beforeOpen ? 'before-open' : 'open';
    if (formState !== lastFormState) {
      lastFormState = formState;
      let replacement;
      try {
        replacement = (!walletAddr && !finalized && !beforeOpen)
          ? buildLockedState(data)
          : buildAnswerForm(data, walletAddr);
      } catch {}
      if (formAreaEl?.isConnected) {
        if (replacement) { formAreaEl.replaceWith(replacement); formAreaEl = replacement; }
        else             { formAreaEl.remove(); formAreaEl = null; }
      }
    }

    // Reopen section visibility
    const reopenContainer   = qPage.querySelector('.reopen-container');
    const reopenedContainer = qPage.querySelector('.reopened-container');
    const reopensContainer  = qPage.querySelector('.reopens-container');
    if (reopenContainer)   reopenContainer.style.display   = isReopenable ? '' : 'none';
    if (reopenedContainer) reopenedContainer.style.display = isReopened   ? '' : 'none';

    // Reopen links — wire once when the IDs are known (may be absent with stale Ponder)
    const baseUrl = `#!/network/${CHAIN_ID}/question/`;
    if (isReopened && data.reopenerQuestionId && reopenedContainer && !reopenedContainer.dataset.wired) {
      reopenedContainer.dataset.wired = '1';
      const a = reopenedContainer.querySelector('.reopener-link');
      if (a) {
        a.href = baseUrl + data.reopenerQuestionId;
        a.textContent = 'View new question';
        a.addEventListener('click', e => { e.preventDefault(); location.href = a.href; location.reload(); });
      }
    }
    if (data.reopensQuestionId && reopensContainer && !reopensContainer.dataset.wired) {
      reopensContainer.dataset.wired = '1';
      reopensContainer.style.display = '';
      const a = reopensContainer.querySelector('.reopens-link');
      if (a) {
        a.href = baseUrl + data.reopensQuestionId;
        a.textContent = 'previously answered too soon';
        a.addEventListener('click', e => { e.preventDefault(); location.href = a.href; location.reload(); });
      }
    }

    // Reopen button — wire once when the question is confirmed reopenable
    if (isReopenable && realityRW && reopenContainer && !reopenContainer.dataset.btnWired) {
      reopenContainer.dataset.btnWired = '1';
      const btn = reopenContainer.querySelector('.reopen-question-submit');
      if (btn) {
        btn.addEventListener('click', () => {
          const reopenNonce = BigInt(QUESTION_ID);
          runTx(btn, btn.textContent, () =>
            realityRW.reopenQuestion(
              data.templateId, data.questionStr, data.arbitrator,
              data.timeout, data.openingTS, reopenNonce, data.minBond,
              QUESTION_ID, { value: 0 }
            )
          );
        });
      }
    }

    // Claim section — wire once when the question is confirmed finalized with user answers
    if (!claimWired) {
      const claimSection = qPage.querySelector('.claim-section');
      if (claimSection && finalized && walletAddr && realityRW) {
        claimWired = true;
        const userEvents = data.answerEvents.filter(
          ev => ev.args.user?.toLowerCase() === walletAddr.toLowerCase()
        );
        if (userEvents.length > 0) {
          safeCall(() => reality.getHistoryHash(QUESTION_ID), null).then(onChainHash => {
            if (onChainHash?.toLowerCase() === ZERO_HASH.toLowerCase()) return;
            claimSection.style.display = '';
            const claimBtn = claimSection.querySelector('button.claim-button');
            if (claimBtn) {
              claimBtn.addEventListener('click', () => {
                const args = buildClaimArgs(QUESTION_ID, data.answerEvents);
                runTx(claimBtn, claimBtn.textContent, () =>
                  realityRW.claimMultipleAndWithdrawBalance(
                    args.question_ids, args.lengths, args.hist_hashes,
                    args.addrs, args.bonds, args.answers
                  )
                );
              });
            }
          });
        }
      }
    }

    // Countdown + poll — start once for open questions
    if (!countdownPollStarted && !finalized) {
      countdownPollStarted = true;
      if (data.finalizeTS > 0) startCountdown(data.finalizeTS, data.timeout);
      startPoll(data.finalizeTS);
    }

    // Wallet hook — set once for open, post-opening questions
    if (!walletHookSet && !finalized && !beforeOpen) {
      walletHookSet = true;
      window._setQuestionWallet = async function(addr) {
        if (!formAreaEl?.isConnected) return;
        walletAddr = addr;
        if (addr && window.ethereum) {
          const _wp = new ethers.BrowserProvider(window.ethereum);
          realityRW = new ethers.Contract(CONTRACT, REALITY_ABI, await _wp.getSigner());
        } else {
          realityRW = null;
        }
        lastFormState = null; // force form rebuild with the new wallet address
        _renderDynamic();
      };
    }
  };

  // Initial render — happens immediately so status badge, state classes, and history
  // appear without waiting for the contract meta fetch.  Some form options (e.g.
  // "Answered too soon") depend on metaMajorVersion, so we force a form rebuild
  // below once the meta resolves.
  _renderDynamic();

  // 6. Contract warnings need meta; rebuild form afterwards with correct metaMajorVersion.
  await contractsMetaPromise;
  renderWarnings(data);
  renderSnapshotPanel(data.qjson?.title || ''); // async, non-blocking
  lastFormState = null; // force form rebuild now that metaMajorVersion is available
  _renderDynamic();

  // 7. Arbitration section (async, one-time)
  renderArbitrationSection(data, walletAddr).catch(() => {});

  // 8. Background RPC verification + reveal-map population
  if (reality) verifyWithRpc(data).catch(() => {});
}

// Called by question.html after initWallet() resolves, so window.ethereum is
// already set (injected wallet or WC session restore) before main() checks it.
window._initQuestion = (hintAddr) => main(hintAddr).catch(err => {
  console.error('question page error', err);
  if (qPage) qPage.dataset.error = err.message;
});

}; // end window.RealityQuestion.mount

})();
