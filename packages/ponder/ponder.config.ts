import { createConfig } from "ponder";
import abi from "@reality.eth/contracts/abi/solc-0.8.6/RealityETH-3.2.abi.json";

export default createConfig({
  chains: {
    sepolia: {
      id: 11155111,
      rpc: process.env.PONDER_RPC_URL_11155111,
    },
  },
  contracts: {
    RealityETH_v3_0: {
      chain: "sepolia",
      abi,
      address: "0xaf33DcB6E8c5c4D9dDF579f53031b514d19449CA",
      startBlock: 3044431,
    },
    RealityETH_v3_2: {
      chain: "sepolia",
      abi,
      address: "0xB7982f20CC159a40eba4b0eA86fd6cbA6Ff810e1",
      startBlock: 7898415,
    },
    RealityETH_ERC20_sepolia: {
      chain: "sepolia",
      abi,
      address: "0x8A5f1C6361E280348a59daC10160A88428FFBd51",
      startBlock: 8526475,
    },
  },
});
