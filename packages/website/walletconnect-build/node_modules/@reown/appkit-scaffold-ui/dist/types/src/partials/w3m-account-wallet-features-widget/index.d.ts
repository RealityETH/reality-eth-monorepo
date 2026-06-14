import { LitElement } from 'lit';
import '@reown/appkit-ui/wui-balance';
import '@reown/appkit-ui/wui-button';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-tabs';
import '@reown/appkit-ui/wui-tooltip';
import '@reown/appkit-ui/wui-wallet-switch';
import '../w3m-account-activity-widget/index.js';
import '../w3m-account-tokens-widget/index.js';
import '../w3m-tooltip-trigger/index.js';
import '../w3m-tooltip/index.js';
export declare class W3mAccountWalletFeaturesWidget extends LitElement {
    static styles: import("lit").CSSResult;
    private watchTokenBalance?;
    private unsubscribe;
    private network;
    private profileName;
    private address;
    private currentTab;
    private tokenBalance;
    private features;
    private namespace;
    private activeConnectorIds;
    private remoteFeatures;
    firstUpdated(): void;
    disconnectedCallback(): void;
    render(): import("lit").TemplateResult<1> | null;
    private orderedWalletFeatures;
    private fundWalletTemplate;
    private swapsTemplate;
    private sendTemplate;
    private watchSwapValues;
    private onTokenBalanceError;
    private listContentTemplate;
    private tokenBalanceTemplate;
    private tabsTemplate;
    private onTabChange;
    private onFundWalletClick;
    private onSwapClick;
    private getAuthData;
    private onGoToProfileWalletsView;
    private onSendClick;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-account-wallet-features-widget': W3mAccountWalletFeaturesWidget;
    }
}
