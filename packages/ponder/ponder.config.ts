import { createConfig } from "@ponder/core";
import { http, fallback, type Transport } from "viem";

// v3.2 ABI is a superset of all earlier versions; events are identical across
// v2.0, v2.1, v3.0, v3.2, and the ERC20 variants, so one ABI covers everything.
import abi from "../contracts/abi/solc-0.8.6/RealityETH-3.2.abi.json";

// Backoff delays (ms) for eth_getLogs / eth_getBlockByNumber failures.
// After the last value is reached it repeats; after ALERT_STREAK consecutive
// max-delay failures a log alert is emitted (and a recovery log on success).
const BACKOFF_MS = [3, 6, 12, 24, 48, 96, 192].map(s => s * 1000);
const ALERT_STREAK = 10;

// Wraps a transport so that eth_getLogs and eth_getBlockByNumber failures back
// off and retry rather than crashing the whole Ponder process. Other RPC methods
// pass through unchanged. Per-chain state lives in a closure.
function resilient(chain: string, inner: Transport): Transport {
  let errors   = 0; // consecutive failures across both watched methods
  let maxCount = 0; // consecutive failures at the max backoff delay
  let notified = false;

  return ((params: any) => {
    const t = (inner as any)(params);
    return {
      ...t,
      request: async (args: any) => {
        if (args.method !== 'eth_getLogs' && args.method !== 'eth_getBlockByNumber') {
          return t.request(args);
        }
        for (;;) {
          try {
            const result = await t.request(args);
            if (errors > 0) {
              const msg = `[${chain}] RPC recovered after ${errors} consecutive failures`;
              if (notified) {
                console.error(`[RECOVERY] ${msg}`);
              } else {
                console.warn(msg);
              }
              errors = 0; maxCount = 0; notified = false;
            }
            return result;
          } catch (err: any) {
            const atMax = errors >= BACKOFF_MS.length - 1;
            const delayMs = BACKOFF_MS[Math.min(errors, BACKOFF_MS.length - 1)];
            errors++;
            if (atMax) {
              maxCount++;
              if (maxCount === ALERT_STREAK && !notified) {
                console.error(`[ALERT] [${chain}] ${args.method} has been failing for ${errors} consecutive attempts with no recovery — manual intervention may be required`);
                notified = true;
              }
            }
            console.warn(`[${chain}] ${args.method} failed (attempt ${errors}, retry in ${delayMs / 1000}s): ${err?.shortMessage ?? err?.message ?? err}`);
            await new Promise(r => setTimeout(r, delayMs));
          }
        }
      },
    };
  }) as unknown as Transport;
}

// Build a network transport. Only include the private RPC in the fallback when
// it's explicitly configured — http(undefined) generates a wall of errors.
function net(chain: string, chainId: number, envUrl: string | undefined, publicUrl: string, maxRequestsPerSecond = 5, pollingInterval = 1_000) {
  const opts = { timeout: 30_000, retryCount: 2, retryDelay: 2000 };
  const inner = envUrl
    ? fallback([http(envUrl, opts), http(publicUrl, opts)], { retryCount: 1 })
    : http(publicUrl, opts);
  return {
    chainId,
    maxRequestsPerSecond,
    pollingInterval,
    transport: resilient(chain, inner),
  };
}

// Chains listed in PONDER_DISABLE (comma-separated) are excluded at startup.
// Example: PONDER_DISABLE=mainnet,sepolia
const DISABLED = new Set(
  (process.env.PONDER_DISABLE || '').split(',').map(s => s.trim()).filter(Boolean)
);
const on = (name: string) => !DISABLED.has(name);

// Optional Infura key for fallback transports — set INFURA_API_KEY in your env.
const INFURA = process.env.INFURA_API_KEY;

