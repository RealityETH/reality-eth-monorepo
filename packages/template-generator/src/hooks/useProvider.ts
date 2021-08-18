import { useState } from "react";
import { ethers } from "ethers";
import memoize from "lodash.memoize";

const { ethereum } = window as any;
export const getProvider = memoize(() => {
  if (ethereum) {
    return new ethers.providers.Web3Provider(ethereum, "any");
  }
  return ethers.getDefaultProvider();
});

export const useProvider = () => {
  const [provider] = useState<
    ethers.providers.BaseProvider | ethers.providers.Web3Provider
  >(() => getProvider());

  return provider;
};
