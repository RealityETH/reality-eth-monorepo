import { LitElement } from 'lit';
import '@reown/appkit-ui/wui-button';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-icon';
import '@reown/appkit-ui/wui-icon-button';
import '@reown/appkit-ui/wui-icon-link';
import '@reown/appkit-ui/wui-image';
import '@reown/appkit-ui/wui-list-item';
import '@reown/appkit-ui/wui-loading-spinner';
import '@reown/appkit-ui/wui-loading-spinner';
import '@reown/appkit-ui/wui-network-image';
import '@reown/appkit-ui/wui-separator';
import '@reown/appkit-ui/wui-text';
import '@reown/appkit-ui/wui-wallet-image';
export declare class W3mPayView extends LitElement {
    static styles: import("lit").CSSResult;
    private unsubscribe;
    private amount;
    private namespace;
    private paymentAsset;
    private activeConnectorIds;
    private caipAddress;
    private exchanges;
    private isLoading;
    constructor();
    disconnectedCallback(): void;
    render(): import("lit").TemplateResult<1>;
    private paymentMethodsTemplate;
    private initializeNamespace;
    private paymentDetailsTemplate;
    private payWithWalletTemplate;
    private connectedWalletTemplate;
    private disconnectedWalletTemplate;
    private templateExchangeOptions;
    private templateSeparator;
    private onWalletPayment;
    private onExchangePayment;
    private onDisconnect;
    private getWalletProperties;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-pay-view': W3mPayView;
    }
}
