import type { SessionTypes } from '@walletconnect/types';
import type { Namespace, NamespaceConfig } from '@walletconnect/universal-provider';
import type UniversalProvider from '@walletconnect/universal-provider';
import { type CaipNetwork, type CaipNetworkId, type ChainNamespace, type ParsedCaipAddress } from '@reown/appkit-common';
import type { OptionsControllerState } from '../controllers/OptionsController.js';
interface ListenWcProviderParams {
    universalProvider: UniversalProvider;
    namespace: ChainNamespace;
    onConnect?: (parsedData: ParsedCaipAddress[]) => void;
    onDisconnect?: () => void;
    onAccountsChanged?: (parsedData: ParsedCaipAddress[]) => void;
    onChainChanged?: (chainId: number | string) => void;
    onDisplayUri?: (uri: string) => void;
}
export declare const DEFAULT_METHODS: {
    ton: string[];
    solana: string[];
    eip155: string[];
    bip122: string[];
};
export declare const WcHelpersUtil: {
    RPC_ERROR_CODE: {
        USER_REJECTED: number;
        USER_REJECTED_METHODS: number;
    };
    /**
     * Retrieves the array of supported methods for a given chain namespace.
     * @param chainNamespace - The chain namespace.
     * @returns An array of method strings.
     */
    getMethodsByChainNamespace(chainNamespace: ChainNamespace): string[];
    /**
     * Creates a default WalletConnect namespace configuration for the given chain namespace.
     * @param chainNamespace - The chain namespace.
     * @returns The default Namespace object.
     */
    createDefaultNamespace(chainNamespace: ChainNamespace): Namespace;
    /**
     * Applies overrides to the base WalletConnect NamespaceConfig.
     * @param baseNamespaces - The base namespace configuration.
     * @param overrides - Optional overrides for methods, chains, events, rpcMap.
     * @returns The resulting NamespaceConfig with overrides applied.
     */
    applyNamespaceOverrides(baseNamespaces: NamespaceConfig, overrides?: OptionsControllerState["universalProviderConfigOverride"]): NamespaceConfig;
    /**
     * Creates WalletConnect namespaces based on CAIP network definitions,
     * optionally applying custom overrides.
     * @param caipNetworks - Array of CaipNetwork definitions.
     * @param configOverride - Optional overrides for namespaces.
     * @returns The resulting NamespaceConfig.
     */
    createNamespaces(caipNetworks: CaipNetwork[], configOverride?: OptionsControllerState["universalProviderConfigOverride"]): NamespaceConfig;
    /**
     * Resolves a Reown/ENS name to its first matching address across configured networks.
     * @param name - The ENS or Reown name to resolve.
     * @returns The resolved address as a string, or false if not found.
     */
    resolveReownName: (name: string) => Promise<string | false>;
    /**
     * Extracts all CAIP network IDs used in given WalletConnect namespaces.
     * @param namespaces - WalletConnect Namespaces object.
     * @returns Array of CAIP network IDs (chainNamespace:chainId).
     */
    getChainsFromNamespaces(namespaces?: SessionTypes.Namespaces): CaipNetworkId[];
    /**
     * Type guard to check if an object is a WalletConnect session event data.
     * @param data - The data to check.
     * @returns True if data matches SessionEventData structure.
     */
    isSessionEventData(data: unknown): data is WcHelpersUtil.SessionEventData;
    /**
     * Detects if an error object represents a user-rejected WalletConnect request.
     * @param error - The error object to check.
     * @returns True if user rejected request, otherwise false.
     */
    isUserRejectedRequestError(error: unknown): boolean;
    /**
     * Checks if a current origin is allowed by configured allowed and default origin patterns.
     * Localhost and 127.0.0.1 are always allowed.
     * @param currentOrigin - The current web origin.
     * @param allowedPatterns - Patterns from project configuration.
     * @param defaultAllowedOrigins - Built-in or default allowed patterns.
     * @returns True if the origin is allowed, false otherwise.
     */
    isOriginAllowed(currentOrigin: string, allowedPatterns: string[], defaultAllowedOrigins: string[]): boolean;
    /**
     * Attaches event listeners to a UniversalProvider instance for WalletConnect events.
     * @param params - The listener parameters including handlers for connect, disconnect, etc.
     */
    listenWcProvider({ universalProvider, namespace, onConnect, onDisconnect, onAccountsChanged, onChainChanged, onDisplayUri }: ListenWcProviderParams): void;
    /**
     * Retrieves and parses the unique set of accounts for a given WalletConnect namespace.
     * @param universalProvider - The UniversalProvider instance.
     * @param namespace - The chain namespace to extract accounts for.
     * @returns Array of parsed CaipAddress objects.
     */
    getWalletConnectAccounts(universalProvider: UniversalProvider, namespace: ChainNamespace): ParsedCaipAddress[];
};
export declare namespace WcHelpersUtil {
    type SessionEventData = {
        id: string;
        topic: string;
        params: {
            chainId: string;
            event: {
                data: unknown;
                name: string;
            };
        };
    };
}
export {};
