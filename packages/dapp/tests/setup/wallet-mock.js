import { ANVIL_URL, TEST_ACCOUNT, FORK_BLOCK } from './anvil.js';

// Returns a script string to be injected via page.addInitScript().
// The mock implements EIP-1193 backed by the local anvil node.
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
  const KNOWN_LOCAL_CONTRACTS = new Set([
    '0xe78996a233895be74a66f451f1019ca9734205cc', // reality.eth v3.0
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
        // Archive rate-limiting: fall back to a safe ceiling so the dapp can still
        // proceed.  The actual tx execution reads only locally-written state.
        return '0x493E0'; // 300 000 gas
      }
    }
    // Non-local contracts don't need gas estimation in our test flows.
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
          // Forward to anvil using the pre-funded test account.
          // anvil_impersonateAccount lets us send without a private key.
          const tx = params[0];
          await rpc('anvil_impersonateAccount', [_address]);
          const hash = await rpc('eth_sendTransaction', [{ ...tx, from: _address }]);
          await rpc('anvil_stopImpersonatingAccount', [_address]);
          return hash;
        }

        case 'eth_call': {
          // Non-local contracts don't exist locally and would hit the archive under
          // rate-limiting, stalling indefinitely.  Throw immediately so that the
          // dapp's catch blocks (e.g. loadArbitratorMetaData, populateArbitratorSelect)
          // handle gracefully without blocking critical paths like updateClaimableDisplay.
          const isLocal = params[0] && params[0].to &&
            KNOWN_LOCAL_CONTRACTS.has(params[0].to.toLowerCase());
          if (!isLocal) throw new Error('execution reverted');
          return rpc('eth_call', params);
        }

        case 'eth_getLogs': {
          // Clip fromBlock to LOG_SCAN_MIN_BLOCK only when the range extends into
          // recent/latest blocks.  Historical point-queries (e.g. template fetching
          // where fromBlock == toBlock == some old block) pass through unchanged.
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

    // Legacy pre-EIP1193 API
    enable: async () => [_address],
    // Some dapps read this directly
    chainId: _chainId,
  };
})();
`;
}
