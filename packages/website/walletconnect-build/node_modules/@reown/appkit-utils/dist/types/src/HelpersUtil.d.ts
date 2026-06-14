import { type ChainNamespace } from '@reown/appkit-common';
import { type Tokens } from '@reown/appkit-controllers';
export declare const HelpersUtil: {
    getCaipTokens(tokens?: Tokens): Tokens | undefined;
    isLowerCaseMatch(str1?: string, str2?: string): boolean;
    /**
     * Iterates the Auth connector supported chains and returns the namespace that is last connected to the active chain.
     * @returns ChainNamespace | undefined
     */
    getActiveNamespaceConnectedToAuth(): ChainNamespace | undefined;
    /**
     * Runs a condition function again and again until it returns true or the max number of tries is reached.
     *
     * @param conditionFn - A function (can be async) that returns true when the condition is met.
     * @param intervalMs - Time to wait between tries, in milliseconds.
     * @param maxRetries - Maximum number of times to try before stopping.
     * @returns A Promise that resolves to true if the condition becomes true in time, or false if it doesn't.
     */
    withRetry({ conditionFn, intervalMs, maxRetries }: {
        conditionFn: () => boolean | Promise<boolean>;
        intervalMs: number;
        maxRetries: number;
    }): Promise<boolean>;
    /**
     * Returns the chain namespace from user's chainId which is returned from Auth provider.
     * @param chainId - The chainId to parse.
     * @returns The chain namespace.
     */
    userChainIdToChainNamespace(chainId: number | string): ChainNamespace;
    /**
     * Get all auth namespaces except the active one
     * @param activeNamespace - The active namespace
     * @returns All auth namespaces except the active one
     */
    getOtherAuthNamespaces(activeNamespace: ChainNamespace | undefined): ChainNamespace[];
    /**
     * Gets the storage info for a connector
     * @param connectorId - The ID of the connector
     * @param namespace - The namespace of the connector
     * @returns
     */
    getConnectorStorageInfo(connectorId: string, namespace: ChainNamespace): {
        hasDisconnected: boolean;
        hasConnected: boolean;
    };
};
