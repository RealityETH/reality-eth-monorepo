(function () {
'use strict';

const STORAGE_KEY = 'reality.ponderUrl';
const DEFAULT_URL = '/graphql';

function getPonderUrl() {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_URL;
}

function setPonderUrl(url) {
  const trimmed = (url || '').trim();
  if (trimmed && trimmed !== DEFAULT_URL) {
    localStorage.setItem(STORAGE_KEY, trimmed);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Inject the gear button and panel into the header
function init() {
  const headerInner = document.querySelector('.header-inner');
  if (!headerInner) return;

  // Gear button — sits just before the wallet button
  const btn = document.createElement('button');
  btn.id = 'settings-btn';
  btn.title = 'Settings';
  btn.setAttribute('aria-label', 'Settings');
  btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>`;

  // Panel
  const panel = document.createElement('div');
  panel.id = 'settings-panel';
  panel.hidden = true;

  const current = getPonderUrl();
  const isCustom = localStorage.getItem(STORAGE_KEY) !== null;

  panel.innerHTML = `
    <div class="sp-title">Settings</div>
    <label class="sp-label" for="sp-ponder-url">Ponder GraphQL URL</label>
    <input id="sp-ponder-url" class="sp-input" type="text"
      placeholder="${DEFAULT_URL}"
      value="${isCustom ? current : ''}">
    <div class="sp-hint">Leave blank to use the default (<code>${DEFAULT_URL}</code>)</div>
    <div class="sp-actions">
      <button class="sp-save">Save</button>
    </div>
  `;

  // Position panel relative to wrapper
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:relative;display:flex;align-items:center;';
  wrap.appendChild(btn);
  wrap.appendChild(panel);

  const walletBtn = document.getElementById('wallet-btn');
  if (walletBtn) headerInner.insertBefore(wrap, walletBtn);
  else           headerInner.appendChild(wrap);

  // Toggle panel
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.hidden = !panel.hidden;
    if (!panel.hidden) panel.querySelector('#sp-ponder-url').focus();
  });

  // Save
  panel.querySelector('.sp-save').addEventListener('click', () => {
    const val = panel.querySelector('#sp-ponder-url').value.trim();
    setPonderUrl(val);
    panel.hidden = true;
    // Reload so the new URL is used immediately
    location.reload();
  });

  // Also save on Enter
  panel.querySelector('#sp-ponder-url').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') panel.querySelector('.sp-save').click();
    if (e.key === 'Escape') panel.hidden = true;
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) panel.hidden = true;
  });

  injectStyles();
}

function injectStyles() {
  if (document.getElementById('settings-styles')) return;
  const s = document.createElement('style');
  s.id = 'settings-styles';
  s.textContent = `
    #settings-btn {
      background: transparent;
      border: 1px solid transparent;
      border-radius: 5px;
      color: var(--text-dim);
      cursor: pointer;
      padding: 5px 6px;
      display: flex;
      align-items: center;
      transition: color 0.15s, border-color 0.15s;
    }
    #settings-btn:hover { color: var(--text-muted); border-color: var(--border); }
    #settings-btn.active { color: var(--accent); border-color: var(--accent); }

    #settings-panel {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 320px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
      z-index: 200;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }
    .sp-title {
      font-size: 12px; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.06em; color: var(--text-dim); margin-bottom: 12px;
    }
    .sp-label {
      display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 6px;
    }
    .sp-input {
      width: 100%; padding: 7px 10px;
      background: var(--bg); border: 1px solid var(--border);
      border-radius: 5px; color: var(--text); font-size: 13px;
      font-family: 'SFMono-Regular', Consolas, monospace;
      outline: none;
    }
    .sp-input:focus { border-color: var(--accent); }
    .sp-hint {
      font-size: 11px; color: var(--text-dim); margin-top: 5px; line-height: 1.4;
    }
    .sp-hint code { font-family: monospace; color: var(--text-muted); }
    .sp-actions { display: flex; justify-content: flex-end; margin-top: 12px; }
    .sp-save {
      padding: 6px 16px; background: var(--accent); border: none;
      border-radius: 5px; color: #fff; font-size: 13px;
      font-weight: 600; cursor: pointer; transition: opacity 0.15s;
    }
    .sp-save:hover { opacity: 0.85; }
  `;
  document.head.appendChild(s);
}

document.addEventListener('DOMContentLoaded', init);

window.RealitySettings = { getPonderUrl, setPonderUrl };

})();
