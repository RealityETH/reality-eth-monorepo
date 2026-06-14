"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateConnection = getOrCreateConnection;
exports.getConnectedNetwork = getConnectedNetwork;
exports.getUsdcMintAddress = getUsdcMintAddress;
const kit_1 = require("@solana/kit");
const constants_js_1 = require("./constants.js");
/**
 * Get a Solana RPC client for the given network or return the provided one
 *
 * @param options - The options for the connection
 *
 * @param options.networkOrConnection - The network to use or an existing RPC client
 *
 * @returns The RPC client
 */
function getOrCreateConnection({ networkOrConnection, }) {
    if (typeof networkOrConnection !== "string") {
        return networkOrConnection;
    }
    return (0, kit_1.createSolanaRpc)(networkOrConnection === "mainnet"
        ? "https://api.mainnet-beta.solana.com"
        : "https://api.devnet.solana.com");
}
/**
 * Determine the network from the RPC client by checking the genesis hash
 *
 * @param rpc - The Solana RPC client
 * @returns The network type (mainnet or devnet)
 */
async function getConnectedNetwork(rpc) {
    const genesisHash = await rpc.getGenesisHash().send();
    if (genesisHash === constants_js_1.GENESIS_HASH_MAINNET) {
        return "mainnet";
    }
    else if (genesisHash === constants_js_1.GENESIS_HASH_DEVNET) {
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
function getUsdcMintAddress(network) {
    if (network === "mainnet") {
        return constants_js_1.USDC_MAINNET_MINT_ADDRESS;
    }
    return constants_js_1.USDC_DEVNET_MINT_ADDRESS;
}
//# sourceMappingURL=utils.js.map