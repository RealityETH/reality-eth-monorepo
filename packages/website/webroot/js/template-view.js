window.RealityTemplate = window.RealityTemplate || {};

window.RealityTemplate.mount = async function (routeId) {
  'use strict';

  // ── Constants ─────────────────────────────────────────────────────────────────
  const GRAPHQL = window.RealitySettings?.getPonderUrl() || '/graphql';

  const VERSION_PREFERENCE = ['RealityETH-3.2', 'RealityETH-3.0', 'RealityETH-2.1'];

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
    'event LogNewTemplate(uint256 indexed template_id, address indexed user, string question_text)',
    'function createTemplate(string content) returns (uint256)',
  ];
  const TYPE_LABELS = {
    'bool': 'Yes / No', 'uint': 'Number', 'datetime': 'Date / Time',
    'single-select': 'Single choice', 'multiple-select': 'Multiple choice',
  };
  const BUILTIN_TEMPLATES = {
    0: '{"title": "%s", "type": "bool", "category": "%s", "lang": "%s"}',
    1: '{"title": "%s", "type": "uint", "decimals": 18, "category": "%s", "lang": "%s"}',
    2: '{"title": "%s", "type": "single-select", "outcomes": [%s], "category": "%s", "lang": "%s"}',
    3: '{"title": "%s", "type": "multiple-select", "outcomes": [%s], "category": "%s", "lang": "%s"}',
    4: '{"title": "%s", "type": "datetime", "category": "%s", "lang": "%s"}',
  };

  // ── State ─────────────────────────────────────────────────────────────────────
  let provider       = null;
  let signer         = null;
  let walletAddr     = null;
  let chainId        = null;
  let pendingChainId = null;
  let rcAddress      = null;
  let contractsData  = null;
  let selectedToken   = null;
  let selectedVersion = null;
  let templateMode    = 'custom';

  // ── DOM refs ──────────────────────────────────────────────────────────────────
  const submitBtn    = document.getElementById('submit-btn');
  const txError      = document.getElementById('tx-error');
  const networkName  = document.getElementById('network-name');
  const networkDot   = document.getElementById('network-dot');
  const jsonPreview  = document.getElementById('json-preview');
  const resultBox    = document.getElementById('result-box');
  const resultId     = document.getElementById('result-id');
  const typeSelect   = document.getElementById('tmpl-type');
  const optionsWrap  = document.getElementById('field-outcomes');
  const addOptionBtn = document.getElementById('add-option');

  // ── GraphQL ───────────────────────────────────────────────────────────────────
  const ponderInd = document.getElementById('ind-ponder');
  const rpcInd    = document.getElementById('ind-rpc');
  async function withIndicator(el, fn) {
    el?.classList.add('active');
    const start = Date.now();
    try { return await fn(); }
    finally { setTimeout(() => el?.classList.remove('active'), Math.max(0, 1000 - (Date.now() - start))); }
  }

  async function gql(query, variables) {
    const res = await withIndicator(ponderInd, () => fetch(GRAPHQL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    }));
    const json = await res.json();
    if (json.errors?.length) throw new Error(json.errors[0].message);
    return json.data;
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
      .filter(v => versions[v]?.address)
      .sort((a, b) => {
        const key = v => { const m = v.match(/(\d+)\.(\d+)$/); return m ? parseInt(m[1]) * 100 + parseInt(m[2]) : 0; };
        return key(b) - key(a);
      });
  }

  // ── Token / version ───────────────────────────────────────────────────────────
  function buildTokenPills(data, chain, tokens, activeToken) {
    const container = document.getElementById('token-pills');
    container.innerHTML = '';
    if (tokens.length <= 1) { container.style.display = 'none'; return; }
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
    const row = document.getElementById('tc-version-row');
    const sel = document.getElementById('tc-version-select');
    if (versions.length <= 1) { row.style.display = 'none'; return; }
    row.style.display = 'block';
    sel.innerHTML = '';
    for (const ver of versions) {
      const opt = document.createElement('option');
      opt.value = ver; opt.textContent = ver; opt.selected = ver === activeVersion;
      sel.appendChild(opt);
    }
  }

  function applyTokenVersion(data, chain, token, version) {
    selectedToken = token;
    selectedVersion = version;
    const info = data[String(chain)]?.[token]?.[version];
    rcAddress = info?.address || null;
    updateSubmitState();
  }

  function selectToken(token) {
    if (!contractsData || !chainId) return;
    for (const pill of document.getElementById('token-pills').querySelectorAll('.token-pill')) {
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

    const container = document.getElementById('tc-chain-pills');
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

  async function setupForChain(chain) {
    chainId = chain;
    const name = chainName(chain);
    const data = await loadContracts();
    const tokens = getTokensForChain(data, chain);

    networkName.textContent = name;
    buildChainPills(chain);

    if (tokens.length === 0) {
      networkDot.classList.add('unknown');
      document.getElementById('network-unsupported').style.display = 'block';
      document.getElementById('token-pills').style.display = 'none';
      document.getElementById('tc-version-row').style.display = 'none';
      rcAddress = null;
      updateSubmitState();
      return;
    }

    networkDot.classList.remove('unknown');
    document.getElementById('network-unsupported').style.display = 'none';

    const nativeToken = CHAIN_NATIVE_TOKEN[chain];
    const defaultToken = tokens.includes(nativeToken) ? nativeToken : tokens[0];
    buildTokenPills(data, chain, tokens, defaultToken);
    const versions = getVersionsForToken(data, chain, defaultToken);
    buildVersionSelect(versions, versions[0]);
    applyTokenVersion(data, chain, defaultToken, versions[0]);
  }

  // ── Wallet ────────────────────────────────────────────────────────────────────
  function applyWallet(addr) {
    walletAddr = addr || null;
    if (walletAddr && window.ethereum) {
      provider = new ethers.BrowserProvider(window.ethereum);
      signer   = new ethers.JsonRpcSigner(provider, walletAddr);
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
    } else if (!walletAddr) {
      provider = null; signer = null;
      networkName.textContent = 'Not connected';
      networkDot.classList.add('unknown');
      buildChainPills(pendingChainId);
    }
    updateSubmitState();
  }

  window._setTemplateWallet = applyWallet;

  // ── Template type toggle ──────────────────────────────────────────────────────
  function setTemplateMode(mode) {
    templateMode = mode;
    document.getElementById('toggle-custom').classList.toggle('active', mode === 'custom');
    document.getElementById('toggle-zodiac').classList.toggle('active', mode === 'zodiac');
    document.getElementById('toggle-raw').classList.toggle('active',    mode === 'raw');
    document.getElementById('form-custom').style.display  = mode === 'custom'  ? '' : 'none';
    document.getElementById('form-zodiac').style.display  = mode === 'zodiac'  ? '' : 'none';
    document.getElementById('form-raw').style.display     = mode === 'raw'     ? '' : 'none';
    document.getElementById('zodiac-info').style.display  = mode === 'zodiac'  ? '' : 'none';
    updatePreview();
    updateSubmitState();
  }

  // ── Answer type ───────────────────────────────────────────────────────────────
  typeSelect.addEventListener('change', () => {
    const t = typeSelect.value;
    const isSelect = t === 'single-select' || t === 'multiple-select';
    const isUint   = t === 'uint';
    optionsWrap.classList.toggle('visible', isSelect);
    document.getElementById('field-decimals').classList.toggle('visible', isUint);
    document.getElementById('field-outcomes').classList.toggle('visible', isSelect);
    updatePreview();
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
    updatePreview();
  });

  optionsWrap.addEventListener('click', e => {
    if (!e.target.classList.contains('remove-option') || e.target.disabled) return;
    e.target.closest('.answer-option-row').remove();
    updateRemoveButtons();
    updatePreview();
  });

  optionsWrap.addEventListener('input', updatePreview);

  function updateRemoveButtons() {
    const rows = optionsWrap.querySelectorAll('.answer-option-row');
    rows.forEach(r => { r.querySelector('.remove-option').disabled = rows.length <= 2; });
  }

  // ── ENS name handling ─────────────────────────────────────────────────────────
  document.getElementById('tmpl-ens').addEventListener('input', () => {
    const ens = document.getElementById('tmpl-ens').value.trim();
    const gen = document.getElementById('generated-title');
    if (ens && ens.includes('.')) {
      gen.textContent = buildZodiacTitle(ens);
      gen.classList.add('visible');
    } else {
      gen.classList.remove('visible');
    }
    updatePreview();
    updateSubmitState();
  });

  function buildZodiacTitle(ens) {
    return (
      'Did the Snapshot proposal with the id %s in the ' +
      `${ens} space pass the execution of the array of Module transactions ` +
      'that have the hash 0x%s and does it meet the requirements of the document ' +
      `referenced in the dao requirements record at ${ens}? The hash is ` +
      'the keccak of the concatenation of the individual EIP-712 hashes of ' +
      'the Module transactions. If this question was asked before the corresponding ' +
      'Snapshot proposal was resolved, it should ALWAYS be resolved to INVALID!'
    );
  }

  ['tmpl-category', 'tmpl-title', 'tmpl-decimals', 'tmpl-lang'].forEach(id => {
    document.getElementById(id).addEventListener('input', updatePreview);
  });
  document.getElementById('tmpl-type').addEventListener('change', updatePreview);
  document.getElementById('tmpl-lang').addEventListener('change', updatePreview);
  document.getElementById('raw-json').addEventListener('input', updatePreview);

  // ── Template building ─────────────────────────────────────────────────────────
  function buildTemplate() {
    if (templateMode === 'raw') {
      const rawVal = document.getElementById('raw-json').value.trim();
      if (!rawVal) return null;
      try {
        const tmpl = JSON.parse(rawVal);
        if (!tmpl.title || !tmpl.type || !tmpl.category) return null;
        return tmpl;
      } catch { return null; }
    }
    if (templateMode === 'zodiac') {
      const ens = document.getElementById('tmpl-ens').value.trim();
      if (!ens || !ens.includes('.')) return null;
      return { title: buildZodiacTitle(ens), type: 'bool', category: 'DAO proposal', lang: 'en' };
    }

    const type     = typeSelect.value;
    const category = document.getElementById('tmpl-category').value.trim();
    const title    = document.getElementById('tmpl-title').value.trim();
    const lang     = document.getElementById('tmpl-lang').value;
    const isSelect = type === 'single-select' || type === 'multiple-select';
    const isUint   = type === 'uint';

    if (!category || !title) return null;

    const tmpl = { title, type, category, lang };

    if (isUint) {
      const dec = parseInt(document.getElementById('tmpl-decimals').value);
      if (isNaN(dec)) return null;
      tmpl.decimals = dec;
    }

    if (isSelect) {
      const outcomes = [...optionsWrap.querySelectorAll('.answer-option-input')]
        .map(i => i.value.trim()).filter(Boolean);
      if (outcomes.length < 2) return null;
      tmpl.outcomes = outcomes;
    }

    return tmpl;
  }

  // ── JSON preview ──────────────────────────────────────────────────────────────
  function updatePreview() {
    if (templateMode === 'raw') {
      const rawVal = document.getElementById('raw-json').value.trim();
      try {
        const tmpl = JSON.parse(rawVal);
        jsonPreview.className = 'json-preview';
        jsonPreview.textContent = JSON.stringify(tmpl, null, 2);
      } catch {
        jsonPreview.className = 'json-preview empty';
        jsonPreview.textContent = rawVal ? 'Invalid JSON.' : 'Enter template JSON.';
      }
      updateSubmitState();
      return;
    }
    const tmpl = buildTemplate();
    if (!tmpl) {
      jsonPreview.className = 'json-preview empty';
      jsonPreview.textContent = 'Fill in the form to preview the template JSON.';
      updateSubmitState();
      return;
    }
    jsonPreview.className = 'json-preview';
    jsonPreview.textContent = JSON.stringify(tmpl, null, 2);
    updateSubmitState();
  }

  // ── Validation ────────────────────────────────────────────────────────────────
  function validate() {
    if (templateMode === 'raw') {
      const rawVal = document.getElementById('raw-json').value.trim();
      const errEl  = document.getElementById('raw-error');
      try {
        const tmpl = JSON.parse(rawVal);
        if (!tmpl.title || !tmpl.type || !tmpl.category) throw new Error();
        errEl.style.display = 'none';
        return true;
      } catch {
        errEl.style.display = 'block';
        return false;
      }
    }

    let ok = true;

    if (templateMode === 'zodiac') {
      const ens = document.getElementById('tmpl-ens').value.trim();
      const field = document.getElementById('field-ens');
      if (!ens || !ens.includes('.')) {
        field.classList.add('is-error'); ok = false;
      } else {
        field.classList.remove('is-error');
      }
      return ok;
    }

    const category = document.getElementById('tmpl-category').value.trim();
    const fieldCat = document.getElementById('field-category');
    if (!category) { fieldCat.classList.add('is-error'); ok = false; }
    else fieldCat.classList.remove('is-error');

    const title = document.getElementById('tmpl-title').value.trim();
    const fieldTitle = document.getElementById('field-title');
    if (!title) { fieldTitle.classList.add('is-error'); ok = false; }
    else fieldTitle.classList.remove('is-error');

    const type = typeSelect.value;
    if (type === 'uint') {
      const dec = document.getElementById('tmpl-decimals').value;
      const decimalsError = document.getElementById('decimals-error');
      if (dec === '' || isNaN(parseInt(dec))) {
        document.getElementById('field-decimals').classList.add('is-error');
        decimalsError.style.display = 'block'; ok = false;
      } else {
        document.getElementById('field-decimals').classList.remove('is-error');
        decimalsError.style.display = 'none';
      }
    }

    if (type === 'single-select' || type === 'multiple-select') {
      const outcomes = [...optionsWrap.querySelectorAll('.answer-option-input')]
        .map(i => i.value.trim()).filter(Boolean);
      const outErr = document.getElementById('outcomes-error');
      if (outcomes.length < 2) { outErr.style.display = 'block'; ok = false; }
      else outErr.style.display = 'none';
    }

    return ok;
  }

  function updateSubmitState() {
    if (!walletAddr) {
      submitBtn.textContent = 'Connect wallet';
      submitBtn.disabled = false;
    } else {
      const tmpl = buildTemplate();
      submitBtn.textContent = 'Create template';
      submitBtn.disabled = !rcAddress || !tmpl;
    }
  }

  // ── TX helpers ────────────────────────────────────────────────────────────────
  function txErrorMessage(err) {
    if (err?.code === 4001 || err?.code === 'ACTION_REJECTED') return 'Transaction rejected.';
    return err?.reason || err?.data?.message || err?.message || 'Transaction failed.';
  }

  // ── Submit ────────────────────────────────────────────────────────────────────
  submitBtn.addEventListener('click', async () => {
    if (!walletAddr) {
      if (typeof RealityWallet !== 'undefined') RealityWallet.connectWallet(addr => window._globalWalletChange?.(addr));
      return;
    }
    if (!signer || !rcAddress) return;
    if (!validate()) return;

    const tmpl = buildTemplate();
    if (!tmpl) return;

    txError.classList.remove('visible');
    resultBox.classList.remove('visible');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Waiting for wallet…';

    try {
      const rc = new ethers.Contract(rcAddress, RC_ABI, signer);
      const tx = await withIndicator(rpcInd, () => rc.createTemplate(JSON.stringify(tmpl)));

      submitBtn.textContent = 'Pending…';
      const receipt = await withIndicator(rpcInd, () => tx.wait());

      const iface = new ethers.Interface(RC_ABI);
      let templateIdNum = null;
      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog(log);
          if (parsed.name === 'LogNewTemplate') {
            templateIdNum = Number(parsed.args.template_id);
            break;
          }
        } catch {}
      }

      submitBtn.textContent = '✓ Template created!';
      submitBtn.disabled = true;

      if (templateIdNum !== null) {
        resultId.textContent = templateIdNum;
        resultBox.classList.add('visible');
        const ponderId = `${chainId}-${rcAddress.toLowerCase()}-${templateIdNum}`;
        const viewLink = document.getElementById('result-view-link');
        if (viewLink) viewLink.href = `#!/template/${ponderId}`;
      }

    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create template';
      txError.textContent = txErrorMessage(err);
      txError.classList.add('visible');
    }
  });

  document.getElementById('result-copy').addEventListener('click', () => {
    navigator.clipboard?.writeText(resultId.textContent);
    const btn = document.getElementById('result-copy');
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy ID'; }, 1500);
  });

  // ── View mode ─────────────────────────────────────────────────────────────────
  function b64urlEncode(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  function b64urlDecode(str) {
    const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const pad = (4 - b64.length % 4) % 4;
    const bin = atob(b64 + '='.repeat(pad));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function parseRouteId(id) {
    if (!id) return null;
    if (id.startsWith('raw/')) {
      try { return { mode: 'rawCreate', json: b64urlDecode(id.slice(4)) }; } catch { return null; }
    }
    if (/^\d+$/.test(id)) return { mode: 'byId', templateId: parseInt(id) };
    const m = id.match(/^(\d+)-(0x[a-fA-F0-9]+)-(\d+)$/);
    if (m) return { mode: 'direct', ponderId: id };
    return null;
  }

  function highlightPlaceholders(text) {
    const div = document.createElement('div');
    div.className = 'view-title-text';
    const escaped = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    div.innerHTML = escaped.replace(/%s/g, '<span class="ph">%s</span>');
    return div;
  }

  function renderTemplateView(t) {
    const rawText = t.questionText || BUILTIN_TEMPLATES[t.templateId] || '{}';
    let tmpl = {};
    try { tmpl = JSON.parse(rawText); } catch {}

    document.title = `reality.eth — Template #${t.templateId}`;

    document.getElementById('view-id-num').textContent = t.templateId;

    const badges = document.getElementById('view-badges');
    badges.innerHTML = '';
    if (tmpl.type) {
      const b = document.createElement('span');
      b.className = 'badge badge-type';
      b.textContent = TYPE_LABELS[tmpl.type] || tmpl.type;
      badges.appendChild(b);
    }
    if (tmpl.category) {
      const b = document.createElement('span');
      b.className = 'badge badge-cat';
      b.textContent = tmpl.category;
      badges.appendChild(b);
    }
    if (tmpl.lang) {
      const b = document.createElement('span');
      b.className = 'badge badge-lang';
      b.textContent = tmpl.lang;
      badges.appendChild(b);
    }

    const titleWrap = document.getElementById('view-title-text');
    titleWrap.innerHTML = '';
    if (tmpl.title) titleWrap.appendChild(highlightPlaceholders(tmpl.title));

    const outcomesWrap = document.getElementById('view-outcomes');
    outcomesWrap.innerHTML = '';
    if (tmpl.outcomes?.length) {
      for (const o of tmpl.outcomes) {
        const row = document.createElement('div');
        row.className = 'view-outcome';
        row.textContent = o;
        outcomesWrap.appendChild(row);
      }
    }
    if (tmpl.decimals !== undefined) {
      const row = document.createElement('div');
      row.className = 'view-outcome';
      row.textContent = `Decimals: ${tmpl.decimals}`;
      outcomesWrap.appendChild(row);
    }

    document.getElementById('view-creator').textContent = t.user;
    document.getElementById('view-contract').textContent =
      `${chainName(t.chainId)} · ${t.contract.slice(0,10)}…`;
    document.getElementById('view-txhash').textContent =
      t.createdTxHash ? t.createdTxHash.slice(0, 14) + '…' : '(built-in)';

    document.getElementById('view-json').textContent = rawText;

    document.getElementById('view-browse-link').href =
      `#!/network/${t.chainId}/template/${t.templateId}`;

    document.getElementById('clone-btn').onclick = () => {
      let cloneJson;
      try { cloneJson = JSON.stringify(JSON.parse(rawText), null, 2); } catch { cloneJson = rawText; }
      location.hash = '#!/template/raw/' + b64urlEncode(cloneJson);
    };

    document.getElementById('view-loading').style.display = 'none';
    document.getElementById('view-single').style.display = '';
  }

  function renderMultiResults(items) {
    document.getElementById('view-loading').style.display = 'none';
    document.getElementById('view-multi').style.display = '';
    const list = document.getElementById('view-multi-list');
    list.innerHTML = '';
    for (const t of items) {
      const row = document.createElement('div');
      row.className = 'multi-result-row';
      row.innerHTML = `<div>
        <div class="chain-info">${chainName(t.chainId)}</div>
        <div class="contract-info">${t.contract}</div>
      </div>`;
      row.addEventListener('click', () => {
        document.getElementById('view-multi').style.display = 'none';
        renderTemplateView(t);
      });
      list.appendChild(row);
    }
  }

  async function loadViewMode(parsed) {
    document.getElementById('create-section').style.display = 'none';
    document.getElementById('view-section').style.display = '';

    try {
      if (parsed.mode === 'direct') {
        const data = await gql(
          `query($id: String!) { template(id: $id) {
            id templateId contract chainId user questionText createdTxHash createdTimestamp
          }}`,
          { id: parsed.ponderId }
        );
        if (!data.template) {
          document.getElementById('view-loading').style.display = 'none';
          document.getElementById('view-error').textContent = 'Template not found.';
          document.getElementById('view-error').style.display = '';
          return;
        }
        renderTemplateView(data.template);
      } else {
        const data = await gql(
          `query($id: Int!) { templates(where: { templateId: $id }, limit: 20) { items {
            id templateId contract chainId user questionText createdTxHash createdTimestamp
          }}}`,
          { id: parsed.templateId }
        );
        const items = data.templates?.items || [];
        if (!items.length) {
          document.getElementById('view-loading').style.display = 'none';
          document.getElementById('view-error').textContent = 'No template found with that ID.';
          document.getElementById('view-error').style.display = '';
          return;
        }
        if (items.length === 1) {
          renderTemplateView(items[0]);
        } else {
          renderMultiResults(items);
        }
      }
    } catch (err) {
      if (ponderInd) { ponderInd.classList.add('offline'); ponderInd.dataset.lastError = err.message || 'GraphQL error'; ponderInd.dataset.ponderUrl = GRAPHQL; }
      document.getElementById('view-loading').style.display = 'none';
      document.getElementById('view-error').textContent = `Error: ${err.message}`;
      document.getElementById('view-error').style.display = '';
    }
  }

  // ── Event listeners ───────────────────────────────────────────────────────────
  document.getElementById('toggle-custom').addEventListener('click', () => setTemplateMode('custom'));
  document.getElementById('toggle-zodiac').addEventListener('click', () => setTemplateMode('zodiac'));
  document.getElementById('toggle-raw').addEventListener('click',    () => setTemplateMode('raw'));

  document.getElementById('tc-chain-pills').addEventListener('click', async e => {
    const pill = e.target.closest('.chain-pill');
    if (!pill) return;
    const chain = parseInt(pill.dataset.chain);
    if (walletAddr) {
      const switched = await switchChain(chain);
      if (switched) {
        provider = new ethers.BrowserProvider(window.ethereum);
        signer   = new ethers.JsonRpcSigner(provider, walletAddr);
        setupForChain(chain);
      }
    } else {
      pendingChainId = chain;
      setupForChain(chain);
    }
  });

  document.getElementById('token-pills').addEventListener('click', e => {
    const pill = e.target.closest('.token-pill');
    if (pill) selectToken(pill.dataset.token);
  });

  document.getElementById('tc-version-select').addEventListener('change', e => {
    selectVersion(e.target.value);
  });

  // ── Boot ──────────────────────────────────────────────────────────────────────
  const parsed = parseRouteId(routeId);
  if (parsed?.mode === 'rawCreate') {
    document.getElementById('view-section').style.display = 'none';
    document.getElementById('create-section').style.display = 'block';
    document.title = 'reality.eth — Create template';
    setTemplateMode('raw');
    document.getElementById('raw-json').value = parsed.json;
    updatePreview();
    loadContracts().catch(() => {});
  } else if (parsed) {
    loadViewMode(parsed);
  } else {
    document.title = 'reality.eth — Create template';
    loadContracts().catch(() => {});
  }
  buildChainPills(null);
};
