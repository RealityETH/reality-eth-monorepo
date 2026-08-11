(function () {
'use strict';

// ── Constants ──────────────────────────────────────────────────────────────────
const ZERO_HASH = '0x' + '0'.repeat(64);

function chainName(id) { return window.RealityChains?.name(id) || `Chain ${id}`; }
// Canonical token symbol per chain — used for display whenever a contract-specific token is not found.
const CHAIN_NATIVE_TOKEN = { 1:'ETH', 10:'OETH', 56:'BNB', 100:'XDAI', 137:'POL', 42161:'ETH', 8453:'ETH', 43114:'AVAX', 42220:'CELO', 11155111:'ETH' };
const EXPLORER    = { 1:'https://etherscan.io', 10:'https://optimistic.etherscan.io', 100:'https://gnosisscan.io', 137:'https://polygonscan.com', 42161:'https://arbiscan.io', 8453:'https://basescan.org', 11155111:'https://sepolia.etherscan.io' };
const PUBLIC_RPC  = { 1:'https://ethereum-rpc.publicnode.com', 10:'https://optimism-rpc.publicnode.com', 100:'https://rpc.gnosischain.com', 137:'https://polygon-rpc.com', 42161:'https://arbitrum-one-rpc.publicnode.com', 8453:'https://base-rpc.publicnode.com', 11155111:'https://ethereum-sepolia-rpc.publicnode.com' };

const VERSION_PREF = ['RealityETH-3.2', 'RealityETH-3.0', 'RealityETH-2.1'];

const BLOCKS_PER_DAY = { 1: 7200, 10: 43200, 100: 17280, 137: 43200, 42161: 360000, 8453: 43200, 11155111: 7200 };

const SCAN_ABI = [
  'event LogNewQuestion(bytes32 indexed question_id, address indexed user, uint256 template_id, string question, bytes32 indexed content_hash, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce, uint256 created)',
  'event LogNewAnswer(bytes32 answer, bytes32 indexed question_id, bytes32 history_hash, address indexed user, uint256 bond, uint256 ts, bool is_commitment)',
];

const REALITY_ABI = [
  'function claimMultipleAndWithdrawBalance(bytes32[] question_ids, uint256[] lengths, bytes32[] hist_hashes, address[] addrs, uint256[] bonds, bytes32[] answers)',
];

// Cached across mount() calls to avoid re-fetching on every navigation
let _contractsData = null;
let _contractTokenMap = {};

// Generation counter: incremented on each mount() so stale async ops bail out
let _accountLoadGen = 0;

window.RealityAccount = window.RealityAccount || {};

window.RealityAccount.mount = async function (addr) {
  // ── DOM refs ────────────────────────────────────────────────────────────────
  const ponderInd = document.getElementById('ind-ponder');
  const rpcInd    = document.getElementById('ind-rpc');

  // ── State ────────────────────────────────────────────────────────────────────
  let viewAddr      = addr ? addr.toLowerCase() : null;
  let walletAddr    = null;
  let walletChainId = null;
  let provider      = null;
  let signer        = null;
  let pendingClaimData  = null;
  let pendingClaimChainId = null;
  let allData           = null;
  let selectedViewChains = new Set();

  // ── URL helpers ─────────────────────────────────────────────────────────────
  function setUrlAddress(a) {
    const newHash = a ? `#!/account/${a}` : '#!/account';
    history.replaceState(null, '', newHash);
  }

  function canClaim() {
    return !!(walletAddr && viewAddr && walletAddr === viewAddr);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function formatEth(bn) {
    if (!bn || BigInt(bn.toString()) === 0n) return '0';
    return ethers.formatEther(bn).replace(/\.0+$/, '');
  }

  function shortAddr(a) { return a ? `${a.slice(0,6)}…${a.slice(-4)}` : ''; }

  function isFinalized(q) {
    const ts = Number(q.answerFinalizedTimestamp || 0);
    // ts=1 is an on-chain sentinel meaning "answered but countdown not yet started"; not finalized.
    return ts > 1 && ts * 1000 < Date.now() && !q.isPendingArbitration;
  }

  function questionUrl(q) {
    return `#!/network/${q.chainId}/question/${q.contract}-${q.questionId}`;
  }

  // ── RPC scan state (reset on each runAccount call) ───────────────────────────
  // null value = scan in progress; {fromBlock, toBlock} = completed
  let _scanState = {};
  // Tracks desired target for scan-further-back; accumulates on repeated clicks
  let _scanFurtherBackTarget = {};
  let _scanFurtherBackActive = new Set();

  // ── Indicators ───────────────────────────────────────────────────────────────
  async function withIndicator(el, fn) {
    el?.classList.add('active');
    const start = Date.now();
    try { return await fn(); }
    finally { setTimeout(() => el?.classList.remove('active'), Math.max(0, 1000 - (Date.now() - start))); }
  }

  // ── RPC helpers ───────────────────────────────────────────────────────────────
  async function safeQueryFilter(contract, filter, fromBlock, toBlock) {
    try {
      return await contract.queryFilter(filter, fromBlock, toBlock);
    } catch {
      const CHUNK = 50000;
      const results = [];
      for (let s = fromBlock; s <= toBlock; s += CHUNK) {
        try {
          const chunk = await contract.queryFilter(filter, s, Math.min(s + CHUNK - 1, toBlock));
          results.push(...chunk);
        } catch { /* skip chunk */ }
      }
      return results;
    }
  }

  async function questionsStructFallback(prov, contractAddr, questionId) {
    try {
      const selector = ethers.id('questions(bytes32)').slice(0, 10);
      const raw = await prov.call({
        to: contractAddr,
        data: selector + ethers.zeroPadValue(ethers.toBeHex(questionId), 32).slice(2),
      });
      if (!raw || raw === '0x') return null;
      const T11 = ['bytes32','address','uint32','uint32','uint32','bool','uint256','bytes32','bytes32','uint256','uint256'];
      const T10 = T11.slice(0, 10);
      let d;
      try       { d = ethers.AbiCoder.defaultAbiCoder().decode(T11, raw); }
      catch     { d = ethers.AbiCoder.defaultAbiCoder().decode(T10, raw); }
      return {
        finalize_ts:            Number(d[4]),
        is_pending_arbitration: Boolean(d[5]),
        bounty:                 d[6],
        best_answer:            d[7],
        history_hash:           d[8],
        bond:                   d[9],
      };
    } catch { return null; }
  }

  function parseQuestionTitle(questionStr) {
    if (!questionStr) return '';
    try {
      const obj = JSON.parse(questionStr);
      if (typeof obj === 'string') return obj;
      return obj.title || obj.question || questionStr.slice(0, 100);
    } catch {
      const sep = questionStr.indexOf('\x1f');
      return sep > 0 ? questionStr.slice(0, sep) : questionStr.slice(0, 100);
    }
  }

  function buildQuestionFromEvents(questionId, contract, chainId, qEvent, answerEvents, state) {
    const args     = qEvent.args;
    const lastAns  = answerEvents.at(-1);
    const now      = Math.floor(Date.now() / 1000);
    const finalTs  = state?.finalize_ts || 0;
    const finalized = finalTs > 0 && finalTs < now && !state?.is_pending_arbitration;
    const bestAns  = state?.best_answer;
    const curAns   = bestAns && bestAns !== ZERO_HASH ? bestAns : (lastAns?.args.answer || null);
    const toBigStr = v => { try { return BigInt(v.toString()).toString(); } catch { return '0'; } };

    return {
      id:                          `${String(contract).toLowerCase()}-${questionId}`,
      questionId,
      contract:                    String(contract).toLowerCase(),
      chainId:                     Number(chainId),
      title:                       parseQuestionTitle(String(args.question || '')),
      type:                        null,
      category:                    null,
      currentAnswer:               curAns,
      currentAnswerBond:           state ? toBigStr(state.bond) : (lastAns ? toBigStr(lastAns.args.bond) : '0'),
      bounty:                      state ? toBigStr(state.bounty) : '0',
      historyHash:                 state?.history_hash || ZERO_HASH,
      answerFinalizedTimestamp:    finalized ? String(finalTs) : null,
      scheduledFinalizationTimestamp: String(finalTs || 0),
      createdTimestamp:            String(Number(args.created || 0)),
      timeout:                     Number(args.timeout || 0),
      arbitrator:                  args.arbitrator || ('0x' + '0'.repeat(40)),
      isPendingArbitration:        Boolean(state?.is_pending_arbitration),
      arbitrationOccurred:         false,
    };
  }

  // Responses in the shape computeClaimable() expects, built from event args.
  function evToResponse(ev) {
    return {
      answer:         ev.args.answer,
      commitmentHash: null,
      bond:           ev.args.bond,
      user:           ev.args.user,
      historyHash:    ev.args.history_hash,
      isCommitment:   Boolean(ev.args.is_commitment),
    };
  }

  // ── QCache fallback ───────────────────────────────────────────────────────────
  async function getQCacheQuestions(addr) {
    const empty = { asked: [], answered: [], userResponses: [], claimedSet: new Set(), claimables: [] };
    if (!window.QCache?.getAllSync) return empty;

    const syncEntries = await QCache.getAllSync().catch(() => []);
    const asked = [], answered = [], userResponses = [];

    for (const entry of syncEntries) {
      const { chainId, contract, questionId } = entry;
      const cached = await QCache.get(chainId, contract, questionId).catch(() => null);
      if (!cached?.qEvent) continue;

      const { qEvent, answerEvents } = cached;
      const creator    = String(qEvent.args?.user || '').toLowerCase();
      const isAsked    = creator === addr;
      const isAnswered = answerEvents.some(ev => String(ev.args?.user || '').toLowerCase() === addr);
      if (!isAsked && !isAnswered) continue;

      const q = buildQuestionFromEvents(questionId, contract, chainId, qEvent, answerEvents, null);
      if (isAsked)    asked.push(q);
      if (isAnswered) answered.push(q);

      for (const ev of answerEvents) {
        if (String(ev.args?.user || '').toLowerCase() === addr) {
          userResponses.push({
            id: `${ev.transactionHash}-${ev.logIndex}`,
            questionId, answer: ev.args.answer, commitmentHash: null,
            bond: ev.args.bond, user: ev.args.user,
            historyHash: ev.args.history_hash, isCommitment: Boolean(ev.args.is_commitment),
            timestamp: ev.args.ts,
          });
        }
      }
    }
    // Skip claimable calc — no live finalize_ts available from cache alone
    return { asked, answered, userResponses, claimedSet: new Set(), claimables: [] };
  }

  // ── RPC account scan ──────────────────────────────────────────────────────────
  async function scanRpcForAccount(addr, chainId, fromBlock, toBlock, gen, onProgress) {
    const contracts = await loadContracts();
    const rcList    = getRcContracts(contracts, chainId);
    const empty     = { asked: [], answered: [], userResponses: [], claimedSet: new Set(), claimables: [] };
    console.log(`[scan] chain=${chainId} addr=${addr} blocks=${fromBlock}-${toBlock} contracts=${rcList.length}`);
    if (!rcList.length) { console.log('[scan] no contracts for chain, skipping'); return empty; }

    const prov = provider || new ethers.JsonRpcProvider(PUBLIC_RPC[chainId], chainId, { staticNetwork: true });
    const foundIds = new Map(); // questionId → { contract, isAsked, isAnswered }

    for (let i = 0; i < rcList.length; i++) {
      if (gen !== _accountLoadGen) return null;
      const { address: rcAddr } = rcList[i];
      onProgress?.(`Scanning ${chainName(chainId)} (${i + 1}/${rcList.length})…`);
      console.log(`[scan] contract ${i + 1}/${rcList.length}: ${rcAddr}`);

      const rc = new ethers.Contract(rcAddr, SCAN_ABI, prov);
      const [askedRes, answeredRes] = await Promise.allSettled([
        safeQueryFilter(rc, rc.filters.LogNewQuestion(null, addr), fromBlock, toBlock),
        safeQueryFilter(rc, rc.filters.LogNewAnswer(null, null, null, addr), fromBlock, toBlock),
      ]);

      console.log(`[scan]   LogNewQuestion: status=${askedRes.status} count=${askedRes.value?.length ?? 'err'}`
        + (askedRes.reason ? ` reason=${askedRes.reason}` : ''));
      console.log(`[scan]   LogNewAnswer:   status=${answeredRes.status} count=${answeredRes.value?.length ?? 'err'}`
        + (answeredRes.reason ? ` reason=${answeredRes.reason}` : ''));

      for (const ev of (askedRes.value || [])) {
        const qId = ev.args.question_id;
        const cur = foundIds.get(qId) || { contract: rcAddr, isAsked: false, isAnswered: false };
        foundIds.set(qId, { ...cur, contract: rcAddr, isAsked: true });
      }
      for (const ev of (answeredRes.value || [])) {
        const qId = ev.args.question_id;
        const cur = foundIds.get(qId) || { contract: rcAddr, isAsked: false, isAnswered: false };
        foundIds.set(qId, { ...cur, contract: rcAddr, isAnswered: true });
      }
    }

    const ids = [...foundIds.entries()];
    console.log(`[scan] found ${ids.length} question(s) on chain ${chainId}`);
    if (!ids.length) return empty;
    onProgress?.(`Fetching ${ids.length} question${ids.length !== 1 ? 's' : ''} from chain…`);

    const asked = [], answered = [], userResponses = [], fullRespMap = {};

    for (const [qId, info] of ids) {
      if (gen !== _accountLoadGen) return null;
      const rc = new ethers.Contract(info.contract, SCAN_ABI, prov);

      // Targeted full-history scan for this specific question
      const qEvents = await safeQueryFilter(rc, rc.filters.LogNewQuestion(qId), 0, toBlock);
      if (!qEvents.length) continue;
      const qEvent = qEvents[0];

      const answerEvents = await safeQueryFilter(rc, rc.filters.LogNewAnswer(null, qId), qEvent.blockNumber, toBlock);
      answerEvents.sort((a, b) => a.blockNumber - b.blockNumber || a.logIndex - b.logIndex);

      const state = await questionsStructFallback(prov, info.contract, qId);
      const q     = buildQuestionFromEvents(qId, info.contract, chainId, qEvent, answerEvents, state);

      if (info.isAsked)    asked.push(q);
      if (info.isAnswered) answered.push(q);

      fullRespMap[qId] = answerEvents.map(evToResponse);

      for (const ev of answerEvents) {
        if (String(ev.args?.user || '').toLowerCase() === addr) {
          userResponses.push({
            id: `${ev.transactionHash}-${ev.logIndex}`,
            questionId: qId, answer: ev.args.answer, commitmentHash: null,
            bond: ev.args.bond, user: ev.args.user,
            historyHash: ev.args.history_hash, isCommitment: Boolean(ev.args.is_commitment),
            timestamp: ev.args.ts,
          });
        }
      }

      // Persist to QCache so question view can use it too
      await QCache.put(Number(chainId), info.contract, qId, qEvent, answerEvents, toBlock).catch(() => {});
    }

    const claimables = [];
    for (const q of answered) {
      if (!fullRespMap[q.questionId]) continue;
      const result = computeClaimable(q, fullRespMap[q.questionId], addr);
      if (result.total > 0n) claimables.push(result);
    }

    return { asked, answered, userResponses, claimedSet: new Set(), claimables };
  }

  // ── Scan status UI ────────────────────────────────────────────────────────────
  function formatScanRange(chainId, fromBlock, toBlock) {
    const days = Math.round((toBlock - fromBlock) / (BLOCKS_PER_DAY[chainId] || 7200));
    if (days >= 14) return `~${Math.round(days / 7)} weeks`;
    if (days >= 2)  return `~${days} days`;
    return '< 1 day';
  }

  function renderScanStatus(scanningMsg, activeChainId) {
    const el = document.getElementById('rpc-scan-status');
    if (!el) return;
    const hasState = Object.keys(_scanState).length > 0;
    if (scanningMsg === null && !hasState) { el.style.display = 'none'; return; }
    el.style.display = '';

    const warnSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    let html = `<div class="rpc-scan-msg">${warnSvg} Indexer unavailable</div>`;
    // Show global scanning message only when it's not attached to a chain row
    const hasInlineRow = activeChainId != null && _scanState[activeChainId] != null;
    if (scanningMsg && !hasInlineRow) {
      html += `<div class="rpc-scan-msg" style="padding-left:18px;color:var(--text-muted)">${scanningMsg}</div>`;
    }

    for (const [cid, state] of Object.entries(_scanState)) {
      if (!state) continue;
      const n = Number(cid);
      const progress = (activeChainId === n && scanningMsg)
        ? `<span class="scan-chain-progress">${scanningMsg}</span>` : '';
      html += `<div class="scan-chain-row">` +
        `<span>${chainName(n)}: scanned ${formatScanRange(n, state.fromBlock, state.toBlock)}</span>` +
        `<button class="scan-back-btn" data-chain="${cid}">Scan further back</button>` +
        progress +
        `</div>`;
    }
    el.innerHTML = html;

    el.querySelectorAll('.scan-back-btn').forEach(btn => {
      btn.onclick = () => scanFurtherBack(Number(btn.dataset.chain));
    });

    loadContracts().then(data => {
      const handled = new Set(Object.keys(_scanState).map(Number));
      const unscanned = Object.keys(data || {}).map(Number)
        .filter(id => getRcContracts(data, id).length > 0 && !handled.has(id));
      if (!unscanned.length || !el.isConnected) return;
      const wrap = document.createElement('div');
      wrap.className = 'scan-more-wrap';
      const label = document.createElement('span');
      label.textContent = 'Scan other chains:';
      label.style.color = 'var(--text-muted)';
      wrap.appendChild(label);
      for (const cid of unscanned) {
        const btn = document.createElement('button');
        btn.className = 'scan-chain-pill';
        btn.textContent = chainName(cid);
        btn.onclick = () => scanMoreChain(cid);
        wrap.appendChild(btn);
      }
      el.appendChild(wrap);
    }).catch(() => {});
  }

  async function scanMoreChain(chainId) {
    if (chainId in _scanState) return;
    _scanState[chainId] = null;  // mark in progress (hides pill)

    const gen = _accountLoadGen;
    const prov = new ethers.JsonRpcProvider(PUBLIC_RPC[chainId], chainId, { staticNetwork: true });
    let toBlock;
    try { toBlock = await withIndicator(rpcInd, () => prov.getBlockNumber()); }
    catch { delete _scanState[chainId]; return; }
    if (gen !== _accountLoadGen) return;

    const fromBlock = Math.max(0, toBlock - (BLOCKS_PER_DAY[chainId] || 7200) * 21);
    renderScanStatus(`Scanning ${chainName(chainId)}…`);

    const rpcData = await scanRpcForAccount(viewAddr, chainId, fromBlock, toBlock, gen, msg => {
      if (gen === _accountLoadGen) renderScanStatus(msg);
    });
    if (!rpcData || gen !== _accountLoadGen) return;

    const existingIds = new Set([
      ...(allData?.askedQuestions || []),
      ...(allData?.answeredQuestions || []),
    ].map(q => q.questionId));

    if (allData) {
      allData.askedQuestions    = [...allData.askedQuestions,    ...rpcData.asked.filter(q => !existingIds.has(q.questionId))];
      allData.answeredQuestions = [...allData.answeredQuestions, ...rpcData.answered.filter(q => !existingIds.has(q.questionId))];
      allData.userResponses     = [...allData.userResponses, ...rpcData.userResponses];
      allData.claimables        = [...allData.claimables, ...rpcData.claimables];
      renderAsked(allData.askedQuestions, false);
      renderAnswered(allData.answeredQuestions, allData.userResponses, allData.claimedSet, allData.claimables, false);
      renderClaimBanner(allData.claimables, effectiveClaimChain(allData.claimables));
    }

    _scanState[chainId] = { fromBlock, toBlock };
    renderScanStatus(null);
  }

  async function scanFurtherBack(chainId) {
    if (!_scanState[chainId] || !viewAddr) return;

    const gen = _accountLoadGen;
    // Each click pushes the desired target 3 more weeks back from wherever we already plan to go
    const base = _scanFurtherBackTarget[chainId] ?? _scanState[chainId].fromBlock;
    _scanFurtherBackTarget[chainId] = Math.max(0, base - (BLOCKS_PER_DAY[chainId] || 7200) * 21);

    // If the loop is already running it will pick up the new target; just return
    if (_scanFurtherBackActive.has(chainId)) return;
    _scanFurtherBackActive.add(chainId);

    try {
      while (_scanState[chainId] && _scanFurtherBackTarget[chainId] < _scanState[chainId].fromBlock) {
        if (gen !== _accountLoadGen) break;

        const { fromBlock, toBlock } = _scanState[chainId];
        const newFrom = _scanFurtherBackTarget[chainId];

        renderScanStatus(`Scanning ${chainName(chainId)} further back…`, chainId);

        const rpcData = await scanRpcForAccount(viewAddr, chainId, newFrom, fromBlock - 1, gen, msg => {
          if (gen === _accountLoadGen) renderScanStatus(msg, chainId);
        });
        if (!rpcData || gen !== _accountLoadGen) break;

        const existingIds = new Set([
          ...(allData?.askedQuestions || []),
          ...(allData?.answeredQuestions || []),
        ].map(q => q.questionId));

        if (allData) {
          allData.askedQuestions    = [...allData.askedQuestions,    ...rpcData.asked.filter(q => !existingIds.has(q.questionId))];
          allData.answeredQuestions = [...allData.answeredQuestions, ...rpcData.answered.filter(q => !existingIds.has(q.questionId))];
          allData.userResponses     = [...allData.userResponses, ...rpcData.userResponses];
          allData.claimables        = [...allData.claimables, ...rpcData.claimables];
          renderAsked(allData.askedQuestions, false);
          renderAnswered(allData.answeredQuestions, allData.userResponses, allData.claimedSet, allData.claimables, false);
          renderClaimBanner(allData.claimables, effectiveClaimChain(allData.claimables));
        }

        _scanState[chainId] = { fromBlock: newFrom, toBlock };
        renderScanStatus(null);
      }
    } finally {
      _scanFurtherBackActive.delete(chainId);
      delete _scanFurtherBackTarget[chainId];
    }
  }

  // ── GraphQL ──────────────────────────────────────────────────────────────────
  async function gql(query) {
    const url = (window.RealitySettings?.getPonderUrl?.()) || '/graphql';
    const res = await withIndicator(ponderInd, () => fetch(url, { method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }) }));
    if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}`);
    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0]?.message || 'GraphQL error');
    return json.data;
  }

  // ── Contracts.json ──────────────────────────────────────────────────────────
  async function loadContracts() {
    if (_contractsData) return _contractsData;
    _contractsData = window.RealityWebsiteData?.contracts || {};
    _contractTokenMap = buildContractTokenMap(_contractsData);
    return _contractsData;
  }

  function buildContractTokenMap(data) {
    const map = {};
    for (const chainData of Object.values(data)) {
      for (const [tokenSym, versions] of Object.entries(chainData)) {
        for (const v of Object.values(versions)) {
          if (v.address) map[v.address.toLowerCase()] = { tokenSym, tokenAddress: v.token_address || null };
        }
      }
    }
    return map;
  }

  function getRcContracts(data, chainId) {
    const chainData = data[String(chainId)] || {};
    const result = [];
    for (const [tokenSym, versions] of Object.entries(chainData)) {
      for (const [ver, v] of Object.entries(versions)) {
        if (v.address) result.push({ address: v.address.toLowerCase(), ver, tokenSym, tokenAddress: v.token_address || null });
      }
    }
    return result;
  }

  function tokenForQuestion(q) {
    if (q.contract) {
      const info = _contractTokenMap[q.contract.toLowerCase()];
      if (info) return info.tokenSym;
    }
    return CHAIN_NATIVE_TOKEN[q.chainId] || 'ETH';
  }

  // ── Answer display ────────────────────────────────────────────────────────────
  const BOOL_LABEL = { '0x0000000000000000000000000000000000000000000000000000000000000000': 'No',
                       '0x0000000000000000000000000000000000000000000000000000000000000001': 'Yes' };
  const INVALID = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
  const TOO_SOON = '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe';

  function answerLabel(hex, q) {
    if (!hex) return null;
    const lo = hex.toLowerCase();
    if (lo === INVALID.toLowerCase()) return 'Invalid';
    if (lo === TOO_SOON.toLowerCase()) return 'Too soon';
    if (q) {
      const qjson = window.RealityLib.parseQuestionJSON(q.data);
      const text = window.RealityLib.getAnswerString(qjson, hex);
      if (text && text !== 'null') return text;
    }
    return BOOL_LABEL[lo] || hex.slice(0, 10) + '…';
  }

  function answerClass(hex, q) {
    if (!hex) return 'ans-inv';
    const lo = hex.toLowerCase();
    if (lo === INVALID.toLowerCase() || lo === TOO_SOON.toLowerCase()) return 'ans-inv';
    const lbl = answerLabel(hex, q);
    if (lbl === 'Yes') return 'ans-yes';
    if (lbl === 'No')  return 'ans-no';
    return 'ans-other';
  }

  // ── Claim calculation ─────────────────────────────────────────────────────────
  function computeClaimable(question, responses, userAddr) {
    const BN0 = 0n;
    if (!isFinalized(question)) return { total: BN0 };
    const finalAnswer = question.currentAnswer;
    if (!finalAnswer) return { total: BN0 };
    if (!question.historyHash || question.historyHash === ZERO_HASH) return { total: BN0 };

    const bounty = BigInt(question.bounty || '0');
    const user = userAddr.toLowerCase();
    let ttl = BN0, is_yours = false, is_first = true;

    for (let i = responses.length - 1; i >= 0; i--) {
      const r = responses[i];
      const answer = r.isCommitment ? (r.commitmentHash || ZERO_HASH) : (r.answer || ZERO_HASH);
      const bond = BigInt(r.bond);
      const isYou = r.user.toLowerCase() === user;

      if (is_yours) {
        if (!isYou && finalAnswer.toLowerCase() === answer.toLowerCase()) {
          is_yours = false; ttl = ttl - bond;
        } else {
          ttl = ttl + bond;
        }
      } else if (isYou && finalAnswer.toLowerCase() === answer.toLowerCase()) {
        is_yours = true; ttl = ttl + bond;
      }
      if (is_first && is_yours) ttl = ttl + bounty;
      is_first = false;
    }

    if (ttl <= BN0) return { total: BN0 };

    const n = responses.length;
    const answers = [], addrs = [], bonds = [], hist_hashes = [];
    for (let i = 0; i < n; i++) {
      const idx = n - 1 - i;
      const r = responses[idx];
      answers.push(r.isCommitment ? (r.commitmentHash || ZERO_HASH) : (r.answer || ZERO_HASH));
      addrs.push(r.user);
      bonds.push(BigInt(r.bond));
      hist_hashes.push(idx > 0 ? (responses[idx - 1].historyHash || ZERO_HASH) : ZERO_HASH);
    }

    return { total: ttl,
      questionId: question.questionId, contract: question.contract.toLowerCase(), chainId: question.chainId,
      question_ids: [question.questionId], lengths: [n],
      answers, addrs, bonds, hist_hashes };
  }

  // ── Ponder data loading ────────────────────────────────────────────────────────
  async function loadAccountData(a) {
    a = a.toLowerCase();
    if (!/^0x[0-9a-f]{40}$/.test(a)) return null;
    const qFields = `id questionId contract chainId title type category currentAnswer currentAnswerBond bounty historyHash answerFinalizedTimestamp scheduledFinalizationTimestamp createdTimestamp timeout arbitrator isPendingArbitration arbitrationOccurred`;

    const [askedData, respData, claimData, arbData] = await Promise.all([
      gql(`{ questions(where:{creator:"${a}"},orderBy:"createdTimestamp",orderDirection:"desc",limit:1000) { items{${qFields}} pageInfo{hasNextPage} } }`),
      gql(`{ responses(where:{user:"${a}"},orderBy:"timestamp",orderDirection:"asc",limit:1000) { items{id questionId answer commitmentHash bond user historyHash isCommitment timestamp} pageInfo{hasNextPage} } }`),
      gql(`{ claims(where:{user:"${a}"},limit:500) { items{questionId amount} } }`),
      gql(`{ questions(where:{arbitrator:"${a}"},orderBy:"createdTimestamp",orderDirection:"desc",limit:1000) { items{${qFields}} pageInfo{hasNextPage} } }`),
    ]);

    const askedQuestions    = askedData.questions?.items || [];
    const askedHasMore      = askedData.questions?.pageInfo?.hasNextPage || false;
    const userResponses     = respData.responses?.items  || [];
    const responsesHasMore  = respData.responses?.pageInfo?.hasNextPage || false;
    const claimedSet        = new Set((claimData.claims?.items || []).map(c => c.questionId));

    const answeredIds = [...new Set(userResponses.map(r => r.questionId))];
    let answeredQuestions = [];
    if (answeredIds.length > 0) {
      const idList = answeredIds.map(id => `"${id}"`).join(',');
      const answeredData = await gql(`{ questions(where:{id_in:[${idList}]},limit:${answeredIds.length}) { items{${qFields}} } }`);
      answeredQuestions = answeredData.questions?.items || [];
    }

    const claimCandidates = answeredQuestions.filter(q =>
      isFinalized(q) && !claimedSet.has(q.id)
    );
    const fullRespMap = {};
    if (claimCandidates.length > 0) {
      const candIds = claimCandidates.map(q => `"${q.id}"`).join(',');
      const histData = await gql(`{ responses(where:{questionId_in:[${candIds}]},orderBy:"timestamp",orderDirection:"asc",limit:${claimCandidates.length * 100}) { items{answer commitmentHash bond user historyHash isCommitment questionId} } }`);
      for (const r of histData.responses?.items || []) {
        (fullRespMap[r.questionId] ??= []).push(r);
      }
    }

    const claimables = [];
    for (const q of claimCandidates) {
      const result = computeClaimable(q, fullRespMap[q.id] || [], a);
      if (result.total > 0n) claimables.push(result);
    }

    const arbitratorQuestions = arbData.questions?.items || [];
    const arbHasMore          = arbData.questions?.pageInfo?.hasNextPage || false;

    return { askedQuestions, askedHasMore, answeredQuestions, responsesHasMore, userResponses, claimedSet, claimables, arbitratorQuestions, arbHasMore };
  }

  // ── Render helpers ─────────────────────────────────────────────────────────────
  function relTime(ts) {
    const diff = Math.floor(Date.now() / 1000) - Number(ts);
    if (diff < 60)    return 'just now';
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(Number(ts) * 1000).toLocaleDateString();
  }

  function statusBadge(q) {
    if (q.isPendingArbitration) return '<span class="badge badge-arb">Pending Arbitration</span>';
    if (isFinalized(q)) return '<span class="badge badge-final">Finalized</span>';
    const now = Date.now() / 1000;
    const schedTS = Number(q.scheduledFinalizationTimestamp || 0);
    if (schedTS > 1 && schedTS > now) return '<span class="badge badge-open">Open</span>';
    return '<span class="badge badge-upcoming">Upcoming</span>';
  }

  function escHtml(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ── Render: asked tab ──────────────────────────────────────────────────────────
  function renderAsked(questions, hasMore) {
    const loading = document.getElementById('asked-loading');
    const list    = document.getElementById('asked-list');
    loading.style.display = 'none';

    list.innerHTML = '';
    if (!questions.length) {
      loading.textContent = 'No questions asked yet.';
      loading.style.display = 'block';
      return;
    }

    document.getElementById('asked-count').textContent = hasMore ? `${questions.length}+` : questions.length;

    for (const q of questions) {
      const fin  = isFinalized(q);
      const token = tokenForQuestion(q);
      const bond  = BigInt(q.currentAnswerBond || '0');
      const chain = chainName(q.chainId);
      const title = q.title || q.id;

      let rightHtml = '';
      if (fin && q.currentAnswer) {
        const label = answerLabel(q.currentAnswer, q);
        const cls   = answerClass(q.currentAnswer, q);
        rightHtml = `<span class="ans-pill ${cls}">${label}</span>`;
      } else if (bond > 0n) {
        rightHtml = `<div class="q-item-amount">${formatEth(bond)} ${token}</div><div class="q-item-chain">top bond</div>`;
      }

      const bounty  = BigInt(q.bounty || '0');
      const bountyStr = bounty > 0n ? ` · reward ${formatEth(bounty)} ${token}` : '';

      const item = document.createElement('div');
      item.className = 'q-item';
      item.innerHTML = `
        <div>
          <div class="q-item-top">
            ${statusBadge(q)}
            <a class="q-item-title" href="${questionUrl(q)}">${escHtml(title)}</a>
          </div>
          <div class="q-item-meta">
            <span>${chain}</span>
            <span class="q-item-meta-sep">·</span>
            <span>${relTime(q.createdTimestamp)}</span>
            ${bountyStr ? `<span class="q-item-meta-sep">·</span><span>${bountyStr.slice(3)}</span>` : ''}
          </div>
        </div>
        <div class="q-item-side">${rightHtml}<span class="q-item-chain">${chain}</span></div>`;
      list.appendChild(item);
    }
  }

  // ── Render: answered tab ───────────────────────────────────────────────────────
  function renderAnswered(questions, userResponses, claimedSet, claimables, hasMore) {
    const loading = document.getElementById('answered-loading');
    const list    = document.getElementById('answered-list');
    loading.style.display = 'none';

    list.innerHTML = '';
    if (!questions.length) {
      loading.textContent = 'No questions answered yet.';
      loading.style.display = 'block';
      return;
    }

    document.getElementById('answered-count').textContent = hasMore ? `${questions.length}+` : questions.length;

    const myLastResp = {};
    for (const r of userResponses) { myLastResp[r.questionId] = r; }

    const claimMap = {};
    for (const c of claimables) { claimMap[c.questionId] = c; }

    const sorted = [...questions].sort((a, b) => {
      const ca = claimMap[a.questionId], cb = claimMap[b.questionId];
      if (ca && !cb) return -1;
      if (!ca && cb) return 1;
      if (isFinalized(a) && !isFinalized(b)) return 1;
      if (!isFinalized(a) && isFinalized(b)) return -1;
      return Number(b.createdTimestamp) - Number(a.createdTimestamp);
    });

    for (const q of sorted) {
      const fin   = isFinalized(q);
      const token = tokenForQuestion(q);
      const chain = chainName(q.chainId);
      const title = q.title || q.id;
      const myResp = myLastResp[q.questionId];
      const claimItem = claimMap[q.questionId];
      const alreadyClaimed = claimedSet.has(q.id);

      let myAnsHtml = '';
      if (myResp && !myResp.isCommitment) {
        const ans   = myResp.answer;
        const label = answerLabel(ans, q);
        const cls   = answerClass(ans, q);
        myAnsHtml = `<span class="ans-pill ${cls}" title="Your answer">${escHtml(label)}</span>`;
      } else if (myResp?.isCommitment) {
        myAnsHtml = `<span class="ans-pill ans-inv">Commitment</span>`;
      }

      let outcomeHtml = '';
      if (fin && myResp && !myResp.isCommitment && q.currentAnswer) {
        const won = myResp.answer?.toLowerCase() === q.currentAnswer.toLowerCase();
        outcomeHtml = won
          ? '<span class="win-mark">✓ Won</span>'
          : '<span class="loss-mark">Lost</span>';
      }

      let rightHtml = '';
      if (claimItem) {
        rightHtml = `<div class="q-item-amount claimable">${formatEth(claimItem.total)} ${token}</div><div class="q-item-chain">claimable</div>`;
      } else if (alreadyClaimed) {
        rightHtml = `<div class="q-item-amount claimed">Claimed</div>`;
      } else if (myResp) {
        const bond = BigInt(myResp.bond || '0');
        if (bond > 0n) rightHtml = `<div class="q-item-amount">${formatEth(bond)} ${token}</div><div class="q-item-chain">your bond</div>`;
      }

      const item = document.createElement('div');
      item.className = 'q-item';
      item.innerHTML = `
        <div>
          <div class="q-item-top">
            ${statusBadge(q)}
            ${myAnsHtml}
            ${outcomeHtml}
            <a class="q-item-title" href="${questionUrl(q)}">${escHtml(title)}</a>
          </div>
          <div class="q-item-meta">
            <span>${chain}</span>
            <span class="q-item-meta-sep">·</span>
            <span>${relTime(myResp?.timestamp || q.createdTimestamp)}</span>
          </div>
        </div>
        <div class="q-item-side">${rightHtml}</div>`;
      list.appendChild(item);
    }
  }

  // ── Render: arbitrator tab ─────────────────────────────────────────────────────
  function renderArbitrator(questions, hasMore) {
    const btn  = document.getElementById('tab-btn-arbitrator');
    const list = document.getElementById('arbitrator-list');

    list.innerHTML = '';
    if (!questions.length) {
      btn.style.display = 'none';
      return;
    }

    btn.style.display = '';
    document.getElementById('arbitrator-count').textContent = hasMore ? `${questions.length}+` : questions.length;

    const open      = questions.filter(q => !q.isPendingArbitration && !q.arbitrationOccurred);
    const requested = questions.filter(q => q.isPendingArbitration);
    const resolved  = questions.filter(q => q.arbitrationOccurred);

    function appendSection(label, items) {
      const hdr = document.createElement('div');
      hdr.className = 'arb-section-header';
      hdr.textContent = label;
      list.appendChild(hdr);

      if (!items.length) {
        const empty = document.createElement('div');
        empty.className = 'arb-empty';
        empty.textContent = 'None';
        list.appendChild(empty);
        return;
      }

      for (const q of items) {
        const token = tokenForQuestion(q);
        const bond  = BigInt(q.currentAnswerBond || '0');
        const chain = chainName(q.chainId);
        const title = q.title || q.id;
        const rightHtml = bond > 0n
          ? `<div class="q-item-amount">${formatEth(bond)} ${token}</div><div class="q-item-chain">top bond</div>`
          : '';
        const item = document.createElement('div');
        item.className = 'q-item';
        item.innerHTML = `
          <div>
            <div class="q-item-top">
              ${statusBadge(q)}
              <a class="q-item-title" href="${questionUrl(q)}">${escHtml(title)}</a>
            </div>
            <div class="q-item-meta">
              <span>${chain}</span>
              <span class="q-item-meta-sep">·</span>
              <span>${relTime(q.createdTimestamp)}</span>
            </div>
          </div>
          <div class="q-item-side">${rightHtml}</div>`;
        list.appendChild(item);
      }
    }

    appendSection('Requested', requested);
    appendSection('Open', open);
    appendSection('Resolved', resolved);
  }

  // ── Chain pills ────────────────────────────────────────────────────────────────
  const SUPPORTED_CHAINS = [1, 100, 11155111];

  function buildChainPills() {
    const container = document.getElementById('chain-pills');
    container.innerHTML = '';
    container.style.display = '';
    for (const chainId of SUPPORTED_CHAINS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chain-pill' + (selectedViewChains.has(chainId) ? ' active' : '');
      btn.dataset.chain = String(chainId);
      btn.textContent = chainName(chainId);
      btn.addEventListener('click', () => toggleViewChain(chainId));
      container.appendChild(btn);
    }
  }

  function effectiveClaimChain(claimables) {
    if (selectedViewChains.size === 0) return walletChainId;
    if (selectedViewChains.size === 1) return [...selectedViewChains][0];
    const visible = claimables.filter(c => selectedViewChains.has(Number(c.chainId)));
    if (walletChainId && visible.some(c => Number(c.chainId) === walletChainId)) return walletChainId;
    return visible.length ? Number(visible[0].chainId) : walletChainId;
  }

  function toggleViewChain(chainId) {
    if (selectedViewChains.has(chainId)) selectedViewChains.delete(chainId);
    else selectedViewChains.add(chainId);

    document.querySelectorAll('.chain-pill').forEach(btn => {
      btn.classList.toggle('active', selectedViewChains.has(Number(btn.dataset.chain)));
    });

    const linkChain = selectedViewChains.size === 1 ? [...selectedViewChains][0] : walletChainId;
    const link = document.getElementById('hero-explorer-link');
    const exp = linkChain ? EXPLORER[linkChain] : null;
    if (exp && viewAddr) { link.href = `${exp}/address/${viewAddr}`; link.style.display = ''; }
    else                 { link.style.display = 'none'; }

    if (!allData) return;
    const { askedQuestions, askedHasMore, answeredQuestions, responsesHasMore, userResponses, claimedSet, claimables } = allData;

    const inView = q => selectedViewChains.size === 0 || selectedViewChains.has(Number(q.chainId));
    renderAsked(askedQuestions.filter(inView), askedHasMore && selectedViewChains.size === 0);
    renderAnswered(answeredQuestions.filter(inView), userResponses, claimedSet, claimables, responsesHasMore && selectedViewChains.size === 0);
    renderClaimBanner(claimables, effectiveClaimChain(claimables));
  }

  // ── Render: claim banner ───────────────────────────────────────────────────────
  function renderClaimBanner(claimables, chainId) {
    const banner = document.getElementById('claim-banner');
    const BN0    = 0n;

    const chainClaimables = claimables.filter(c => Number(c.chainId) === Number(chainId));
    const otherClaimables = claimables.filter(c => Number(c.chainId) !== Number(chainId));

    if (chainClaimables.length === 0 && otherClaimables.length === 0) {
      banner.style.display = 'none';
      pendingClaimData = null;
      return;
    }

    const claimBtn  = document.getElementById('claim-btn');
    const noteEl    = document.getElementById('other-chain-note');
    const needsSwitch = chainId !== null && chainId !== walletChainId;

    if (chainClaimables.length > 0) {
      const byToken = {};
      for (const c of chainClaimables) {
        const sym = _contractTokenMap[c.contract]?.tokenSym || CHAIN_NATIVE_TOKEN[chainId] || 'ETH';
        byToken[sym] = (byToken[sym] || BN0) + c.total;
      }
      const amountText = Object.entries(byToken).map(([sym, amt]) => `${formatEth(amt)} ${sym}`).join(' + ');
      banner.style.display = '';
      document.getElementById('claim-amount').textContent = `${amountText} claimable`;
      document.getElementById('claim-desc').textContent =
        `from ${chainClaimables.length} finalized question${chainClaimables.length > 1 ? 's' : ''} on ${chainName(chainId)}`;

      if (!canClaim()) {
        claimBtn.style.display = 'none';
        const matchNote = walletAddr
          ? `Connected as <a href="#!/account/${walletAddr}" class="hero-addr-link">${shortAddr(walletAddr)}</a> — connect the viewing address to claim`
          : 'Connect wallet to claim';
        noteEl.innerHTML = matchNote;
        noteEl.style.display = 'block';
        pendingClaimData = null; pendingClaimChainId = null;
      } else if (needsSwitch) {
        claimBtn.style.display = 'none';
        noteEl.textContent = `Switch to ${chainName(chainId)} in your wallet to claim`;
        noteEl.style.display = 'block';
        pendingClaimData = null; pendingClaimChainId = null;
      } else {
        const byContract = {};
        for (const c of chainClaimables) {
          const k = c.contract;
          if (!byContract[k]) byContract[k] = { contract: k, question_ids:[], lengths:[], hist_hashes:[], addrs:[], bonds:[], answers:[] };
          byContract[k].question_ids.push(...c.question_ids);
          byContract[k].lengths.push(...c.lengths);
          byContract[k].hist_hashes.push(...c.hist_hashes);
          byContract[k].addrs.push(...c.addrs);
          byContract[k].bonds.push(...c.bonds);
          byContract[k].answers.push(...c.answers);
        }
        pendingClaimData = Object.values(byContract);
        pendingClaimChainId = Number(chainId);
        claimBtn.style.display = '';
        claimBtn.disabled = false;
        claimBtn.textContent = 'Claim all & withdraw';

        if (otherClaimables.length > 0) {
          const chains = [...new Set(otherClaimables.map(c => chainName(c.chainId)))].join(', ');
          noteEl.textContent = `Also claimable on: ${chains} (select chain above to claim)`;
          noteEl.style.display = 'block';
        } else {
          noteEl.style.display = 'none';
        }
      }
    } else {
      banner.style.display = '';
      document.getElementById('claim-amount').textContent = '';
      document.getElementById('claim-desc').textContent   = '';
      claimBtn.style.display = 'none';
      pendingClaimData = null;

      const chains = [...new Set(otherClaimables.map(c => chainName(c.chainId)))].join(', ');
      noteEl.textContent = `Claimable on: ${chains} (select chain above to claim)`;
      noteEl.style.display = 'block';
    }
  }

  // ── TX helpers ─────────────────────────────────────────────────────────────────
  function txErr(err) {
    if (err?.code === 4001 || err?.code === 'ACTION_REJECTED') return 'Cancelled.';
    return err?.reason || err?.data?.message || err?.message || 'Transaction failed.';
  }

  async function handleClaimAll() {
    if (!signer || !pendingClaimData) return;
    if (walletChainId !== pendingClaimChainId) {
      document.getElementById('claim-error').textContent = `Please switch your wallet to ${chainName(pendingClaimChainId)} before claiming.`;
      document.getElementById('claim-error').classList.add('visible');
      return;
    }
    const btn   = document.getElementById('claim-btn');
    const errEl = document.getElementById('claim-error');
    errEl.classList.remove('visible');
    btn.disabled = true; btn.textContent = 'Waiting for wallet…';
    try {
      for (const group of pendingClaimData) {
        const rc = new ethers.Contract(group.contract, REALITY_ABI, signer);
        const tx = await withIndicator(rpcInd, () => rc.claimMultipleAndWithdrawBalance(
          group.question_ids, group.lengths, group.hist_hashes,
          group.addrs, group.bonds, group.answers
        ));
        btn.textContent = 'Pending…';
        await withIndicator(rpcInd, () => tx.wait());
      }
      btn.textContent = '✓ Done';
      setTimeout(() => location.reload(), 1500);
    } catch (err) {
      btn.disabled = false; btn.textContent = 'Claim all & withdraw';
      errEl.textContent = txErr(err);
      errEl.classList.add('visible');
    }
  }

  // ── Wallet UI update ───────────────────────────────────────────────────────────
  function updateWalletUI() {
    const noteEl = document.getElementById('hero-wallet-note');
    if (walletAddr && viewAddr && walletAddr !== viewAddr) {
      noteEl.innerHTML = `Connected as <a href="#!/account/${walletAddr}" class="hero-addr-link">${shortAddr(walletAddr)}</a> — connect the viewing address to claim`;
      noteEl.style.display = '';
    } else {
      noteEl.style.display = 'none';
    }

    if (allData) {
      renderClaimBanner(allData.claimables, effectiveClaimChain(allData.claimables));
    }

    if (selectedViewChains.size === 0 && walletChainId && viewAddr) {
      const exp = EXPLORER[walletChainId];
      const link = document.getElementById('hero-explorer-link');
      if (exp) { link.href = `${exp}/address/${viewAddr}`; link.style.display = ''; }
      else      { link.style.display = 'none'; }
    }
  }

  // ── Navigate to an address ────────────────────────────────────────────────────
  function setViewAddr(a) {
    a = a.toLowerCase();
    if (a === viewAddr) return;
    viewAddr = a;
    setUrlAddress(a);
    document.getElementById('connect-prompt').style.display = 'none';
    document.getElementById('account-content').style.display = '';
    document.getElementById('hero-addr').textContent = shortAddr(a);
    const exp = walletChainId ? EXPLORER[walletChainId] : null;
    const link = document.getElementById('hero-explorer-link');
    if (exp) { link.href = `${exp}/address/${a}`; link.style.display = ''; }
    else      { link.style.display = 'none'; }
    runAccount(a);
  }

  // ── Account data loading ───────────────────────────────────────────────────────
  function resetAccountUI() {
    document.getElementById('asked-list').innerHTML     = '';
    document.getElementById('answered-list').innerHTML  = '';
    document.getElementById('asked-count').textContent  = '0';
    document.getElementById('answered-count').textContent = '0';
    document.getElementById('asked-loading').textContent  = 'Loading…';
    document.getElementById('asked-loading').className    = 'state-msg';
    document.getElementById('asked-loading').style.display  = 'block';
    document.getElementById('answered-loading').textContent = 'Loading…';
    document.getElementById('answered-loading').className   = 'state-msg';
    document.getElementById('answered-loading').style.display = 'block';
    document.getElementById('claim-banner').style.display  = 'none';
    document.getElementById('chain-pills').innerHTML = '';
    document.getElementById('chain-pills').style.display = 'none';
    document.getElementById('arbitrator-list').innerHTML = '';
    document.getElementById('arbitrator-count').textContent = '0';
    document.getElementById('tab-btn-arbitrator').style.display = 'none';
    pendingClaimData  = null;
    allData            = null;
    selectedViewChains = new Set();
  }

  async function runAccount(a) {
    const gen = ++_accountLoadGen;
    _scanState = {};
    _scanFurtherBackTarget = {};
    _scanFurtherBackActive = new Set();

    resetAccountUI();
    updateWalletUI();
    renderScanStatus(null);

    // Phase 1: Try Ponder indexer
    try {
      const data = await loadAccountData(a);
      if (gen !== _accountLoadGen) return;
      ponderInd?.classList.remove('offline');
      allData = data;
      buildChainPills();
      renderAsked(data.askedQuestions, data.askedHasMore);
      renderAnswered(data.answeredQuestions, data.userResponses, data.claimedSet, data.claimables, data.responsesHasMore);
      renderArbitrator(data.arbitratorQuestions, data.arbHasMore);
      renderClaimBanner(data.claimables, effectiveClaimChain(data.claimables));
      return;
    } catch (e) {
      if (gen !== _accountLoadGen) return;
      if (ponderInd) { ponderInd.classList.add('offline'); ponderInd.dataset.lastError = e?.message || 'Ponder unavailable'; ponderInd.dataset.ponderUrl = (window.RealitySettings?.getPonderUrl?.()) || '/graphql'; }
    }

    // Phase 2a: Show any locally-cached data immediately
    renderScanStatus('Checking local cache…');
    const cacheData = await getQCacheQuestions(a);
    if (gen !== _accountLoadGen) return;

    if (cacheData.asked.length || cacheData.answered.length) {
      allData = { askedQuestions: cacheData.asked, askedHasMore: false,
                  answeredQuestions: cacheData.answered, responsesHasMore: false,
                  userResponses: cacheData.userResponses, claimedSet: cacheData.claimedSet,
                  claimables: cacheData.claimables, arbitratorQuestions: [], arbHasMore: false };
      buildChainPills();
      renderAsked(cacheData.asked, false);
      renderAnswered(cacheData.answered, cacheData.userResponses, cacheData.claimedSet, cacheData.claimables, false);
    }

    // Phase 2b: RPC scan — wallet chain + any chains with cached activity
    // (avoids scanning chain 1 when all the user's activity is on another chain)
    const cacheChainIds = [...new Set([
      ...cacheData.asked.map(q => q.chainId),
      ...cacheData.answered.map(q => q.chainId),
    ])];
    const chainsToScan = [...new Set([
      ...(walletChainId ? [walletChainId] : []),
      ...cacheChainIds,
    ])].filter(id => (id === walletChainId && provider) || PUBLIC_RPC[id]);
    if (!chainsToScan.length) chainsToScan.push(1);
    console.log(`[scan] walletChainId=${walletChainId} cacheChains=[${cacheChainIds}] chainsToScan=[${chainsToScan}]`);

    const allRpcAsked = [], allRpcAnswered = [], allRpcUserResponses = [], allRpcClaimables = [];

    for (const chainId of chainsToScan) {
      if (gen !== _accountLoadGen) return;
      _scanState[chainId] = null;  // mark in progress

      let toBlock;
      try {
        const prov = (chainId === walletChainId && provider)
          || new ethers.JsonRpcProvider(PUBLIC_RPC[chainId], chainId, { staticNetwork: true });
        toBlock = await withIndicator(rpcInd, () => prov.getBlockNumber());
      } catch {
        delete _scanState[chainId];
        renderScanStatus(`RPC unavailable for ${chainName(chainId)}.`);
        continue;
      }
      if (gen !== _accountLoadGen) return;

      const fromBlock = Math.max(0, toBlock - (BLOCKS_PER_DAY[chainId] || 7200) * 21);
      renderScanStatus(`Scanning ${chainName(chainId)} (last 3 weeks)…`);

      const rpcData = await scanRpcForAccount(a, chainId, fromBlock, toBlock, gen, msg => {
        if (gen === _accountLoadGen) renderScanStatus(msg);
      });
      if (!rpcData || gen !== _accountLoadGen) return;

      allRpcAsked.push(...rpcData.asked);
      allRpcAnswered.push(...rpcData.answered);
      allRpcUserResponses.push(...rpcData.userResponses);
      allRpcClaimables.push(...rpcData.claimables);

      _scanState[chainId] = { fromBlock, toBlock };

      // Update display after each chain so results appear incrementally
      const rpcIds = new Set([...allRpcAsked, ...allRpcAnswered].map(q => q.questionId));
      const mergedAsked    = [...allRpcAsked,    ...cacheData.asked.filter(q => !rpcIds.has(q.questionId))];
      const mergedAnswered = [...allRpcAnswered, ...cacheData.answered.filter(q => !rpcIds.has(q.questionId))];
      allData = { askedQuestions: mergedAsked, askedHasMore: false,
                  answeredQuestions: mergedAnswered, responsesHasMore: false,
                  userResponses: allRpcUserResponses, claimedSet: new Set(),
                  claimables: allRpcClaimables, arbitratorQuestions: [], arbHasMore: false };
      buildChainPills();
      renderAsked(mergedAsked, false);
      renderAnswered(mergedAnswered, allRpcUserResponses, new Set(), allRpcClaimables, false);
      renderClaimBanner(allRpcClaimables, effectiveClaimChain(allRpcClaimables));
      renderScanStatus(null);
    }
  }

  // ── Wallet callback (called by index.html via window._setAccountWallet) ────────
  function onWalletChange(a) {
    walletAddr = a ? a.toLowerCase() : null;

    if (walletAddr) {
      provider = new ethers.BrowserProvider(window.ethereum);
      Promise.all([provider.getSigner(), provider.getNetwork()]).then(([s, net]) => {
        signer = s;
        walletChainId = Number(net.chainId);
        if (!viewAddr) {
          setViewAddr(walletAddr);
        } else {
          updateWalletUI();
        }
      });
      window.ethereum.removeAllListeners?.('chainChanged');
      window.ethereum.on('chainChanged', async hex => {
        walletChainId = parseInt(hex, 16);
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        updateWalletUI();
      });
    } else {
      provider = null; signer = null;
      if (viewAddr) {
        updateWalletUI();
      } else {
        document.getElementById('connect-prompt').style.display = '';
        document.getElementById('account-content').style.display = 'none';
      }
    }
  }

  // ── Tabs ────────────────────────────────────────────────────────────────────────
  document.querySelectorAll('#account-view .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#account-view .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      document.getElementById('tab-asked').style.display       = tab === 'asked'       ? '' : 'none';
      document.getElementById('tab-answered').style.display    = tab === 'answered'    ? '' : 'none';
      document.getElementById('tab-arbitrator').style.display  = tab === 'arbitrator'  ? '' : 'none';
    });
  });

  // ── Claim + address input event listeners ─────────────────────────────────────
  document.getElementById('claim-btn').addEventListener('click', handleClaimAll);

  document.getElementById('connect-btn').onclick = () => RealityWallet.connectWallet(onWalletChange);

  const addrInput = document.getElementById('addr-input');
  const handleAddrGo = () => {
    const raw = addrInput.value.trim().toLowerCase();
    if (/^0x[0-9a-f]{40}$/.test(raw)) setViewAddr(raw);
  };
  document.getElementById('addr-go-btn').addEventListener('click', handleAddrGo);
  addrInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleAddrGo(); });

  // ── Expose wallet callback for index.html ──────────────────────────────────────
  window._setAccountWallet = onWalletChange;

  // ── Initial load ───────────────────────────────────────────────────────────────
  if (viewAddr) {
    document.getElementById('connect-prompt').style.display = 'none';
    document.getElementById('account-content').style.display = '';
    document.getElementById('hero-addr').textContent = shortAddr(viewAddr);
    runAccount(viewAddr);
  }
};

})();
