window.RealityTemplates = window.RealityTemplates || {};

window.RealityTemplates.mount = async function (params) {
  'use strict';

  const GRAPHQL   = window.RealitySettings?.getPonderUrl() || '/graphql';
  const PAGE_SIZE = 25;

  const CHAIN_NAME = {
    1: 'Ethereum', 100: 'Gnosis', 137: 'Polygon', 42161: 'Arbitrum',
    10: 'Optimism', 8453: 'Base', 130: 'Unichain', 11155111: 'Sepolia',
  };
  const TYPE_LABELS = {
    'bool': 'Yes / No', 'uint': 'Number', 'datetime': 'Date / Time',
    'single-select': 'Single choice', 'multiple-select': 'Multiple choice',
  };

  const TEMPLATE_FIELDS = `id templateId contract chainId user questionText createdTxHash createdTimestamp`;

  // ── State ────────────────────────────────────────────────────────────────────
  let cursor         = null;
  let hasMore        = false;
  let loading        = false;
  let selectedChain  = '';
  let selectedToken  = '';
  let selectedVersion = '';
  let contractsData  = null;

  // ── DOM helpers ──────────────────────────────────────────────────────────────
  const resultsList  = document.getElementById('results-list');
  const emptyState   = document.getElementById('empty-state');
  const errorState   = document.getElementById('error-state');
  const statusMsg    = document.getElementById('status-msg');
  const totalCount   = document.getElementById('total-count');
  const loadMoreWrap = document.getElementById('tv-load-more-wrap');
  const loadMoreBtn  = document.getElementById('tv-load-more-btn');

  // ── GraphQL ──────────────────────────────────────────────────────────────────
  const ponderInd = document.getElementById('ind-ponder');
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

  // ── Contracts ────────────────────────────────────────────────────────────────
  async function loadContracts() {
    if (contractsData) return contractsData;
    const res = await fetch('generated/contracts.json');
    contractsData = await res.json();
    return contractsData;
  }

  function getTokensForChain(chain) {
    return Object.keys(contractsData?.[String(chain)] || {});
  }

  function getVersionsForToken(chain, token) {
    return Object.entries(contractsData?.[String(chain)]?.[token] || {})
      .filter(([, v]) => v?.address)
      .sort(([a], [b]) => {
        const key = s => { const m = s.match(/(\d+)\.(\d+)$/); return m ? parseInt(m[1])*100+parseInt(m[2]) : 0; };
        return key(b) - key(a);
      })
      .map(([k]) => k);
  }

  function getContractAddressesForFilter() {
    if (!selectedChain || !contractsData) return null;
    const chainData = contractsData[String(selectedChain)] || {};
    const tokens = selectedToken ? [selectedToken] : Object.keys(chainData);
    const addrs = [];
    for (const tok of tokens) {
      const versions = selectedVersion ? [selectedVersion] : Object.keys(chainData[tok] || {});
      for (const ver of versions) {
        const addr = chainData[tok]?.[ver]?.address;
        if (addr) addrs.push(addr.toLowerCase());
      }
    }
    return addrs.length ? addrs : null;
  }

  function updateTokenPills() {
    if (!selectedChain) {
      document.getElementById('token-version-row').style.display = 'none';
      selectedToken = '';
      selectedVersion = '';
      return;
    }
    const tokens = getTokensForChain(selectedChain);
    if (!tokens.length) {
      document.getElementById('token-version-row').style.display = 'none';
      return;
    }

    document.getElementById('token-version-row').style.display = '';
    const container = document.getElementById('token-chips');
    container.innerHTML = '';

    const allChip = makeChip('All tokens', '', 'token-chip', selectedToken === '');
    container.appendChild(allChip);
    for (const tok of tokens) {
      container.appendChild(makeChip(tok, tok, 'token-chip', tok === selectedToken));
    }

    updateVersionSelect();
  }

  function updateVersionSelect() {
    const field = document.getElementById('version-field');
    const sel   = document.getElementById('s-version');

    if (!selectedChain || !selectedToken) { field.style.display = 'none'; return; }

    const versions = getVersionsForToken(selectedChain, selectedToken);
    if (versions.length <= 1) { field.style.display = 'none'; return; }

    field.style.display = '';
    const prev = sel.value;
    sel.innerHTML = `<option value="">All versions</option>` +
      versions.map(v => `<option value="${v}"${v === prev ? ' selected' : ''}>${v}</option>`).join('');
    if (!versions.includes(prev)) selectedVersion = '';
  }

  function makeChip(label, value, cls, active) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `chain-chip${active ? ' active' : ''}`;
    btn.dataset.value = value;
    btn.textContent = label;
    return btn;
  }

  // ── Where clause ─────────────────────────────────────────────────────────────
  function buildWhere() {
    const keyword = document.getElementById('s-keyword').value.trim();
    const creator = document.getElementById('s-creator').value.trim().toLowerCase();
    const idVal   = document.getElementById('s-id').value.trim();
    const filters = [];

    if (keyword) filters.push({ questionText_contains: keyword });
    if (creator) filters.push({ user_contains: creator });
    if (idVal)   filters.push({ templateId: parseInt(idVal) });
    if (selectedChain) filters.push({ chainId: parseInt(selectedChain) });

    const addrs = getContractAddressesForFilter();
    if (addrs) {
      if (addrs.length === 1) filters.push({ contract: addrs[0] });
      else filters.push({ contract_in: addrs });
    }

    if (filters.length === 0) return {};
    if (filters.length === 1) return filters[0];
    return { AND: filters };
  }

  async function fetchPage(after, reset) {
    if (loading) return;
    loading = true;
    setLoading(true);

    try {
      const where = buildWhere();
      const vars  = { limit: PAGE_SIZE, after: after || null };
      const data  = await gql(
        `query($limit: Int, $after: String, $where: templateFilter) {
          templates(limit: $limit, after: $after, where: $where,
                    orderBy: "createdTimestamp", orderDirection: "desc") {
            items { ${TEMPLATE_FIELDS} }
            pageInfo { hasNextPage endCursor }
            totalCount
          }
        }`,
        { ...vars, where: Object.keys(where).length ? where : undefined }
      );

      const { items, pageInfo, totalCount: tc } = data.templates;

      if (reset) resultsList.innerHTML = '';

      if (reset && !items.length) {
        emptyState.style.display = '';
      } else {
        emptyState.style.display = 'none';
        for (const t of items) resultsList.appendChild(buildCard(t));
      }

      cursor  = pageInfo.endCursor;
      hasMore = pageInfo.hasNextPage;
      totalCount.textContent = tc ? `${tc.toLocaleString()} total` : '';
      loadMoreWrap.style.display = hasMore ? '' : 'none';
      loadMoreBtn.disabled = false;
      errorState.style.display = 'none';

    } catch (err) {
      ponderInd?.classList.add('offline');
      errorState.textContent = `Error: ${err.message}`;
      errorState.style.display = '';
    } finally {
      loading = false;
      setLoading(false);
    }
  }

  // ── Card rendering ────────────────────────────────────────────────────────────
  function buildCard(t) {
    let tmpl = {};
    try { tmpl = JSON.parse(t.questionText || '{}'); } catch {}

    const a = document.createElement('a');
    a.className = 't-card';
    a.href = `#!/template/${t.id}`;

    const top = document.createElement('div');
    top.className = 't-card-top';

    const idBadge = document.createElement('span');
    idBadge.className = 't-id';
    idBadge.textContent = `#${t.templateId}`;
    top.appendChild(idBadge);

    if (tmpl.type) {
      const b = document.createElement('span');
      b.className = 'badge badge-type';
      b.textContent = TYPE_LABELS[tmpl.type] || tmpl.type;
      top.appendChild(b);
    }
    if (tmpl.category) {
      const b = document.createElement('span');
      b.className = 'badge badge-cat';
      b.textContent = tmpl.category;
      top.appendChild(b);
    }
    if (tmpl.lang && tmpl.lang !== 'en') {
      const b = document.createElement('span');
      b.className = 'badge badge-lang';
      b.textContent = tmpl.lang;
      top.appendChild(b);
    }

    const chainName = CHAIN_NAME[t.chainId] || `Chain ${t.chainId}`;
    const chainB = document.createElement('span');
    chainB.style.cssText = 'margin-left:auto; font-size:11px; color:var(--text-dim);';
    chainB.textContent = chainName;
    top.appendChild(chainB);

    const titleEl = document.createElement('div');
    titleEl.className = 't-title';
    if (tmpl.title) {
      const escaped = tmpl.title.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      titleEl.innerHTML = escaped.replace(/%s/g, '<span class="ph">%s</span>');
    } else {
      titleEl.style.color = 'var(--text-dim)';
      titleEl.textContent = '(no title)';
    }

    const footer = document.createElement('div');
    footer.className = 't-footer';

    const creatorItem = document.createElement('div');
    creatorItem.className = 't-footer-item';
    creatorItem.innerHTML = `Creator: <span>${t.user.slice(0,10)}…${t.user.slice(-6)}</span>`;
    footer.appendChild(creatorItem);

    if (t.createdTimestamp) {
      const date = new Date(parseInt(t.createdTimestamp) * 1000);
      const dateItem = document.createElement('div');
      dateItem.className = 't-footer-item';
      dateItem.innerHTML = `Created: <span>${date.toLocaleDateString()}</span>`;
      footer.appendChild(dateItem);
    }

    if (tmpl.outcomes?.length) {
      const outItem = document.createElement('div');
      outItem.className = 't-footer-item';
      outItem.textContent = `${tmpl.outcomes.length} options`;
      footer.appendChild(outItem);
    }

    a.appendChild(top);
    a.appendChild(titleEl);
    a.appendChild(footer);
    return a;
  }

  // ── UI helpers ────────────────────────────────────────────────────────────────
  function setLoading(on) {
    if (on) {
      statusMsg.innerHTML = '<span class="loading-spinner"></span> Loading…';
    } else {
      statusMsg.textContent = '';
    }
  }

  function runSearch() {
    cursor = null;
    fetchPage(null, true);
  }

  // ── Events ────────────────────────────────────────────────────────────────────
  document.getElementById('search-btn').addEventListener('click', runSearch);

  ['s-keyword', 's-creator', 's-id'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') runSearch();
    });
  });

  document.getElementById('chain-chips').addEventListener('click', e => {
    const chip = e.target.closest('.chain-chip');
    if (!chip) return;
    selectedChain = chip.dataset.chain;
    selectedToken = '';
    selectedVersion = '';
    for (const c of document.querySelectorAll('#chain-chips .chain-chip')) {
      c.classList.toggle('active', c === chip);
    }
    updateTokenPills();
    runSearch();
  });

  document.getElementById('token-chips').addEventListener('click', e => {
    const chip = e.target.closest('.chain-chip');
    if (!chip) return;
    selectedToken = chip.dataset.value;
    selectedVersion = '';
    for (const c of document.querySelectorAll('#token-chips .chain-chip')) {
      c.classList.toggle('active', c === chip);
    }
    updateVersionSelect();
    runSearch();
  });

  document.getElementById('s-version').addEventListener('change', e => {
    selectedVersion = e.target.value;
    runSearch();
  });

  loadMoreBtn.addEventListener('click', () => {
    loadMoreBtn.disabled = true;
    fetchPage(cursor, false);
  });

  // ── Wallet ────────────────────────────────────────────────────────────────────
  window._setTemplatesWallet = function (addr) {
    if (addr) {
      document.getElementById('s-creator').value = addr;
      runSearch();
    }
  };

  // ── Pre-fill from params ──────────────────────────────────────────────────────
  if (params?.creator) document.getElementById('s-creator').value = params.creator;
  if (params?.keyword) document.getElementById('s-keyword').value = params.keyword;
  if (params?.id)      document.getElementById('s-id').value      = params.id;

  // ── Init ──────────────────────────────────────────────────────────────────────
  document.title = 'reality.eth — Templates';
  loadContracts().catch(() => {});
  fetchPage(null, true);
};
