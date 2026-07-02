window.RealityWatchConfigure = window.RealityWatchConfigure || {};

window.RealityWatchConfigure.mount = async function (rawParams) {
  const KNOWN_CHAINS = [
    { id: 1,        label: 'Mainnet'  },
    { id: 100,      label: 'Gnosis'   },
    { id: 137,      label: 'Polygon'  },
    { id: 10,       label: 'Optimism' },
    { id: 42161,    label: 'Arbitrum' },
    { id: 11155111, label: 'Sepolia'  },
  ];

  const ARG_DELIMITER = '␟';

  const editId         = rawParams?.id         ? Number(rawParams.id)                : null;
  const initChainId    = rawParams?.chainId     ? Number(rawParams.chainId)           : null;
  const initTplId      = rawParams?.templateId  || null;
  const initQuestionId = rawParams?.questionId  || null;
  const initContract   = rawParams?.contract?.toLowerCase() || null;

  // ── State ──────────────────────────────────────────────────────────────────
  let selectedChains   = initChainId ? [initChainId] : [];
  let useTemplate      = initTplId != null;
  let templateId       = initTplId;
  let categoryValue    = null;
  let useCategory      = false;
  let creatorAddress   = null;
  let useCreator       = false;
  let contractsData    = null;
  let selectedContract = initContract;
  const _contractLabels = {};

  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function shortAddr(addr) {
    return String(addr).slice(0, 6) + '…' + String(addr).slice(-4);
  }

  // ── Creator label lookup ────────────────────────────────────────────────────
  let _integrations = null;
  async function getCreatorLabel(addr) {
    if (!_integrations) {
      _integrations = window.RealityWebsiteData?.integrations || {};
    }
    const integId = _integrations?.creatorMap?.[addr.toLowerCase()];
    if (integId && _integrations?.integrations?.[integId]?.name) {
      return _integrations.integrations[integId].name;
    }
    return shortAddr(addr);
  }

  // ── Contract / version select ───────────────────────────────────────────────
  async function loadContracts() {
    if (contractsData) return contractsData;
    try {
      contractsData = window.RealityWebsiteData?.contracts || {};
    } catch { contractsData = {}; }
    return contractsData;
  }

  function getContractsForChains(data, chainIds) {
    const seen = new Set();
    const result = [];
    for (const chainId of chainIds) {
      const chain = data[String(chainId)] || {};
      for (const [token, versions] of Object.entries(chain)) {
        for (const [ver, info] of Object.entries(versions)) {
          if (!info?.address) continue;
          const addr = info.address.toLowerCase();
          if (seen.has(addr)) continue;
          seen.add(addr);
          const verShort = ver.replace('RealityETH_ERC20-', 'ERC20 v').replace('RealityETH-', 'v');
          const label = `${token} ${verShort}`;
          _contractLabels[addr] = label;
          result.push({ address: addr, label });
        }
      }
    }
    return result;
  }

  async function buildVersionSelect() {
    const row = document.getElementById('version-row');
    if (!useTemplate || selectedChains.length === 0) {
      row.style.display = 'none';
      return;
    }
    const data = await loadContracts();
    const contracts = getContractsForChains(data, selectedChains);
    if (contracts.length <= 1) {
      if (contracts.length === 1 && !selectedContract) selectedContract = contracts[0].address;
      row.style.display = 'none';
      return;
    }
    const sel = document.getElementById('version-select');
    sel.innerHTML = '<option value="">Any version</option>';
    for (const { address, label } of contracts) {
      const opt = document.createElement('option');
      opt.value = address;
      opt.textContent = label;
      opt.selected = address === selectedContract;
      sel.appendChild(opt);
    }
    row.style.display = '';
  }

  // ── Chain pills ─────────────────────────────────────────────────────────────
  function renderChainPills() {
    const container = document.getElementById('wc-chain-pills');
    const allChains = initChainId
      ? [initChainId, ...KNOWN_CHAINS.map(c => c.id).filter(id => id !== initChainId)]
      : KNOWN_CHAINS.map(c => c.id);

    container.innerHTML = [...new Set(allChains)].map(id => {
      const info   = KNOWN_CHAINS.find(c => c.id === id);
      const label  = info?.label || `Chain ${id}`;
      const active = selectedChains.includes(id);
      return `<button class="chain-pill${active ? ' active' : ''}" data-chain="${id}">${esc(label)}</button>`;
    }).join('');

    container.querySelectorAll('.chain-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.chain);
        if (selectedChains.includes(id)) {
          selectedChains = selectedChains.filter(c => c !== id);
        } else {
          selectedChains.push(id);
        }
        btn.classList.toggle('active', selectedChains.includes(id));
        buildVersionSelect().then(() => schedulePreview());
      });
    });
  }

  // ── Template toggle ─────────────────────────────────────────────────────────
  if (templateId) {
    document.getElementById('template-card').style.display = '';
    document.getElementById('template-label').textContent  = `#${templateId}`;
  }
  document.getElementById('template-toggle').addEventListener('change', e => {
    useTemplate = e.target.checked;
    buildVersionSelect().then(() => schedulePreview());
  });

  // ── Category toggle + input ─────────────────────────────────────────────────
  document.getElementById('category-toggle').addEventListener('change', e => {
    useCategory = e.target.checked;
    document.getElementById('category-value-row').style.display = useCategory ? '' : 'none';
    schedulePreview();
  });
  document.getElementById('category-input').addEventListener('input', () => schedulePreview());

  // ── Creator toggle + input ──────────────────────────────────────────────────
  document.getElementById('creator-toggle').addEventListener('change', e => {
    useCreator = e.target.checked;
    document.getElementById('creator-value-row').style.display = useCreator ? '' : 'none';
    schedulePreview();
  });
  document.getElementById('creator-input').addEventListener('input', () => schedulePreview());

  document.getElementById('version-select').addEventListener('change', e => {
    selectedContract = e.target.value || null;
    schedulePreview();
  });

  // ── Keyword suggestions ─────────────────────────────────────────────────────
  function renderSuggestions(items) {
    if (items.length === 0) return;
    const wrap  = document.getElementById('suggestions-wrap');
    const chips = document.getElementById('suggestion-chips');
    wrap.style.display = '';

    chips.innerHTML = items.map(item =>
      `<button class="suggestion-chip" data-value="${esc(item.value)}">${esc(item.label)}</button>`
    ).join('');

    const input = document.getElementById('keyword-input');
    chips.querySelectorAll('.suggestion-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const current = input.value.split(',').map(s => s.trim()).filter(Boolean);
        const val = btn.dataset.value;
        if (!current.map(s => s.toLowerCase()).includes(val.toLowerCase())) {
          current.push(val);
          input.value = current.join(', ');
          schedulePreview();
        }
        btn.disabled = true;
      });
    });
  }

  // ── Load source question ────────────────────────────────────────────────────
  async function loadSourceQuestion() {
    if (!initQuestionId || editId != null) return;
    const GRAPHQL = window.RealitySettings?.getPonderUrl() || '/graphql';
    try {
      const r = await fetch(GRAPHQL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ query: `{ question(id: ${JSON.stringify(initQuestionId)}) { data title category creator } }` }),
      });
      const q = (await r.json()).data?.question;
      if (!q) return;

      const title    = (q.title || q.data || '').toLowerCase();
      const args     = (q.data || '').split(ARG_DELIMITER).map(s => s.trim()).filter(Boolean);
      const suggestions = [];
      const seen        = new Set();

      for (const arg of args) {
        if (arg.length < 3 || arg.length > 80) continue;
        if (!title.includes(arg.toLowerCase())) continue;
        const key = arg.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        suggestions.push({ label: arg, value: arg });
      }

      renderSuggestions(suggestions);

      const cat = (q.category || '').trim();
      if (cat.length >= 2) {
        useCategory = true;
        document.getElementById('category-input').value = cat;
        document.getElementById('category-value-row').style.display = '';
        document.getElementById('category-toggle').checked = true;
      }

      if (q.creator) {
        creatorAddress = q.creator.toLowerCase();
        document.getElementById('creator-input').value = creatorAddress;
        const label = await getCreatorLabel(creatorAddress);
        if (label !== shortAddr(creatorAddress)) {
          const nameEl = document.getElementById('creator-name');
          nameEl.textContent = label;
          nameEl.style.display = '';
        }
      }
    } catch {}
  }

  // ── Preview ─────────────────────────────────────────────────────────────────
  let _previewTimer;
  document.getElementById('keyword-input').addEventListener('input', () => schedulePreview());

  function schedulePreview() {
    clearTimeout(_previewTimer);
    _previewTimer = setTimeout(updatePreview, 350);
  }

  function buildConditions() {
    const c = {};
    if (selectedChains.length > 0) {
      c.chainId = selectedChains.length === 1 ? selectedChains[0] : selectedChains;
    }
    if (useTemplate && templateId) {
      c.templateId = templateId;
    }
    if (useCategory) {
      const cat = document.getElementById('category-input').value.trim();
      if (cat) c.category = cat;
    }
    if (useCreator) {
      const creator = document.getElementById('creator-input').value.trim().toLowerCase();
      if (creator) c.creator = creator;
    }
    if (useTemplate && selectedContract) {
      c.contract = selectedContract;
    }
    const kws = document.getElementById('keyword-input').value
      .split(',').map(s => s.trim()).filter(Boolean);
    if (kws.length > 0) c.keywords = kws;
    return c;
  }

  async function updatePreview() {
    const GRAPHQL    = window.RealitySettings?.getPonderUrl() || '/graphql';
    const conditions = buildConditions();

    const filters = [];
    if (conditions.chainId != null) {
      filters.push(Array.isArray(conditions.chainId)
        ? `chainId_in:[${conditions.chainId.join(',')}]`
        : `chainId:${conditions.chainId}`);
    }
    if (conditions.templateId != null) {
      filters.push(`templateId:"${conditions.templateId}"`);
    }
    if (conditions.category != null) {
      filters.push(`category:"${conditions.category}"`);
    }
    if (conditions.creator != null) {
      filters.push(`creator:"${conditions.creator}"`);
    }
    if (conditions.contract != null) {
      filters.push(`contract:"${conditions.contract}"`);
    }
    const whereClause = filters.length > 0 ? `where:{${filters.join(',')}}` : '';

    const countEl = document.getElementById('preview-count');
    const listEl  = document.getElementById('preview-list');
    countEl.innerHTML = 'Loading…';
    listEl.innerHTML  = '';

    try {
      const r = await fetch(GRAPHQL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `{
          questions(${whereClause},orderBy:"createdTimestamp",orderDirection:"desc",limit:50) {
            items { id title data chainId templateId category contract creator createdTimestamp }
          }
        }` }),
      });
      const data    = (await r.json()).data;
      const all     = data?.questions?.items || [];
      const matched = all.filter(q => RealityWatches.questionMatchesCondition(q, conditions));

      countEl.innerHTML = `<strong>${matched.length}</strong> matching question${matched.length === 1 ? '' : 's'}`;
      listEl.innerHTML  = matched.slice(0, 10).map(q => {
        const title = q.title || q.data || q.id;
        const url   = `#!/network/${q.chainId}/question/${esc(q.id)}`;
        const chain = KNOWN_CHAINS.find(c => c.id === Number(q.chainId))?.label || `Chain ${q.chainId}`;
        return `<div class="preview-item">
          <a href="${url}" target="_blank">${esc(title)}</a>
          <span class="pi-meta">${esc(chain)} · Template #${esc(q.templateId || '0')}</span>
        </div>`;
      }).join('');
      if (matched.length > 10) {
        listEl.innerHTML += `<div class="preview-item" style="text-align:center;color:var(--text-dim)">… and ${matched.length - 10} more</div>`;
      }
    } catch {
      countEl.textContent = 'Could not load preview';
    }
  }

  // ── Save / delete ───────────────────────────────────────────────────────────
  document.getElementById('btn-save').addEventListener('click', async () => {
    const conditions = buildConditions();
    const btn    = document.getElementById('btn-save');
    const status = document.getElementById('save-status');
    btn.disabled = true;
    try {
      if (editId != null) {
        await RealityWatches.updateConditionWatch(editId, conditions);
      } else {
        await RealityWatches.addConditionWatch(conditions);
        location.hash = '#!/watches';
      }
      status.style.display = '';
      setTimeout(() => { status.style.display = 'none'; }, 2000);
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById('btn-delete').addEventListener('click', async () => {
    if (!confirm('Delete this watch?')) return;
    if (editId != null) await RealityWatches.removeConditionWatch(editId);
    location.hash = '#!/watches';
  });

  // ── Load existing watch (edit mode) ────────────────────────────────────────
  async function loadExistingWatch() {
    if (editId == null) return;
    const all = await RealityWatches.getConditionWatches();
    const cw  = all.find(c => c.id === editId);
    if (!cw) return;

    document.getElementById('btn-delete').style.display = '';

    const c = cw.conditions;
    if (c.chainId != null) {
      selectedChains = Array.isArray(c.chainId) ? c.chainId : [c.chainId];
    }
    if (c.templateId != null) {
      templateId  = c.templateId;
      useTemplate = true;
      document.getElementById('template-card').style.display = '';
      document.getElementById('template-label').textContent  = `#${templateId}`;
      document.getElementById('template-toggle').checked     = true;
    }
    if (c.category != null) {
      useCategory = true;
      document.getElementById('category-input').value = c.category;
      document.getElementById('category-value-row').style.display = '';
      document.getElementById('category-toggle').checked = true;
    }
    if (c.creator != null) {
      creatorAddress = c.creator;
      useCreator     = true;
      document.getElementById('creator-input').value = c.creator;
      document.getElementById('creator-value-row').style.display = '';
      document.getElementById('creator-toggle').checked = true;
      const label = await getCreatorLabel(c.creator);
      if (label !== shortAddr(c.creator)) {
        const nameEl = document.getElementById('creator-name');
        nameEl.textContent = label;
        nameEl.style.display = '';
      }
    }
    if (c.keywords?.length) {
      document.getElementById('keyword-input').value = c.keywords.join(', ');
    }
    if (c.contract != null) {
      selectedContract = c.contract;
    }
    renderChainPills();
    await buildVersionSelect();
    updatePreview();
  }

  // ── Init ────────────────────────────────────────────────────────────────────
  if (editId != null) {
    document.getElementById('page-title').textContent = 'Edit watch';
    document.title = 'reality.eth — Edit Watch';
  } else if (initQuestionId == null) {
    document.getElementById('page-title').textContent = 'Watch Questions';
    document.title = 'reality.eth — Watch Questions';
  }

  renderChainPills();
  RealityWatches.updateBellBadge();
  await loadSourceQuestion();
  await loadExistingWatch();
  await buildVersionSelect();
  updatePreview();
};
