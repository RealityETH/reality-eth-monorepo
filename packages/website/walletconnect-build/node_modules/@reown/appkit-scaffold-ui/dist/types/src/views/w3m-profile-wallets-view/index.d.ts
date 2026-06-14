import { LitElement } from 'lit';
import '@reown/appkit-ui/wui-active-profile-wallet-item';
import '@reown/appkit-ui/wui-balance';
import '@reown/appkit-ui/wui-button';
import '@reown/appkit-ui/wui-icon';
import '@reown/appkit-ui/wui-icon-box';
import '@reown/appkit-ui/wui-inactive-profile-wallet-item';
import '@reown/appkit-ui/wui-list-item';
import '@reown/appkit-ui/wui-separator';
import '@reown/appkit-ui/wui-tabs';
import '@reown/appkit-ui/wui-text';
export declare class W3mProfileWalletsView extends LitElement {
    static styles: import("lit").CSSResult;
    private unsubscribers;
    private resizeObserver?;
    private chainListener?;
    private currentTab;
    private namespace;
    private namespaces;
    private caipAddress;
    private profileName;
    private activeConnectorIds;
    private lastSelectedAddress;
    private lastSelectedConnectorId;
    private isSwitching;
    private caipNetwork;
    private user;
    private remoteFeatures;
    constructor();
    disconnectedCallback(): void;
    firstUpdated(): void;
    render(): import("lit").TemplateResult<1>;
    private renderTabs;
    private renderHeader;
    private renderConnections;
    private renderActiveConnections;
    private renderActiveProfile;
    private renderActiveConnectionsList;
    private renderRecentConnections;
    private renderConnectionList;
    private renderAddConnectionButton;
    private renderEmptyState;
    private handleTabChange;
    private handleSwitchWallet;
    private handleWalletAction;
    private handleDisconnect;
    private handleCopyAddress;
    private handleMore;
    private handleExternalLink;
    private handleAddConnection;
    private getChainLabelInfo;
    private isSmartAccount;
    private getPlainAddress;
    private getActiveConnections;
    private hasAnyConnections;
    private isAccountLoading;
    private getProfileContent;
    private getBitcoinProfileContent;
    private removeScrollListener;
    private handleConnectListScroll;
    private isMultiWalletEnabled;
    private updateScrollOpacity;
    private onConnectionsChange;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-profile-wallets-view': W3mProfileWalletsView;
    }
}
