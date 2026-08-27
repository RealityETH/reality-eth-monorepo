import { createConfig } from "ponder";
import type { Abi } from "abitype";
import rawAbi from "@reality.eth/contracts/abi/solc-0.8.6/RealityETH-3.2.abi.json";
const abi = rawAbi as unknown as Abi;

// Chain is included only if its PONDER_RPC_URL_{chainId} env var is set.
const has = (id: number) => !!process.env[`PONDER_RPC_URL_${id}`];
const rpc = (id: number) => process.env[`PONDER_RPC_URL_${id}`] as string;
const rps = (id: number, def = 5) => Number(process.env[`PONDER_RPC_MAX_RPS_${id}`] || def);

export default createConfig({
  chains: {
    ...(has(100)      && { gnosis:   { id: 100,      rpc: rpc(100),      pollingInterval:   5_000 } }),
    ...(has(1)        && { mainnet:  { id: 1,        rpc: rpc(1),        pollingInterval:  12_000 } }),
    ...(has(42161)    && { arbitrum: { id: 42161,    rpc: rpc(42161),    pollingInterval: 300_000 } }),
    ...(has(11155111) && { sepolia:  { id: 11155111, rpc: rpc(11155111), pollingInterval:  30_000 } }),
    ...(has(137)      && { polygon:  { id: 137,      rpc: rpc(137),      pollingInterval:  15_000, maxRequestsPerSecond: rps(137) } }),
    ...(has(130)      && { unichain: { id: 130,      rpc: rpc(130),      pollingInterval:   8_000 } }),
    ...(has(10)       && { optimism: { id: 10,       rpc: rpc(10),       pollingInterval:  30_000, maxRequestsPerSecond: rps(10) } }),
    ...(has(8453)     && { base:     { id: 8453,     rpc: rpc(8453),     pollingInterval:  30_000 } }),
    ...(has(56)       && { bnb:      { id: 56,       rpc: rpc(56),       pollingInterval:   3_000 } }),
  },
  contracts: {
    // v3.2 — most recent deployment.
    RealityETH_v3_2: {
      abi,
      chain: {
        ...(has(1)        && { mainnet: { address: "0x6a2155613b68eFB38D5c6074921F3F4281c8c177", startBlock: 22100226 } }),
        ...(has(100)      && { gnosis:  { address: "0xEb51d9d9717906c981C57af09C4a3449eF30705b", startBlock: 39142627 } }),
        ...(has(11155111) && { sepolia: { address: "0xB7982f20CC159a40eba4b0eA86fd6cbA6Ff810e1", startBlock: 7898415  } }),
      },
    },

    // v3.0 — active since 2021 across all chains.
    RealityETH_v3_0: {
      abi,
      chain: {
        ...(has(1)        && { mainnet:  { address: "0x5b7dD1E86623548AF054A4985F7fc8Ccbb554E2c", startBlock: 13194676 } }),
        ...(has(100)      && { gnosis:   { address: "0xE78996A233895bE74a66F451f1019cA9734205cc", startBlock: 17997262 } }),
        ...(has(42161)    && { arbitrum: { address: "0x5D18bD4dC5f1AC8e9bD9B666Bd71cB35A327C4A9", startBlock: 459975   } }),
        ...(has(11155111) && { sepolia:  { address: "0xaf33DcB6E8c5c4D9dDF579f53031b514d19449CA", startBlock: 3044431  } }),
        ...(has(137)      && { polygon:  { address: "0x60573B8DcE539aE5bF9aD7932310668997ef0428", startBlock: 18901674 } }),
        ...(has(130)      && { unichain: { address: "0xB920dBedE88B42aA77eE55ebcE3671132ee856fC", startBlock: 8561869  } }),
        ...(has(10)       && { optimism: { address: "0x0eF940F7f053a2eF5D6578841072488aF0c7d89A", startBlock: 2462149  } }),
        ...(has(8453)     && { base:     { address: "0x2F39f464d16402Ca3D8527dA89617b73DE2F60e8", startBlock: 26260675 } }),
        ...(has(56)       && { bnb:      { address: "0xa925646Cae3721731F9a8C886E5D1A7B123151B9", startBlock: 10751380 } }),
        // celo:      { address: "0x4C2863bb9969dD693Ec487bED72BDfD83C0cA5b3", startBlock: 31954377 },
        // avalanche: { address: "0xD88cd78631Ea0D068cedB0d1357a6eabe59D7502", startBlock: 4090592  },
      },
    },

    // v2.1 — Gnosis, Arbitrum, Polygon, BNB; predates v3.0.
    ...((has(100) || has(42161) || has(137) || has(56)) && { RealityETH_v2_1: {
      abi,
      chain: {
        ...(has(100)   && { gnosis:   { address: "0x79e32aE03fb27B07C89c0c568F80287C01ca2E57", startBlock: 14005802 } }),
        ...(has(42161) && { arbitrum: { address: "0x0EDB4CB0B12523749c56Ff24C4a09c0c1417f691", startBlock: 112029   } }),
        ...(has(137)   && { polygon:  { address: "0xA75AE6D61Dd9d55e8153A393E2fc859c6a0FC716", startBlock: 15610082 } }),
        ...(has(56)    && { bnb:      { address: "0xa75ae6d61dd9d55e8153a393e2fc859c6a0fc716", startBlock: 7962044  } }),
      },
    }}),

    // v2.0 — Snapshot used this heavily on mainnet. Long history from block ~6.5M (2019).
    ...(has(1) && { RealityETH_v2_0: {
      abi,
      chain: {
        mainnet: { address: "0x325a2e0F3CCA2ddbaeBB4DfC38Df8D19ca165b47", startBlock: 6531265 },
      },
    }}),

    // ERC20 token-denominated variants — same events as native, grouped per chain.
    ...(has(1) && { RealityETH_ERC20_mainnet: {
      abi,
      chain: {
        mainnet: {
          address: [
            "0x3D3B51b1091d1F6491AeB1916C94BAfe57f6Cc9d", // TRST v2.0, block 8050824
            "0x8f1CC53bf34932591177CDA24723486205CA7510", // GNO  v2.0, block 12654677
            "0xf4585A9944A390615E7cec6756C1c082173B93eB", // FOX  v2.0, block 12821080
            "0x33aa365a53a4c9ba777fb5f450901a8eef73f0a9", // GNO  v3.0, block 13201169
            "0x867092A32bC16816F12Fb326EfF7A2865E1ec138", // SWISE v3.0, block 14485577
          ],
          startBlock: 8050824,
        },
      },
    }}),

    ...(has(100) && { RealityETH_ERC20_gnosis: {
      abi,
      chain: {
        gnosis: {
          address: [
            "0x95b2b2b4b66A5a47Df79bF07BEBe72E9870fceb2", // GNO  v3.0, block 20882108
            "0xC9FbdF0df8dE06Ad8d2193F7FA28bdA78c13a102", // SWISE v3.0, block 21371853
            "0x934326a86A99DaB25bB8329089ce73ed9c7c0E4a", // POLK v3.0, block 34578493
          ],
          startBlock: 20882108,
        },
      },
    }}),

    ...(has(137) && { RealityETH_ERC20_polygon: {
      abi,
      chain: {
        polygon: {
          address: [
            "0x83d3f4769a19f1b43337888b0290f5473cf508b2", // POLK v3.0, block 42899867
            "0x3155836D28C0845c37791808287FaFC811742C5a", // SUKU v3.2, block 73217319
          ],
          startBlock: 42899867,
        },
      },
    }}),

    ...(has(56) && { RealityETH_ERC20_bnb: {
      abi,
      chain: {
        bnb: {
          address: "0x95f8fc16C7Bd5a5b24CaE629471c6cCC3916826A", // DEXE v3.0
          startBlock: 13749748,
        },
      },
    }}),

    ...(has(11155111) && { RealityETH_ERC20_sepolia: {
      abi,
      chain: {
        sepolia: {
          address: "0x8A5f1C6361E280348a59daC10160A88428FFBd51", // BOND v3.2
          startBlock: 8526475,
        },
      },
    }}),
  },
});
