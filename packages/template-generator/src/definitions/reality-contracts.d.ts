declare module "@reality.eth/contracts" {
  function realityETHConfig(
    chain_id: number,
    token: string,
    version?: string
  ): {
    address: string;
    arbitrators: Record<string, string>;
    block: number;
    chain_id: number;
    contract_name: string;
    contract_version: string;
    version_number: string;
  };

  function chainTokenList(chain_id: number): Record<
    string,
    {
      decimals: number;
      is_native: boolean;
      native_chains: Record<number, boolean>;
      small_number: number;
    }
  >;
}
