import type { CaipNetwork, ChainNamespace } from '@reown/appkit-common';
import type { Connector, WcWallet } from './TypeUtil.js';
export interface AssetUtilState {
    networkImagePromises: Record<string, Promise<void>>;
    tokenImagePromises: Record<string, Promise<void>>;
}
export declare const AssetUtil: {
    fetchWalletImage(imageId?: string): Promise<string | undefined>;
    fetchNetworkImage(imageId?: string): Promise<string | undefined>;
    /**
     * Fetches the token image for the given image ID.
     * @param imageId - The image id of the token.
     * @returns The token image.
     */
    fetchTokenImage(imageId?: string): Promise<string | undefined>;
    getWalletImageById(imageId?: string): string | undefined;
    getWalletImage(wallet?: WcWallet): string | undefined;
    getNetworkImage(network?: CaipNetwork): string | undefined;
    getNetworkImageById(imageId?: string): string | undefined;
    getConnectorImage(connector?: Connector): string | undefined;
    getChainImage(chain: ChainNamespace): string | undefined;
    getTokenImage(symbol?: string): string | undefined;
    /**
     * Get the explorer wallet's image URL for the given image ID.
     * @param imageId - The image id of the wallet.
     * @returns The image URL for the wallet.
     */
    getWalletImageUrl(imageId: string | undefined): string;
    /**
     * Get the public asset's image URL with the given image ID.
     * @param imageId - The image id of the asset.
     * @returns The image URL for the asset.
     */
    getAssetImageUrl(imageId: string | undefined): string;
    /**
     * Get the image URL for the given chain namespace.
     * @param chainNamespace - The chain namespace to get the image URL for.
     * @returns The image URL for the chain namespace.
     */
    getChainNamespaceImageUrl(chainNamespace: ChainNamespace): string;
    /**
     * Get the image id for the given token and namespace.
     * @param token - The token address or 'native' to get the image id for.
     * @param namespace - The namespace to get the image id for.
     * @returns The image URL for the token.
     */
    getImageByToken(token: string, namespace: ChainNamespace): Promise<string | undefined>;
};
