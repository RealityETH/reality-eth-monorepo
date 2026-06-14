import type { Balance, CaipAddress, ChainNamespace, SocialProvider } from '@reown/appkit-common';
import type { NamespaceTypeMap, PreferredAccountTypes } from '../../../../utils/TypeUtil.js';
export type Metadata = {
    label: string;
    icon: string;
};
export type AccountType = NamespaceTypeMap[ChainNamespace];
export type AccountProps = {
    address: string;
    caipAddress: CaipAddress;
    type: AccountType;
    namespace: ChainNamespace;
    metadata: Metadata;
};
export type EmbeddedWalletProps = {
    userInfo?: Record<string, unknown>;
    authProvider: SocialProvider;
    accountType: PreferredAccountTypes[ChainNamespace];
    isSmartAccountDeployed: boolean;
};
export declare abstract class Account {
    address: string;
    caipAddress: CaipAddress;
    type: AccountType;
    namespace: ChainNamespace;
    metadata: {
        label: string;
        icon: string;
    };
    balance?: string;
    balanceSymbol?: string;
    balanceLoading?: boolean;
    tokenBalance?: Balance[];
    profileName?: string | null;
    profileImage?: string | null;
    addressLabels: Map<string, string>;
    addressExplorerUrl?: string;
    smartAccountDeployed?: boolean;
    socialProvider?: SocialProvider;
    preferredAccountType?: NamespaceTypeMap[keyof NamespaceTypeMap];
    constructor({ address, caipAddress, type, namespace, metadata }: AccountProps);
}
