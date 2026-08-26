// Shared wallet connection for reality.eth pages.
// Supports injected wallets (MetaMask, Rabby, etc.) and WalletConnect v2.
// Exposes window.RealityWallet = { initWallet, connectWallet, disconnectWallet, shortAddr }

(function () {
  const CACHE_KEY    = 'reality-eth-wallet';
  const WC_CACHE_KEY = 'reality-eth-wc-session';

  // WalletConnect project ID — obtain one at https://cloud.walletconnect.com
  const WC_PROJECT_ID = 'b96a6c05f714b99168f6d0eb5c422215';

  // Chain 1 (mainnet) is the WC required chain (spec requires at least one).
  // All contract chains including mainnet go in optionalChains too — the SDK
  // deduplicates, and this gets mainnet into the optional namespace's extended
  // method list (which includes wallet_switchEthereumChain), allowing wallets
  // that grant mainnet via optional to switch to it internally without a relay call.
  const WC_CHAINS = [1];
  function wcOptionalChains() {
    const contracts = window.RealityWebsiteData?.contracts || {};
    return Object.keys(contracts).map(Number).filter(id => id > 0);
  }

  // Saved reference to the injected wallet when WC overwrites window.ethereum,
  // so it can be restored if the user later disconnects WC.
  let _savedInjected = null;

  function shortAddr(addr) {
    return addr.slice(0, 6) + '…' + addr.slice(-4);
  }

  function getCached() {
    try { return localStorage.getItem(CACHE_KEY) || null; } catch { return null; }
  }

  function setCached(addr) {
    try {
      if (addr) localStorage.setItem(CACHE_KEY, addr.toLowerCase());
      else localStorage.removeItem(CACHE_KEY);
    } catch {}
  }

  // ── Wallet chooser modal ───────────────────────────────────────────────────

  function showWalletChooser() {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.style.cssText = [
        'position:fixed;inset:0;z-index:9999',
        'background:rgba(0,0,0,0.72)',
        'display:flex;align-items:center;justify-content:center',
      ].join(';');

      const card = document.createElement('div');
      card.style.cssText = [
        'background:#161b22;border:1px solid #30363d;border-radius:12px',
        'padding:24px 20px 16px;min-width:280px;max-width:340px;width:90%',
      ].join(';');

      const title = document.createElement('p');
      title.style.cssText = 'font-size:15px;font-weight:600;color:#e6edf3;margin:0 0 16px;text-align:center';
      title.textContent = 'Connect wallet';

      function makeOption(label, sub, svgPath) {
        const btn = document.createElement('button');
        btn.style.cssText = [
          'width:100%;padding:12px 14px;background:#0d1117',
          'border:1px solid #30363d;border-radius:8px;cursor:pointer',
          'display:flex;align-items:center;gap:12px;margin-bottom:10px',
          'color:#e6edf3;text-align:left;font-family:inherit;font-size:14px',
        ].join(';');
        btn.onmouseover = () => { btn.style.borderColor = '#58a6ff'; };
        btn.onmouseout  = () => { btn.style.borderColor = '#30363d'; };

        const icon = document.createElement('span');
        icon.style.cssText = 'flex-shrink:0;color:#8b949e;display:flex';
        icon.innerHTML = svgPath;

        const text = document.createElement('span');
        const labelEl = document.createElement('div');
        labelEl.style.fontWeight = '500';
        labelEl.textContent = label;
        text.appendChild(labelEl);
        if (sub) {
          const subEl = document.createElement('div');
          subEl.style.cssText = 'font-size:12px;color:#8b949e;margin-top:2px';
          subEl.textContent = sub;
          text.appendChild(subEl);
        }

        btn.appendChild(icon);
        btn.appendChild(text);
        btn.addEventListener('click', () => { cleanup(); resolve(btn.dataset.choice); });
        return btn;
      }

      const browserBtn = makeOption(
        'Browser wallet', 'MetaMask, Rabby, Coinbase…',
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
        '<rect x="2" y="7" width="20" height="15" rx="2"/>' +
        '<path d="M16 14h.01"/>' +
        '<path d="M2 10h20"/>' +
        '<path d="M6 4l3-1h6l3 1"/>' +
        '</svg>'
      );
      browserBtn.dataset.choice = 'injected';

      const wcBtn = makeOption(
        'WalletConnect', 'Scan QR with your phone',
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
        '<path d="M3 7V5a2 2 0 012-2h2"/>' +
        '<path d="M17 3h2a2 2 0 012 2v2"/>' +
        '<path d="M21 17v2a2 2 0 01-2 2h-2"/>' +
        '<path d="M7 21H5a2 2 0 01-2-2v-2"/>' +
        '<rect x="7" y="7" width="3" height="3"/>' +
        '<rect x="14" y="7" width="3" height="3"/>' +
        '<rect x="7" y="14" width="3" height="3"/>' +
        '<path d="M14 14h3v3"/>' +
        '</svg>'
      );
      wcBtn.dataset.choice = 'walletconnect';

      const cancelBtn = document.createElement('button');
      cancelBtn.style.cssText = [
        'width:100%;padding:8px;background:none;border:none',
        'color:#8b949e;cursor:pointer;font-size:13px;font-family:inherit',
      ].join(';');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.addEventListener('click', () => { cleanup(); resolve(null); });

      card.appendChild(title);
      card.appendChild(browserBtn);
      card.appendChild(wcBtn);
      card.appendChild(cancelBtn);
      overlay.appendChild(card);

      function cleanup() {
        overlay.remove();
        document.removeEventListener('keydown', onKey);
      }
      function onKey(e) { if (e.key === 'Escape') { cleanup(); resolve(null); } }
      document.addEventListener('keydown', onKey);
      overlay.addEventListener('click', e => { if (e.target === overlay) { cleanup(); resolve(null); } });

      document.body.appendChild(overlay);
    });
  }

  // ── WalletConnect ──────────────────────────────────────────────────────────

  // Extract the first numeric chainId from a WC session's CAIP-10 accounts
  // ("eip155:11155111:0x..."). Returns null if session/accounts absent.
  function wcSessionChainId(provider) {
    try {
      const accs = provider.session?.namespaces?.eip155?.accounts || [];
      for (const a of accs) {
        const parts = a.split(':');
        if (parts.length >= 3) {
          const n = parseInt(parts[1]);
          if (n) return n;
        }
      }
    } catch {}
    return null;
  }

  // Lazily inject walletconnect.js (built IIFE) and wait for it.
  function loadWCBundle() {
    if (window.WalletConnectProvider) return Promise.resolve(window.WalletConnectProvider);
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'js/vendor/walletconnect.js';
      s.onload  = () => resolve(window.WalletConnectProvider);
      s.onerror = () => reject(new Error('Failed to load WalletConnect bundle'));
      document.head.appendChild(s);
    });
  }

  async function initWC(onChange) {
    const { EthereumProvider } = await loadWCBundle();
    const provider = await EthereumProvider.init({
      projectId:       WC_PROJECT_ID,
      chains:          WC_CHAINS,
      optionalChains:  wcOptionalChains(),
      optionalMethods: ['wallet_switchEthereumChain', 'wallet_addEthereumChain'],
      showQrModal:     true,
    });

    // If there's an existing session (page reload after WC connect), restore it
    // silently without showing the modal.
    if (provider.session) {
      let addr = (provider.accounts?.[0] || '').toLowerCase() || null;
      if (!addr) {
        try {
          const accs = await provider.request({ method: 'eth_accounts' });
          addr = (accs[0] || '').toLowerCase() || null;
        } catch {}
      }
      if (addr) {
        // provider.chainId defaults to WC_CHAINS[0] (mainnet=1) even when the
        // session is on an optionalChain. Fix it from the session namespace
        // BEFORE attaching listeners so chainChanged doesn't trigger a reload.
        const sessionChain = wcSessionChainId(provider);
        if (sessionChain && sessionChain !== provider.chainId) {
          try {
            await provider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x' + sessionChain.toString(16) }],
            });
          } catch {}
        }
        window.ethereum = provider;
        setCached(addr);
        attachWCListeners(provider, onChange);
        onChange(addr);
        return true;
      }
    }
    return false;
  }

  async function connectWC(onChange, onLoading) {
    onLoading?.('Loading WalletConnect…');
    const { EthereumProvider } = await loadWCBundle();
    const provider = await EthereumProvider.init({
      projectId:       WC_PROJECT_ID,
      chains:          WC_CHAINS,
      optionalChains:  wcOptionalChains(),
      optionalMethods: ['wallet_switchEthereumChain', 'wallet_addEthereumChain'],
      showQrModal:     true,
    });
    onLoading?.(null); // bundle + provider ready — QR modal is about to appear
    await provider.connect(); // shows QR modal; resolves after user approves
    // provider.accounts is populated synchronously when connect() resolves.
    // Avoid a separate eth_accounts RPC which can race before the session is ready.
    let addr = (provider.accounts?.[0] || '').toLowerCase() || null;
    if (!addr) {
      try {
        const accs = await provider.request({ method: 'eth_accounts' });
        addr = (accs[0] || '').toLowerCase() || null;
      } catch {}
    }
    window.ethereum = provider; // make existing eth code use WC provider
    setCached(addr);
    try { localStorage.setItem(WC_CACHE_KEY, '1'); } catch {}
    attachWCListeners(provider, onChange);
    onChange(addr);
  }

  function attachWCListeners(provider, onChange) {
    provider.on('accountsChanged', accs => {
      const addr = (accs[0] || '').toLowerCase() || null;
      setCached(addr);
      onChange(addr);
    });
    provider.on('chainChanged', () => {
      if (provider._internalChainSwitch) return;
      location.reload();
    });
    provider.on('disconnect', () => {
      window.ethereum = _savedInjected || undefined;
      _savedInjected = null;
      setCached(null);
      try { localStorage.removeItem(WC_CACHE_KEY); } catch {}
      onChange(null);
    });
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  // Silent reconnect on page load. Calls onChange(addr|null) immediately from
  // cache (for instant render), then again once the async check resolves.
  async function initWallet(onChange) {
    const cached = getCached();
    if (cached) onChange(cached);

    // If the user previously chose WalletConnect, try to restore that session
    // before touching window.ethereum (an injected wallet would otherwise stomp
    // on the cached WC address). Only loads the WC bundle if the flag is set.
    const wcFlag = (() => { try { return localStorage.getItem(WC_CACHE_KEY); } catch { return null; } })();
    if (wcFlag) {
      // Hide the injected wallet while we load the WC bundle so that page-level
      // wallet callbacks (which run concurrently) don't accidentally pick up
      // MetaMask instead of the WC provider.
      if (window.ethereum && !window.ethereum.session) {
        _savedInjected = window.ethereum;
        window.ethereum = undefined;
      }
      const restored = await initWC(onChange);
      if (restored) return;
      // Session gone — restore the injected wallet, clear the flag, and fall through.
      window.ethereum = _savedInjected || undefined;
      _savedInjected = null;
      try { localStorage.removeItem(WC_CACHE_KEY); } catch {}
    }

    const eth = window.ethereum;
    if (eth) {
      // Injected wallet (MetaMask, Rabby, etc.)
      try {
        const accs = await eth.request({ method: 'eth_accounts' });
        const addr = (accs[0] || '').toLowerCase() || null;
        setCached(addr);
        if (addr !== cached) onChange(addr);
      } catch {}

      eth.on('accountsChanged', accs => {
        const addr = (accs[0] || '').toLowerCase() || null;
        setCached(addr);
        onChange(addr);
      });
      eth.on('chainChanged', () => { if (eth._internalChainSwitch) return; location.reload(); });
      return;
    }

    // No injected wallet and no cached address — clear wallet state.
    if (!cached) onChange(null);
  }

  // Shows wallet chooser / connect flow.
  async function connectWallet(onChange, onLoading) {
    const eth = window.ethereum;

    if (eth) {
      // Both injected wallet and WalletConnect are available — let user choose.
      const choice = await showWalletChooser();

      if (choice === 'walletconnect') {
        // Save the injected wallet so we can restore it if the user disconnects WC.
        _savedInjected = eth;
        try {
          await connectWC(onChange, onLoading);
        } catch (e) {
          _savedInjected = null;
          onLoading?.(null);
          if (!e.message?.includes('User rejected') && e.code !== 4001) {
            console.error('WalletConnect error:', e);
          }
        }
        return;
      }

      if (choice !== 'injected') return; // cancelled

      // Browser wallet chosen
      try {
        const accs = await eth.request({ method: 'eth_requestAccounts' });
        const addr = (accs[0] || '').toLowerCase() || null;
        setCached(addr);
        onChange(addr);
      } catch (e) {
        if (e.code !== 4001) console.error('Wallet connect error:', e);
      }
      return;
    }

    // No injected wallet. If we have a cached WC address, try to silently
    // restore the session before showing the QR modal.
    try {
      if (getCached() && await initWC(onChange)) return;
      await connectWC(onChange, onLoading);
    } catch (e) {
      onLoading?.(null);
      if (!e.message?.includes('User rejected') && e.code !== 4001) {
        console.error('WalletConnect error:', e);
      }
    }
  }

  // Clear local state and session.
  function disconnectWallet(onChange) {
    const eth = window.ethereum;
    // If it's a WC provider, disconnect the session and restore the injected wallet.
    if (eth && typeof eth.disconnect === 'function' && eth.session) {
      eth.disconnect().catch(() => {});
      window.ethereum = _savedInjected || undefined;
      _savedInjected = null;
      try { localStorage.removeItem(WC_CACHE_KEY); } catch {}
    }
    setCached(null);
    onChange(null);
  }

  window.RealityWallet = { initWallet, connectWallet, disconnectWallet, shortAddr };
})();
