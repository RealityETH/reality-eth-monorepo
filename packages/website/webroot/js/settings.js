(function () {
'use strict';

const PONDER_KEY     = 'reality.ponderUrl';
const RPC_PREFIX     = 'reality.rpcUrl.';
const BROWSER_RPC_KEY = 'reality.useBrowserRpc';
const DEFAULT_PONDER = '/graphql';

const CHAINS = [
  { id: 1,        name: 'Ethereum',  defaultRpc: 'https://ethereum-rpc.publicnode.com' },
  { id: 10,       name: 'Optimism',  defaultRpc: 'https://optimism-rpc.publicnode.com' },
  { id: 100,      name: 'Gnosis',    defaultRpc: 'https://rpc.gnosischain.com' },
  { id: 137,      name: 'Polygon',   defaultRpc: 'https://polygon-rpc.com' },
  { id: 42161,    name: 'Arbitrum',  defaultRpc: 'https://arbitrum-one-rpc.publicnode.com' },
  { id: 8453,     name: 'Base',      defaultRpc: 'https://base-rpc.publicnode.com' },
  { id: 43114,    name: 'Avalanche', defaultRpc: 'https://avalanche-c-chain-rpc.publicnode.com' },
  { id: 42220,    name: 'Celo',      defaultRpc: 'https://celo-rpc.publicnode.com' },
  { id: 11155111, name: 'Sepolia',   defaultRpc: 'https://ethereum-sepolia-rpc.publicnode.com' },
];

// ── Storage ───────────────────────────────────────────────────────────────────

function getPonderUrl() {
  return localStorage.getItem(PONDER_KEY) || DEFAULT_PONDER;
}
function setPonderUrl(url) {
  const t = (url || '').trim();
  if (t && t !== DEFAULT_PONDER) localStorage.setItem(PONDER_KEY, t);
  else localStorage.removeItem(PONDER_KEY);
}

function getRpcUrl(chainId) {
  return localStorage.getItem(RPC_PREFIX + chainId) || null;
}
function setRpcUrl(chainId, url) {
  const t = (url || '').trim();
  if (t) localStorage.setItem(RPC_PREFIX + chainId, t);
  else localStorage.removeItem(RPC_PREFIX + chainId);
}

function getUseBrowserRpc() {
  const v = localStorage.getItem(BROWSER_RPC_KEY);
  return v === null || v === 'true';
}
function setUseBrowserRpc(val) {
  if (val) localStorage.removeItem(BROWSER_RPC_KEY);
  else localStorage.setItem(BROWSER_RPC_KEY, 'false');
}

// ── Panel infrastructure ──────────────────────────────────────────────────────

let activePanel = null;
let activeAnchor = null;

function closePanel() {
  if (activePanel) { activePanel.remove(); activePanel = null; activeAnchor = null; }
}

function openPanel(anchorEl, width, buildFn) {
  closePanel();
  const panel = document.createElement('div');
  panel.className = 'sp-panel';
  buildFn(panel);
  document.body.appendChild(panel);
  activePanel = panel;
  activeAnchor = anchorEl;

  const rect = anchorEl.getBoundingClientRect();
  let left = rect.left;
  if (left + width > window.innerWidth - 12) left = window.innerWidth - width - 12;
  panel.style.cssText = `position:fixed;top:${rect.bottom + 6}px;left:${Math.max(8, left)}px;width:${width}px;`;

  const outside = (e) => {
    if (!panel.contains(e.target) && !anchorEl.contains(e.target)) {
      closePanel();
      document.removeEventListener('click', outside, true);
    }
  };
  setTimeout(() => document.addEventListener('click', outside, true), 0);
}

// ── Ponder panel ──────────────────────────────────────────────────────────────

function attachPonderPanel(el) {
  el.classList.add('sp-clickable');
  el.style.cursor = 'pointer';
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    if (activeAnchor === el) { closePanel(); return; }
    openPanel(el, 300, (panel) => {
      const isCustom = localStorage.getItem(PONDER_KEY) !== null;
      panel.innerHTML = `
        <div class="sp-title">Ponder Indexer</div>
        <label class="sp-label" for="sp-ponder-url">GraphQL endpoint</label>
        <input id="sp-ponder-url" class="sp-input" type="text"
          placeholder="${DEFAULT_PONDER}"
          value="${isCustom ? getPonderUrl() : ''}">
        <div class="sp-hint">Leave blank to use the default (<code>${DEFAULT_PONDER}</code>)</div>
        <div class="sp-actions"><button class="sp-save">Save &amp; reload</button></div>
      `;
      const inp = panel.querySelector('#sp-ponder-url');
      inp.focus();
      const save = () => { setPonderUrl(inp.value); closePanel(); location.reload(); };
      panel.querySelector('.sp-save').addEventListener('click', save);
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') save();
        if (e.key === 'Escape') closePanel();
      });
    });
  });
}

// ── RPC panel ─────────────────────────────────────────────────────────────────

