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

const CHAIN_TOKEN = { 1:'ETH', 100:'XDAI', 137:'POL', 42161:'ETH', 8453:'ETH', 43114:'AVAX', 42220:'CELO' };
const EXPLORER    = { 1:'https://etherscan.io', 100:'https://gnosisscan.io', 137:'https://polygonscan.com', 42161:'https://arbiscan.io', 8453:'https://basescan.org', 43114:'https://snowtrace.io', 42220:'https://celoscan.io' };

const BUILTIN_TEMPLATES = {
  0: '{"title": "%s", "type": "bool", "category": "%s", "lang": "%s"}',
  1: '{"title": "%s", "type": "uint", "decimals": 18, "category": "%s", "lang": "%s"}',
  2: '{"title": "%s", "type": "single-select", "outcomes": [%s], "category": "%s", "lang": "%s"}',
  3: '{"title": "%s", "type": "multiple-select", "outcomes": [%s], "category": "%s", "lang": "%s"}',
  4: '{"title": "%s", "type": "datetime", "category": "%s", "lang": "%s"}',
};

const REALITY_ABI = [
  'function getBond(bytes32) view returns (uint256)',
  'function getContentHash(bytes32) view returns (bytes32)',
  'function getFinalizeTS(bytes32) view returns (uint32)',
  'function getMinBond(bytes32) view returns (uint256)',
  'function isSettledTooSoon(bytes32) view returns (bool)',
  'function reopened_questions(bytes32) view returns (bytes32)',
  'function templates(uint256) view returns (string)',
  'function submitAnswer(bytes32 question_id, bytes32 answer, uint256 max_previous) payable',
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

// ── Provider ──────────────────────────────────────────────────────────────────
// Wallet is only required for write operations; reads come from Ponder.
const majorVersion = CONTRACT_MAJOR[CONTRACT.toLowerCase()] || 3;
let reality = null, realityRW = null;
if (window.ethereum) {
  const _wp = new ethers.providers.Web3Provider(window.ethereum);
  reality   = new ethers.Contract(CONTRACT, REALITY_ABI, _wp);
  realityRW = new ethers.Contract(CONTRACT, REALITY_ABI, _wp.getSigner());
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
  const s = ethers.utils.formatEther(bn);
  // Trim trailing zeros but keep at least 3 decimals
  return parseFloat(s).toString();
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
      minBond scheduledFinalizationTimestamp
    }
    responses(where: { questionId: ${qid} }, orderBy: "timestamp", orderDirection: "asc", limit: 1000) {
      items { answer bond user historyHash isCommitment timestamp }
    }
    reopeners: questions(where: { reopensQuestionId: ${qid} }, limit: 1) {
      items { id }
    }
  }`;
  const resp = await fetch('/graphql', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
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
    const resp = await fetch('/graphql', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `{ template(id: ${tid}) { questionText } }` }),
    });
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
      answer:        r.answer || ZERO_HASH,
      question_id:   QUESTION_ID,
      history_hash:  r.historyHash,
      user:          r.user,
      bond:          ethers.BigNumber.from(r.bond.toString()),
      ts:            Number(r.timestamp),
      is_commitment: r.isCommitment,
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
    settledTooSoon: (pq.currentAnswer || '').toLowerCase() === TOO_SOON.toLowerCase(),
    reopenedBy:    (reopeners?.items?.length || 0) > 0 ? '0x01' : ZERO_HASH,
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

// ── Form builder ──────────────────────────────────────────────────────────────
function buildAnswerForm(data, walletAddr) {
  const { qjson, bond, minBond, openingTS, finalizeTS } = data;
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
    return bf;
  }

  // Finalized: return nothing (no submit form shown)
  if (finalized) return null;

  // Compute minimum required bond
  const minRequired = minBond.gt(0) && bond.eq(0)
    ? minBond
    : bond.gt(0) ? bond.mul(2) : (minBond.gt(0) ? minBond : ethers.BigNumber.from(0));

  const prefill = minRequired.gt(0)
    ? parseFloat(ethers.utils.formatEther(minRequired)).toString()
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

  // ── Submit button ──
  const btn = el('button', 'post-answer-button btn-post', 'Post answer');
  btn.type = 'button';
  form.appendChild(btn);

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
    const maxPrev  = data.bond; // front-run guard

    realityRW.submitAnswer(QUESTION_ID, ansBytes, maxPrev, { value: bondWei })
      .catch(err => console.error('submitAnswer failed', err));
  });

  return form;
}

// ── Render ────────────────────────────────────────────────────────────────────
function formatRelTime(ts) {
  const diff = Math.floor(Date.now() / 1000) - Number(ts);
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const d = Math.floor(diff / 86400);
  if (d < 60)       return `${d}d ago`;
  const dt = new Date(Number(ts) * 1000);
  return dt.toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric' });
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
  const { answerEvents, qjson } = data;
  const n        = answerEvents.length;
  const token    = CHAIN_TOKEN[CHAIN_ID] || 'ETH';
  const explorer = EXPLORER[CHAIN_ID]    || '';

  // Max bond across all answers — used to scale bar widths
  const maxBond = answerEvents.reduce((mx, ev) => {
    const b = BigInt(ev.args.bond.toString());
    return b > mx ? b : mx;
  }, BigInt(0));

  function buildEntryContents(ev, tag, isCurrent) {
    const color   = answerColorClass(ev.args.answer, qjson);
    const label   = bytes32ToLabel(ev.args.answer, qjson) || '?';
    const bondStr = `${formatEth(ev.args.bond)} ${token}`;
    const letter  = { yes:'Y', no:'N', inv:'?', other:'·' }[color] || '·';

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

    // Right: bond amount + bar
    const right   = el('div', 'bond-right');
    right.appendChild(el('div', `bond-amount answer-bond-value`, bondStr));
    const barWrap = el('div', 'bond-bar-wrap');
    const bar     = el('div', `bond-bar bar-${color}`);
    if (maxBond > BigInt(0)) {
      bar.style.width = Math.round(Number(BigInt(ev.args.bond.toString()) * BigInt(100) / maxBond)) + '%';
    }
    barWrap.appendChild(bar);
    right.appendChild(barWrap);

    return { connector, main, right };
  }

  const curContainer = qPage.querySelector('.current-answer-container');
  if (!curContainer) return;

  if (n === 0) return;

  // Build current answer entry (latest)
  const { connector, main, right } = buildEntryContents(answerEvents[n - 1], 'current', true);
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
    const tag  = i === n - 2 ? 'disputed' : null;
    const { connector, main, right } = buildEntryContents(answerEvents[i], tag, false);
    const item = el('div', 'answered-history-item');
    item.appendChild(connector);
    item.appendChild(main);
    item.appendChild(right);
    histContainer.appendChild(item);
  }
}

function renderStatusCard(data) {
  const card = qPage.querySelector('#status-card');
  if (!card) return;

  const { answerEvents, qjson, bond, finalizeTS, timeout, minBond, arbitrator } = data;
  const n        = answerEvents.length;
  const token    = CHAIN_TOKEN[CHAIN_ID] || 'ETH';
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
    const bondStr  = `${formatEth(bond)} ${token}`;
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
  const token = CHAIN_TOKEN[CHAIN_ID] || 'ETH';
  const minRequired = minBond?.gt(0) && bond?.eq(0)
    ? minBond
    : bond?.gt(0) ? bond.mul(2) : (minBond?.gt(0) ? minBond : ethers.BigNumber.from(0));
  const nextBondStr = minRequired?.gt(0) ? `${formatEth(minRequired)} ${token}` : null;

  const card = el('div', 'card');
  card.innerHTML = `
    <div class="card-title">Interact</div>
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

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const BN0 = ethers.BigNumber.from(0);

  // 1. Wallet address (optional — reads work without it)
  let walletAddr = null;
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      walletAddr = (accounts && accounts[0]) || null;
    } catch {}
  }

  // 2. Load question data — Ponder first (production), RPC fallback (test env)
  let data;
  try {
    const ponderResult = await fetchPonderData();
    const pq = ponderResult.question;
    const templateStr = await fetchTemplateStr(Number(pq.templateId || 0));
    data = adaptPonderData(ponderResult, BN0);
    data.qjson = populateTemplate(templateStr, pq.data);
  } catch {
    if (!reality) {
      const titleEl = document.getElementById('question-title');
      if (titleEl) titleEl.textContent = 'Failed to load question.';
      return;
    }
    // RPC path: used by the test suite (Ponder not running during tests)
    const [bond, finalizeTS, newQEvents, answerEvents] = await Promise.all([
      safeCall(() => reality.getBond(QUESTION_ID), BN0),
      safeCall(() => reality.getFinalizeTS(QUESTION_ID), 0),
      safeCall(() => reality.queryFilter(reality.filters.LogNewQuestion(QUESTION_ID), FORK_BLOCK), []),
      safeCall(() => reality.queryFilter(reality.filters.LogNewAnswer(null, QUESTION_ID), FORK_BLOCK), []),
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
        () => reality.queryFilter(reality.filters.LogNewTemplate(templateId), FORK_BLOCK), []
      );
      rpcTemplateStr = tevents[0]?.args.question_text
        || await safeCall(() => reality.templates(templateId), '{"type":"bool","title":"%s"}');
    }
    let minBond = BN0, settledTooSoon = false, reopenedBy = ZERO_HASH;
    if (majorVersion >= 3) {
      [minBond, settledTooSoon, reopenedBy] = await Promise.all([
        safeCall(() => reality.getMinBond(QUESTION_ID), BN0),
        safeCall(() => reality.isSettledTooSoon(QUESTION_ID), false),
        safeCall(() => reality.reopened_questions(QUESTION_ID), ZERO_HASH),
      ]);
    }
    data = {
      bond, finalizeTS, openingTS, timeout: qTimeout, arbitrator, nonce,
      templateId, questionStr, qjson: populateTemplate(rpcTemplateStr, questionStr),
      minBond, settledTooSoon, reopenedBy, answerEvents,
    };
  }

  // 3. Update question title and status + type badges
  const titleEl = document.getElementById('question-title');
  if (titleEl) titleEl.textContent = data.qjson?.title || '';

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
      btn.addEventListener('click', async () => {
        try {
          // Use the original question_id as the nonce for the new question — it's
          // always unique (a 256-bit hash) and never collides with the small integer
          // nonces used when questions are first created.
          const reopenNonce = ethers.BigNumber.from(QUESTION_ID);
          const tx = await realityRW.reopenQuestion(
            data.templateId, data.questionStr, data.arbitrator,
            data.timeout, data.openingTS, reopenNonce, data.minBond,
            QUESTION_ID, { value: 0 }
          );
          await tx.wait();
        } catch (err) { console.error('reopenQuestion failed', err); }
      });
    }
  }

  // 10. Claim section
  const claimSection = qPage.querySelector('.claim-section');
  if (claimSection && finalized && walletAddr && realityRW) {
    const userEvents = data.answerEvents.filter(
      ev => ev.args.user.toLowerCase() === walletAddr.toLowerCase()
    );
    if (userEvents.length > 0) {
      claimSection.style.display = '';
      const claimBtn = claimSection.querySelector('button.claim-button');
      if (claimBtn) {
        claimBtn.addEventListener('click', async () => {
          try {
            const args = buildClaimArgs(QUESTION_ID, data.answerEvents);
            const tx = await realityRW.claimMultipleAndWithdrawBalance(
              args.question_ids, args.lengths, args.hist_hashes,
              args.addrs, args.bonds, args.answers
            );
            await tx.wait();
          } catch (err) { console.error('claim failed', err); }
        });
      }
    }
  }
}

main().catch(err => {
  console.error('question page error', err);
  if (qPage) qPage.dataset.error = err.message;
});

})();
