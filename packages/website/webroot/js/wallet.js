// Shared wallet connection for reality.eth pages.
// Supports injected wallets only (MetaMask, Rabby, etc.) — no bundler required.
// Exposes window.RealityWallet = { initWallet, connectWallet, disconnectWallet, shortAddr }

(function () {
  const CACHE_KEY = 'reality-eth-wallet';

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

  // Silent reconnect on page load. Calls onChange(addr|null) immediately from
  // cache (for instant render), then again once the async eth_accounts check
  // resolves — so any stale cache gets corrected without a visible flash.
  async function initWallet(onChange) {
    const eth = window.ethereum;
    const cached = getCached();
    if (cached) onChange(cached);

    if (!eth) {
      if (!cached) onChange(null);
      return;
    }

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

    // Reload on chain change — simplest way to keep displayed data consistent.
    eth.on('chainChanged', () => location.reload());
  }

  // Request accounts — shows the wallet popup if not yet permitted.
  async function connectWallet(onChange) {
    const eth = window.ethereum;
    if (!eth) {
      alert('No wallet found. Install MetaMask or another browser wallet to continue.');
      return;
    }
    try {
      const accs = await eth.request({ method: 'eth_requestAccounts' });
      const addr = (accs[0] || '').toLowerCase() || null;
      setCached(addr);
      onChange(addr);
    } catch (e) {
      if (e.code !== 4001) console.error('Wallet connect error:', e);
      // 4001 = user rejected — silently ignore
    }
  }

  // Clear local state. The wallet retains the site permission — the user must
  // revoke that themselves in their wallet settings if they want a full disconnect.
  function disconnectWallet(onChange) {
    setCached(null);
    onChange(null);
  }

  window.RealityWallet = { initWallet, connectWallet, disconnectWallet, shortAddr };
})();
