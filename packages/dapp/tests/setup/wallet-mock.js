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

  // Clip eth_getLogs fromBlock to just before the fork so we never scan
  // 28M+ historical blocks on the archive node.
  const LOG_SCAN_MIN_BLOCK = ${FORK_BLOCK - 100};

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

        case 'eth_sendTransaction': {
          // Forward to anvil using the pre-funded test account
          // anvil_impersonateAccount lets us send without a private key
          const tx = params[0];
          await rpc('anvil_impersonateAccount', [_address]);
          const hash = await rpc('eth_sendTransaction', [{ ...tx, from: _address }]);
          await rpc('anvil_stopImpersonatingAccount', [_address]);
          return hash;
        }

        case 'eth_getLogs': {
          // Clip fromBlock to LOG_SCAN_MIN_BLOCK only when the scan reaches into recent
          // blocks (toBlock is 'latest' or >= LOG_SCAN_MIN_BLOCK). Targeted historical
          // queries like template fetching (fromBlock == toBlock == 17997262) must pass
          // through unmodified so the archive node can answer them.
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
