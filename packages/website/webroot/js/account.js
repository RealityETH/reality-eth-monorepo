(function () {
'use strict';

// ── Constants ──────────────────────────────────────────────────────────────────
const ZERO_HASH = '0x' + '0'.repeat(64);

const CHAIN_TOKEN = { 1:'ETH', 10:'OETH', 100:'XDAI', 137:'POL', 42161:'ETH', 8453:'ETH', 11155111:'ETH' };
const CHAIN_NAME  = { 1:'Ethereum', 10:'Optimism', 100:'Gnosis', 137:'Polygon', 42161:'Arbitrum', 8453:'Base', 11155111:'Sepolia' };
const CHAIN_NATIVE_TOKEN = { 1:'ETH', 10:'OETH', 100:'XDAI', 137:'MATIC', 42161:'ARETH', 8453:'ETH', 11155111:'ETH' };
const EXPLORER    = { 1:'https://etherscan.io', 10:'https://optimistic.etherscan.io', 100:'https://gnosisscan.io', 137:'https://polygonscan.com', 42161:'https://arbiscan.io', 8453:'https://basescan.org', 11155111:'https://sepolia.etherscan.io' };
const PUBLIC_RPC  = { 1:'https://ethereum-rpc.publicnode.com', 10:'https://optimism-rpc.publicnode.com', 100:'https://rpc.gnosischain.com', 137:'https://polygon-rpc.com', 42161:'https://arbitrum-one-rpc.publicnode.com', 8453:'https://base-rpc.publicnode.com', 11155111:'https://ethereum-sepolia-rpc.publicnode.com' };

const VERSION_PREF = ['RealityETH-3.2', 'RealityETH-3.0', 'RealityETH-2.1'];

const REALITY_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function withdraw()',
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
  let allData           = null;
  let selectedViewChains = new Set();

  // ── URL helpers ─────────────────────────────────────────────────────────────
  function setUrlAddress(a) {
    const newHash = a ? `#!/account?address=${a}` : '#!/account';
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
    return ts > 0 && ts * 1000 < Date.now();
  }

  function questionUrl(q) {
    return `#!/network/${q.chainId}/question/${q.contract}-${q.questionId}`;
  }

  // ── Indicators ───────────────────────────────────────────────────────────────
  async function withIndicator(el, fn) {
    el?.classList.add('active');
    const start = Date.now();
    try { return await fn(); }
    finally { setTimeout(() => el?.classList.remove('active'), Math.max(0, 1000 - (Date.now() - start))); }
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
    const r = await fetch('generated/contracts.json');
    _contractsData = await r.json();
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

  function answerLabel(hex) {
    if (!hex) return null;
    const lo = hex.toLowerCase();
    if (lo === INVALID.toLowerCase()) return 'Invalid';
    if (lo === TOO_SOON.toLowerCase()) return 'Too soon';
    return BOOL_LABEL[lo] || hex.slice(0, 10) + '…';
  }

  function answerClass(hex) {
    if (!hex) return 'ans-inv';
    const lo = hex.toLowerCase();
    if (lo === INVALID.toLowerCase() || lo === TOO_SOON.toLowerCase()) return 'ans-inv';
    const lbl = BOOL_LABEL[lo];
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

  // ── RPC balances ──────────────────────────────────────────────────────────────
  async function loadBalances(a, chainId) {
    const BN0 = 0n;
    const prov = provider || new ethers.JsonRpcProvider(PUBLIC_RPC[chainId], chainId, { staticNetwork: true });
    const contracts = await loadContracts();
    const rcList = getRcContracts(contracts, chainId);

    const [walletBal, ...rcBals] = await Promise.all([
      prov.getBalance(a).catch(() => BN0),
      ...rcList.map(({ address }) =>
        new ethers.Contract(address, REALITY_ABI, prov).balanceOf(a).catch(() => BN0)
      ),
    ]);

    const contractBal = rcList.reduce((sum, r, i) => !r.tokenAddress ? sum + (rcBals[i] || BN0) : sum, BN0);
    const withdrawableContracts = rcList.filter((_, i) => (rcBals[i] || 0n) > 0n).map(r => r.address);
    return { walletBal, contractBal, withdrawableContracts };
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
    if (isFinalized(q)) return '<span class="badge badge-final">Finalized</span>';
    const now = Date.now() / 1000;
    const schedTS = Number(q.scheduledFinalizationTimestamp || 0);
    if (schedTS > 0 && schedTS > now) return '<span class="badge badge-open">Open</span>';
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
      const chain = CHAIN_NAME[q.chainId] || `Chain ${q.chainId}`;
      const title = q.title || q.id;

      let rightHtml = '';
      if (fin && q.currentAnswer) {
        const label = answerLabel(q.currentAnswer);
        const cls   = answerClass(q.currentAnswer);
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
      const chain = CHAIN_NAME[q.chainId]  || `Chain ${q.chainId}`;
      const title = q.title || q.id;
      const myResp = myLastResp[q.id];
      const claimItem = claimMap[q.questionId];
      const alreadyClaimed = claimedSet.has(q.id);

      let myAnsHtml = '';
      if (myResp && !myResp.isCommitment) {
        const ans   = myResp.answer;
        const label = answerLabel(ans);
        const cls   = answerClass(ans);
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
        const chain = CHAIN_NAME[q.chainId] || `Chain ${q.chainId}`;
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
      btn.textContent = CHAIN_NAME[chainId] || `Chain ${chainId}`;
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

  // ── Render: balances + claim banner ───────────────────────────────────────────
  function renderBalances({ walletBal, contractBal, withdrawableContracts }, chainId) {
    const token = CHAIN_TOKEN[chainId] || 'ETH';
    document.getElementById('wallet-balance').textContent   = `${formatEth(walletBal)} ${token}`;
    document.getElementById('contract-balance').textContent = `${formatEth(contractBal)} ${token}`;

    const wdBtn = document.getElementById('withdraw-btn');
    if (canClaim() && withdrawableContracts.length > 0) {
      wdBtn.style.display = '';
      wdBtn.onclick = () => handleWithdraw(withdrawableContracts, chainId);
    } else {
      wdBtn.style.display = 'none';
    }
  }

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
        `from ${chainClaimables.length} finalized question${chainClaimables.length > 1 ? 's' : ''} on ${CHAIN_NAME[chainId] || `chain ${chainId}`}`;

      if (!canClaim()) {
        claimBtn.style.display = 'none';
        const matchNote = walletAddr
          ? `Connected as <a href="#!/account?address=${walletAddr}" class="hero-addr-link">${shortAddr(walletAddr)}</a> — connect the viewing address to claim`
          : 'Connect wallet to claim';
        noteEl.innerHTML = matchNote;
        noteEl.style.display = 'block';
        pendingClaimData = null;
      } else if (needsSwitch) {
        claimBtn.style.display = 'none';
        noteEl.textContent = `Switch to ${CHAIN_NAME[chainId] || `chain ${chainId}`} in your wallet to claim`;
        noteEl.style.display = 'block';
        pendingClaimData = null;
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
        claimBtn.style.display = '';
        claimBtn.disabled = false;
        claimBtn.textContent = 'Claim all & withdraw';

        if (otherClaimables.length > 0) {
          const chains = [...new Set(otherClaimables.map(c => CHAIN_NAME[Number(c.chainId)] || `chain ${c.chainId}`))].join(', ');
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

      const chains = [...new Set(otherClaimables.map(c => CHAIN_NAME[Number(c.chainId)] || `chain ${c.chainId}`))].join(', ');
      noteEl.textContent = `Claimable on: ${chains} (select chain above to claim)`;
      noteEl.style.display = 'block';
    }
  }

  // ── TX helpers ─────────────────────────────────────────────────────────────────
  function txErr(err) {
    if (err?.code === 4001 || err?.code === 'ACTION_REJECTED') return 'Cancelled.';
    return err?.reason || err?.data?.message || err?.message || 'Transaction failed.';
  }

  async function handleWithdraw(contractAddrs, chainId) {
    if (!signer) return;
    const btn = document.getElementById('withdraw-btn');
    btn.disabled = true; btn.textContent = 'Waiting…';
    try {
      for (const a of contractAddrs) {
        const rc = new ethers.Contract(a, REALITY_ABI, signer);
        const tx = await withIndicator(rpcInd, () => rc.withdraw());
        btn.textContent = 'Pending…';
        await withIndicator(rpcInd, () => tx.wait());
      }
      btn.textContent = '✓ Done';
      setTimeout(() => location.reload(), 1500);
    } catch (err) {
      btn.disabled = false; btn.textContent = 'Withdraw';
      alert(txErr(err));
    }
  }

  async function handleClaimAll() {
    if (!signer || !pendingClaimData) return;
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
      noteEl.innerHTML = `Connected as <a href="#!/account?address=${walletAddr}" class="hero-addr-link">${shortAddr(walletAddr)}</a> — connect the viewing address to claim`;
      noteEl.style.display = '';
    } else {
      noteEl.style.display = 'none';
    }

    if (canClaim() && walletChainId) {
      loadBalances(viewAddr, walletChainId)
        .then(bals => renderBalances(bals, walletChainId))
        .catch(() => {
          document.getElementById('wallet-balance').textContent   = '—';
          document.getElementById('contract-balance').textContent = '—';
        });
    } else {
      document.getElementById('wallet-balance').textContent   = '—';
      document.getElementById('contract-balance').textContent = '—';
      document.getElementById('withdraw-btn').style.display   = 'none';
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
    document.getElementById('wallet-balance').textContent   = '—';
    document.getElementById('contract-balance').textContent = '—';
    document.getElementById('withdraw-btn').style.display   = 'none';
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

    resetAccountUI();
    updateWalletUI();

    try {
      const data = await loadAccountData(a);
      if (gen !== _accountLoadGen) return;

      allData = data;

      buildChainPills();
      renderAsked(data.askedQuestions, data.askedHasMore);
      renderAnswered(data.answeredQuestions, data.userResponses, data.claimedSet, data.claimables, data.responsesHasMore);
      renderArbitrator(data.arbitratorQuestions, data.arbHasMore);
      renderClaimBanner(data.claimables, effectiveClaimChain(data.claimables));
    } catch (err) {
      if (gen !== _accountLoadGen) return;
      console.error('account load error', err);
      document.getElementById('asked-loading').textContent   = 'Failed to load data (is the indexer running?)';
      document.getElementById('asked-loading').className     = 'state-msg state-error';
      document.getElementById('asked-loading').style.display = 'block';
      document.getElementById('answered-loading').style.display = 'none';
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
