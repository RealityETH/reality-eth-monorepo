import { ANVIL_URL, TEST_ACCOUNT, FORK_BLOCK } from './anvil.js';

// ── WalletConnect mock ────────────────────────────────────────────────────────
//
// Simulates a restored WalletConnect v2 session with the "optional-chain"
// quirk: eth_accounts returns [] even though the session has a valid address.
// This is the root cause of the wallet-connection bugs we fixed in question.js,
// account.js, ask-view.js, and template-view.js.
//
// The mock pre-sets window.WalletConnectProvider so wallet.js's loadWCBundle()
// resolves immediately without fetching the real walletconnect.js bundle.
// It also writes the two localStorage keys that wallet.js checks to take the
// WC path (reality-eth-wc-session and reality-eth-wallet).
//
// sessionChainId — the chain the mock session reports (default 100 = Gnosis)
// address        — the wallet address (default TEST_ACCOUNT.address)
// rpcUrl         — RPC for real chain calls (default ANVIL_URL)
// requiredChains — chains passed as WC `chains:` (required); WC does NOT emit
//                  chainChanged when switching to one of these (default [1]).
export function wcWalletMockScript({
  sessionChainId = 100,
  address = TEST_ACCOUNT.address,
  rpcUrl = ANVIL_URL,
  requiredChains = [1],
} = {}) {
  const LOG_MIN_BLOCK = FORK_BLOCK + 1;
  return `
(function () {
  const _addr    = ${JSON.stringify(address)};
  const _sesChain = ${sessionChainId};
  const _rpcUrl  = ${JSON.stringify(rpcUrl)};
  const LOG_SCAN_MIN_BLOCK = ${LOG_MIN_BLOCK};
  const _requiredChains = new Set(${JSON.stringify(requiredChains)});

  async function rpc(method, params = []) {
    const res = await fetch(_rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    });
    const json = await res.json();
    if (json.error) { const e = new Error(json.error.message); e.code = json.error.code; throw e; }
    return json.result;
  }

  // Pre-set WalletConnectProvider so wallet.js's loadWCBundle() resolves
  // immediately without fetching walletconnect.js.
  window.WalletConnectProvider = {
    EthereumProvider: {
      init: async function ({ chains }) {
        const _handlers = {};
        // WC EthereumProvider starts with the required chain (usually mainnet=1)
        // even when the actual session is on an optional chain — the exact
        // mismatch our initWC fix corrects via wallet_switchEthereumChain.
        let _chainId = (chains && chains[0]) || 1;

        const provider = {
          get chainId() { return _chainId; },
          set chainId(v) { _chainId = v; },
          // WC populates .accounts from the session (not eth_accounts).
          accounts: [_addr],
          session: {
            namespaces: {
              eip155: {
                accounts: ['eip155:' + _sesChain + ':' + _addr],
                chains:   ['eip155:' + _sesChain],
              },
            },
          },
          request: async ({ method, params = [] }) => {
            switch (method) {
              // Core WC optional-chain behaviour: eth_accounts returns empty.
              // This is what broke getSigner() throughout the view code.
              case 'eth_accounts': return [];
              case 'eth_chainId':  return '0x' + _chainId.toString(16);
              case 'net_version':  return String(_chainId);
              case 'wallet_switchEthereumChain': {
                const newChainId = parseInt(params[0].chainId, 16);
                _chainId = newChainId;
                // Real WC does NOT emit chainChanged when switching to a required chain.
                if (!_requiredChains.has(newChainId)) {
                  (_handlers['chainChanged'] || []).forEach(h => h(params[0].chainId));
                }
                return null;
              }
              case 'eth_sendTransaction': {
                const tx = params[0];
                await rpc('anvil_impersonateAccount', [_addr]);
                const hash = await rpc('eth_sendTransaction', [{ ...tx, from: _addr }]);
                await rpc('anvil_stopImpersonatingAccount', [_addr]);
                return hash;
              }
              case 'eth_getLogs': {
                // Same fromBlock clipping as the injected-wallet mock to
                // avoid touching the archive on full-range scans.
                const filter = { ...params[0] };
                if (filter.fromBlock) {
                  const from = parseInt(filter.fromBlock, 16);
                  const to   = filter.toBlock === 'latest' || filter.toBlock == null
                    ? Infinity : parseInt(filter.toBlock, 16);
                  if (!isNaN(from) && from < LOG_SCAN_MIN_BLOCK && to >= LOG_SCAN_MIN_BLOCK) {
                    filter.fromBlock = '0x' + LOG_SCAN_MIN_BLOCK.toString(16);
                  }
                }
                return rpc('eth_getLogs', [filter]);
              }
              default:
                return rpc(method, params);
            }
          },
          on: (event, handler) => {
            if (!_handlers[event]) _handlers[event] = [];
            _handlers[event].push(handler);
          },
          removeListener: (event, handler) => {
            if (_handlers[event]) _handlers[event] = _handlers[event].filter(h => h !== handler);
          },
          removeAllListeners: (event) => {
            if (event) _handlers[event] = [];
            else Object.keys(_handlers).forEach(k => { _handlers[k] = []; });
          },
        };
        return provider;
      },
    },
  };

  // Tell wallet.js to take the WC path: it checks both keys before loading
  // the bundle and attempting session restore.
  try {
    localStorage.setItem('reality-eth-wc-session', '1');
    localStorage.setItem('reality-eth-wallet', _addr);
  } catch {}
})();
`;
}

