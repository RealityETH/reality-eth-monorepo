window.RealityAsk = window.RealityAsk || {};

window.RealityAsk.mount = async function () {
  'use strict';

  // ── Constants ─────────────────────────────────────────────────────────────────
  const DELIM = '␟';

  const TEMPLATE_IDS = { bool: 0, uint: 1, 'single-select': 2, 'multiple-select': 3, datetime: 4 };

  const CHAIN_NATIVE_TOKEN = {
    1: 'ETH', 100: 'XDAI', 137: 'MATIC', 42161: 'ARETH',
    10: 'OETH', 8453: 'ETH', 130: 'ETH', 11155111: 'ETH',
  };
  const chainName = id => window.RealityChains?.name(id) || `Chain ${id}`;
  const CHAIN_ADD_PARAMS = {
    100: {
      chainId: '0x64', chainName: 'Gnosis',
      nativeCurrency: { name: 'xDAI', symbol: 'XDAI', decimals: 18 },
      rpcUrls: ['https://rpc.gnosischain.com'],
      blockExplorerUrls: ['https://gnosisscan.io'],
    },
  };

  const RC_ABI = [
    'function askQuestion(uint256 template_id, string question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce) payable returns (bytes32)',
    'function askQuestionWithMinBond(uint256 template_id, string question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce, uint256 min_bond) payable returns (bytes32)',
    'function templates(uint256) view returns (uint256)',
    'event LogNewTemplate(uint256 indexed template_id, address indexed user, string question_text)',
    'event LogNewQuestion(bytes32 indexed question_id, address indexed user, uint256 template_id, string question, bytes32 indexed content_hash, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce, uint256 timestamp)',
  ];
  const RC_ERC20_ABI = [
    'function askQuestionERC20(uint256 template_id, string question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce, uint256 tokens) returns (bytes32)',
    'function askQuestionWithMinBondERC20(uint256 template_id, string question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce, uint256 min_bond, uint256 tokens) returns (bytes32)',
  ];
  const ERC20_TOKEN_ABI = [
    'function allowance(address owner, address spender) view returns (uint256)',
    'function approve(address spender, uint256 amount) returns (bool)',
  ];
  const ARB_ABI = [
    'function arbitrator_question_fees(address) view returns (uint256)',
  ];


  // ── State ─────────────────────────────────────────────────────────────────────
  let provider      = null;
  let signer        = null;
  let walletAddr    = null;
  let chainId       = null;
  let rcAddress     = null;
  let rcToken       = 'ETH';
  let contractsData = null;
  let selectedToken           = null;
  let selectedVersion         = null;
  let contractUsesDescription = false;
  let isERC20Contract         = false;
  let rcTokenAddress   = null;
  let pendingChainId   = null;
  let customTemplate   = null;
  let customTplTimer   = null;

  // ── DOM refs ──────────────────────────────────────────────────────────────────
  const submitBtn          = document.getElementById('ask-submit-btn');
  const txError            = document.getElementById('ask-tx-error');
  const walletNotice       = document.getElementById('ask-wallet-notice');
  const networkName        = document.getElementById('ask-network-name');
  const networkDot         = document.getElementById('ask-network-dot');
  const networkUnsupported = document.getElementById('ask-network-unsupported');
  const timeoutWarning     = document.getElementById('timeout-warning');
  const arbSelect          = document.getElementById('question-arbitrator');
  const arbTosEl           = document.getElementById('arb-tos');
  const arbTosLink         = document.getElementById('arb-tos-link');
  const arbOtherEl         = document.getElementById('arb-other');
  const typeSelect         = document.getElementById('question-type');
  const optionsWrap        = document.getElementById('answer-options');
  const addOptionBtn       = document.getElementById('add-option');
  const rewardInput        = document.getElementById('question-reward');
  const timeoutSel         = document.getElementById('question-timeout');
  const form               = document.getElementById('ask-form');

  // Shared header indicators
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

  // ── Contracts ─────────────────────────────────────────────────────────────────
  async function loadContracts() {
    if (contractsData) return contractsData;
    contractsData = window.RealityWebsiteData?.contracts || {};
    return contractsData;
  }

  function getTokensForChain(data, chain) {
    return Object.keys(data[String(chain)] || {});
  }

  function getVersionsForToken(data, chain, token) {
    const versions = data[String(chain)]?.[token] || {};
    return Object.keys(versions)
      .filter(v => versions[v]?.address && !versions[v]?.reality_eth_address)
      .sort((a, b) => {
        const key = v => { const m = v.match(/(\d+)\.(\d+)$/); return m ? parseInt(m[1]) * 100 + parseInt(m[2]) : 0; };
        return key(b) - key(a);
      });
  }

  // ── Arbitrator select ─────────────────────────────────────────────────────────
  async function populateArbitrators(chain, rcAddr, arbsObj) {
    const arbs = Object.entries(arbsObj || {}).map(([addr, name]) => ({ addr, name }));

    arbSelect.innerHTML = '';
    if (arbs.length === 0) {
      arbSelect.innerHTML = '<option value="">No known arbitrators for this network</option>';
    } else {
      arbSelect.innerHTML = '<option value="">Select arbitrator…</option>';
      for (const { addr, name } of arbs) {
        const opt = document.createElement('option');
        opt.value = addr;
        opt.textContent = name;
        opt.dataset.fee = '';
        arbSelect.appendChild(opt);
      }
    }
    const selfOpt = document.createElement('option');
    selfOpt.value = 'self';
    selfOpt.textContent = 'No arbitrator';
    selfOpt.dataset.fee = '0';
    arbSelect.appendChild(selfOpt);

    const otherOpt = document.createElement('option');
    otherOpt.value = 'other';
    otherOpt.textContent = 'Other (enter address)…';
    arbSelect.appendChild(otherOpt);

    updateArbTos();
    updateCost();

    if (rcAddr && (provider || window.ethereum)) {
      const prov = provider || new ethers.BrowserProvider(window.ethereum);
      for (const { addr, name } of arbs) {
        try {
          const arb = new ethers.Contract(addr, ARB_ABI, prov);
          const fee = await arb.arbitrator_question_fees(rcAddr);
          const eth = ethers.formatEther(fee);
          const display = parseFloat(eth) === 0 ? 'free' : `${formatAmount(parseFloat(eth))} ${rcToken}`;
          for (const opt of arbSelect.options) {
            if (opt.value.toLowerCase() === addr.toLowerCase()) {
              opt.textContent = `${name} — ${display}`;
              opt.dataset.fee = ethers.formatEther(fee);
              break;
            }
          }
        } catch { /* arbitrator doesn't implement the interface or call failed */ }
        if (arbSelect.value.toLowerCase() === addr.toLowerCase()) updateCost();
      }
    }
  }

  function updateArbTos() {
    const val = arbSelect.value;
    arbOtherEl.classList.toggle('visible', val === 'other');
    arbTosEl.style.display = 'none';
    if (!ethers.isAddress(val)) return;
    const prov = provider || (window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null);
    if (!prov) return;
    new ethers.Contract(val, ['function metadata() view returns (string)'], prov)
      .metadata()
      .then(raw => {
        let meta;
        try { meta = JSON.parse(raw); } catch { return; }
        if (!meta.tos) return;
        let tos = meta.tos;
        if (tos.toLowerCase().startsWith('ipfs://')) tos = 'https://ipfs.io/ipfs/' + tos.slice(7);
        arbTosLink.href = tos;
        arbTosEl.style.display = 'block';
      })
      .catch(() => {});
  }

  // ── Token / version selection ─────────────────────────────────────────────────
  function buildTokenPills(data, chain, tokens, activeToken) {
    const container = document.getElementById('ask-token-pills');
    container.innerHTML = '';
    if (tokens.length === 0) {
      container.style.display = 'none';
      return;
    }
    container.style.display = 'flex';
    for (const tok of tokens) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'token-pill' + (tok === activeToken ? ' active' : '');
      btn.dataset.token = tok;
      btn.textContent = tok;
      container.appendChild(btn);
    }
  }

  function buildVersionSelect(versions, activeVersion) {
    const row = document.getElementById('ask-version-row');
    const sel = document.getElementById('ask-version-select');
    if (versions.length === 0) {
      row.style.display = 'none';
      return;
    }
    row.style.display = 'block';
    sel.innerHTML = '';
    for (const ver of versions) {
      const opt = document.createElement('option');
      opt.value = ver;
      opt.textContent = ver;
      opt.selected = ver === activeVersion;
      sel.appendChild(opt);
    }
  }

  function versionMajor(versionStr) {
    const m = versionStr.match(/-(\d+)\./);
    return m ? parseInt(m[1]) : 0;
  }

  async function applyTokenVersion(data, chain, token, version) {
    selectedToken = token;
    selectedVersion = version;

    const info = data[String(chain)]?.[token]?.[version];
    if (!info) return;

    rcAddress = info.address;
    rcToken = token;
    isERC20Contract = !!info.token_address;
    rcTokenAddress = info.token_address || null;
    const supportsMinBond = versionMajor(version) >= 3;
    const minor = parseInt((version || '').match(/\.(\d+)/)?.[1] ?? '0');
    contractUsesDescription = minor >= 2;
    if (typeSelect.value !== 'custom') applyCustomTemplate(null);

    document.getElementById('token-label').textContent = `(${rcToken}, optional)`;
    document.getElementById('reward-token-label').textContent = `(${rcToken})`;
    document.getElementById('summary-reward').textContent = `0 ${rcToken}`;

    document.getElementById('erc20-note').style.display = isERC20Contract ? 'block' : 'none';

    const minBondInput = document.getElementById('question-minbond');
    const minBondField = document.getElementById('field-minbond');
    minBondInput.disabled = !supportsMinBond;
    minBondField.style.opacity = supportsMinBond ? '' : '0.5';
    if (!supportsMinBond) minBondInput.value = '';

    await populateArbitrators(chain, rcAddress, info.arbitrators);
    updateSubmitState();
    updateCustomTemplateLink();
    maybeFetchCustomTemplate();
  }

  function selectToken(token) {
    if (!contractsData || !chainId) return;
    for (const pill of document.getElementById('ask-token-pills').querySelectorAll('.token-pill')) {
      pill.classList.toggle('active', pill.dataset.token === token);
    }
    const versions = getVersionsForToken(contractsData, chainId, token);
    buildVersionSelect(versions, versions[0]);
    applyTokenVersion(contractsData, chainId, token, versions[0]);
  }

  function selectVersion(version) {
    if (!contractsData || !chainId || !selectedToken) return;
    applyTokenVersion(contractsData, chainId, selectedToken, version);
  }

  // ── Chain switching ───────────────────────────────────────────────────────────
  async function switchChain(chain) {
    if (!window.ethereum) return false;
    const eth = window.ethereum;
    const hexChain = '0x' + chain.toString(16);
    try {
      if (eth.session) eth._internalChainSwitch = true;
      await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: hexChain }] });
      return true;
    } catch (err) {
      if ((err.code === 4902 || err.code === -32603) && CHAIN_ADD_PARAMS[chain]) {
        try {
          await eth.request({ method: 'wallet_addEthereumChain', params: [CHAIN_ADD_PARAMS[chain]] });
          return true;
        } catch {}
      }
      return false;
    } finally {
      if (eth.session) eth._internalChainSwitch = false;
    }
  }

  function buildChainPills(activeChain) {
    const data = contractsData || window.RealityWebsiteData?.contracts || {};
    const allChains = Object.keys(data).map(Number)
      .filter(id => getTokensForChain(data, id).length > 0)
      .sort((a, b) => a - b);
    const indexedSet = new Set(window.RealitySettings?.getChainIds() || []);
    const primary = allChains.filter(id => indexedSet.has(id) || id === activeChain);
    const extra   = allChains.filter(id => !indexedSet.has(id) && id !== activeChain);

    const container = document.getElementById('ask-chain-pills');
    container.innerHTML = '';
    container.classList.add('visible');

    function makePill(id) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chain-pill' + (id === activeChain ? ' active' : '');
      btn.dataset.chain = String(id);
      btn.textContent = chainName(id);
      return btn;
    }
    for (const id of primary) container.appendChild(makePill(id));

    if (extra.length > 0) {
      const moreBtn = document.createElement('button');
      moreBtn.type = 'button';
      moreBtn.className = 'chain-pill-more';
      moreBtn.textContent = 'More';
      moreBtn.addEventListener('click', () => {
        moreBtn.remove();
        for (const id of extra) container.appendChild(makePill(id));
        const lessBtn = document.createElement('button');
        lessBtn.type = 'button';
        lessBtn.className = 'chain-pill-more';
        lessBtn.textContent = 'Less';
        lessBtn.addEventListener('click', () => buildChainPills(activeChain));
        container.appendChild(lessBtn);
      });
      container.appendChild(moreBtn);
    }
  }

  // ── Network setup ─────────────────────────────────────────────────────────────
  async function setupForChain(chain) {
    chainId = chain;
    const name = chainName(chain);
    const data = await loadContracts();
    const tokens = getTokensForChain(data, chain);

    networkName.textContent = name;
    buildChainPills(chain);

    if (tokens.length === 0) {
      networkDot.classList.add('unknown');
      networkUnsupported.style.display = 'block';
      rcAddress = null;
      rcToken = CHAIN_NATIVE_TOKEN[chain] || 'ETH';
      document.getElementById('ask-token-pills').style.display = 'none';
      document.getElementById('ask-version-row').style.display = 'none';
      document.getElementById('erc20-note').style.display = 'none';
      arbSelect.innerHTML = '<option value="">Unsupported network</option>';
      updateCost();
      return;
    }

    networkDot.classList.remove('unknown');
    networkUnsupported.style.display = 'none';

    const nativeToken = CHAIN_NATIVE_TOKEN[chain];
    const defaultToken = tokens.includes(nativeToken) ? nativeToken : tokens[0];
    buildTokenPills(data, chain, tokens, defaultToken);

    const versions = getVersionsForToken(data, chain, defaultToken);
    buildVersionSelect(versions, versions[0]);

    await applyTokenVersion(data, chain, defaultToken, versions[0]);
  }

  // ── Wallet ────────────────────────────────────────────────────────────────────
  async function applyWallet(addr) {
    walletAddr = addr && window.ethereum ? addr : null;
    if (walletAddr) {
      provider = new ethers.BrowserProvider(window.ethereum);
      signer   = new ethers.JsonRpcSigner(provider, walletAddr);
      walletNotice.style.display = 'none';

      provider.getNetwork().then(async net => {
        const target = pendingChainId;
        pendingChainId = null;
        if (target && target !== Number(net.chainId)) {
          await switchChain(target);
        } else {
          setupForChain(target || Number(net.chainId));
        }
      });

      window.ethereum.removeAllListeners?.('chainChanged');
      window.ethereum.on('chainChanged', hexChain => {
        provider = new ethers.BrowserProvider(window.ethereum);
        signer   = new ethers.JsonRpcSigner(provider, walletAddr);
        setupForChain(parseInt(hexChain, 16));
      });
    } else {
      provider = null; signer = null;
      networkName.textContent = 'Not connected';
      networkDot.classList.add('unknown');
      walletNotice.style.display = 'block';
      buildChainPills(pendingChainId);
    }
    updateSubmitState();
  }

  // ── Answer type toggling ──────────────────────────────────────────────────────
  typeSelect.addEventListener('change', () => {
    const t = typeSelect.value;
    const isCustom = t === 'custom';
    document.getElementById('field-custom-template').style.display = isCustom ? '' : 'none';
    if (isCustom) {
      maybeFetchCustomTemplate();
    } else {
      customTemplate = null;
      applyCustomTemplate(null);
    }
  });

  document.getElementById('custom-template-id').addEventListener('input', () => {
    updateCustomTemplateLink();
    clearTimeout(customTplTimer);
    customTplTimer = setTimeout(() => maybeFetchCustomTemplate(), 600);
  });

  addOptionBtn.addEventListener('click', () => {
    const rows = optionsWrap.querySelectorAll('.answer-option-row');
    const letter = String.fromCharCode(65 + rows.length);
    const row = document.createElement('div');
    row.className = 'answer-option-row';
    row.innerHTML = `<input type="text" placeholder="Option ${letter}" class="answer-option-input">
      <button type="button" class="remove-option">×</button>`;
    optionsWrap.insertBefore(row, addOptionBtn);
    updateRemoveButtons();
  });

  optionsWrap.addEventListener('click', e => {
    if (!e.target.classList.contains('remove-option') || e.target.disabled) return;
    e.target.closest('.answer-option-row').remove();
    updateRemoveButtons();
  });

  function updateRemoveButtons() {
    const rows = optionsWrap.querySelectorAll('.answer-option-row');
    rows.forEach(r => { r.querySelector('.remove-option').disabled = rows.length <= 2; });
  }

  // ── Timeout warning ───────────────────────────────────────────────────────────
  timeoutSel.addEventListener('change', () => {
    timeoutWarning.style.display = parseInt(timeoutSel.value) < 86400 ? 'block' : 'none';
    updateCost();
  });

  // ── Arbitrator change ─────────────────────────────────────────────────────────
  arbSelect.addEventListener('change', () => { updateArbTos(); updateCost(); });

  // ── Cost summary ──────────────────────────────────────────────────────────────
  rewardInput.addEventListener('input', updateCost);

  function formatAmount(n) {
    if (!n) return '0';
    return n.toFixed(10).replace(/\.?0+$/, '');
  }

  function updateCost() {
    const reward = parseFloat(rewardInput.value) || 0;
    const opt    = arbSelect.options[arbSelect.selectedIndex];
    const fee    = opt?.dataset?.fee !== undefined && opt.dataset.fee !== ''
      ? parseFloat(opt.dataset.fee) : null;

    document.getElementById('summary-reward').textContent =
      `${formatAmount(reward)} ${rcToken}`;
    document.getElementById('summary-arb-fee').textContent =
      fee !== null ? (fee > 0 ? `${formatAmount(fee)} ${rcToken}` : 'Free') : '—';
    document.getElementById('summary-total').textContent =
      fee !== null ? `${formatAmount(reward + fee)} ${rcToken}` : '—';
  }

  // ── Validation ────────────────────────────────────────────────────────────────
  function setError(fieldId, msg) {
    const el = document.getElementById(fieldId);
    el.classList.add('is-error');
    if (msg) { const fe = el.querySelector('.field-error'); if (fe) fe.textContent = msg; }
  }
  function clearError(fieldId) {
    document.getElementById(fieldId)?.classList.remove('is-error');
  }

  function validate() {
    let ok = true;

    const bodyField = document.getElementById('field-body');
    if (bodyField.style.display !== 'none') {
      const body = document.getElementById('question-body').value.trim();
      if (!body) { setError('field-body'); ok = false; } else clearError('field-body');
    } else clearError('field-body');

    const fieldTitleParams = document.getElementById('field-title-params');
    if (fieldTitleParams.style.display !== 'none') {
      const inputs = fieldTitleParams.querySelectorAll('.title-part-input');
      const allFilled = [...inputs].every(i => i.value.trim());
      if (!allFilled) { setError('field-title-params'); ok = false; } else clearError('field-title-params');
    } else clearError('field-title-params');

    const catField = form.querySelector('#field-category');
    const catSel   = form.querySelector('#question-category');
    if (catField.style.display !== 'none' && catSel.style.display !== 'none') {
      if (!catSel.value) { setError('field-category'); ok = false; } else clearError('field-category');
    } else clearError('field-category');

    const descField = form.querySelector('#field-description');
    const descInput = form.querySelector('#question-description');
    if (descField.style.display !== 'none') {
      if (!descInput.value.trim()) { setError('field-description'); ok = false; } else clearError('field-description');
    } else clearError('field-description');

    if (typeSelect.value === 'custom') {
      if (!customTemplate) { setError('field-custom-template'); ok = false; }
      else clearError('field-custom-template');
    }

    if (optionsWrap.classList.contains('visible')) {
      const opts = [...optionsWrap.querySelectorAll('.answer-option-input')]
        .map(i => i.value.trim()).filter(Boolean);
      const errEl = document.getElementById('options-error');
      if (opts.length < 2) {
        errEl.style.display = 'block'; ok = false;
      } else {
        errEl.style.display = 'none';
      }
    }

    if (!arbSelect.value) { setError('field-arbitrator'); ok = false; } else clearError('field-arbitrator');
    if (arbSelect.value === 'other') {
      const addr = document.getElementById('arbitrator-address').value.trim();
      if (!ethers.isAddress(addr)) { setError('field-arbitrator', 'Please enter a valid address.'); ok = false; }
    }

    const minBondVal = document.getElementById('question-minbond').value;
    if (minBondVal && isNaN(parseFloat(minBondVal))) {
      setError('field-minbond', 'Please enter a valid amount.'); ok = false;
    } else clearError('field-minbond');

    const rewardVal = rewardInput.value;
    if (rewardVal && isNaN(parseFloat(rewardVal))) {
      setError('field-reward', 'Please enter a valid amount.'); ok = false;
    } else clearError('field-reward');

    return ok;
  }

  function updateSubmitState() {
    submitBtn.disabled = !walletAddr || !rcAddress;
  }

  // ── Custom template helpers ───────────────────────────────────────────────────
  function parseCustomTemplate(str) {
    const SPARAM = '__RC_PARAM__';
    const APARAM = '__RC_APARAM__';
    let s = str.replace(/\[%s\]/g, JSON.stringify([APARAM]));
    s = s.replace(/%s/g, SPARAM);
    let parsed;
    try { parsed = JSON.parse(s); } catch { return null; }
    const fields = {};
    const paramOrder = [];
    for (const [k, v] of Object.entries(parsed)) {
      if (k === 'title_text' || k === 'title_html') continue;
      if (v === SPARAM) {
        fields[k] = 'param';
        paramOrder.push({ key: k, kind: 'string' });
      } else if (Array.isArray(v) && v.length === 1 && v[0] === APARAM) {
        fields[k] = 'array_param';
        paramOrder.push({ key: k, kind: 'array' });
      } else if (typeof v === 'string' && v.includes(SPARAM)) {
        const parts = [];
        const segs = v.split(SPARAM);
        for (let i = 0; i < segs.length; i++) {
          if (segs[i]) parts.push({ t: 'text', value: segs[i] });
          if (i < segs.length - 1) {
            const paramKey = `${k}__${paramOrder.length}`;
            parts.push({ t: 'param', key: paramKey });
            paramOrder.push({ key: paramKey, kind: 'string' });
          }
        }
        fields[k] = { parts };
      } else {
        fields[k] = { fixed: v };
      }
    }
    return { fields, paramOrder, type: String(parsed.type || 'bool') };
  }

  function applyCustomTemplate(tmpl) {
    form.querySelectorAll('.tpl-locked-value').forEach(el => el.remove());
    const catSel    = form.querySelector('#question-category');
    catSel.style.display = '';
    const fieldBody = form.querySelector('#field-body');
    const fieldCat  = form.querySelector('#field-category');
    const fieldDesc = form.querySelector('#field-description');

    if (!tmpl) {
      fieldBody.style.display = '';
      fieldCat.style.display  = contractUsesDescription ? 'none' : '';
      fieldDesc.style.display = contractUsesDescription ? '' : 'none';
      document.getElementById('field-title-params').style.display = 'none';
      const t = typeSelect.value;
      optionsWrap.classList.toggle('visible', t === 'single-select' || t === 'multiple-select');
      return;
    }

    const { fields, type } = tmpl;

    const fieldTitleParams = document.getElementById('field-title-params');
    const titlePartsContainer = document.getElementById('title-parts-container');
    titlePartsContainer.innerHTML = '';
    if (fields.title && fields.title.parts) {
      fieldBody.style.display = 'none';
      fieldTitleParams.style.display = '';
      for (const part of fields.title.parts) {
        if (part.t === 'text') {
          const span = document.createElement('span');
          span.className = 'title-part-text';
          span.textContent = part.value;
          titlePartsContainer.appendChild(span);
        } else {
          const inp = document.createElement('input');
          inp.type = 'text';
          inp.className = 'title-part-input';
          inp.dataset.paramKey = part.key;
          inp.placeholder = 'enter value';
          titlePartsContainer.appendChild(inp);
        }
      }
    } else {
      fieldTitleParams.style.display = 'none';
      fieldBody.style.display = (fields.title === 'param') ? '' : 'none';
    }

    if ('description' in fields) {
      fieldCat.style.display = 'none';
      fieldDesc.style.display = fields.description === 'param' ? '' : 'none';
    } else if (!('category' in fields)) {
      fieldCat.style.display = 'none';
      fieldDesc.style.display = 'none';
    } else if (fields.category === 'param') {
      fieldCat.style.display = '';
      fieldDesc.style.display = 'none';
    } else {
      catSel.style.display = 'none';
      fieldDesc.style.display = 'none';
      const locked = document.createElement('div');
      locked.className = 'tpl-locked-value';
      locked.textContent = String(fields.category.fixed ?? '');
      catSel.insertAdjacentElement('afterend', locked);
    }

    const isMulti = type === 'single-select' || type === 'multiple-select';
    optionsWrap.classList.toggle('visible', isMulti && fields.outcomes === 'array_param');
  }

  async function fetchCustomTemplate(id) {
    const statusEl = document.getElementById('custom-template-status');
    statusEl.textContent = 'Loading…';
    clearError('field-custom-template');
    try {
      const ponderId = `${chainId}-${rcAddress.toLowerCase()}-${id}`;
      const GRAPHQL  = window.RealitySettings?.getPonderUrl() || '/graphql';
      let templateStr = null;
      try {
        const res  = await fetch(GRAPHQL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: 'query($id:String!){template(id:$id){questionText}}',
            variables: { id: ponderId },
          }),
        });
        templateStr = (await res.json())?.data?.template?.questionText ?? null;
      } catch {}
      if (!templateStr && provider) {
        const rc = new ethers.Contract(rcAddress, RC_ABI, provider);
        const tBlock = Number(await rc.templates(id));
        if (tBlock) {
          const tevs = await rc.queryFilter(rc.filters.LogNewTemplate(id), tBlock, tBlock);
          templateStr = tevs[0]?.args.question_text ?? null;
        }
      }
      if (!templateStr) {
        statusEl.textContent = '';
        setError('field-custom-template', 'Template not found.');
        customTemplate = null;
        applyCustomTemplate(null);
        return;
      }
      const parsed = parseCustomTemplate(templateStr);
      if (!parsed) {
        statusEl.textContent = '';
        setError('field-custom-template', 'Invalid template format.');
        customTemplate = null;
        applyCustomTemplate(null);
        return;
      }
      customTemplate = { id, str: templateStr, ...parsed };
      const typeLabels = { bool: 'Yes/No', uint: 'Number', 'single-select': 'Single choice', 'multiple-select': 'Multiple choice', datetime: 'Date/time' };
      statusEl.textContent = `Loaded: ${typeLabels[parsed.type] || parsed.type}`;
      applyCustomTemplate(customTemplate);
    } catch (err) {
      statusEl.textContent = '';
      setError('field-custom-template', `Error: ${err.message}`);
      customTemplate = null;
      applyCustomTemplate(null);
    }
  }

  function updateCustomTemplateLink() {
    const link = document.getElementById('custom-template-link');
    if (!link) return;
    const id = document.getElementById('custom-template-id').value;
    if (id && rcAddress && chainId) {
      link.href = `#!/template/${chainId}-${rcAddress.toLowerCase()}-${id}`;
      link.textContent = `View / edit template #${id}`;
    } else {
      link.href = '#!/template';
      link.textContent = 'Create a new template';
    }
  }

  function maybeFetchCustomTemplate() {
    if (typeSelect.value !== 'custom') return;
    const id = document.getElementById('custom-template-id').value;
    updateCustomTemplateLink();
    if (id && rcAddress && chainId) fetchCustomTemplate(id);
  }

  // ── Question encoding ─────────────────────────────────────────────────────────
  function encodeQuestion(type, title, outcomes, category) {
    return RealityLib.encodeText(type, title, outcomes, category);
  }

  // ── TX helper ─────────────────────────────────────────────────────────────────
  function txErrorMessage(err) {
    if (err?.code === 4001 || err?.code === 'ACTION_REJECTED') return 'Transaction rejected.';
    return err?.reason || err?.data?.message || err?.message || 'Transaction failed.';
  }

  // ── Submit ────────────────────────────────────────────────────────────────────
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!signer || !rcAddress) return;
    if (!validate()) return;

    txError.classList.remove('visible');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Waiting for wallet…';

    try {
      const title       = form.querySelector('#question-body').value.trim();
      const category    = form.querySelector('#question-category').value;
      const description = form.querySelector('#question-description').value.trim();
      const opening  = document.getElementById('opening-date').value;
      const timeout  = parseInt(timeoutSel.value);
      const rewardEth  = rewardInput.value || '0';
      const supportsMinBond = versionMajor(selectedVersion) >= 3;
      const minBondEth = supportsMinBond ? (document.getElementById('question-minbond').value || '0') : '0';
      const outcomes = [...optionsWrap.querySelectorAll('.answer-option-input')]
        .map(i => i.value.trim()).filter(Boolean);

      let templateId, qtext;
      if (typeSelect.value === 'custom') {
        templateId = parseInt(document.getElementById('custom-template-id').value);
        const values = {};
        for (const { key } of customTemplate.paramOrder) {
          if (key === 'title')            values[key] = title;
          else if (key === 'category')    values[key] = category;
          else if (key === 'description') values[key] = description;
          else if (key === 'outcomes')    values[key] = outcomes;
          else if (key.startsWith('title__')) {
            const inputEl = document.querySelector(`[data-param-key="${key}"]`);
            values[key] = inputEl ? inputEl.value.trim() : '';
          } else                          values[key] = '';
        }
        qtext = RealityLib.encodeCustomText(values);
      } else {
        const type = typeSelect.value;
        templateId = TEMPLATE_IDS[type];
        qtext = encodeQuestion(type, title, outcomes, contractUsesDescription ? description : category);
      }
      const openingTs = opening
        ? Math.floor(new Date(opening + 'T00:00:00Z').getTime() / 1000) : 0;
      const rewardWei  = ethers.parseEther(rewardEth);
      const minBondWei = ethers.parseEther(minBondEth);

      let arbAddr, feeWei = 0n;
      const arbVal = arbSelect.value;
      if (arbVal === 'self') {
        arbAddr = rcAddress;
      } else if (arbVal === 'other') {
        arbAddr = document.getElementById('arbitrator-address').value.trim();
      } else {
        arbAddr = arbVal;
        if (!isERC20Contract) {
          try {
            const arbContract = new ethers.Contract(arbAddr, ARB_ABI, provider);
            feeWei = await withIndicator(rpcInd, () => arbContract.arbitrator_question_fees(rcAddress));
          } catch {}
        }
      }

      // ERC20 approval step (only when reward > 0)
      if (isERC20Contract && rcTokenAddress && rewardWei > 0n) {
        submitBtn.textContent = `Approve ${rcToken} in wallet…`;
        const tokenRead = new ethers.Contract(rcTokenAddress, ERC20_TOKEN_ABI, provider);
        const allowance = await withIndicator(rpcInd, () => tokenRead.allowance(walletAddr, rcAddress));
        if (allowance < rewardWei) {
          const tokenRW = new ethers.Contract(rcTokenAddress, ERC20_TOKEN_ABI, signer);
          const approveTx = await withIndicator(rpcInd, () => tokenRW.approve(rcAddress, rewardWei));
          submitBtn.textContent = `Approving ${rcToken}…`;
          await withIndicator(rpcInd, () => approveTx.wait());
        }
      }

      submitBtn.textContent = 'Waiting for wallet…';

      let tx;
      if (isERC20Contract) {
        const rc = new ethers.Contract(rcAddress, [...RC_ABI, ...RC_ERC20_ABI], signer);
        if (supportsMinBond && minBondWei > 0n) {
          tx = await withIndicator(rpcInd, () => rc.askQuestionWithMinBondERC20(
            templateId, qtext, arbAddr, timeout, openingTs, 0, minBondWei, rewardWei));
        } else {
          tx = await withIndicator(rpcInd, () => rc.askQuestionERC20(
            templateId, qtext, arbAddr, timeout, openingTs, 0, rewardWei));
        }
      } else {
        const value = rewardWei + feeWei;
        const rc = new ethers.Contract(rcAddress, RC_ABI, signer);
        if (minBondWei > 0n) {
          tx = await withIndicator(rpcInd, () => rc.askQuestionWithMinBond(
            templateId, qtext, arbAddr, timeout, openingTs, 0, minBondWei, { value }));
        } else {
          tx = await withIndicator(rpcInd, () => rc.askQuestion(
            templateId, qtext, arbAddr, timeout, openingTs, 0, { value }));
        }
      }

      submitBtn.textContent = 'Pending…';
      // The WC relay can drop inbound messages after the wallet approves, leaving
      // tx.wait() hanging indefinitely. Use a direct hosted RPC when available
      // (Alchemy etc. support browser CORS); otherwise fall back to tx.wait() with
      // a timeout so the user is never permanently stuck.
      const hostedRpcUrl = window.RealityWebsiteData?.chains?.[chainId]?.hostedRPC;
      const isCorsHosted = hostedRpcUrl && /alchemy\.com|infura\.io|quicknode\.pro|g\.alchemy/.test(hostedRpcUrl);
      let receipt;
      if (isCorsHosted) {
        receipt = await withIndicator(rpcInd,
          () => new ethers.JsonRpcProvider(hostedRpcUrl).waitForTransaction(tx.hash));
      } else {
        receipt = await withIndicator(rpcInd,
          () => Promise.race([tx.wait(), new Promise(r => setTimeout(() => r(null), 120000))]));
      }
      if (!receipt) {
        submitBtn.textContent = '✓ Sent!';
        setTimeout(() => { location.hash = '#!/browse'; }, 1500);
        return;
      }

      // Extract question ID from LogNewQuestion event
      const iface = new ethers.Interface(RC_ABI);
      let questionId = null;
      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog(log);
          if (parsed.name === 'LogNewQuestion') { questionId = parsed.args.question_id; break; }
        } catch {}
      }

      submitBtn.textContent = '✓ Question asked!';
      setTimeout(() => {
        if (questionId) {
          location.hash = `#!/network/${chainId}/question/${rcAddress.toLowerCase()}-${questionId}`;
        } else {
          location.hash = '#!/browse';
        }
      }, 1000);

    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Ask question';
      txError.textContent = txErrorMessage(err);
      txError.classList.add('visible');
    }
  });

  // ── Chain / token / version events ────────────────────────────────────────────
  document.getElementById('ask-chain-pills').addEventListener('click', async e => {
    const pill = e.target.closest('.chain-pill');
    if (!pill) return;
    const chain = parseInt(pill.dataset.chain);
    if (walletAddr) {
      const switched = await switchChain(chain);
      // WC doesn't fire chainChanged when switching to chain 1 (its required chain).
      // Use the promise return value (not window.ethereum.chainId, which is stale
      // for required chains) to decide whether the switch succeeded.
      if (window.ethereum?.session && switched) setupForChain(chain);
    } else {
      pendingChainId = chain;
      setupForChain(chain);
    }
  });

  document.getElementById('ask-token-pills').addEventListener('click', e => {
    const pill = e.target.closest('.token-pill');
    if (pill) selectToken(pill.dataset.token);
  });

  document.getElementById('ask-version-select').addEventListener('change', e => {
    selectVersion(e.target.value);
  });

  // ── Init ──────────────────────────────────────────────────────────────────────
  document.title = 'reality.eth — Ask a question';
  loadContracts().catch(() => {});
  updateCost();
  buildChainPills(null);

  const hashParams = new URLSearchParams(window.location.hash.replace(/^[^?]*/, ''));
  const urlTemplateId = hashParams.get('templateId');
  if (urlTemplateId) {
    typeSelect.value = 'custom';
    document.getElementById('field-custom-template').style.display = '';
    document.getElementById('custom-template-id').value = urlTemplateId;
  }

  window._setAskWallet = applyWallet;
};
