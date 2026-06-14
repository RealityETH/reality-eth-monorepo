import { type CaipNetwork, type ChainNamespace } from '@reown/appkit-common';
import type { AdapterBlueprint } from '@reown/appkit-controllers';
import { AppKitBaseClient, type AppKitOptionsWithSdk } from './appkit-base-client.js';
declare global {
    interface Window {
        ethereum?: Record<string, unknown>;
    }
}
export declare class AppKit extends AppKitBaseClient {
    static instance?: AppKit;
    private authProvider?;
    private onAuthProviderConnected;
    private setupAuthConnectorListeners;
    private syncAuthConnectorTheme;
    private syncAuthConnector;
    private checkExistingTelegramSocialConnection;
    private createAuthProvider;
    private createAuthProviderForAdapter;
    protected initControllers(options: AppKitOptionsWithSdk): void;
    protected switchCaipNetwork(caipNetwork: CaipNetwork): Promise<void>;
    protected initialize(options: AppKitOptionsWithSdk): Promise<void>;
    syncIdentity({ address, chainId, chainNamespace }: Pick<AdapterBlueprint.ConnectResult, 'address' | 'chainId'> & {
        chainNamespace: ChainNamespace;
    }): Promise<void>;
    protected syncConnectedWalletInfo(chainNamespace: ChainNamespace): void;
    protected injectModalUi(): Promise<void>;
    private loadModalComponents;
}
