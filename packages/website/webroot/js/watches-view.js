window.RealityWatchesView = window.RealityWatchesView || {};

window.RealityWatchesView.mount = async function () {
  function chainLabel(id) { return window.RealityChains?.name(id) || `Chain ${id}`; }

  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function shortAddr(addr) {
    return String(addr).slice(0, 6) + '…' + String(addr).slice(-4);
  }

  function describeWatch(cw) {
    const c = cw.conditions;
    const parts = [];
    if (c.chainId != null) {
      const ids = Array.isArray(c.chainId) ? c.chainId : [c.chainId];
      parts.push(ids.map(id => chainLabel(id)).join(', '));
    }
    if (c.templateId != null) parts.push(`Template #${c.templateId}`);
    if (c.contract   != null) parts.push(shortAddr(c.contract));
    if (c.category   != null) parts.push(`Category: ${c.category}`);
    if (c.creator    != null) parts.push(`Creator: ${shortAddr(c.creator)}`);
    if (c.keywords?.length)   parts.push(`Keywords: ${c.keywords.join(', ')}`);
    return parts.join(' · ') || 'All questions';
  }

  async function render() {
    const listEl = document.getElementById('watches-list');
    const all    = await RealityWatches.getConditionWatches();

    if (all.length === 0) {
      listEl.innerHTML = `<div class="empty-state">
        <p>No watches configured yet.</p>
        <a class="btn-new" href="#!/watch-configure">+ New watch</a>
      </div>`;
      return;
    }

    listEl.innerHTML = all.map(cw => `
      <div class="watch-row">
        <div class="watch-row-info">
          <div class="watch-row-label"><a href="#!/watch-configure?id=${esc(cw.id)}">${esc(describeWatch(cw))}</a></div>
        </div>
        <div class="watch-row-actions">
          <button class="watch-row-delete" data-id="${esc(cw.id)}">Delete</button>
        </div>
      </div>`).join('');

    listEl.querySelectorAll('.watch-row-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this watch?')) return;
        await RealityWatches.removeConditionWatch(Number(btn.dataset.id));
        render();
      });
    });
  }

  RealityWatches.updateBellBadge();
  await render();
};
