// Shared wallet connection for reality.eth pages.
// Supports injected wallets (MetaMask, Rabby, etc.) and WalletConnect v2.
// Exposes window.RealityWallet = { initWallet, connectWallet, disconnectWallet, shortAddr }

(function () {
  const CACHE_KEY    = 'reality-eth-wallet';
  const WC_CACHE_KEY = 'reality-eth-wc-session';

  // WalletConnect project ID — obtain one at https://cloud.walletconnect.com
  const WC_PROJECT_ID = 'b96a6c05f714b99168f6d0eb5c422215';

  // All chains the app supports; WC needs to know upfront.
  const WC_CHAINS          = [1];
  const WC_OPTIONAL_CHAINS = [10, 100, 137, 42161, 8453, 43114, 42220, 11155111];

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

  // ── WalletConnect ──────────────────────────────────────────────────────────

  // Lazily inject walletconnect.js (built IIFE) and wait for it.
  function loadWCBundle() {
    if (window.WalletConnectProvider) return Promise.resolve(window.WalletConnectProvider);
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'js/walletconnect.js';
      s.onload  = () => resolve(window.WalletConnectProvider);
      s.onerror = () => reject(new Error('Failed to load WalletConnect bundle'));
      document.head.appendChild(s);
    });
  }

  async function initWC(onChange) {
    const { EthereumProvider } = await loadWCBundle();
    const provider = await EthereumProvider.init({
      projectId:      WC_PROJECT_ID,
      chains:         WC_CHAINS,
      optionalChains: WC_OPTIONAL_CHAINS,
      showQrModal:    true,
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
        window.ethereum = provider;
        setCached(addr);
        attachWCListeners(provider, onChange);
        onChange(addr);
        return true;
      }
    }
    return false;
  }

  async function connectWC(onChange) {
    const { EthereumProvider } = await loadWCBundle();
    const provider = await EthereumProvider.init({
      projectId:      WC_PROJECT_ID,
      chains:         WC_CHAINS,
      optionalChains: WC_OPTIONAL_CHAINS,
      showQrModal:    true,
    });
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
    attachWCListeners(provider, onChange);
    onChange(addr);
  }

  function attachWCListeners(provider, onChange) {
    provider.on('accountsChanged', accs => {
      const addr = (accs[0] || '').toLowerCase() || null;
      setCached(addr);
      onChange(addr);
    });
    provider.on('chainChanged', () => location.reload());
    provider.on('disconnect', () => {
      window.ethereum = undefined;
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
      eth.on('chainChanged', () => location.reload());
      return;
    }

    // No injected wallet — try to silently restore a WalletConnect session.
    // Only attempt if we have a cached address (avoids loading the 2 MB bundle
    // on every page load for users who have never used WC).
    if (cached) {
      try {
        const restored = await initWC(onChange);
        if (restored) return;
      } catch { /* WC bundle load failure is non-fatal */ }
    }

    if (!cached) onChange(null);
  }

  // Shows wallet chooser / connect flow.
  async function connectWallet(onChange) {
    const eth = window.ethereum;
    if (eth) {
      // Injected wallet already present
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

    // No injected wallet — use WalletConnect
    try {
      await connectWC(onChange);
    } catch (e) {
      if (!e.message?.includes('User rejected') && e.code !== 4001) {
        console.error('WalletConnect error:', e);
      }
    }
  }

  // Clear local state.
  function disconnectWallet(onChange) {
    const eth = window.ethereum;
    // If it's a WC provider, also disconnect the session
    if (eth && typeof eth.disconnect === 'function' && eth.session) {
      eth.disconnect().catch(() => {});
      window.ethereum = undefined;
    }
    setCached(null);
    onChange(null);
  }

  window.RealityWallet = { initWallet, connectWallet, disconnectWallet, shortAddr };
})();
