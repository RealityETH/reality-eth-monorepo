import { useProvider } from "./useProvider";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

export function useSigner() {
  const provider = useProvider();
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const connect = useCallback(async () => {
    if (provider instanceof ethers.providers.Web3Provider) {
      setConnecting(true);
      try {
        await provider.send("eth_requestAccounts", []);
        setConnected(true);
      } catch (error) {
        setConnected(false);
        throw error;
      } finally {
        setConnecting(false);
      }
    }
  }, [provider]);

  const signer = useMemo(() => {
    if (provider instanceof ethers.providers.Web3Provider) {
      return provider.getSigner();
    }
    return null;
  }, [provider]);

  useEffect(() => {
    if (signer) {
      signer
        .getAddress()
        .then(() => setConnected(true))
        .catch(() => setConnected(false));
    }
  }, [signer]);

  return { signer, connected, connect, connecting };
}
