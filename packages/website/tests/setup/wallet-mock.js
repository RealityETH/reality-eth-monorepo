import { ANVIL_URL, TEST_ACCOUNT, FORK_BLOCK } from './anvil.js';

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
