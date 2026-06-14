import type UniversalProvider from '@walletconnect/universal-provider';
import type { ChainNamespace } from '@reown/appkit-common';
import type { ConnectorType } from '../utils/TypeUtil.js';
import type { ChainControllerState } from './ChainController.js';
export interface ProviderControllerState {
    providers: Record<ChainNamespace, UniversalProvider | unknown | undefined>;
    providerIds: Record<ChainNamespace, ConnectorType | undefined>;
}
type StateKey = keyof ProviderControllerState;
export type ProviderType = 'walletConnect' | 'injected' | 'coinbaseWallet' | 'eip6963' | 'AUTH' | 'coinbaseWalletSDK' | 'baseAccount';
export declare const ProviderController: {
    state: ProviderControllerState;
    subscribeKey<K extends StateKey>(key: K, callback: (value: ProviderControllerState[K]) => void): () => void;
    subscribe(callback: (value: ProviderControllerState) => void): () => void;
    subscribeProviders(callback: (providers: ProviderControllerState["providers"]) => void): () => void;
    setProvider<T = UniversalProvider>(chainNamespace: ChainControllerState["activeChain"], provider: T): void;
    getProvider<T = UniversalProvider>(chainNamespace: ChainControllerState["activeChain"]): T | undefined;
    setProviderId(chainNamespace: ChainNamespace, providerId: ConnectorType): void;
    getProviderId(chainNamespace: ChainNamespace | undefined): ConnectorType | undefined;
    reset(): void;
    resetChain(chainNamespace: ChainNamespace): void;
};
export {};
