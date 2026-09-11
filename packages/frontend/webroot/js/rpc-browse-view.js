(function () {
'use strict';

const MULTICALL3  = '0xcA11bde05977b3631167028862bE2a173976CA11';
const WEEKS_INIT  = 1;   // default scan window
const WEEKS_BACK  = 3;   // how many weeks each "Scan further back" adds

function chainName(id)         { return window.RealityWebsiteData?.chains?.[String(id)]?.display_name || window.RealityChains?.name(id) || `Chain ${id}`; }
function chainBlocksPerDay(id) { return window.RealityWebsiteData?.chains?.[String(id)]?.blocksPerDay || 7200; }
function chainRpc(id)          { return window.RealitySettings?.getEffectiveRpcUrl(id) || null; }

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

const TEMPLATE_FETCH_ABI = ['function templates(uint256 template_id) view returns (uint256)'];
const LOG_TEMPLATE_TOPIC = ethers.id('LogNewTemplate(uint256,address,string)');
const templateLogIface   = new ethers.Interface([
  'event LogNewTemplate(uint256 indexed template_id, address indexed user, string question_text)',
]);

// Survives across scans for the page lifetime.
// Key: `${chainId}:${contractAddr}:${templateId}` → text (string) or null (not found).
const templateCache = new Map();

function builtinTemplatesForVer(verStr) {
  const minor = parseInt((verStr || '').match(/\.(\d+)/)?.[1] ?? '0');
  return minor >= 2
    ? window.RealityLib.preloadedTemplateContentsV32()
    : window.RealityLib.preloadedTemplateContents();
}

function getBundledTemplate(chainId, contractAddr, templateId) {
  return (window.RealityBundledTemplates
    ?.[String(chainId)]
    ?.[contractAddr.toLowerCase()]
    ?.[String(templateId)]
  ) ?? null;
}

function getTemplateStr(item, chainId) {
  const tid = Number(item.ev.args.template_id);
  const builtins = builtinTemplatesForVer(item.ver);
  if (builtins[tid] != null) return builtins[tid];
  const bundled = getBundledTemplate(chainId, item.rcAddr, tid);
  if (bundled != null) return bundled;
  // templateCache stores null for "not found", undefined (missing key) for "not yet fetched"
  const cached = templateCache.get(`${chainId}:${item.rcAddr}:${tid}`);
  return cached !== undefined ? cached : null;
}

// Fetches and caches custom templates for any items not already resolved.
// Calls templates(id) on the contract to get the block, then getLogs for that block.
async function prefetchTemplates(items, chainId, prov) {
  const toFetch = [];
  for (const item of items) {
    const tid = Number(item.ev.args.template_id);
    const key = `${chainId}:${item.rcAddr}:${tid}`;
    if (
      builtinTemplatesForVer(item.ver)[tid] != null ||
      getBundledTemplate(chainId, item.rcAddr, tid) != null ||
      templateCache.has(key)
    ) continue;
    if (!toFetch.some(f => f.addr === item.rcAddr && f.tid === tid)) {
      toFetch.push({ addr: item.rcAddr, tid });
    }
  }
  if (!toFetch.length) return;

  const byContract = new Map();
  for (const { addr, tid } of toFetch) {
    if (!byContract.has(addr)) byContract.set(addr, new Set());
    byContract.get(addr).add(tid);
  }

  for (const [addr, idSet] of byContract) {
    const rc = new ethers.Contract(addr, TEMPLATE_FETCH_ABI, prov);
    const blockToIds = new Map();
    for (const tid of idSet) {
      try {
        const blockNum = Number(await rc.templates(tid));
        if (blockNum === 0) {
          templateCache.set(`${chainId}:${addr}:${tid}`, null);
          continue;
        }
        if (!blockToIds.has(blockNum)) blockToIds.set(blockNum, []);
        blockToIds.get(blockNum).push(tid);
      } catch {
        templateCache.set(`${chainId}:${addr}:${tid}`, null);
      }
    }
    for (const [blockNum, ids] of blockToIds) {
      try {
        const logs = await prov.getLogs({
          address: addr,
          topics:  [LOG_TEMPLATE_TOPIC],
          fromBlock: blockNum,
          toBlock:   blockNum,
        });
        for (const log of logs) {
          try {
            const parsed = templateLogIface.parseLog(log);
            const tid = Number(parsed.args.template_id);
            templateCache.set(`${chainId}:${addr}:${tid}`, parsed.args.question_text);
          } catch { /* malformed log */ }
        }
      } catch { /* getLogs failed — leave keys missing so a future call can retry */ }
      // Mark any ids not found in logs as null so we don't retry them
      for (const tid of ids) {
        const key = `${chainId}:${addr}:${tid}`;
        if (!templateCache.has(key)) templateCache.set(key, null);
      }
    }
  }
}

function resolveTitle(item, chainId) {
  const rawQ = String(item.ev.args.question || '');
  const templateStr = getTemplateStr(item, chainId);
  if (templateStr) {
    try {
      const populated = window.RealityLib.populatedJSONForTemplate(templateStr, rawQ);
      if (populated?.title) return populated.title;
    } catch { /* fall through */ }
  }
  try {
    const obj = JSON.parse(rawQ);
    return obj?.title || obj?.question || rawQ.slice(0, 100);
  } catch { return rawQ.slice(0, 100); }
}

function resolveCategory(item, chainId) {
  const rawQ = String(item.ev.args.question || '');
  const templateStr = getTemplateStr(item, chainId);
  if (templateStr) {
    try {
      const populated = window.RealityLib.populatedJSONForTemplate(templateStr, rawQ);
      if (populated?.category) return String(populated.category);
    } catch { /* fall through */ }
  }
  try { return String(JSON.parse(rawQ)?.category || ''); } catch { return ''; }
}

function formatRpcAnswer(item, chainId, bestAnswer, hasAnswer) {
  const ZERO = '0x' + '0'.repeat(64);
  if (!bestAnswer) return null;
  // ZERO is "answered false" for bool; only skip it when nothing has been posted
  if (bestAnswer === ZERO && !hasAnswer) return null;
  const rawQ = String(item.ev.args.question || '');
  const templateStr = getTemplateStr(item, chainId);
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

function rpcErrDetail(err) {
  // ethers spreads makeError params directly onto the error object (Object.assign);
  // for "could not coalesce error" (UNKNOWN_ERROR), the JSON-RPC error is at err.error.message
  const msg = err?.error?.message || err?.shortMessage || err?.message || String(err);
  return err?.status ? `HTTP ${err.status}: ${msg}` : msg;
}

function rpcErrHtml(errRef, rpcUrl) {
  const msgLines = [...errRef.msgs].slice(0, 3)
    .map(m => `<div style="font-size:11px;opacity:0.85;margin-top:2px">${escHtml(m)}</div>`)
    .join('');
  const src = rpcUrl ? `the RPC node (<code>${escHtml(rpcUrl)}</code>)` : 'the browser wallet';
  return `<div class="rpc-scan-msg" style="color:var(--amber)">`
    + `${errRef.count} getLogs request(s) to ${src} failed — results may be incomplete.`
    + msgLines
    + `</div>`;
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
async function safeQueryFilter(contract, filter, fromBlock, toBlock, chunkRef, errRef) {
  if (!chunkRef.value) {
    try {
      return await contract.queryFilter(filter, fromBlock, toBlock);
    } catch {
      let size = Math.floor((toBlock - fromBlock + 1) / 2);
      let probeResult = null;
      let lastProbeErr = null;
      while (size >= 10) {
        try {
          probeResult = await contract.queryFilter(filter, fromBlock, fromBlock + size - 1);
          chunkRef.value = size;
          break;
        } catch (err) {
          lastProbeErr = err;
          size = Math.floor(size / 2);
        }
      }
      if (!chunkRef.value) {
        if (errRef) { errRef.count++; if (lastProbeErr) errRef.msgs.add(rpcErrDetail(lastProbeErr)); }
        return [];
      }
      const results = [...probeResult];
      for (let s = fromBlock + size; s <= toBlock; s += size) {
        try {
          results.push(...await contract.queryFilter(filter, s, Math.min(s + size - 1, toBlock)));
        } catch (err) {
          if (errRef) { errRef.count++; errRef.msgs.add(rpcErrDetail(err)); }
        }
      }
      return results;
    }
  }
  const size = chunkRef.value;
  const results = [];
  for (let s = fromBlock; s <= toBlock; s += size) {
    try {
      results.push(...await contract.queryFilter(filter, s, Math.min(s + size - 1, toBlock)));
    } catch (err) {
      if (errRef) { errRef.count++; errRef.msgs.add(rpcErrDetail(err)); }
    }
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
  const m = location.hash.match(/^#!?\/rpc-browse(?:\/network\/(\d+))?(\/.*)?$/);
  if (!m) return {};
  const segs = (m[2] || '').split('/').filter(Boolean);
  const p = {};
  for (let i = 0; i + 1 < segs.length; i += 2) {
    try { p[segs[i]] = decodeURIComponent(segs[i + 1]); } catch { p[segs[i]] = segs[i + 1]; }
  }
  return {
    chainId: m[1] ? parseInt(m[1], 10) : null,
    creator: p.creator || '',
    tmpl:    p.tmpl    || '',
    ver:     p.ver     || '',
    cat:     p.cat     || '',
    kw:      p.kw      || '',
    status:  p.status  || '',
  };
}

function buildRpcBrowseHash(chainId, opts = {}) {
  let h = `#!/rpc-browse/network/${chainId}`;
  for (const [key, val] of [
    ['creator', opts.creator],
    ['tmpl',    opts.tmpl !== undefined && opts.tmpl !== '' ? String(opts.tmpl) : ''],
    ['ver',     opts.ver],
    ['cat',     opts.cat],
    ['kw',      opts.kw],
    ['status',  opts.status],
  ]) {
    if (val) h += `/${key}/${encodeURIComponent(val)}`;
  }
  return h;
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
        history.replaceState(null, '', `#!/rpc-browse/network/${id}`);
        scanWindow = null;
        scanItems  = [];
        statusFilters.clear();
        resultsEl.innerHTML = '';
        ++scanGen;
        scanning = false;
        scanBtn.disabled = false;
        buildChainPills();
        buildVersionSelect();
        syncFilterBar();
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
      if (selectedChainId) {
        const cur = parseRpcBrowseHash();
        history.replaceState(null, '', buildRpcBrowseHash(selectedChainId, {
          ...cur,
          status: statusFilters.size > 0 ? [...statusFilters].sort().join(',') : '',
        }));
      }
    };
  });

  // Restore status filter from URL (auto-scan fires later, after onclick is wired)
  if (urlChain && urlState.status) {
    const valid = new Set(['open', 'upcoming', 'arb', 'finalized']);
    statusFilters = new Set(urlState.status.split(',').filter(s => valid.has(s)));
    syncFilterBar();
  }

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
    // finalize_ts=1 is the sentinel the contracts write when an arbitrator finalises a question
    if (finalizeTs > 0 && finalizeTs < now) return 'finalized';
    if (finalizeTs > 0) return 'open'; // answer posted, still within timeout
    // No answer yet: upcoming if before opening_ts, otherwise open (awaiting first answer)
    const openingTs = Number(item.ev?.args?.opening_ts || 0);
    return openingTs > now ? 'upcoming' : 'open';
  }

  function renderItem(item) {
    const chainId    = scanWindow?.chainId ?? selectedChainId;
    const { ev, rcAddr, state, token } = item;
    const questionId = ev.args.question_id;
    const title      = resolveTitle(item, chainId);
    const category   = resolveCategory(item, chainId);
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
      const human = parseFloat(ethers.formatUnits(bondBig, decimals));
      bondStr = human < 0.0001 ? `< 0.0001 ${token}`
        : human < 1            ? `${+human.toFixed(4)} ${token}`
        :                        `${+human.toFixed(2)} ${token}`;
    }

    const answer = state?.best_answer ? formatRpcAnswer(item, chainId, state.best_answer, bondBig > 0n) : null;

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
  async function fetchAndAppend(prov, chainId, fromBlock, toBlock, creator, tmpl, verFilter, cat, kw, myGen, prepend, errRef) {
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
      const evs = await safeQueryFilter(rc, rc.filters.LogNewQuestion(null, creator), fromBlock, toBlock, chunkRef, errRef);
      if (chunkRef.value && chunkRef.value !== prevChunk) saveChunkSize(rpcUrl, chunkRef.value);
      for (const ev of evs) found.push({ ev, rcAddr, ver: contractVer, token: contractToken, state: null });
    }

    if (myGen !== scanGen) return null;

    // Fetch any custom templates not in builtins or bundle before filtering/rendering
    await prefetchTemplates(found, chainId, prov);

    const filtered = found.filter(f => {
      if (tmpl !== null && Number(f.ev.args.template_id) !== tmpl) return false;
      if (cat && !resolveCategory(f, chainId).toLowerCase().includes(cat)) return false;
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
    resultsEl.innerHTML = '';

    let rpcUrl = null;
    let usingBrowserWallet = false;

    try {
      const chainId = selectedChainId;
      rpcUrl = chainRpc(chainId);

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

      let prov = null;
      const useBrRpc = window.RealitySettings?.getUseBrowserRpc() ?? true;
      if (useBrRpc && window.ethereum) {
        updateScanStatus('Checking browser wallet…');
        const brProv = new ethers.BrowserProvider(window.ethereum);
        const net = await brProv.getNetwork();
        if (Number(net.chainId) === chainId) { prov = brProv; usingBrowserWallet = true; }
      }
      if (!prov) {
        if (!rpcUrl) throw new Error('No RPC available for this chain');
        prov = new ethers.JsonRpcProvider(rpcUrl, chainId, { staticNetwork: true });
      }

      // Pre-populate from QCache and show with live state before the RPC scan
      const cachedRaw = await loadCachedForChain(chainId, verFilter, creator);
      await prefetchTemplates(cachedRaw, chainId, prov);
      const filteredCached = cachedRaw.filter(f => {
        if (tmpl !== null && Number(f.ev.args.template_id) !== tmpl) return false;
        if (cat && !resolveCategory(f, chainId).toLowerCase().includes(cat)) return false;
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

      const errRef = { count: 0, msgs: new Set() };
      const newItems = await fetchAndAppend(prov, chainId, fromBlock, latestBlock, creator, tmpl, verFilter, cat, kw, myGen, false, errRef);
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
        if (errRef.count > 0) {
          statusEl.insertAdjacentHTML('afterbegin', rpcErrHtml(errRef, usingBrowserWallet ? null : rpcUrl));
        }
      } else {
        updateScanStatus(null);
        renderAllItems();
        if (errRef.count > 0) {
          statusEl.style.display = '';
          statusEl.insertAdjacentHTML('beforeend', rpcErrHtml(errRef, usingBrowserWallet ? null : rpcUrl));
        }
      }

    } catch (err) {
      if (myGen === scanGen) {
        statusEl.style.display = '';
        const provDesc = usingBrowserWallet ? 'browser wallet' : `RPC node (<code>${escHtml(rpcUrl)}</code>)`;
        statusEl.innerHTML = `Error connecting to ${provDesc}: ${escHtml(err.message)}`;
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
      const errRef = { count: 0, msgs: new Set() };
      const newItems = await fetchAndAppend(prov, chainId, newFrom, newTo, creator, tmpl, verFilter, cat, kw, myGen, false, errRef);
      if (newItems === null || myGen !== scanGen) return;

      scanWindow.fromBlock = newFrom;
      updateScanStatus(null);
      renderAllItems();
      if (errRef.count > 0) {
        statusEl.insertAdjacentHTML('beforeend', rpcErrHtml(errRef, chainRpc(chainId)));
      }
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

  // Auto-scan now that all handlers are wired
  if (urlChain) scanBtn.click();
};

})();
