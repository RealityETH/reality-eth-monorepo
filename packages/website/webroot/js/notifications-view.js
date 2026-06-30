window.RealityNotifications = window.RealityNotifications || {};

window.RealityNotifications.mount = async function () {
  const TYPE_ICON = {
    new_answer:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    finalized:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
    arb_requested: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    arb_resolved:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    new_question:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
  };

  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function fmtTime(ts) {
    if (!ts) return '';
    const d   = new Date(ts * 1000);
    const now = Date.now();
    const diff = now - d.getTime();
    if (diff < 60000)   return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  }

  // Load contracts.json once to resolve chainId from contract address for
  // older notifications that were stored before chainId was persisted.
  let _contractsCache = null;
  async function loadContracts() {
    if (_contractsCache) return _contractsCache;
    try {
      const r = await fetch('generated/contracts.json');
      _contractsCache = await r.json();
    } catch { _contractsCache = {}; }
    return _contractsCache;
  }

  function resolveChainId(n, contractsData) {
    if (n.chainId) return n.chainId;
    const contractAddr = typeof n.questionId === 'string'
      ? n.questionId.slice(0, 42).toLowerCase() : null;
    if (!contractAddr?.startsWith('0x')) return null;
    for (const [chainId, tokens] of Object.entries(contractsData || {})) {
      for (const versions of Object.values(tokens)) {
        for (const info of Object.values(versions)) {
          if (info?.address?.toLowerCase() === contractAddr) return parseInt(chainId);
        }
      }
    }
    return null;
  }

  async function render() {
    const list = document.getElementById('notif-list');
    const notifications = await RealityWatches.getNotifications(200);

    if (notifications.length === 0) {
      list.innerHTML = `<div class="empty-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <p>No notifications yet</p>
        <small>Star questions or <a href="#!/watches" style="color:var(--accent)">configure watches</a> to get notified.</small>
      </div>`;
      return;
    }

    const contractsData = await loadContracts();

    list.innerHTML = notifications.map(n => {
      const icon     = TYPE_ICON[n.type] || TYPE_ICON.new_answer;
      const chainId  = resolveChainId(n, contractsData);
      const url      = `#!/network/${chainId ?? 'unknown'}/question/${esc(n.questionId)}`;
      const condLink = n.conditionId
        ? `<a class="notif-cond-link" href="#!/watch-configure?id=${esc(n.conditionId)}">View watch →</a>`
        : '';
      return `<div class="notif-item${n.seen ? '' : ' unseen'}" data-id="${esc(n.id)}">
        <div class="notif-icon ${esc(n.type)}">${icon}</div>
        <div class="notif-body">
          <div class="notif-detail">${esc(n.detail || n.type.replace('_', ' '))}</div>
          <div class="notif-title"><a href="${url}">${esc(n.title)}</a></div>
          <div class="notif-meta">
            <span>${fmtTime(n.timestamp)}</span>
            ${condLink}
          </div>
        </div>
      </div>`;
    }).join('');
  }

  await render();
  RealityWatches.updateBellBadge();

  document.getElementById('mark-all-btn').addEventListener('click', async () => {
    await RealityWatches.markAllSeen();
    document.querySelectorAll('#notifications-view .notif-item.unseen').forEach(el => el.classList.remove('unseen'));
    RealityWatches.updateBellBadge();
  });
};
