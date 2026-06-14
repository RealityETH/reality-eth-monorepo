import {} from 'viem';
import { ParseUtil } from '@reown/appkit-common';
import { OptionsController } from '../controllers/OptionsController.js';
// -- Constants ----------------------------------------------------------------
let cachedViemUtils = undefined;
// -- Helpers ------------------------------------------------------------------
async function loadViemUtils() {
    if (!cachedViemUtils) {
        const { createPublicClient, http, defineChain } = await import('viem');
        cachedViemUtils = {
            createPublicClient,
            http,
            defineChain
        };
    }
    return cachedViemUtils;
}
// -- Utils --------------------------------------------------------------------
export const ViemUtil = {
    getBlockchainApiRpcUrl(caipNetworkId, projectId) {
        const url = new URL('https://rpc.walletconnect.org/v1/');
        url.searchParams.set('chainId', caipNetworkId);
        url.searchParams.set('projectId', projectId);
        return url.toString();
    },
    async getViemChain(caipNetwork) {
        const { defineChain } = await loadViemUtils();
        const { chainId } = ParseUtil.parseCaipNetworkId(caipNetwork.caipNetworkId);
        return defineChain({ ...caipNetwork, id: Number(chainId) });
    },
    async createViemPublicClient(caipNetwork) {
        const { createPublicClient, http } = await loadViemUtils();
        const projectId = OptionsController.state.projectId;
        const viemChain = await ViemUtil.getViemChain(caipNetwork);
        if (!viemChain) {
            throw new Error(`Chain ${caipNetwork.caipNetworkId} not found in viem/chains`);
        }
        return createPublicClient({
            chain: viemChain,
            transport: http(ViemUtil.getBlockchainApiRpcUrl(caipNetwork.caipNetworkId, projectId))
        });
    }
};
//# sourceMappingURL=ViemUtil.js.map