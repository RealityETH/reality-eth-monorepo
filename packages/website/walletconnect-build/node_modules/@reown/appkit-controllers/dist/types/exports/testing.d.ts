import type { CaipNetwork, ChainNamespace } from '@reown/appkit-common';
import type { SIWXSession } from '@reown/appkit-controllers';
import { type AccountState, type AdapterNetworkState, type ChainAdapter, type ChainControllerState } from '../exports/index.js';
export declare const extendedMainnet: CaipNetwork;
export declare const solanaCaipNetwork: CaipNetwork;
export declare function mockChainControllerState(state: Partial<Omit<ChainControllerState, 'chains'> & {
    chains: Map<ChainNamespace, Partial<Omit<ChainAdapter, 'accountState' | 'networkState'>> & {
        accountState?: Partial<AccountState>;
        networkState?: Partial<AdapterNetworkState>;
    }>;
}>): void;
export declare function updateChainsMap(namespace: ChainNamespace, state: Partial<Omit<ChainAdapter, 'accountState' | 'networkState'>> & {
    accountState?: Partial<AccountState>;
    networkState?: Partial<AdapterNetworkState>;
}): void;
export declare function mockAccountState(state: AccountState): void;
type MockSessionReplaces = {
    [K in keyof SIWXSession]?: Partial<SIWXSession[K]>;
};
export declare function mockSession(replaces?: MockSessionReplaces): SIWXSession;
export {};
