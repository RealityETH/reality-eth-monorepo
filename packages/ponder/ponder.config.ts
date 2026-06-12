import { createConfig } from "@ponder/core";
import { http, fallback } from "viem";

// v3.2 ABI is a superset of all earlier versions; events are identical across
// v2.0, v2.1, v3.0, v3.2, and the ERC20 variants, so one ABI covers everything.
import abi from "../contracts/abi/solc-0.8.6/RealityETH-3.2.abi.json";

// Build a network transport. Only include the private RPC in the fallback when
// it's explicitly configured — http(undefined) generates a wall of errors.
function net(chainId: number, envUrl: string | undefined, publicUrl: string, maxRequestsPerSecond = 5) {
  const opts = { timeout: 30_000, retryCount: 2, retryDelay: 2000 };
  return {
    chainId,
    maxRequestsPerSecond,
    transport: envUrl
      ? fallback([http(envUrl, opts), http(publicUrl, opts)], { retryCount: 1 })
      : http(publicUrl, opts),
  };
}

export default createConfig({
  networks: {
    mainnet:   net(1,         process.env.PONDER_RPC_URL_1,         "https://ethereum-rpc.publicnode.com"),
    gnosis:    net(100,       process.env.PONDER_RPC_URL_100,       "https://rpc.gnosischain.com"),
    // arbitrum: disabled — ~2s block time causes high CPU load during sync
    sepolia:   net(11155111,  process.env.PONDER_RPC_URL_11155111,  "https://ethereum-sepolia-rpc.publicnode.com"),
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
        mainnet: { address: "0x6a2155613b68eFB38D5c6074921F3F4281c8c177", startBlock: 22100226 },
        gnosis:  { address: "0xEb51d9d9717906c981C57af09C4a3449eF30705b", startBlock: 39142627 },
        sepolia: { address: "0xB7982f20CC159a40eba4b0eA86fd6cbA6Ff810e1", startBlock: 7898415 },
      },
    },

    // v3.0 — active since 2021 across all chains.
    RealityETH_v3_0: {
      abi,
      network: {
        mainnet:   { address: "0x5b7dD1E86623548AF054A4985F7fc8Ccbb554E2c", startBlock: 13194676 },
        gnosis:    { address: "0xE78996A233895bE74a66F451f1019cA9734205cc", startBlock: 17997262 },
        // arbitrum: disabled (see network comment)
        sepolia:   { address: "0xaf33DcB6E8c5c4D9dDF579f53031b514d19449CA", startBlock: 3044431 },
        // optimism disabled
        // base disabled (see network comment above)
        // base:      { address: "0x2F39f464d16402Ca3D8527dA89617b73DE2F60e8", startBlock: 26260675 },
        // celo:      { address: "0x4C2863bb9969dD693Ec487bED72BDfD83C0cA5b3", startBlock: 31954377 },
        // avalanche: { address: "0xD88cd78631Ea0D068cedB0d1357a6eabe59D7502", startBlock: 4090592 },
      },
    },

    // v2.1 — Gnosis only, predates v3.0.
    RealityETH_v2_1: {
      abi,
      network: {
        gnosis: { address: "0x79e32aE03fb27B07C89c0c568F80287C01ca2E57", startBlock: 14005802 },
      },
    },

    // v2.0 — Snapshot used this heavily on mainnet. Long history from block ~6.5M (2019).
    RealityETH_v2_0: {
      abi,
      network: {
        mainnet: { address: "0x325a2e0F3CCA2ddbaeBB4DfC38Df8D19ca165b47", startBlock: 6531265 },
      },
    },

    // ERC20 token-denominated variants — same events, grouped per chain.
    // Mainnet: TRST/GNO/FOX (v2.0), GNO/SWISE (v3.0)
    RealityETH_ERC20_mainnet: {
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
    },

    // Gnosis: GNO/SWISE/POLK (v3.0)
    RealityETH_ERC20_gnosis: {
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
    },

    // Sepolia: BOND token (v3.2 ERC20)
    RealityETH_ERC20_sepolia: {
      abi,
      network: {
        sepolia: {
          address: "0x8A5f1C6361E280348a59daC10160A88428FFBd51", // BOND v3.2, block 8526475
          startBlock: 8526475,
        },
      },
    },

  },
});
