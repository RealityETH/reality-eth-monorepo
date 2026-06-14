import { type HttpTransport, type Transport } from 'viem';
import { type AppKitNetwork, type CaipNetwork, type CaipNetworkId, type ChainNamespace, type CustomRpcUrl, type CustomRpcUrlMap } from '@reown/appkit-common';
export declare function getBlockchainApiRpcUrl(caipNetworkId: CaipNetworkId, projectId: string): string;
type ExtendCaipNetworkParams = {
    customNetworkImageUrls: Record<number | string, string> | undefined;
    projectId: string;
    customRpc?: boolean;
    customRpcUrls?: CustomRpcUrlMap;
};
export declare const CaipNetworksUtil: {
    /**
     * Extends the RPC URL with the project ID if the RPC URL is a Reown URL
     * @param rpcUrl - The RPC URL to extend
     * @param projectId - The project ID to extend the RPC URL with
     * @returns The extended RPC URL
     */
    extendRpcUrlWithProjectId(rpcUrl: string, projectId: string): string;
    isCaipNetwork(network: AppKitNetwork): network is CaipNetwork;
    getChainNamespace(network: AppKitNetwork): ChainNamespace<import("@reown/appkit-common").InternalChainNamespace>;
    getCaipNetworkId(network: AppKitNetwork): CaipNetworkId;
    getDefaultRpcUrl(caipNetwork: AppKitNetwork, caipNetworkId: CaipNetworkId, projectId: string): string;
    /**
     * Extends the CaipNetwork object with the image ID and image URL if the image ID is not provided
     * @param params - The parameters object
     * @param params.caipNetwork - The CaipNetwork object to extend
     * @param params.networkImageIds - The network image IDs
     * @param params.customNetworkImageUrls - The custom network image URLs
     * @param params.projectId - The project ID
     * @param params.customRpc - Boolean to indicate if the custom RPC URL should be used
     * @param params.customRpcUrls - The map of chain and custom RPC URLs to be used by the AppKit
     * @returns The extended array of CaipNetwork objects
     */
    extendCaipNetwork(caipNetwork: AppKitNetwork | CaipNetwork, { customNetworkImageUrls, projectId, customRpcUrls }: ExtendCaipNetworkParams): CaipNetwork;
    /**
     * Extends the array of CaipNetwork objects with the image ID and image URL if the image ID is not provided
     * @param caipNetworks - The array of CaipNetwork objects to extend
     * @param params - The parameters object
     * @param params.networkImageIds - The network image IDs
     * @param params.customNetworkImageUrls - The custom network image URLs
     * @param params.customRpcUrls - The map of chain and custom RPC URLs to be used by the AppKit
     * @param params.projectId - The project ID
     * @returns The extended array of CaipNetwork objects
     */
    extendCaipNetworks(caipNetworks: AppKitNetwork[], { customNetworkImageUrls, projectId, customRpcUrls }: ExtendCaipNetworkParams): [CaipNetwork, ...CaipNetwork[]];
    getViemTransport(caipNetwork: CaipNetwork, projectId: string, customRpcUrls?: CustomRpcUrl[]): import("viem").FallbackTransport<HttpTransport[]>;
    extendWagmiTransports(caipNetwork: CaipNetwork, projectId: string, transport: Transport): Transport | import("viem").FallbackTransport<readonly [Transport, HttpTransport<undefined, false>]>;
    /**
     * Generates the unsupported network object with the given CaipNetwork ID
     * @param caipNetworkId - The CAIP network ID
     * @returns The unsupported CAIP network object
     */
    getUnsupportedNetwork(caipNetworkId: CaipNetworkId): CaipNetwork;
    /**
     * Gets the CaipNetwork object from the storage if `@appkit/active_caip_network_id` is being set
     * @returns CaipNetwork or undefined
     */
    getCaipNetworkFromStorage(defaultCaipNetwork?: CaipNetwork): CaipNetwork | undefined;
};
export {};