function attachRpcPanel(el, currentChainId) {
  el.classList.add('sp-clickable');
  el.style.cursor = 'pointer';
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    if (activeAnchor === el) { closePanel(); return; }
    openPanel(el, 340, (panel) => {
      const sorted = currentChainId
        ? [CHAINS.find(c => c.id === currentChainId), ...CHAINS.filter(c => c.id !== currentChainId)].filter(Boolean)
        : CHAINS;

      panel.innerHTML = `
        <div class="sp-title">RPC Endpoints</div>
        <label class="sp-check-row">
          <input type="checkbox" id="sp-use-browser" ${getUseBrowserRpc() ? 'checked' : ''}>
          <span>Use browser wallet (MetaMask) if available</span>
        </label>
        <div class="sp-divider"></div>
        <div class="sp-chain-list" id="sp-chain-list"></div>
        <div class="sp-actions"><button class="sp-save">Save &amp; reload</button></div>
      `;

      const listEl = panel.querySelector('#sp-chain-list');
      for (const chain of sorted) {
        const custom = getRpcUrl(chain.id);
        const isCurrent = chain.id === currentChainId;
        const row = document.createElement('div');
        row.className = 'sp-chain-row' + (isCurrent ? ' sp-chain-current' : '');
        row.innerHTML = `
          <div class="sp-chain-name">
            ${chain.name}${isCurrent ? ' <span class="sp-current-tag">current</span>' : ''}
          </div>
          <input class="sp-input" type="text"
            data-chain="${chain.id}"
            placeholder="${chain.defaultRpc}"
            value="${custom || ''}">
        `;
        listEl.appendChild(row);
      }

      const save = () => {
        setUseBrowserRpc(panel.querySelector('#sp-use-browser').checked);
        for (const inp of panel.querySelectorAll('[data-chain]'))
          setRpcUrl(Number(inp.dataset.chain), inp.value);
        closePanel();
        location.reload();
      };
      panel.querySelector('.sp-save').addEventListener('click', save);
    });
  });
}

// ── Styles ────────────────────────────────────────────────────────────────────

function injectStyles() {
  if (document.getElementById('settings-styles')) return;
  const s = document.createElement('style');
  s.id = 'settings-styles';
  s.textContent = `
    .data-ind.sp-clickable { cursor: pointer; }
    .data-ind.sp-clickable:hover:not(.active) {
      color: var(--text-muted) !important; background: var(--bg-card-hover) !important;
    }
    .sp-panel {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: 8px; padding: 14px 16px; z-index: 200;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }
    .sp-title {
      font-size: 11px; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.06em; color: var(--text-dim); margin-bottom: 12px;
    }
    .sp-label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 6px; }
    .sp-input {
      width: 100%; padding: 6px 9px; box-sizing: border-box;
      background: var(--bg); border: 1px solid var(--border);
      border-radius: 5px; color: var(--text); font-size: 12px;
      font-family: 'SFMono-Regular', Consolas, monospace; outline: none;
    }
    .sp-input:focus { border-color: var(--accent); }
    .sp-hint { font-size: 11px; color: var(--text-dim); margin-top: 5px; line-height: 1.4; }
    .sp-hint code { font-family: monospace; color: var(--text-muted); }
    .sp-check-row {
      display: flex; align-items: center; gap: 8px; cursor: pointer;
      font-size: 13px; color: var(--text-muted); user-select: none;
    }
    .sp-check-row input { width: 14px; height: 14px; flex-shrink: 0; cursor: pointer; }
    .sp-divider { border-top: 1px solid var(--border-subtle); margin: 12px 0; }
    .sp-chain-list {
      display: flex; flex-direction: column; gap: 10px;
      max-height: 240px; overflow-y: auto;
    }
    .sp-chain-name {
      font-size: 12px; color: var(--text-muted); margin-bottom: 4px;
      display: flex; align-items: center; gap: 6px;
    }
    .sp-chain-current .sp-chain-name { color: var(--text); font-weight: 500; }
    .sp-current-tag {
      font-size: 10px; font-weight: 600; text-transform: uppercase;
      color: var(--accent); letter-spacing: 0.05em;
    }
    .sp-actions { display: flex; justify-content: flex-end; margin-top: 14px; }
    .sp-save {
      padding: 6px 16px; background: var(--accent); border: none;
      border-radius: 5px; color: #fff; font-size: 13px;
      font-weight: 600; cursor: pointer; transition: opacity 0.15s;
    }
    .sp-save:hover { opacity: 0.85; }
  `;
  document.head.appendChild(s);
}

// Call immediately if DOM is already ready (scripts at bottom of body often
// find readyState 'interactive'), otherwise wait for DOMContentLoaded.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectStyles);
} else {
  injectStyles();
}

window.RealitySettings = {
  getPonderUrl, setPonderUrl,
  getRpcUrl, setRpcUrl,
  getUseBrowserRpc, setUseBrowserRpc,
  attachPonderPanel, attachRpcPanel,
};

})();
