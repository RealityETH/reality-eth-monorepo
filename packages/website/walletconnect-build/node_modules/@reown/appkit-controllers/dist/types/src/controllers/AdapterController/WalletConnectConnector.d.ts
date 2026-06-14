import type { SessionTypes } from '@walletconnect/types';
import UniversalProvider from '@walletconnect/universal-provider';
import { type CaipNetwork, type ChainNamespace } from '@reown/appkit-common';
import type { ChainAdapterConnector } from './types.js';
export declare class WalletConnectConnector<Namespace extends ChainNamespace = ChainNamespace> implements ChainAdapterConnector {
    readonly id: "walletConnect";
    readonly name = "WalletConnect";
    readonly type = "WALLET_CONNECT";
    readonly imageId = "ef1a1fcf-7fe8-4d69-bd6d-fda1345b4400";
    readonly chain: Namespace;
    provider: UniversalProvider;
    protected caipNetworks: CaipNetwork[];
    private getCaipNetworks;
    constructor({ provider, namespace }: WalletConnectConnector.Options<Namespace>);
    get chains(): CaipNetwork[];
    connectWalletConnect(): Promise<{
        clientId: string;
        session: SessionTypes.Struct;
    }>;
    disconnect(): Promise<void>;
    authenticate(): Promise<boolean>;
}
export declare namespace WalletConnectConnector {
    type Options<Namespace extends ChainNamespace> = {
        provider: UniversalProvider;
        caipNetworks: CaipNetwork[];
        namespace: Namespace;
    };
    type ConnectResult = {
        clientId: string | null;
        session: SessionTypes.Struct;
    };
}
