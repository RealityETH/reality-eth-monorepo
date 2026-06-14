import type { Namespace, NamespaceConfig } from '@walletconnect/universal-provider';
import type { CaipNetwork } from '@reown/appkit-common';
export declare const DEFAULT_METHODS: {
    ton: string[];
    solana: string[];
    eip155: string[];
    bip122: string[];
};
export declare function getMethodsByChainNamespace(chainNamespace: string): string[];
export declare function createDefaultNamespace(chainNamespace: string): Namespace;
export declare function createNamespaces(caipNetworks: CaipNetwork[]): NamespaceConfig;
