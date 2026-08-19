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

  const ARB_TOS = {
    '0xff32eff': 'https://kleros.io/tos',
    '0xf72cfd1': 'https://kleros.io/tos',
    '0x7837638': 'https://kleros.io/tos',
    '0x728cba7': 'https://kleros.io/tos',
    '0x29f39de': 'https://kleros.io/tos',
    '0x5afa42b': 'https://kleros.io/tos',
  };

  // ── State ─────────────────────────────────────────────────────────────────────
  let provider      = null;
  let signer        = null;
  let walletAddr    = null;
  let chainId       = null;
  let rcAddress     = null;
  let rcToken       = 'ETH';
  let contractsData = null;
  let selectedToken    = null;
  let selectedVersion  = null;
  let isERC20Contract  = false;
  let rcTokenAddress   = null;
  let pendingChainId   = null;

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
    const isOther = val === 'other';
    arbOtherEl.classList.toggle('visible', isOther);

    const prefix = val.slice(0, 9).toLowerCase();
    const tos = ARB_TOS[prefix];
    arbTosEl.style.display = tos ? 'block' : 'none';
    if (tos) arbTosLink.href = tos;
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
    if (!window.ethereum) return;
    const hexChain = '0x' + chain.toString(16);
    try {
      await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: hexChain }] });
    } catch (err) {
      if ((err.code === 4902 || err.code === -32603) && CHAIN_ADD_PARAMS[chain]) {
        try {
          await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [CHAIN_ADD_PARAMS[chain]] });
        } catch {}
      }
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
    const multi = t === 'single-select' || t === 'multiple-select';
    optionsWrap.classList.toggle('visible', multi);
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
    const body = document.getElementById('question-body').value.trim();
    if (!body) { setError('field-body'); ok = false; } else clearError('field-body');

    const cat = document.getElementById('question-category').value;
    if (!cat) { setError('field-category'); ok = false; } else clearError('field-category');

    const type = typeSelect.value;
    if (type === 'single-select' || type === 'multiple-select') {
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

  // ── Question encoding ─────────────────────────────────────────────────────────
  function encodeQuestion(type, title, outcomes, category) {
    const parts = [title];
    if (type === 'single-select' || type === 'multiple-select') {
      parts.push(outcomes.map(o => JSON.stringify(o)).join(','));
    }
    parts.push(category);
    return parts.join(DELIM);
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
      const type     = typeSelect.value;
      const title    = document.getElementById('question-body').value.trim();
      const category = document.getElementById('question-category').value;
      const opening  = document.getElementById('opening-date').value;
      const timeout  = parseInt(timeoutSel.value);
      const rewardEth  = rewardInput.value || '0';
      const supportsMinBond = versionMajor(selectedVersion) >= 3;
      const minBondEth = supportsMinBond ? (document.getElementById('question-minbond').value || '0') : '0';
      const outcomes = [...optionsWrap.querySelectorAll('.answer-option-input')]
        .map(i => i.value.trim()).filter(Boolean);

      const templateId = TEMPLATE_IDS[type];
      const qtext = encodeQuestion(type, title, outcomes, category);
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
      const receipt = await withIndicator(rpcInd, () => tx.wait());

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
  document.getElementById('ask-chain-pills').addEventListener('click', e => {
    const pill = e.target.closest('.chain-pill');
    if (!pill) return;
    const chain = parseInt(pill.dataset.chain);
    if (walletAddr) {
      switchChain(chain);
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

  window._setAskWallet = applyWallet;
};