// Set up a fresh Playwright page for a website test:
//  - inject the wallet mock (EIP-1193 backed by anvil)
//  - intercept /graphql so Ponder returns no data → triggers RPC fallback
export async function setupPage(page) {
  await page.addInitScript(walletMockScript());
  // Return a null question so question.js falls back to RPC event scanning
  await page.route('**/graphql**', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { question: null } }),
    })
  );
}

// Variant of setupPage that returns a known question from Ponder but with no
// response events — simulating an indexer that has the creation block but not
// the answer events (indexer lag).
export async function setupPageWithStalePonder(page, ponderData) {
  await page.addInitScript(walletMockScript());
  await page.route('**/graphql**', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: ponderData }),
    })
  );
}

// Returns a script string injected via page.addInitScript().
// EIP-1193 mock backed by the local anvil node.
export function walletMockScript({ chainId = '0x64', rpcUrl = ANVIL_URL } = {}) {
  return `
(function() {
  const RPC_URL = ${JSON.stringify(rpcUrl)};
  let _chainId = ${JSON.stringify(chainId)};
  const _address = ${JSON.stringify(TEST_ACCOUNT.address)};
  const _handlers = {};

  // Clip eth_getLogs fromBlock to the first local block so continuous event scans
  // never touch the archive.  Targeted historical queries (fromBlock == toBlock at an
  // old height, e.g. template fetching) have toBlock < LOG_SCAN_MIN_BLOCK so they are
  // not clipped and still reach the archive normally.
  const LOG_SCAN_MIN_BLOCK = ${FORK_BLOCK + 1};

  // These contracts exist on the local fork — all eth_calls to them are fast.
  // Calls to any other address return 'execution reverted' immediately so the
  // page's catch blocks (arbitrator fee lookup, etc.) handle gracefully without
  // blocking critical paths like claim detection.
  const KNOWN_LOCAL_CONTRACTS = new Set([
    '0x79e32ae03fb27b07c89c0c568f80287c01ca2e57', // reality.eth v2.1
    '0xe78996a233895be74a66f451f1019ca9734205cc', // reality.eth v3.0
    '0xeb51d9d9717906c981c57af09c4a3449ef30705b', // reality.eth v3.2
    '0x29f39de98d750eb77b5fafb31b2837f079fce222', // Kleros ForeignArbitrationProxy
  ]);

  async function rpc(method, params = []) {
    const res = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error.message);
    return json.result;
  }

  async function estimateGas(tx) {
    if (tx && tx.to && KNOWN_LOCAL_CONTRACTS.has(tx.to.toLowerCase())) {
      try {
        return await rpc('eth_estimateGas', [tx]);
      } catch (_) {
        return '0x493E0'; // 300 000 gas fallback
      }
    }
    return '0x493E0';
  }

  window.ethereum = {
    isMetaMask: true,
    selectedAddress: _address,

    request: async ({ method, params = [] }) => {
      switch (method) {
        case 'eth_requestAccounts':
        case 'eth_accounts':
          return [_address];

        case 'eth_chainId':
          return _chainId;

        case 'net_version':
          return String(parseInt(_chainId, 16));

        case 'wallet_switchEthereumChain': {
          const newChainId = params[0].chainId;
          _chainId = newChainId;
          (_handlers['chainChanged'] || []).forEach(h => h(newChainId));
          return null;
        }

        case 'eth_estimateGas':
          return estimateGas(params[0]);

        case 'eth_sendTransaction': {
          const tx = params[0];
          await rpc('anvil_impersonateAccount', [_address]);
          const hash = await rpc('eth_sendTransaction', [{ ...tx, from: _address }]);
          await rpc('anvil_stopImpersonatingAccount', [_address]);
          return hash;
        }

        case 'eth_call': {
          const isLocal = params[0] && params[0].to &&
            KNOWN_LOCAL_CONTRACTS.has(params[0].to.toLowerCase());
          if (!isLocal) throw new Error('execution reverted');
          return rpc('eth_call', params);
        }

        case 'eth_getLogs': {
          const filter = { ...params[0] };
          if (filter.fromBlock) {
            const from = parseInt(filter.fromBlock, 16);
            const toRaw = filter.toBlock;
            const to = (toRaw === 'latest' || toRaw === undefined)
              ? Infinity
              : parseInt(toRaw, 16);
            if (!isNaN(from) && from < LOG_SCAN_MIN_BLOCK && to >= LOG_SCAN_MIN_BLOCK) {
              filter.fromBlock = '0x' + LOG_SCAN_MIN_BLOCK.toString(16);
            }
          }
          return rpc('eth_getLogs', [filter]);
        }

        default:
          return rpc(method, params);
      }
    },

    on: (event, handler) => {
      if (!_handlers[event]) _handlers[event] = [];
      _handlers[event].push(handler);
    },

    removeListener: (event, handler) => {
      if (_handlers[event]) {
        _handlers[event] = _handlers[event].filter(h => h !== handler);
      }
    },

    removeAllListeners: (event) => {
      if (event) { _handlers[event] = []; }
      else { Object.keys(_handlers).forEach(k => { _handlers[k] = []; }); }
    },

    // Legacy pre-EIP1193 API
    enable: async () => [_address],
    chainId: _chainId,
  };
})();
`;
}
