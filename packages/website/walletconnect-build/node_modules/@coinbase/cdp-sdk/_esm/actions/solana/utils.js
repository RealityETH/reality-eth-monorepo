import { createSolanaRpc } from "@solana/kit";
import { GENESIS_HASH_MAINNET, GENESIS_HASH_DEVNET, USDC_MAINNET_MINT_ADDRESS, USDC_DEVNET_MINT_ADDRESS, } from "./constants.js";
/**
 * Get a Solana RPC client for the given network or return the provided one
 *
 * @param options - The options for the connection
 *
 * @param options.networkOrConnection - The network to use or an existing RPC client
 *
 * @returns The RPC client
 */
export function getOrCreateConnection({ networkOrConnection, }) {
    if (typeof networkOrConnection !== "string") {
        return networkOrConnection;
    }
    return createSolanaRpc(networkOrConnection === "mainnet"
        ? "https://api.mainnet-beta.solana.com"
        : "https://api.devnet.solana.com");
}
/**
 * Determine the network from the RPC client by checking the genesis hash
 *
 * @param rpc - The Solana RPC client
 * @returns The network type (mainnet or devnet)
 */
export async function getConnectedNetwork(rpc) {
    const genesisHash = await rpc.getGenesisHash().send();
    if (genesisHash === GENESIS_HASH_MAINNET) {
        return "mainnet";
    }
    else if (genesisHash === GENESIS_HASH_DEVNET) {
        return "devnet";
    }
    throw new Error("Unknown or unsupported network");
}
/**
 * Get the USDC mint address for the given connection
 *
 * @param network - The network to use
 *
 * @returns The USDC mint address
 */
export function getUsdcMintAddress(network) {
    if (network === "mainnet") {
        return USDC_MAINNET_MINT_ADDRESS;
    }
    return USDC_DEVNET_MINT_ADDRESS;
}
//# sourceMappingURL=utils.js.map