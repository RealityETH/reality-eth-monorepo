(function () {
'use strict';

const MULTICALL3  = '0xcA11bde05977b3631167028862bE2a173976CA11';
const WEEKS_INIT  = 1;   // default scan window
const WEEKS_BACK  = 3;   // how many weeks each "Scan further back" adds

function chainName(id)         { return window.RealityWebsiteData?.chains?.[String(id)]?.display_name || window.RealityChains?.name(id) || `Chain ${id}`; }
function chainBlocksPerDay(id) { return window.RealityWebsiteData?.chains?.[String(id)]?.blocksPerDay || 7200; }
function chainRpc(id)          { return window.RealitySettings?.getRpcUrl(id) || window.RealityWebsiteData?.chains?.[String(id)]?.hostedRPC || null; }

function getContractsForChain(chainId) {
  const chainData = (window.RealityWebsiteData?.contracts || {})[String(chainId)] || {};
  const out = [];
  for (const [token, versions] of Object.entries(chainData)) {
    for (const [ver, v] of Object.entries(versions)) {
      if (v.address) out.push({ address: v.address.toLowerCase(), ver, token });
    }
  }
  return out;
}

function verLabel(ver, token) {
  const num = ver.replace(/^RealityETH(?:_ERC20)?-/, '');
  return ver.includes('_ERC20') ? `${num} (${token})` : num;
}

function listUsableChains() {
  const contracts = window.RealityWebsiteData?.contracts || {};
  return Object.keys(contracts).map(Number)
    .filter(id => getContractsForChain(id).length > 0 && chainRpc(id))
    .sort((a, b) => a - b);
}

const SCAN_ABI = [
  'event LogNewQuestion(bytes32 indexed question_id, address indexed user, uint256 template_id, string question, bytes32 indexed content_hash, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce, uint256 created)',
];

const MC3_ABI = [
  'function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) view returns (tuple(bool success, bytes returnData)[] returnData)',
];

function builtinTemplatesForVer(verStr) {
  const minor = parseInt((verStr || '').match(/\.(\d+)/)?.[1] ?? '0');
  return minor >= 2
    ? window.RealityLib.preloadedTemplateContentsV32()
    : window.RealityLib.preloadedTemplateContents();
}

function resolveTitle(ev, ver) {
  const rawQ = String(ev.args.question || '');
  const templateId = Number(ev.args.template_id);
  const templateStr = builtinTemplatesForVer(ver)[templateId] ?? null;
  if (templateStr) {
    try {
      const populated = window.RealityLib.populatedJSONForTemplate(templateStr, rawQ);
      if (populated?.title) return populated.title;
    } catch { /* fall through */ }
  }
  const sep = rawQ.indexOf('\x1f');
  if (sep > 0) return rawQ.slice(0, sep);
  try {
    const obj = JSON.parse(rawQ);
    return obj?.title || obj?.question || rawQ.slice(0, 100);
  } catch { return rawQ.slice(0, 100); }
}

function resolveCategory(ev, ver) {
  const rawQ = String(ev.args.question || '');
  const templateId = Number(ev.args.template_id);
  const templateStr = builtinTemplatesForVer(ver)[templateId] ?? null;
  if (templateStr) {
    try {
      const populated = window.RealityLib.populatedJSONForTemplate(templateStr, rawQ);
      if (populated?.category) return String(populated.category);
    } catch { /* fall through */ }
  }
  const sep = rawQ.indexOf('\x1f');
  if (sep >= 0) {
    const rest = rawQ.slice(sep + 1);
    const sep2 = rest.indexOf('\x1f');
    return sep2 >= 0 ? rest.slice(0, sep2) : rest;
  }
  try { return String(JSON.parse(rawQ)?.category || ''); } catch { return ''; }
}

function formatRpcAnswer(ev, ver, bestAnswer) {
  const ZERO = '0x' + '0'.repeat(64);
  if (!bestAnswer || bestAnswer === ZERO) return null;
  const rawQ = String(ev.args.question || '');
  const templateId = Number(ev.args.template_id);
  const templateStr = builtinTemplatesForVer(ver)[templateId] ?? null;
  let qjson = null;
  if (templateStr) {
    try { qjson = window.RealityLib.populatedJSONForTemplate(templateStr, rawQ); } catch { /* */ }
  }
  if (!qjson) {
    try { qjson = window.RealityLib.parseQuestionJSON(rawQ); } catch { /* */ }
  }
  if (!qjson) return null;
  try {
    const text = window.RealityLib.getAnswerString(qjson, bestAnswer);
    if (!text || text === 'null') return null;
    if (text === 'Invalid') return { text: 'Invalid', cls: 'answer-invalid' };
    if (text === 'Answered too soon') return { text: 'Too Soon', cls: 'answer-invalid' };
    if (qjson.type === 'bool') return { text, cls: text === 'Yes' ? 'answer-yes' : 'answer-no' };
    return { text, cls: 'answer-opt' };
  } catch { return null; }
}

function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function relTime(ts) {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - Number(ts || 0);
  const abs  = Math.abs(diff);
  if (diff < 0) {
    if (abs < 3600)   return `in ${Math.floor(abs / 60)}m`;
    if (abs < 86400)  return `in ${Math.floor(abs / 3600)}h`;
    if (abs < 604800) return `in ${Math.floor(abs / 86400)}d`;
    return new Date(Number(ts) * 1000).toLocaleDateString();
  }
  if (abs < 3600)   return `${Math.floor(abs / 60)}m ago`;
  if (abs < 86400)  return `${Math.floor(abs / 3600)}h ago`;
  if (abs < 604800) return `${Math.floor(abs / 86400)}d ago`;
  return new Date(Number(ts) * 1000).toLocaleDateString();
}

function chunkSizeKey(rpcUrl) { return `reality.rpcChunk.${rpcUrl}`; }
function loadChunkSize(rpcUrl) { const v = localStorage.getItem(chunkSizeKey(rpcUrl)); return v ? Number(v) : undefined; }
function saveChunkSize(rpcUrl, size) { try { localStorage.setItem(chunkSizeKey(rpcUrl), String(size)); } catch { /* quota */ } }


function formatScanRange(chainId, fromBlock, toBlock) {
  const days = Math.round((toBlock - fromBlock) / chainBlocksPerDay(chainId));
  if (days >= 14) return `~${Math.round(days / 7)} weeks`;
  if (days >= 2)  return `~${days} days`;
  return '< 1 day';
}

// chunkRef is a shared { value } object so the discovered chunk size carries across
// multiple safeQueryFilter calls within the same scan (one probe, not one per contract).
async function safeQueryFilter(contract, filter, fromBlock, toBlock, chunkRef) {
  if (!chunkRef.value) {
    try {
      return await contract.queryFilter(filter, fromBlock, toBlock);
    } catch {
      let size = Math.floor((toBlock - fromBlock + 1) / 2);
      let probeResult = null;
      while (size >= 10) {
        try {
          probeResult = await contract.queryFilter(filter, fromBlock, fromBlock + size - 1);
          chunkRef.value = size;
          break;
        } catch {
          size = Math.floor(size / 2);
        }
      }
      if (!chunkRef.value) return [];
      const results = [...probeResult];
      for (let s = fromBlock + size; s <= toBlock; s += size) {
        try {
          results.push(...await contract.queryFilter(filter, s, Math.min(s + size - 1, toBlock)));
        } catch { /* skip */ }
      }
      return results;
    }
  }
  const size = chunkRef.value;
  const results = [];
  for (let s = fromBlock; s <= toBlock; s += size) {
    try {
      results.push(...await contract.queryFilter(filter, s, Math.min(s + size - 1, toBlock)));
    } catch { /* skip */ }
  }
  return results;
}

async function loadCachedForChain(chainId, verFilter, creator) {
  if (!window.QCache) return [];
  const [filterVer, filterToken] = verFilter ? verFilter.split('|') : [null, null];
  const rcList = getContractsForChain(chainId).filter(c => !filterVer || (c.ver === filterVer && c.token === filterToken));
  const items = [];
  for (const { address: rcAddr, ver: contractVer, token: contractToken } of rcList) {
    const cached = await window.QCache.getByContract(chainId, rcAddr);
    for (const { ev } of cached) {
      if (creator && String(ev.args.user).toLowerCase() !== creator.toLowerCase()) continue;
      items.push({ ev, rcAddr, ver: contractVer, token: contractToken, state: null });
    }
  }
  return items;
}

async function batchQuestionState(prov, items) {
  if (!items.length) return [];
  const selector = ethers.id('questions(bytes32)').slice(0, 10);
  const calls = items.map(({ contract: addr, questionId }) => ({
    target: addr,
    allowFailure: true,
    callData: selector + ethers.zeroPadValue(questionId, 32).slice(2),
  }));

  const CHUNK = 100;
  const raw = [];
  try {
    const mc = new ethers.Contract(MULTICALL3, MC3_ABI, prov);
    for (let i = 0; i < calls.length; i += CHUNK) {
      try {
        raw.push(...await mc.aggregate3(calls.slice(i, i + CHUNK)));
      } catch {
        raw.push(...calls.slice(i, i + CHUNK).map(() => ({ success: false, returnData: '0x' })));
      }
    }
  } catch {
    return items.map(() => null);
  }

  const T11 = ['bytes32','address','uint32','uint32','uint32','bool','uint256','bytes32','bytes32','uint256','uint256'];
  const T10 = T11.slice(0, 10);
  return raw.map(({ success, returnData }) => {
    if (!success || !returnData || returnData === '0x') return null;
    try {
      let d;
      try { d = ethers.AbiCoder.defaultAbiCoder().decode(T11, returnData); }
      catch { d = ethers.AbiCoder.defaultAbiCoder().decode(T10, returnData); }
      return {
        finalize_ts:            Number(d[4]),
        is_pending_arbitration: Boolean(d[5]),
        bounty:                 d[6],
        best_answer:            String(d[7]),
        bond:                   d[9],
      };
    } catch { return null; }
  });
}

function parseRpcBrowseHash() {
  const m = location.hash.match(/^#!?\/rpc-browse(?:\/(\d+))?(?:\?(.*))?$/);
  if (!m) return {};
  const p = new URLSearchParams(m[2] || '');
  return {
    chainId: m[1] ? parseInt(m[1], 10) : null,
    creator: p.get('creator') || '',
    tmpl:    p.get('tmpl')    || '',
    ver:     p.get('ver')     || '',
    cat:     p.get('cat')     || '',
    kw:      p.get('kw')      || '',
  };
}

function buildRpcBrowseHash(chainId, opts = {}) {
  const q = new URLSearchParams();
  if (opts.creator) q.set('creator', opts.creator);
  if (opts.tmpl !== undefined && opts.tmpl !== '') q.set('tmpl', String(opts.tmpl));
  if (opts.ver) q.set('ver', opts.ver);
  if (opts.cat) q.set('cat', opts.cat);
  if (opts.kw) q.set('kw', opts.kw);
  const qs = q.toString();
  return qs ? `#!/rpc-browse/${chainId}?${qs}` : `#!/rpc-browse/${chainId}`;
}

window.RealityRpcBrowse = window.RealityRpcBrowse || {};

window.RealityRpcBrowse.mount = async function () {
  const pillsEl   = document.getElementById('rb-chain-pills');
  const creatorIn = document.getElementById('rb-creator');
  const tmplIn    = document.getElementById('rb-template');
  const verEl      = document.getElementById('rb-version');
  const catIn      = document.getElementById('rb-category');
  const kwIn       = document.getElementById('rb-keyword');
  const scanBtn    = document.getElementById('rb-scan-btn');
  const statusEl   = document.getElementById('rb-scan-status');
  const filterBarEl = document.getElementById('rb-filter-bar');
  const resultsEl  = document.getElementById('rb-results');

  // ── Per-scan state ────────────────────────────────────────────────────────────
  let selectedChainId = null;
  let scanWindow      = null;  // {fromBlock, toBlock, prov, creator, tmpl, ver} after a scan
  let scanItems       = [];    // [{ev, rcAddr, ver, state}] accumulated results (newest first)
  let scanning        = false;
  let scanGen         = 0;
  let statusFilters   = new Set(); // empty = show all

  // ── Chain pills ───────────────────────────────────────────────────────────────
  const chains = listUsableChains();

  function buildChainPills() {
    pillsEl.innerHTML = '';
    if (!chains.length) {
      pillsEl.style.display = 'none';
      scanBtn.disabled = true;
      setStatus('Configure an RPC URL in Settings to use this page on chains without a hosted RPC.');
      return;
    }
    pillsEl.style.display = '';

    const indexedSet = new Set(window.RealitySettings?.getChainIds() || []);
    // Primary: indexed chains + the currently selected chain (so it's always visible)
    const primary = chains.filter(id => indexedSet.has(id) || id === selectedChainId);
    const extra   = chains.filter(id => !indexedSet.has(id) && id !== selectedChainId);

    function makePill(id) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chain-pill' + (id === selectedChainId ? ' active' : '');
      btn.textContent = chainName(id);
      btn.onclick = () => {
        if (id === selectedChainId) return;
        selectedChainId = id;
        history.replaceState(null, '', `#!/rpc-browse/${id}`);
        scanWindow = null;
        scanItems  = [];
        resultsEl.innerHTML = '';
        ++scanGen;
        scanning = false;
        scanBtn.disabled = false;
        buildChainPills();
        buildVersionSelect();
        updateScanStatus(null);
      };
      return btn;
    }

    for (const id of primary) pillsEl.appendChild(makePill(id));

    if (extra.length > 0) {
      const moreBtn = document.createElement('button');
      moreBtn.type = 'button';
      moreBtn.className = 'chain-pill-more';
      moreBtn.textContent = 'More';
      moreBtn.onclick = () => {
        moreBtn.remove();
        for (const id of extra) pillsEl.appendChild(makePill(id));
        const lessBtn = document.createElement('button');
        lessBtn.type = 'button';
        lessBtn.className = 'chain-pill-more';
        lessBtn.textContent = 'Less';
        lessBtn.onclick = () => buildChainPills();
        pillsEl.appendChild(lessBtn);
      };
      pillsEl.appendChild(moreBtn);
    }
  }

  function buildVersionSelect() {
    const current = verEl.value;
    verEl.innerHTML = '';
    const any = document.createElement('option');
    any.value = '';
    any.textContent = 'Any version';
    verEl.appendChild(any);
    if (selectedChainId) {
      const seen = new Map(); // "ver|token" → label
      for (const { ver, token } of getContractsForChain(selectedChainId)) {
        const key = `${ver}|${token}`;
        if (!seen.has(key)) seen.set(key, verLabel(ver, token));
      }
      // Sort by numeric version part then token name
      const sorted = [...seen.entries()].sort(([a], [b]) => {
        const na = a.replace(/^[^-]*-/, ''); // "3.2|GNO" etc.
        const nb = b.replace(/^[^-]*-/, '');
        return na.localeCompare(nb);
      });
      for (const [value, label] of sorted) {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = label;
        verEl.appendChild(opt);
      }
      if ([...verEl.options].some(o => o.value === current)) verEl.value = current;
    }
  }

  const urlState = parseRpcBrowseHash();
  const urlChain = urlState.chainId && chains.includes(urlState.chainId) ? urlState.chainId : null;
  selectedChainId = urlChain ?? (chains.length ? chains[0] : null);

  if (urlChain) {
    creatorIn.value = urlState.creator;
    tmplIn.value    = urlState.tmpl;
    catIn.value     = urlState.cat;
    kwIn.value      = urlState.kw;
  }

  buildChainPills();
  buildVersionSelect();

  // Restore version select after buildVersionSelect populates options
  if (urlChain && urlState.ver) verEl.value = urlState.ver;

  filterBarEl.querySelectorAll('[data-rbf]').forEach(btn => {
    btn.onclick = () => {
      const f = btn.dataset.rbf;
      if (f === 'all') statusFilters.clear();
      else if (statusFilters.has(f)) statusFilters.delete(f);
      else statusFilters.add(f);
      syncFilterBar();
      renderAllItems();
    };
  });

  // Auto-scan if the URL already encodes a chain (back-button restore or direct link)
  if (urlChain) scanBtn.click();

  // ── Scan status bar ───────────────────────────────────────────────────────────
  function setStatus(msg) {
    statusEl.style.display = msg !== null ? '' : 'none';
    if (msg !== null) statusEl.textContent = msg;
  }

  function updateScanStatus(progressMsg) {
    statusEl.style.display = '';
    statusEl.innerHTML = '';

    if (scanWindow) {
      const row = document.createElement('div');
      row.className = 'scan-chain-row';

      const info = document.createElement('span');
      info.textContent = `${chainName(scanWindow.chainId)}: scanned ${formatScanRange(scanWindow.chainId, scanWindow.fromBlock, scanWindow.toBlock)}`;
      row.appendChild(info);

      const backBtn = document.createElement('button');
      backBtn.className = 'scan-back-btn';
      backBtn.textContent = 'Scan further back';
      backBtn.onclick = scanFurtherBack;
      row.appendChild(backBtn);

      if (progressMsg) {
        const prog = document.createElement('span');
        prog.className = 'scan-chain-progress';
        prog.textContent = progressMsg;
        row.appendChild(prog);
      }

      statusEl.appendChild(row);
    } else if (progressMsg) {
      const msg = document.createElement('div');
      msg.className = 'rpc-scan-msg';
      msg.textContent = progressMsg;
      statusEl.appendChild(msg);
    } else {
      statusEl.style.display = 'none';
      return;
    }
  }

  // ── Result rendering ──────────────────────────────────────────────────────────
  function getItemStatus(item) {
    const state = item.state;
    const finalizeTs = state ? Number(state.finalize_ts) : 0;
    const now = Date.now() / 1000;
    if (state?.is_pending_arbitration) return 'arb';
    if (finalizeTs > 1 && finalizeTs < now) return 'finalized';
    if (finalizeTs > 1 && finalizeTs > now) return 'open';
    return 'upcoming';
  }

  function renderItem(item) {
    const { ev, rcAddr, state, token } = item;
    const chainId    = scanWindow?.chainId ?? selectedChainId;
    const questionId = ev.args.question_id;
    const title      = resolveTitle(ev, item.ver);
    const category   = resolveCategory(ev, item.ver);
    const href       = `#!/network/${chainId}/question/${rcAddr}-${questionId}`;

    const status  = getItemStatus(item);
    const now     = Date.now() / 1000;

    const badgeHtml = status === 'arb'       ? '<span class="badge badge-arb">Arb.</span>'
      : status === 'finalized'               ? '<span class="badge badge-final">Final</span>'
      : status === 'open'                    ? '<span class="badge badge-open">Open</span>'
      :                                        '<span class="badge badge-upcoming">Wait</span>';

    const bondBig = state?.bond ? BigInt(state.bond.toString()) : 0n;
    let bondStr = '';
    if (bondBig > 0n) {
      const decimals = window.RealityWebsiteData?.tokens?.[token]?.decimals ?? 18;
      const human = Number(bondBig) / (10 ** decimals);
      bondStr = human < 0.0001 ? `< 0.0001 ${token}`
        : human < 1            ? `${+human.toFixed(4)} ${token}`
        :                        `${+human.toFixed(2)} ${token}`;
    }

    const answer = state?.best_answer ? formatRpcAnswer(ev, item.ver, state.best_answer) : null;

    const openingTs  = Number(ev.args.opening_ts || 0);
    const createdTs  = Number(ev.args.created || 0);
    const timeTs     = openingTs > now ? openingTs : createdTs;
    const timeStr    = timeTs ? relTime(timeTs) : '';
    const timeTitle  = openingTs > now ? 'Opens' : 'Created';

    const tr = document.createElement('tr');
    tr.className = 'rb-row';
    tr.innerHTML = `
      <td class="rb-td-status">${badgeHtml}</td>
      <td class="rb-td-title"><a class="rb-title-link" href="${escHtml(href)}">${escHtml(title)}</a>${category ? `<span class="rb-cat">${escHtml(category)}</span>` : ''}</td>
      <td class="rb-td-answer">${answer ? `<span class="answer-val ${escHtml(answer.cls)}">${escHtml(answer.text)}</span>` : ''}</td>
      <td class="rb-td-bond">${escHtml(bondStr)}</td>
      <td class="rb-td-time" title="${escHtml(timeTitle)}">${escHtml(timeStr)}</td>`;
    return tr;
  }

  function syncFilterBar() {
    filterBarEl.querySelector('[data-rbf="all"]').classList.toggle('active', statusFilters.size === 0);
    filterBarEl.querySelectorAll('[data-rbf]:not([data-rbf="all"])').forEach(btn => {
      btn.classList.toggle('active', statusFilters.has(btn.dataset.rbf));
    });
  }

  function renderAllItems() {
    resultsEl.innerHTML = '';
    const visible = statusFilters.size > 0
      ? scanItems.filter(item => statusFilters.has(getItemStatus(item)))
      : scanItems;
    if (!visible.length) return;
    const table = document.createElement('table');
    table.className = 'rb-table';
    table.innerHTML = `<thead><tr>
      <th class="rb-th-status">Status</th>
      <th class="rb-th-title">Question</th>
      <th class="rb-th-answer">Answer</th>
      <th class="rb-th-bond">Bond</th>
      <th class="rb-th-time">Time</th>
    </tr></thead>`;
    const tbody = document.createElement('tbody');
    for (const item of visible) tbody.appendChild(renderItem(item));
    table.appendChild(tbody);
    resultsEl.appendChild(table);
  }

  // ── Core scan logic ───────────────────────────────────────────────────────────
  async function fetchAndAppend(prov, chainId, fromBlock, toBlock, creator, tmpl, verFilter, cat, kw, myGen, prepend) {
    const [filterVer, filterToken] = verFilter ? verFilter.split('|') : [null, null];
    const rcList = getContractsForChain(chainId).filter(c => !filterVer || (c.ver === filterVer && c.token === filterToken));
    const found  = [];
    const rpcUrl = chainRpc(chainId);
    const chunkRef = { value: loadChunkSize(rpcUrl) };

    for (let i = 0; i < rcList.length; i++) {
      if (myGen !== scanGen) return null;
      const { address: rcAddr, ver: contractVer, token: contractToken } = rcList[i];
      updateScanStatus(`Scanning ${chainName(chainId)} contract ${i + 1}/${rcList.length}…`);
      const rc = new ethers.Contract(rcAddr, SCAN_ABI, prov);
      const prevChunk = chunkRef.value;
      const evs = await safeQueryFilter(rc, rc.filters.LogNewQuestion(null, creator), fromBlock, toBlock, chunkRef);
      if (chunkRef.value && chunkRef.value !== prevChunk) saveChunkSize(rpcUrl, chunkRef.value);
      for (const ev of evs) found.push({ ev, rcAddr, ver: contractVer, token: contractToken, state: null });
    }

    if (myGen !== scanGen) return null;

    const filtered = found.filter(f => {
      if (tmpl !== null && Number(f.ev.args.template_id) !== tmpl) return false;
      if (cat && !resolveCategory(f.ev, f.ver).toLowerCase().includes(cat)) return false;
      if (kw  && !String(f.ev.args.question || '').toLowerCase().includes(kw)) return false;
      return true;
    });

    // Deduplicate against existing results
    const existingIds = new Set(scanItems.map(r => r.ev.args.question_id));
    const newItems = filtered.filter(f => !existingIds.has(f.ev.args.question_id));

    // Sort newest first within batch
    newItems.sort((a, b) =>
      b.ev.blockNumber - a.ev.blockNumber || b.ev.logIndex - a.ev.logIndex
    );

    if (!newItems.length) return newItems;

    updateScanStatus(`Fetching status for ${newItems.length} question(s)…`);
    const states = await batchQuestionState(prov,
      newItems.map(f => ({ contract: f.rcAddr, questionId: f.ev.args.question_id }))
    );
    if (myGen !== scanGen) return null;

    for (let i = 0; i < newItems.length; i++) newItems[i].state = states[i];

    // Write new events into QCache so question.js and future browse scans can use them
    for (const { ev, rcAddr } of newItems) {
      window.QCache?.put(chainId, rcAddr, String(ev.args.question_id), ev, [], ev.blockNumber);
    }

    if (prepend) {
      // Newer results go before existing (shouldn't normally happen, but defensive)
      scanItems = [...newItems, ...scanItems];
    } else {
      // Older results go after (scan further back)
      scanItems = [...scanItems, ...newItems];
    }

    return newItems;
  }

  // ── Scan button ───────────────────────────────────────────────────────────────
  scanBtn.onclick = async () => {
    if (scanning || !selectedChainId) return;
    scanning = true;
    scanBtn.disabled = true;
    const myGen = ++scanGen;

    scanItems  = [];
    scanWindow = null;
    statusFilters.clear();
    syncFilterBar();
    resultsEl.innerHTML = '';

    try {
      const chainId = selectedChainId;
      const rpcUrl = chainRpc(chainId);
      if (!rpcUrl) throw new Error('No RPC available for this chain');

      const creatorRaw = creatorIn.value.trim();
      let creator = null;
      if (creatorRaw) {
        if (!/^0x[0-9a-fA-F]{40}$/.test(creatorRaw)) throw new Error('Invalid creator address');
        creator = ethers.getAddress(creatorRaw);
      }
      const tmpl      = tmplIn.value.trim() !== '' ? Number(tmplIn.value) : null;
      const verFilter = verEl.value || null;
      const cat       = catIn.value.trim().toLowerCase() || null;
      const kw        = kwIn.value.trim().toLowerCase() || null;

      history.replaceState(null, '', buildRpcBrowseHash(chainId, {
        creator: creatorRaw,
        tmpl:    tmplIn.value.trim(),
        ver:     verEl.value,
        cat:     catIn.value.trim(),
        kw:      kwIn.value.trim(),
      }));

      const prov = new ethers.JsonRpcProvider(rpcUrl, chainId, { staticNetwork: true });

      // Pre-populate from QCache and show with live state before the RPC scan
      const cachedRaw = await loadCachedForChain(chainId, verFilter, creator);
      const filteredCached = cachedRaw.filter(f => {
        if (tmpl !== null && Number(f.ev.args.template_id) !== tmpl) return false;
        if (cat && !resolveCategory(f.ev, f.ver).toLowerCase().includes(cat)) return false;
        if (kw  && !String(f.ev.args.question || '').toLowerCase().includes(kw)) return false;
        return true;
      });
      filteredCached.sort((a, b) => b.ev.blockNumber - a.ev.blockNumber || b.ev.logIndex - a.ev.logIndex);
      if (filteredCached.length && myGen === scanGen) {
        updateScanStatus(`Loading state for ${filteredCached.length} cached question(s)…`);
        const cachedStates = await batchQuestionState(prov,
          filteredCached.map(f => ({ contract: f.rcAddr, questionId: f.ev.args.question_id }))
        );
        if (myGen === scanGen) {
          for (let i = 0; i < filteredCached.length; i++) filteredCached[i].state = cachedStates[i];
          scanItems = filteredCached;
          renderAllItems();
        }
      }

      updateScanStatus('Connecting…');
      const latestBlock = await prov.getBlockNumber();
      const fromBlock   = Math.max(0, latestBlock - Math.ceil(WEEKS_INIT * 7 * chainBlocksPerDay(chainId)));

      const newItems = await fetchAndAppend(prov, chainId, fromBlock, latestBlock, creator, tmpl, verFilter, cat, kw, myGen, false);
      if (newItems === null || myGen !== scanGen) return;

      scanWindow = { chainId, fromBlock, toBlock: latestBlock, prov, creator, tmpl, verFilter, cat, kw };
      updateScanStatus(null);

      if (!scanItems.length) {
        updateScanStatus(null);
        statusEl.style.display = '';
        statusEl.innerHTML = '<div class="scan-chain-row">' +
          `<span>${chainName(chainId)}: scanned ${formatScanRange(chainId, fromBlock, latestBlock)}</span>` +
          '<button class="scan-back-btn">Scan further back</button></div>';
        statusEl.querySelector('.scan-back-btn').onclick = scanFurtherBack;
        statusEl.insertAdjacentHTML('afterbegin',
          '<div class="rpc-scan-msg" style="color:var(--text-muted)">No questions found.</div>');
      } else {
        updateScanStatus(null);
        renderAllItems();
      }

    } catch (err) {
      if (myGen === scanGen) {
        statusEl.style.display = '';
        statusEl.textContent = `Error: ${err.message}`;
      }
    } finally {
      if (myGen === scanGen) {
        scanning = false;
        scanBtn.disabled = false;
      }
    }
  };

  // ── Scan further back ─────────────────────────────────────────────────────────
  async function scanFurtherBack() {
    if (!scanWindow || scanning) return;
    scanning = true;
    scanBtn.disabled = true;
    const myGen = ++scanGen;

    const { chainId, fromBlock: prevFrom, prov, creator, tmpl, verFilter, cat, kw } = scanWindow;
    const bpd     = chainBlocksPerDay(chainId);
    const newFrom = Math.max(0, prevFrom - Math.ceil(WEEKS_BACK * 7 * bpd));
    const newTo   = prevFrom - 1;

    try {
      const newItems = await fetchAndAppend(prov, chainId, newFrom, newTo, creator, tmpl, verFilter, cat, kw, myGen, false);
      if (newItems === null || myGen !== scanGen) return;

      scanWindow.fromBlock = newFrom;
      updateScanStatus(null);
      renderAllItems();
    } catch (err) {
      if (myGen === scanGen) {
        updateScanStatus(null);
        statusEl.insertAdjacentHTML('beforeend',
          `<div class="rpc-scan-msg" style="color:var(--text-muted)">Error: ${escHtml(err.message)}</div>`);
      }
    } finally {
      if (myGen === scanGen) {
        scanning = false;
        scanBtn.disabled = false;
      }
    }
  }
};

})();