export default createConfig({
  networks: {
    ...(on('gnosis')   && { gnosis:   net('gnosis',   100,       process.env.PONDER_RPC_URL_100,      "https://rpc.gnosischain.com") }),
    ...(on('mainnet')  && { mainnet:  net('mainnet',  1,         process.env.PONDER_RPC_URL_1,        INFURA ? `https://mainnet.infura.io/v3/${INFURA}` : "https://eth.llamarpc.com", 5, 12_000) }),
    // Arbitrum has sub-second blocks; use a long polling interval to limit CPU load during sync.
    ...(on('arbitrum') && { arbitrum: net('arbitrum', 42161,     process.env.PONDER_RPC_URL_42161,    "https://arbitrum-one-rpc.publicnode.com", 5, 10_000) }),
    ...(on('sepolia')  && { sepolia:  net('sepolia',  11155111,  process.env.PONDER_RPC_URL_11155111, INFURA ? `https://sepolia.infura.io/v3/${INFURA}` : "https://ethereum-sepolia-rpc.publicnode.com", 5, 30_000) }),
    // optimism: disabled — public RPCs consistently time out on large eth_getLogs ranges
    // base: disabled — base-rpc.publicnode.com returns inconsistent log/block data, causing
    //   Ponder's consistency check to fire. Re-enable by setting PONDER_RPC_URL_8453 to a
    //   reliable dedicated endpoint (e.g. Alchemy, Infura, or mainnet.base.org).
    // base: net(8453, process.env.PONDER_RPC_URL_8453, "https://base-rpc.publicnode.com"),
    // celo: disabled — ~5s block time causes high CPU load during sync
    // avalanche: disabled — ~2s block time causes high CPU load during sync
  },

  contracts: {
    // v3.2 — most recent deployment.
    RealityETH_v3_2: {
      abi,
      network: {
        ...(on('mainnet') && { mainnet: { address: "0x6a2155613b68eFB38D5c6074921F3F4281c8c177", startBlock: 22100226 } }),
        ...(on('gnosis')  && { gnosis:  { address: "0xEb51d9d9717906c981C57af09C4a3449eF30705b", startBlock: 39142627 } }),
        ...(on('sepolia') && { sepolia: { address: "0xB7982f20CC159a40eba4b0eA86fd6cbA6Ff810e1", startBlock: 7898415  } }),
      },
    },

    // v3.0 — active since 2021 across all chains.
    RealityETH_v3_0: {
      abi,
      network: {
        ...(on('mainnet')  && { mainnet:  { address: "0x5b7dD1E86623548AF054A4985F7fc8Ccbb554E2c", startBlock: 13194676 } }),
        ...(on('gnosis')   && { gnosis:   { address: "0xE78996A233895bE74a66F451f1019cA9734205cc", startBlock: 17997262 } }),
        ...(on('arbitrum') && { arbitrum: { address: "0x5D18bD4dC5f1AC8e9bD9B666Bd71cB35A327C4A9", startBlock: 459975   } }),
        ...(on('sepolia')  && { sepolia:  { address: "0xaf33DcB6E8c5c4D9dDF579f53031b514d19449CA", startBlock: 3044431  } }),
        // optimism disabled
        // base disabled (see network comment above)
        // base:      { address: "0x2F39f464d16402Ca3D8527dA89617b73DE2F60e8", startBlock: 26260675 },
        // celo:      { address: "0x4C2863bb9969dD693Ec487bED72BDfD83C0cA5b3", startBlock: 31954377 },
        // avalanche: { address: "0xD88cd78631Ea0D068cedB0d1357a6eabe59D7502", startBlock: 4090592  },
      },
    },

    // v2.1 — Gnosis and Arbitrum, predates v3.0.
    ...((on('gnosis') || on('arbitrum')) && { RealityETH_v2_1: {
      abi,
      network: {
        ...(on('gnosis')   && { gnosis:   { address: "0x79e32aE03fb27B07C89c0c568F80287C01ca2E57", startBlock: 14005802 } }),
        ...(on('arbitrum') && { arbitrum: { address: "0x0EDB4CB0B12523749c56Ff24C4a09c0c1417f691", startBlock: 112029   } }),
      },
    }}),

    // v2.0 — Snapshot used this heavily on mainnet. Long history from block ~6.5M (2019).
    ...(on('mainnet') && { RealityETH_v2_0: {
      abi,
      network: {
        mainnet: { address: "0x325a2e0F3CCA2ddbaeBB4DfC38Df8D19ca165b47", startBlock: 6531265 },
      },
    }}),

    // ERC20 token-denominated variants — same events, grouped per chain.
    // Mainnet: TRST/GNO/FOX (v2.0), GNO/SWISE (v3.0)
    ...(on('mainnet') && { RealityETH_ERC20_mainnet: {
      abi,
      network: {
        mainnet: {
          address: [
            "0x3D3B51b1091d1F6491AeB1916C94BAfe57f6Cc9d", // TRST v2.0, block 8050824
            "0x8f1CC53bf34932591177CDA24723486205CA7510", // GNO v2.0, block 12654677
            "0xf4585A9944A390615E7cec6756C1c082173B93eB", // FOX v2.0, block 12821080
            "0x33aa365a53a4c9ba777fb5f450901a8eef73f0a9", // GNO v3.0, block 13201169
            "0x867092A32bC16816F12Fb326EfF7A2865E1ec138", // SWISE v3.0, block 14485577
          ],
          startBlock: 8050824,
        },
      },
    }}),

    // Gnosis: GNO/SWISE/POLK (v3.0)
    ...(on('gnosis') && { RealityETH_ERC20_gnosis: {
      abi,
      network: {
        gnosis: {
          address: [
            "0x95b2b2b4b66A5a47Df79bF07BEBe72E9870fceb2", // GNO v3.0, block 20882108
            "0xC9FbdF0df8dE06Ad8d2193F7FA28bdA78c13a102", // SWISE v3.0, block 21371853
            "0x934326a86A99DaB25bB8329089ce73ed9c7c0E4a", // POLK v3.0, block 34578493
          ],
          startBlock: 20882108,
        },
      },
    }}),

    // Sepolia: BOND token (v3.2 ERC20)
    ...(on('sepolia') && { RealityETH_ERC20_sepolia: {
      abi,
      network: {
        sepolia: {
          address: "0x8A5f1C6361E280348a59daC10160A88428FFBd51", // BOND v3.2, block 8526475
          startBlock: 8526475,
        },
      },
    }}),

  },
});
