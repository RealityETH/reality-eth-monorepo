import { useState } from "react";
import { ethers } from "ethers";

const { ethereum } = window as any;

export function useProvider() {
  const [provider] = useState<
    ethers.providers.BaseProvider | ethers.providers.Web3Provider
  >(() => {
    if (ethereum) {
      return new ethers.providers.Web3Provider(ethereum, "any");
    }
    return ethers.getDefaultProvider();
  });

  return provider;
}
