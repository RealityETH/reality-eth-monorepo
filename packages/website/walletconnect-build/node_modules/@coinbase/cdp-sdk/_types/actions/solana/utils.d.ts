import { createSolanaRpc } from "@solana/kit";
export type Network = "mainnet" | "devnet";
export type SolanaRpcClient = ReturnType<typeof createSolanaRpc>;
type GetOrCreateConnectionOptions = {
    networkOrConnection: Network | SolanaRpcClient;
};
/**
 * Get a Solana RPC client for the given network or return the provided one
 *
 * @param options - The options for the connection
 *
 * @param options.networkOrConnection - The network to use or an existing RPC client
 *
 * @returns The RPC client
 */
export declare function getOrCreateConnection({ networkOrConnection, }: GetOrCreateConnectionOptions): SolanaRpcClient;
/**
 * Determine the network from the RPC client by checking the genesis hash
 *
 * @param rpc - The Solana RPC client
 * @returns The network type (mainnet or devnet)
 */
export declare function getConnectedNetwork(rpc: SolanaRpcClient): Promise<Network>;
/**
 * Get the USDC mint address for the given connection
 *
 * @param network - The network to use
 *
 * @returns The USDC mint address
 */
export declare function getUsdcMintAddress(network: Network): string;
export {};
//# sourceMappingURL=utils.d.ts.map