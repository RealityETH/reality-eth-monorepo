import { type ChainNamespace, type ParsedCaipAddress } from '@reown/appkit-common';
import { type RouterControllerState } from '../controllers/RouterController.js';
import type { Connector, SocialProvider } from './TypeUtil.js';
interface ConnectWalletConnectParameters {
    walletConnect: boolean;
    connector?: Connector;
    closeModalOnConnect?: boolean;
    redirectViewOnModalClose?: RouterControllerState['view'];
    onOpen?: (isMobile?: boolean) => void;
    onConnect?: () => void;
}
interface ConnectSocialParameters {
    social: SocialProvider;
    namespace?: ChainNamespace;
    closeModalOnConnect?: boolean;
    redirectViewOnModalClose?: RouterControllerState['view'];
    onOpenFarcaster?: () => void;
    onConnect?: () => void;
}
interface ConnectEmailParameters {
    closeModalOnConnect?: boolean;
    namespace?: ChainNamespace;
    redirectViewOnModalClose?: RouterControllerState['view'];
    onOpen?: () => void;
    onConnect?: () => void;
}
export declare const ConnectorControllerUtil: {
    checkNamespaceConnectorId(namespace: ChainNamespace, connectorId: string): boolean;
    isSocialProvider(socialProvider: string): socialProvider is SocialProvider;
    connectWalletConnect({ walletConnect, connector, closeModalOnConnect, redirectViewOnModalClose, onOpen, onConnect }: ConnectWalletConnectParameters): Promise<ParsedCaipAddress>;
    connectExternal(connector: Connector): Promise<ParsedCaipAddress>;
    connectSocial({ social: socialProvider, namespace, closeModalOnConnect, onOpenFarcaster, onConnect }: ConnectSocialParameters): Promise<ParsedCaipAddress>;
    connectEmail({ closeModalOnConnect, redirectViewOnModalClose, onOpen, onConnect }: ConnectEmailParameters): Promise<ParsedCaipAddress>;
    updateEmail(): Promise<{
        email: string;
    }>;
    canSwitchToSmartAccount(namespace: ChainNamespace): boolean;
};
export {};
