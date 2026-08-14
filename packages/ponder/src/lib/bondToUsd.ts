import LOOKUP from "../../../contracts/generated/contract_token_lookup.json";

interface TokenInfo {
  symbol: string;
  decimals: number;
  approx_1_usd: number;
}

const lookup = LOOKUP as Record<string, Record<string, TokenInfo>>;

// Returns USD value scaled by 1e18 as a BigInt.
export function bondToUsdBigInt(bond: bigint, contractAddr: string, chainId: number): bigint {
  const byChain = lookup[String(chainId)];
  if (!byChain) return 0n;
  const info = byChain[contractAddr.toLowerCase()];
  if (!info?.approx_1_usd) return 0n;
  const convFactor = BigInt(Math.round(1e18 / info.approx_1_usd));
  return bond * convFactor / BigInt(10 ** info.decimals);
}
