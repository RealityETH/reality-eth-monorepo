(async function () {
'use strict';

// ── Constants ─────────────────────────────────────────────────────────────────
const INVALID  = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
const TOO_SOON = '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe';
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

const CHAIN_NAME    = { 1:'Ethereum', 10:'Optimism', 100:'Gnosis', 137:'Polygon', 42161:'Arbitrum', 8453:'Base', 43114:'Avalanche', 42220:'Celo', 11155111:'Sepolia' };
const CHAIN_TOKEN   = { 1:'ETH', 10:'OETH', 100:'XDAI', 137:'POL', 42161:'ETH', 8453:'ETH', 43114:'AVAX', 42220:'CELO', 11155111:'ETH' };
const EXPLORER      = { 1:'https://etherscan.io', 10:'https://optimistic.etherscan.io', 100:'https://gnosisscan.io', 137:'https://polygonscan.com', 42161:'https://arbiscan.io', 8453:'https://basescan.org', 43114:'https://snowtrace.io', 42220:'https://celoscan.io', 11155111:'https://sepolia.etherscan.io' };
const PUBLIC_RPC    = { 1:'https://ethereum-rpc.publicnode.com', 10:'https://optimism-rpc.publicnode.com', 100:'https://rpc.gnosischain.com', 137:'https://polygon-rpc.com', 42161:'https://arbitrum-one-rpc.publicnode.com', 8453:'https://base-rpc.publicnode.com', 43114:'https://avalanche-c-chain-rpc.publicnode.com', 42220:'https://celo-rpc.publicnode.com', 11155111:'https://ethereum-sepolia-rpc.publicnode.com' };
// Params for chains MetaMask may not know natively (wallet_addEthereumChain fallback)
const CHAIN_ADD_PARAMS = {
  100: {
    chainId: '0x64', chainName: 'Gnosis',
    nativeCurrency: { name: 'xDAI', symbol: 'XDAI', decimals: 18 },
    rpcUrls: ['https://rpc.gnosischain.com'],
    blockExplorerUrls: ['https://gnosisscan.io'],
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
  'function getHistoryHash(bytes32) view returns (bytes32)',
  'function getMinBond(bytes32) view returns (uint256)',
  'function getTimeout(bytes32) view returns (uint32)',
  'function getArbitrator(bytes32) view returns (address)',
  'function isSettledTooSoon(bytes32) view returns (bool)',
  'function reopened_questions(bytes32) view returns (bytes32)',
  'function template_hashes(uint256) view returns (bytes32)',
  'function templates(uint256) view returns (string)',
  'function submitAnswer(bytes32 question_id, bytes32 answer, uint256 max_previous) payable',
  'function submitAnswerERC20(bytes32 question_id, bytes32 answer, uint256 max_previous, uint256 tokens)',
  'function submitAnswerCommitment(bytes32 question_id, bytes32 answer_hash, uint256 max_previous, address _answerer) payable',
  'function submitAnswerCommitmentERC20(bytes32 question_id, bytes32 answer_hash, uint256 max_previous, address _answerer, uint256 tokens)',
  'function submitAnswerReveal(bytes32 question_id, bytes32 answer, uint256 nonce, uint256 bond)',
  'function claimMultipleAndWithdrawBalance(bytes32[] question_ids, uint256[] lengths, bytes32[] hist_hashes, address[] addrs, uint256[] bonds, bytes32[] answers)',
  'function reopenQuestion(uint256 template_id, string question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce, uint256 min_bond, bytes32 reopens_question_id) payable',
  'event LogNewQuestion(bytes32 indexed question_id, address indexed user, uint256 template_id, string question, bytes32 indexed content_hash, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce, uint256 timestamp)',
  'event LogNewAnswer(bytes32 answer, bytes32 indexed question_id, bytes32 history_hash, address indexed user, uint256 bond, uint256 ts, bool is_commitment)',
  'event LogNewTemplate(uint256 indexed template_id, address indexed user, string question_text)',
];

// ── URL parsing ───────────────────────────────────────────────────────────────
// Hash format (canonical, IPFS-friendly): #!/network/{chainId}/question/{contract}-{questionId}
// Query format (test suite fallback):     ?contract=0x...&question=0x...&network=100
let CONTRACT, QUESTION_ID, CHAIN_ID;
const hash = location.hash;
const hashMatch = hash.match(/\/network\/(\d+)\/question\/(0x[0-9a-fA-F]+)-(0x[0-9a-fA-F]+)/);
if (hashMatch) {
  CHAIN_ID    = parseInt(hashMatch[1], 10);
  CONTRACT    = hashMatch[2];
  QUESTION_ID = hashMatch[3];
} else {
  const params = new URLSearchParams(location.search);
  CONTRACT    = params.get('contract');
  QUESTION_ID = params.get('question');
  CHAIN_ID    = parseInt(params.get('network') || '100', 10);
}
const qPage = document.getElementById('question-page');
if (!CONTRACT || !QUESTION_ID || !qPage) return;

// Chain badge — known from URL, no async needed
const chainBadge = document.getElementById('chain-badge');
if (chainBadge) {
  const label = CHAIN_NAME[CHAIN_ID] || `Chain ${CHAIN_ID}`;
  chainBadge.textContent = label;
  chainBadge.style.display = '';
}

// ── Provider ──────────────────────────────────────────────────────────────────
// readProvider is always available for the correct chain (no wallet needed).
// reality / realityRW are set in main() once we know the wallet's chain.
const majorVersion = CONTRACT_MAJOR[CONTRACT.toLowerCase()] || 3;
let reality = null, realityRW = null;

const publicRpcUrl = PUBLIC_RPC[CHAIN_ID];
const readProvider = publicRpcUrl
  ? new ethers.providers.JsonRpcProvider(publicRpcUrl, CHAIN_ID)
  : null;

// ── Data-source indicators ────────────────────────────────────────────────────
const ponderInd = document.getElementById('ind-ponder');
const rpcInd    = document.getElementById('ind-rpc');

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

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function formatEth(bn) {
  if (!bn || ethers.BigNumber.from(bn).eq(0)) return '0';
  return ethers.utils.formatEther(bn).replace(/\.0+$/, '');
}

// ── Ponder data loading ───────────────────────────────────────────────────────
const PONDER_QUESTION_ID = `${CONTRACT}-${QUESTION_ID}`;

async function fetchPonderData() {
  const qid = JSON.stringify(PONDER_QUESTION_ID);
  // responses and reopeners are separate top-level queries (no nested relations in Ponder)
  const query = `{
    question(id: ${qid}) {
      templateId data
      arbitrator openingTimestamp timeout
      currentAnswer currentAnswerBond
      minBond bounty scheduledFinalizationTimestamp
      arbitrationOccurred isPendingArbitration
    }
    responses(where: { questionId: ${qid} }, orderBy: "timestamp", orderDirection: "asc", limit: 1000) {
      items { answer commitmentHash bond user historyHash isCommitment isUnrevealed timestamp }
    }
    reopeners: questions(where: { reopensQuestionId: ${qid} }, limit: 1) {
      items { id }
    }
  }`;
  const resp = await withIndicator(ponderInd, () =>
    fetch(window.RealitySettings?.getPonderUrl() || '/graphql', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
  );
  if (!resp.ok) throw new Error('GraphQL unavailable');
  const json = await resp.json();
  if (!json.data?.question) throw new Error('Question not in Ponder');
  return json.data;
}

async function fetchTemplateStr(templateId) {
  const builtin = BUILTIN_TEMPLATES[templateId];
  if (builtin) return builtin;
  const tid = JSON.stringify(`${CHAIN_ID}-${CONTRACT.toLowerCase()}-${templateId}`);
  try {
    const resp = await withIndicator(ponderInd, () =>
      fetch(window.RealitySettings?.getPonderUrl() || '/graphql', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `{ template(id: ${tid}) { questionText } }` }),
      })
    );
    const { data } = await resp.json();
    return data?.template?.questionText || BUILTIN_TEMPLATES[0];
  } catch { return BUILTIN_TEMPLATES[0]; }
}

function adaptPonderData(ponderData, BN0) {
  const { question: pq, responses: responsePage, reopeners } = ponderData;
  const responses = (responsePage?.items || [])
    .sort((a, b) => (Number(a.timestamp) < Number(b.timestamp) ? -1 : 1));
  const answerEvents = responses.map(r => ({
    args: {
      // For history-hash computation: use the commitment hash for commitments
      // (that's the value actually hashed on-chain), actual answer otherwise
      answer:          r.isCommitment ? (r.commitmentHash || ZERO_HASH) : (r.answer || ZERO_HASH),
      // For display: the revealed answer (null while still unrevealed)
      display_answer:  r.answer,
      question_id:     QUESTION_ID,
      history_hash:    r.historyHash,
      user:            r.user,
      bond:            ethers.BigNumber.from(r.bond.toString()),
      ts:              Number(r.timestamp),
      is_commitment:   r.isCommitment,
      is_unrevealed:   r.isUnrevealed ?? false,
    }
  }));
  return {
    bond:          ethers.BigNumber.from((pq.currentAnswerBond || '0').toString()),
    finalizeTS:    Number(pq.scheduledFinalizationTimestamp || 0),
    openingTS:     Number(pq.openingTimestamp || 0),
    timeout:       Number(pq.timeout || 0),
    arbitrator:    pq.arbitrator,
    nonce:         BN0,
    templateId:    Number(pq.templateId || 0),
    questionStr:   pq.data,
    qjson:         null,
    minBond:       ethers.BigNumber.from((pq.minBond || '0').toString()),
    bounty:        ethers.BigNumber.from((pq.bounty  || '0').toString()),
    settledTooSoon:       (pq.currentAnswer || '').toLowerCase() === TOO_SOON.toLowerCase(),
    reopenedBy:           (reopeners?.items?.length || 0) > 0 ? '0x01' : ZERO_HASH,
    arbitrationOccurred:  !!pq.arbitrationOccurred,
    isPendingArbitration: !!pq.isPendingArbitration,
    answerEvents,
  };
}

// ── Template parsing ──────────────────────────────────────────────────────────
function populateTemplate(templateStr, questionStr) {
  const DELIM = '␟';
  const parts = questionStr ? questionStr.split(DELIM) : [];
  let idx = 0;
  const interpolated = templateStr.replace(/%s/g, () => parts[idx++] || '');
  try {
    const j = JSON.parse(interpolated);
    if (typeof j.outcomes === 'string') {
      try { j.outcomes = JSON.parse('[' + j.outcomes + ']'); } catch {}
    }
    return j;
  } catch {
    return { type: 'bool', title: questionStr || '' };
  }
}

// ── State detection ───────────────────────────────────────────────────────────
function isFinalized(finalizeTS) {
  return finalizeTS > 0 && finalizeTS * 1000 < Date.now();
}
function isBeforeOpening(openingTS) {
  return openingTS > 0 && openingTS * 1000 > Date.now();
}

// ── Answer encoding ───────────────────────────────────────────────────────────
function answerToBytes32(raw, qjson) {
  const norm = typeof raw === 'string' ? raw.toLowerCase() : String(raw);
  if (norm === INVALID || norm === INVALID.toLowerCase()) return INVALID;
  if (norm === TOO_SOON || norm === TOO_SOON.toLowerCase()) return TOO_SOON;

  const type = qjson?.type || 'bool';
  if (type === 'bool' || type === 'single-select') {
    return ethers.utils.hexZeroPad(ethers.BigNumber.from(raw).toHexString(), 32);
  }
  if (type === 'multiple-select') {
    return ethers.utils.hexZeroPad(ethers.BigNumber.from(raw).toHexString(), 32);
  }
  if (type === 'uint' || type === 'int') {
    const decimals = parseInt(qjson.decimals) || 0;
    if (decimals > 0) {
      const scaled = ethers.utils.parseUnits(String(raw), decimals);
      return ethers.utils.hexZeroPad(scaled.toHexString(), 32);
    }
    return ethers.utils.hexZeroPad(ethers.BigNumber.from(raw).toHexString(), 32);
  }
  if (type === 'datetime') {
    const ts = Math.floor(new Date(raw).getTime() / 1000);
    return ethers.utils.hexZeroPad(ethers.BigNumber.from(ts).toHexString(), 32);
  }
  return ZERO_HASH;
}

function bytes32ToLabel(bytes32, qjson) {
  if (bytes32 === null || bytes32 === undefined || bytes32 === '') return null;
  const lo = bytes32.toLowerCase();
  if (lo === INVALID.toLowerCase()) return 'Invalid';
  if (lo === TOO_SOON.toLowerCase()) return 'Answered too soon';
  const type = qjson?.type || 'bool';
  if (type === 'bool') {
    const n = ethers.BigNumber.from(bytes32);
    if (n.eq(1)) return 'Yes';
    if (n.eq(0)) return 'No';
    return null;
  }
  if (type === 'single-select') {
    const idx = ethers.BigNumber.from(bytes32).toNumber();
    return (qjson.outcomes || [])[idx] || String(idx);
  }
  if (type === 'multiple-select') {
    const mask = ethers.BigNumber.from(bytes32).toNumber();
    const outcomes = qjson.outcomes || [];
    return outcomes.filter((_, i) => mask & (1 << i)).join(' / ') || String(mask);
  }
  if (type === 'uint' || type === 'int') {
    const decimals = parseInt(qjson.decimals) || 0;
    if (decimals > 0) return ethers.utils.formatUnits(bytes32, decimals);
    return ethers.BigNumber.from(bytes32).toString();
  }
  if (type === 'datetime') {
    const ts = ethers.BigNumber.from(bytes32).toNumber();
    return new Date(ts * 1000).toISOString().split('T')[0];
  }
  return bytes32;
}

function answerColorClass(bytes32, qjson) {
  if (!bytes32 || bytes32.toLowerCase() === INVALID.toLowerCase()) return 'inv';
  if (bytes32.toLowerCase() === TOO_SOON.toLowerCase()) return 'inv';
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
  const wp = new ethers.providers.Web3Provider(window.ethereum);
  realityRW = new ethers.Contract(CONTRACT, REALITY_ABI, wp.getSigner());
}

async function runTxWithERC20Approval(btn, originalText, walletAddr, tokenAddr, spender, amountWei, txFn, onSubmitted) {
  btn.disabled = true;
  try {
    await ensureCorrectChain();
    const wp = new ethers.providers.Web3Provider(window.ethereum);
    const tokenRead = new ethers.Contract(tokenAddr, ERC20_TOKEN_ABI, wp);
    const allowance = await tokenRead.allowance(walletAddr, spender);
    if (allowance.lt(amountWei)) {
      btn.textContent = `Approve ${metaToken} in wallet…`;
      const tokenRW = new ethers.Contract(tokenAddr, ERC20_TOKEN_ABI, wp.getSigner());
      const approveTx = await tokenRW.approve(spender, amountWei);
      btn.textContent = `Approving ${metaToken}…`;
      await approveTx.wait();
    }
    btn.textContent = 'Waiting for wallet…';
    const tx = await txFn();
    btn.textContent = 'Pending…';
    if (onSubmitted) onSubmitted();
    await tx.wait();
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
  const minF = minRequired.gt(0) ? parseFloat(ethers.utils.formatEther(minRequired)) : 0;
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
  return ethers.utils.hexlify(ethers.utils.randomBytes(32));
}

function computeCommitHash(ansBytes, nonce) {
  // Matches soliditySHA3(["uint256","uint256"], [answer, nonce]) in the contracts lib
  return ethers.utils.solidityKeccak256(['uint256', 'uint256'], [ansBytes, nonce]);
}

const PENDING_REVEAL_KEY = `cr-${CHAIN_ID}-${CONTRACT.toLowerCase()}-${QUESTION_ID}`;

function storePendingReveal(walletAddr, ansBytes, nonce, bondWei) {
  try {
    localStorage.setItem(PENDING_REVEAL_KEY, JSON.stringify({
      wallet: walletAddr.toLowerCase(), answer: ansBytes, nonce, bond: bondWei.toHexString(),
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
    const wp = new ethers.providers.Web3Provider(window.ethereum);
    const rc = new ethers.Contract(CONTRACT, REALITY_ABI, wp.getSigner());

    if (metaTokenAddress) {
      btn.textContent = `Approve ${metaToken} in wallet…`;
      const tokenRead = new ethers.Contract(metaTokenAddress, ERC20_TOKEN_ABI, wp);
      const allowance = await tokenRead.allowance(walletAddr, CONTRACT);
      if (allowance.lt(bondWei)) {
        const tokenRW = new ethers.Contract(metaTokenAddress, ERC20_TOKEN_ABI, wp.getSigner());
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

// ── Form builder ──────────────────────────────────────────────────────────────
function buildAnswerForm(data, walletAddr) {
  const { qjson, minBond, openingTS, finalizeTS, answerEvents } = data;
  const bond = answerEvents.reduce((mx, ev) => ev.args.bond.gt(mx) ? ev.args.bond : mx, ethers.BigNumber.from(0));
  const finalized    = isFinalized(finalizeTS);
  const beforeOpen   = isBeforeOpening(openingTS);
  const type         = qjson.type || 'bool';
  const isSelectType = type === 'bool' || type === 'single-select';
  const isMulti      = type === 'multiple-select';
  const isUint       = type === 'uint' || type === 'int';
  const isDatetime   = type === 'datetime';

  // Before-opening: return a non-interactive notice
  if (beforeOpen) {
    const bf = document.createElement('div');
    bf.className = 'answer-form-container before-opening is-open';
    const p = el('p', null, 'This question is not yet open for answers.');
    const ot = el('div', 'opening-time-label',
      new Date(openingTS * 1000).toLocaleString());
    bf.appendChild(p);
    bf.appendChild(ot);
    const card = el('div', 'card');
    card.appendChild(el('div', 'card-title', 'Answer'));
    card.appendChild(bf);
    return card;
  }

  // Finalized: return nothing (no submit form shown)
  if (finalized) return null;

  // Compute minimum required bond
  const minRequired = minBond.gt(0) && bond.eq(0)
    ? minBond
    : bond.gt(0) ? bond.mul(2) : (minBond.gt(0) ? minBond : ethers.BigNumber.from(0));

  const prefill = minRequired.gt(0)
    ? ethers.utils.formatEther(minRequired).replace(/\.0+$/, '')
    : '0.001';

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
    const inv = el('div', 'invalid-switch-container');
    if (!hasInvalid) inv.style.display = 'none';
    inv.innerHTML = `<a class="invalid-text-link" href="#" data-special="${INVALID}">Mark as Invalid</a>`;
    inputWrap.appendChild(inv);
    const ts = el('div', 'too-soon-switch-container');
    if (!hasTooSoon) ts.style.display = 'none';
    ts.innerHTML = `<a class="too-soon-text-link" href="#" data-special="${TOO_SOON}">Mark as Answered Too Soon</a>`;
    inputWrap.appendChild(ts);

  } else if (isUint) {
    const input = document.createElement('input');
    input.type = 'number'; input.name = 'input-answer';
    input.step = 'any'; input.placeholder = '0'; input.className = 'uint-input';
    inputWrap.appendChild(input);
    const inv = el('div', 'invalid-switch-container');
    if (!hasInvalid) inv.style.display = 'none';
    inv.innerHTML = `<a class="invalid-text-link" href="#" data-special="${INVALID}">Mark as Invalid</a>`;
    inputWrap.appendChild(inv);
    const ts = el('div', 'too-soon-switch-container');
    if (!hasTooSoon) ts.style.display = 'none';
    ts.innerHTML = `<a class="too-soon-text-link" href="#" data-special="${TOO_SOON}">Mark as Answered Too Soon</a>`;
    inputWrap.appendChild(ts);

  } else if (isDatetime) {
    const input = document.createElement('input');
    input.type = 'date'; input.className = 'datetime-input-date';
    input.name = 'input-answer';
    inputWrap.appendChild(input);
  }

  // ── Bond row ──
  const bondWrap = el('div', 'input-container--bond');
  const bondInput = document.createElement('input');
  bondInput.type = 'number'; bondInput.name = 'questionBond';
  bondInput.className = 'bond-input-field'; bondInput.step = 'any';
  bondInput.value = prefill;
  const minEl = el('span', 'min-amount', formatEth(minRequired));
  bondWrap.appendChild(bondInput);
  bondWrap.appendChild(minEl);
  form.appendChild(bondWrap);

  // ── Commit-reveal toggle ──
  const crLabel = el('label', 'cr-toggle');
  const crCb    = document.createElement('input');
  crCb.type = 'checkbox';
  crLabel.appendChild(crCb);
  crLabel.appendChild(document.createTextNode(' Use commit-reveal'));
  form.appendChild(crLabel);

  // ── Submit button ──
  const btn = el('button', 'post-answer-button btn-post', 'Post answer');
  btn.type = 'button';
  form.appendChild(btn);

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
    form.dataset.specialAnswer = link.dataset.special;
    form.querySelectorAll('[data-special]').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
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
    const bondWei  = ethers.utils.parseEther(bondInput.value);
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
    if (pending && lastEv?.args.is_unrevealed &&
        lastEv.args.user.toLowerCase() === walletAddr.toLowerCase()) {
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
          const wp = new ethers.providers.Web3Provider(window.ethereum);
          const rc = new ethers.Contract(CONTRACT, REALITY_ABI, wp.getSigner());
          const ansBytes = pending.answer;
          const nonce    = pending.nonce;
          const bondWei  = ethers.BigNumber.from(pending.bond);
          const tx = await rc.submitAnswerReveal(QUESTION_ID, ansBytes, nonce, bondWei);
          revealBtn.textContent = 'Revealing…';
          await tx.wait();
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
let metaTokenAddress = null; // ERC20 token address, or null for native-token contracts

// Kick off immediately so it loads in parallel with Ponder
const contractsMetaPromise = (async () => {
  try {
    const res = await fetch('/packages/contracts/generated/contracts.json');
    const data = await res.json();
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
          if (metaTokenAddress) metaToken = tokenSym;
        }
      }
    }
    knownArbitrators = addrs;
  } catch {
    knownArbitrators = null;
  }
})();

function renderWarnings(data) {
  const container = document.getElementById('warnings-container');
  if (!container) return;
  container.innerHTML = '';

  const warnings = [];

  // Unknown arbitrator — only warn if we successfully loaded the list for this chain
  if (knownArbitrators && knownArbitrators.size > 0 &&
      data.arbitrator && !/^0x0+$/.test(data.arbitrator) &&
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
      (mx, ev) => ev.args.bond.gt(mx) ? ev.args.bond : mx, ethers.BigNumber.from(0));
    const totalStake = (data.bounty || ethers.BigNumber.from(0)).add(topBond);
    const ONE_ETH = ethers.utils.parseEther('1');
    if (totalStake.lt(ONE_ETH)) {
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

// ── Optimistic answer entry ───────────────────────────────────────────────────
function addOptimisticEntry(ansBytes, bondWei, walletAddr, qjson) {
  const bondList = qPage.querySelector('.bond-list');
  if (!bondList) return;

  const token    = metaToken;
  const explorer = EXPLORER[CHAIN_ID]    || '';
  const color    = answerColorClass(ansBytes, qjson);
  const label    = bytes32ToLabel(ansBytes, qjson) || '?';
  const bondStr  = `${formatEth(bondWei)} ${token}`;
  const letter   = { yes:'Y', no:'N', inv:'?', other:'·' }[color] || '·';
  const short    = walletAddr ? `${walletAddr.slice(0,6)}…${walletAddr.slice(-4)}` : '';
  const addrHtml = short
    ? (explorer
        ? `<a class="bond-addr-link" href="${explorer}/address/${walletAddr}" target="_blank" rel="noopener noreferrer">${short}</a>`
        : `<span class="bond-addr">${short}</span>`)
    : '';

  const entry = document.createElement('div');
  entry.className = 'optimistic-entry';
  entry.innerHTML = `
    <div class="bond-connector"><div class="answer-dot dot-${color}">${letter}</div></div>
    <div class="bond-main">
      <div class="bond-answer-label ${color}">${label}<span class="bond-tag tag-pending">Submitting…</span></div>
      <div class="bond-submeta">${addrHtml}${addrHtml ? ' · ' : ''}<span>Unconfirmed</span></div>
    </div>
    <div class="bond-right"><div class="bond-amount">${bondStr}</div></div>`;

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

function formatDuration(secs) {
  secs = Number(secs);
  if (secs <= 0)    return 'Any moment';
  if (secs < 3600)  return `${Math.floor(secs / 60)}m`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`;
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  return h > 0 ? `${d}d ${h}h` : `${d}d`;
}

function renderHistory(data) {
  const { answerEvents, qjson, arbitrationOccurred } = data;
  const n        = answerEvents.length;
  const token    = metaToken;
  const explorer = EXPLORER[CHAIN_ID]    || '';

  // Max bond across all answers — used to scale bar widths
  const maxBond = answerEvents.reduce((mx, ev) => {
    const b = BigInt(ev.args.bond.toString());
    return b > mx ? b : mx;
  }, BigInt(0));

  function buildEntryContents(ev, tag, isCurrent) {
    const isUnrevealed = ev.args.is_unrevealed;
    const displayAns   = isUnrevealed ? null : (ev.args.display_answer || ev.args.answer);
    const color   = isUnrevealed ? 'other' : answerColorClass(displayAns, qjson);
    const label   = isUnrevealed ? 'Commitment' : (bytes32ToLabel(displayAns, qjson) || '?');
    const bondStr = `${formatEth(ev.args.bond)} ${token}`;
    const letter  = isUnrevealed ? '?' : ({ yes:'Y', no:'N', inv:'?', other:'·' }[color] || '·');

    // Connector + dot
    const connector = el('div', 'bond-connector');
    connector.appendChild(el('div', `answer-dot dot-${color}`, letter));

    // Main: label + submeta
    const main      = el('div', 'bond-main');
    const labelEl   = el('div', `bond-answer-label ${color} current-answer`);
    labelEl.appendChild(document.createTextNode(label));
    if (tag) labelEl.appendChild(el('span', `bond-tag tag-${tag}`, tag));
    main.appendChild(labelEl);

    const submeta = el('div', 'bond-submeta');
    if (ev.args.user && !/^0x0+$/.test(ev.args.user)) {
      const short = ev.args.user.slice(0,6) + '…' + ev.args.user.slice(-4);
      if (explorer) {
        const a = document.createElement('a');
        a.className = 'bond-addr-link';
        a.href = `${explorer}/address/${ev.args.user}`;
        a.target = '_blank'; a.rel = 'noopener noreferrer';
        a.textContent = short;
        submeta.appendChild(a);
      } else {
        submeta.appendChild(el('span', 'bond-addr', short));
      }
      submeta.appendChild(document.createTextNode(' · '));
    }
    if (ev.args.ts) submeta.appendChild(document.createTextNode(formatRelTime(ev.args.ts)));
    main.appendChild(submeta);

    // Right: bond amount + bar (omitted for arbitrated answers where bond is meaningless)
    const right = el('div', 'bond-right');
    if (tag !== 'arbitrated') {
      right.appendChild(el('div', `bond-amount answer-bond-value`, bondStr));
      const barWrap = el('div', 'bond-bar-wrap');
      const bar     = el('div', `bond-bar bar-${color}`);
      if (maxBond > BigInt(0)) {
        bar.style.width = Math.round(Number(BigInt(ev.args.bond.toString()) * BigInt(100) / maxBond)) + '%';
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
  const latestIsArbitrated = arbitrationOccurred && answerEvents[n - 1].args.bond.isZero();
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

  // History: show from second-latest down to oldest (newest at top)
  for (let i = n - 2; i >= 0; i--) {
    const isArbitrated = arbitrationOccurred && answerEvents[i].args.bond.isZero();
    const tag  = isArbitrated ? 'arbitrated' : (i === n - 2 ? 'disputed' : null);
    const { connector, main, right } = buildEntryContents(answerEvents[i], tag, false);
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
  const hasArbitrator = arbitrator && !/^0x0+$/.test(arbitrator);

  if (!hasArbitrator) return;

  if (isPendingArbitration) {
    section.innerHTML = `
      <div class="card-title">Arbitration</div>
      <div class="arb-pending-notice">Arbitration has been requested and is awaiting resolution by the arbitrator.</div>`;
    section.style.display = '';
    return;
  }

  if (finalized || beforeOpen || bond.isZero() || !walletAddr) return;

  section.innerHTML = `
    <div class="card-title">Arbitration</div>
    <p class="arb-note">Dispute the current answer by requesting arbitration.</p>
    <button class="arb-btn" id="arb-btn" disabled>Loading fee…</button>`;
  section.style.display = '';

  const btn = document.getElementById('arb-btn');
  const prov = reality?.provider || readProvider;

  let fee;
  try {
    fee = await new ethers.Contract(arbitrator, ARBITRATOR_ABI, prov).getDisputeFee(QUESTION_ID);
    const nativeToken = CHAIN_TOKEN[CHAIN_ID] || 'ETH';
    const btnLabel = fee.isZero()
      ? 'Request arbitration (free)'
      : `Request arbitration — costs ${formatEth(fee)} ${nativeToken}`;
    btn.textContent = btnLabel;
    btn.disabled = false;
    btn.addEventListener('click', () =>
      runTx(btn, btnLabel, async () => {
        const wp = new ethers.providers.Web3Provider(window.ethereum);
        return new ethers.Contract(arbitrator, ARBITRATOR_ABI, wp.getSigner())
          .requestArbitration(QUESTION_ID, bond, { value: fee });
      })
    );
  } catch {
    btn.textContent = 'Fee unavailable — arbitrator may not be responding';
  }
}

function renderStatusCard(data) {
  const card = qPage.querySelector('#status-card');
  if (!card) return;

  const { answerEvents, qjson, bond, finalizeTS, timeout, minBond, arbitrator } = data;
  const n        = answerEvents.length;
  const token    = metaToken;
  const explorer = EXPLORER[CHAIN_ID]    || '';
  const finalized = isFinalized(finalizeTS);

  function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  let html = '<div class="card-title">Current status</div>';

  // Answer pill + top bond
  if (n > 0) {
    const latest   = answerEvents[n - 1];
    const label    = bytes32ToLabel(latest.args.answer, qjson) || '?';
    const color    = answerColorClass(latest.args.answer, qjson);
    const pillCls  = color === 'yes' ? 'answer-yes-lg' : color === 'no' ? 'answer-no-lg' : 'answer-inv-lg';
    const topBond  = answerEvents.reduce((mx, ev) => ev.args.bond.gt(mx) ? ev.args.bond : mx, ethers.BigNumber.from(0));
    const bondStr  = `${formatEth(topBond)} ${token}`;
    html += `
      <div class="status-answer">
        <div>
          <div class="status-answer-label">Best answer</div>
          <span class="answer-pill-large ${pillCls}">${esc(label)}</span>
        </div>
        <div>
          <div class="status-bond-label">Top bond</div>
          <div class="status-bond-val">${esc(bondStr)}</div>
        </div>
      </div>`;
  }

  // Timer
  const now = Math.floor(Date.now() / 1000);
  if (finalized) {
    html += `
      <div class="timer-row">
        <span class="timer-label">Status</span>
        <span class="timer-val finalized">Finalized</span>
      </div>`;
  } else if (finalizeTS > 0) {
    const remaining = Math.max(0, finalizeTS - now);
    const barPct = timeout > 0 ? Math.max(0, Math.min(100, Math.round((1 - remaining / timeout) * 100))) : 0;
    html += `
      <div class="timer-row">
        <span class="timer-label">Finalizes in</span>
        <span class="timer-val">${esc(formatDuration(remaining))}</span>
      </div>
      <div class="timer-bar-wrap"><div class="timer-bar" style="width:${barPct}%"></div></div>`;
  }

  // Stats grid
  const totalBond = answerEvents.reduce(
    (sum, ev) => sum.add(ev.args.bond), ethers.BigNumber.from(0)
  );
  const arbHtml = (arbitrator && !/^0x0+$/.test(arbitrator))
    ? (explorer
        ? `<a href="${explorer}/address/${arbitrator}" target="_blank" rel="noopener">${arbitrator.slice(0,6)}…${arbitrator.slice(-4)}</a>`
        : `${arbitrator.slice(0,6)}…${arbitrator.slice(-4)}`)
    : '—';
  const minBondStr = minBond?.gt(0) ? `${formatEth(minBond)} ${token}` : '—';
  const totalStr   = totalBond.gt(0) ? `${formatEth(totalBond)} ${token}` : '—';

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
function buildDetailsCard(data, chainId) {
  const token = CHAIN_TOKEN[chainId] || 'ETH';
  const exp   = EXPLORER[chainId]    || '';

  function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function addrHtml(a) {
    if (!a || /^0x0+$/.test(a)) return null;
    const short = a.slice(0,6) + '…' + a.slice(-4);
    return exp
      ? `<a href="${exp}/address/${a}" target="_blank" rel="noopener">${short}</a>`
      : `<span>${short}</span>`;
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
  if (data.minBond?.gt(0)) row('Min bond', `${esc(formatEth(data.minBond))} ${esc(token)}`);
  if (data.bond?.gt(0))    row('Current bond', `${esc(formatEth(data.bond))} ${esc(token)}`);
  row('Arbitrator', addrHtml(data.arbitrator));
  row('Contract', addrHtml(CONTRACT));
  row('Question ID', `<span class="meta-val mono" title="${esc(QUESTION_ID)}">${QUESTION_ID.slice(0,10)}…</span>`);

  const card = el('div', 'card');
  card.innerHTML = `<div class="card-title">Details</div><div class="meta-list">${rows.join('')}</div>`;
  return card;
}

// ── Locked interact state ─────────────────────────────────────────────────────
function buildLockedState(data) {
  const { bond, minBond } = data;
  const token = metaToken;
  const minRequired = minBond?.gt(0) && bond?.eq(0)
    ? minBond
    : bond?.gt(0) ? bond.mul(2) : (minBond?.gt(0) ? minBond : ethers.BigNumber.from(0));
  const nextBondStr = minRequired?.gt(0) ? `${formatEth(minRequired)} ${token}` : null;

  const card = el('div', 'card');
  card.innerHTML = `
    <div class="card-title">Answer</div>
    <div class="interact-locked">
      <div class="lock-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <div class="lock-text">Connect your wallet to answer this question or dispute the current answer.</div>
    </div>
    <button class="btn-connect">Connect wallet</button>
    ${nextBondStr ? `<div class="interact-hint">Next valid bond: <strong>${nextBondStr}</strong></div>` : ''}
  `;
  card.querySelector('.btn-connect').addEventListener('click', () => {
    if (typeof RealityWallet !== 'undefined') RealityWallet.connectWallet(() => location.reload());
  });
  return card;
}

// ── RPC verification ─────────────────────────────────────────────────────────
async function verifyWithRpc(data) {
  if (!reality) return;

  const errors = [];

  await withIndicator(rpcInd, async () => {
    const calls = [
      safeCall(() => reality.getBestAnswer(QUESTION_ID), null),
      safeCall(() => reality.getHistoryHash(QUESTION_ID), null),
      safeCall(() => reality.getBond(QUESTION_ID), null),
      safeCall(() => reality.getFinalizeTS(QUESTION_ID), null),
      safeCall(() => reality.getTimeout(QUESTION_ID), null),
      safeCall(() => reality.getArbitrator(QUESTION_ID), null),
      safeCall(() => reality.getContentHash(QUESTION_ID), null),
    ];
    if (data.templateId > 4) {
      calls.push(safeCall(() => reality.template_hashes(data.templateId), null));
    }
    const [bestAnswer, historyHash, bond, finalizeTS, timeout, arbitrator, contentHash, templateHash]
      = await Promise.all(calls);

    // Content hash covers templateId + openingTs + question data in one shot
    if (contentHash) {
      const computed = ethers.utils.solidityKeccak256(
        ['uint256', 'uint32', 'string'],
        [data.templateId, data.openingTS, data.questionStr]
      );
      if (computed.toLowerCase() !== contentHash.toLowerCase())
        errors.push('content hash mismatch');
    }

    // Template text (custom templates only)
    if (templateHash && data.templateStr) {
      const computed = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(data.templateStr));
      if (computed.toLowerCase() !== templateHash.toLowerCase())
        errors.push('template hash mismatch');
    }

    // Reconstruct history hash from the answer list.
    // Skip for finalized questions: claiming rewinds the on-chain hash, so a
    // mismatch is expected and tells us nothing useful once settled.
    if (historyHash !== null && !isFinalized(data.finalizeTS)) {
      let computed = ZERO_HASH;
      for (const ev of data.answerEvents) {
        computed = ethers.utils.solidityKeccak256(
          ['bytes32', 'bytes32', 'uint256', 'address', 'bool'],
          [computed, ev.args.answer, ev.args.bond, ev.args.user, ev.args.is_commitment]
        );
      }
      if (computed.toLowerCase() !== historyHash.toLowerCase())
        errors.push('history hash mismatch');
    }

    // Current best answer — catches a concealed commitment reveal
    if (bestAnswer !== null && data.answerEvents.length > 0) {
      const latest = data.answerEvents[data.answerEvents.length - 1];
      // For an unrevealed commitment, on-chain best_answer is the commitment hash
      const expected = (latest.args.is_commitment && latest.args.is_unrevealed)
        ? latest.args.answer          // commitment hash stored in args.answer
        : (latest.args.display_answer || ZERO_HASH);
      if (bestAnswer.toLowerCase() !== expected.toLowerCase())
        errors.push('current answer mismatch (possible concealed reveal)');
    }

    if (bond !== null && !bond.eq(data.bond))
      errors.push('bond mismatch');
    if (finalizeTS !== null && Number(finalizeTS) !== data.finalizeTS)
      errors.push('finalization timestamp mismatch');
    if (timeout !== null && Number(timeout) !== data.timeout)
      errors.push('timeout mismatch');
    if (arbitrator !== null && data.arbitrator &&
        arbitrator.toLowerCase() !== data.arbitrator.toLowerCase())
      errors.push('arbitrator mismatch');
  });

  const ind = ponderInd;
  if (!ind) return;
  if (errors.length === 0) {
    ind.classList.add('ok');
    ind.title = 'Ponder (indexed data) — RPC verified ✓';
  } else {
    ind.classList.add('fail');
    ind.title = `Ponder — WARNING: ${errors.join('; ')}`;
    console.warn('[reality.eth] RPC verification discrepancies:', errors);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const BN0 = ethers.BigNumber.from(0);

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
      const _wp = new ethers.providers.Web3Provider(window.ethereum);
      // Use wallet for reads only when it's on the right chain
      if (walletChainId === CHAIN_ID) {
        reality = new ethers.Contract(CONTRACT, REALITY_ABI, _wp);
      }
      // Wallet is always the write provider (user must switch chain themselves)
      realityRW = new ethers.Contract(CONTRACT, REALITY_ABI, _wp.getSigner());
    } catch {}
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
    const templateStr = await fetchTemplateStr(Number(pq.templateId || 0));
    data = adaptPonderData(ponderResult, BN0);
    data.qjson = populateTemplate(templateStr, pq.data);
    data.templateStr = templateStr;
    data.fromPonder = true;
  } catch {
    if (!reality) {
      const titleEl = document.getElementById('question-title');
      if (titleEl) titleEl.textContent = 'Failed to load question (no data source available).';
      return;
    }
    // RPC path — await meta so we have the correct deployment block and version
    await contractsMetaPromise;
    const effectiveMajor = metaMajorVersion ?? (CONTRACT_MAJOR[CONTRACT.toLowerCase()] || 3);
    const startBlock     = metaStartBlock   ?? CONTRACT_START_BLOCK[CONTRACT.toLowerCase()] ?? FORK_BLOCK;

    data = await withIndicator(rpcInd, async () => {
      const [bond, finalizeTS, newQEvents, rawAnswerEvents] = await Promise.all([
        safeCall(() => reality.getBond(QUESTION_ID), BN0),
        safeCall(() => reality.getFinalizeTS(QUESTION_ID), 0),
        safeCall(() => reality.queryFilter(reality.filters.LogNewQuestion(QUESTION_ID), startBlock), []),
        safeCall(() => reality.queryFilter(reality.filters.LogNewAnswer(null, QUESTION_ID), startBlock), []),
      ]);
      const qEv        = newQEvents[0];
      const templateId  = qEv ? qEv.args.template_id.toNumber() : 0;
      const questionStr = qEv ? qEv.args.question : '';
      const openingTS   = qEv ? qEv.args.opening_ts : 0;
      const qTimeout    = qEv ? qEv.args.timeout    : 0;
      const arbitrator  = qEv ? qEv.args.arbitrator  : ethers.constants.AddressZero;
      const nonce       = qEv ? qEv.args.nonce        : BN0;
      let rpcTemplateStr = BUILTIN_TEMPLATES[templateId];
      if (!rpcTemplateStr) {
        const tevents = await safeCall(
          () => reality.queryFilter(reality.filters.LogNewTemplate(templateId), startBlock), []
        );
        rpcTemplateStr = tevents[0]?.args.question_text
          || await safeCall(() => reality.templates(templateId), '{"type":"bool","title":"%s"}');
      }
      let minBond = BN0, settledTooSoon = false, reopenedBy = ZERO_HASH;
      if (effectiveMajor >= 3) {
        [minBond, settledTooSoon, reopenedBy] = await Promise.all([
          safeCall(() => reality.getMinBond(QUESTION_ID), BN0),
          safeCall(() => reality.isSettledTooSoon(QUESTION_ID), false),
          safeCall(() => reality.reopened_questions(QUESTION_ID), ZERO_HASH),
        ]);
      }
      // Normalise raw ethers events to the same shape as adaptPonderData output
      const answerEvents = rawAnswerEvents.map(ev => ({
        args: {
          answer:         ev.args.answer,
          display_answer: ev.args.is_commitment ? null : ev.args.answer,
          question_id:    ev.args.question_id,
          history_hash:   ev.args.history_hash,
          user:           ev.args.user,
          bond:           ev.args.bond,
          ts:             ev.args.ts.toNumber(),
          is_commitment:  ev.args.is_commitment,
          is_unrevealed:  ev.args.is_commitment, // RPC can't confirm reveals
        },
      }));
      const arbitrationOccurred = answerEvents.some(ev => ev.args.bond.isZero());
      return {
        bond, finalizeTS, openingTS, timeout: qTimeout, arbitrator, nonce,
        templateId, questionStr, qjson: populateTemplate(rpcTemplateStr, questionStr),
        minBond, bounty: BN0, settledTooSoon, reopenedBy, arbitrationOccurred,
        isPendingArbitration: false, // not available from events alone; Ponder path is authoritative
        answerEvents,
      };
    });
  }

  // 3. Update question title and status + type badges
  const titleEl = document.getElementById('question-title');
  if (titleEl) {
    const rawTitle = data.qjson?.title || '';
    if (data.qjson?.format === 'text/markdown' && typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
      const safeSource = DOMPurify.sanitize(rawTitle, {USE_PROFILES: {html: false}});
      titleEl.innerHTML = DOMPurify.sanitize(marked.parse(safeSource));
      titleEl.classList.add('q-text-md');
    } else {
      titleEl.textContent = rawTitle;
    }
  }

  const finalized   = isFinalized(data.finalizeTS);
  const beforeOpen  = isBeforeOpening(data.openingTS);
  const isReopenable = finalized && data.settledTooSoon && majorVersion >= 3 && data.reopenedBy === ZERO_HASH;
  const isReopened   = finalized && data.settledTooSoon && majorVersion >= 3 && data.reopenedBy !== ZERO_HASH;

  const statusBadge = document.getElementById('status-badge');
  if (statusBadge) {
    if (finalized) {
      statusBadge.textContent = '✓ Finalized';
      statusBadge.className = 'badge badge-final';
    } else if (beforeOpen) {
      statusBadge.textContent = 'Upcoming';
      statusBadge.className = 'badge badge-upcoming';
    } else {
      statusBadge.textContent = '● Open';
      statusBadge.className = 'badge badge-open';
    }
  }

  const badgesEl = qPage.querySelector('.q-badges');
  if (badgesEl && data.qjson?.type) {
    const TYPE_SHORT = { bool:'Yes / No', uint:'Number', int:'Number', 'single-select':'Choice', 'multiple-select':'Multi-choice', datetime:'Date' };
    const typeLbl = TYPE_SHORT[data.qjson.type] || data.qjson.type;
    badgesEl.appendChild(el('span', 'badge badge-type', typeLbl));
    if (data.qjson.category) badgesEl.appendChild(el('span', 'badge badge-app', data.qjson.category));
  }

  // 4. State classes
  if (finalized) qPage.classList.add('question-state-finalized');
  else           qPage.classList.add('question-state-open');
  if (isReopenable) qPage.classList.add('reopenable');
  if (isReopened)   qPage.classList.add('reopened');

  // 5. Render history + status card
  renderHistory(data);
  renderStatusCard(data);
  await contractsMetaPromise;
  renderWarnings(data);

  // 6. Answer form (or locked state if no wallet and question is open)
  const formSlot = qPage.querySelector('#answer-form-container');
  if (formSlot) {
    let replacement;
    if (!walletAddr && !finalized && !beforeOpen) {
      replacement = buildLockedState(data);
    } else {
      replacement = buildAnswerForm(data, walletAddr);
    }
    if (replacement) formSlot.replaceWith(replacement);
    else             formSlot.remove();
  }

  // 7. Details card
  const sideCol = qPage.querySelector('.col-side');
  if (sideCol) sideCol.appendChild(buildDetailsCard(data, CHAIN_ID));

  // 8. Reopen containers
  const reopenContainer  = qPage.querySelector('.reopen-container');
  const reopenedContainer = qPage.querySelector('.reopened-container');
  if (reopenContainer)   reopenContainer.style.display   = isReopenable ? '' : 'none';
  if (reopenedContainer) reopenedContainer.style.display  = isReopened   ? '' : 'none';

  // 9. Reopen button
  if (isReopenable && reopenContainer && realityRW) {
    const btn = reopenContainer.querySelector('.reopen-question-submit');
    if (btn) {
      btn.addEventListener('click', () => {
        // Use the original question_id as the nonce — always unique (256-bit hash)
        const reopenNonce = ethers.BigNumber.from(QUESTION_ID);
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

  // 10. Arbitration section
  renderArbitrationSection(data, walletAddr).catch(() => {});

  // 11. Claim section
  const claimSection = qPage.querySelector('.claim-section');
  if (claimSection && finalized && walletAddr && realityRW) {
    const userEvents = data.answerEvents.filter(
      ev => ev.args.user.toLowerCase() === walletAddr.toLowerCase()
    );
    if (userEvents.length > 0) {
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
    }
  }

  // 12. Background RPC verification (only when data came from Ponder)
  if (data.fromPonder) verifyWithRpc(data).catch(() => {});
}

main().catch(err => {
  console.error('question page error', err);
  if (qPage) qPage.dataset.error = err.message;
});

})();
