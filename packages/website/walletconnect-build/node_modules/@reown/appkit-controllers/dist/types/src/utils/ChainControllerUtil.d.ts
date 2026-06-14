import type { ChainNamespace } from '@reown/appkit-common';
import type { ChainAdapter } from './TypeUtil.js';
/**
 * Returns the array of chains to disconnect from the connector with the given namespace.
 * If no namespace is provided, it returns all chains.
 * @param namespace - The namespace of the connector to disconnect from.
 * @returns An array of chains to disconnect.
 */
export declare function getChainsToDisconnect(namespace?: ChainNamespace): [ChainNamespace, ChainAdapter][];
/**
 * Get the active network token address
 * @returns The active network token address
 */
export declare function getActiveNetworkTokenAddress(): string;
/**
 * Get the native token address for a given namespace
 * @param namespace - The namespace of the native token
 * @returns The native token address
 */
export declare function getNativeTokenAddress(namespace: ChainNamespace): "So11111111111111111111111111111111111111111" | "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" | "0x";
/**
 * Get the preferred account type for a given namespace
 * @param namespace - The namespace of the account
 * @returns The preferred account type
 */
export declare function getPreferredAccountType(namespace: ChainNamespace | undefined): "payment" | "ordinal" | "stx" | "smartAccount" | "eoa" | undefined;
/**
 * Get the active CAIP network for a given chain namespace, if no namespace is provided, it returns the active CAIP network
 * @param chainNamespace - The chain namespace to get the active CAIP network for
 * @returns The active CAIP network
 */
export declare function getActiveCaipNetwork(chainNamespace?: ChainNamespace): import("@reown/appkit-common").CaipNetwork | undefined;
