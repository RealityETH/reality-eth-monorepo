const labels: Record<number, string> = {
  1: "Main Ethereum Network",
  4: "Rinkeby Test Network",
  8: "Ubiq Main Network",
  42: "Kovan Test Network",
  56: "Binance Smart Chain",
  77: "Sokal Network",
  100: "XDAI Network",
  137: "Polygon Main Network (Matic)",
  42161: "Arbitrum One Network",
  421611: "Arbitrum Rinkeby Test Network",
  123411710: "Local Test Network",
};

export function getNetworkLabel(chainId: number) {
  return labels[chainId] || "Unknown Test Network";
}
