import { LitElement } from 'lit';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-image';
import '@reown/appkit-ui/wui-loading-spinner';
import '@reown/appkit-ui/wui-pulse';
import '@reown/appkit-ui/wui-separator';
import '@reown/appkit-ui/wui-text';
export declare class W3mPayLoadingView extends LitElement {
    static styles: import("lit").CSSResult;
    private unsubscribe;
    private pollingInterval;
    private paymentAsset;
    private quoteStatus;
    private quote;
    private amount;
    private namespace;
    private caipAddress;
    private profileName;
    private activeConnectorIds;
    private selectedExchange;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    render(): import("lit").TemplateResult<1>;
    private tokenTemplate;
    private paymentTemplate;
    private paymentLifecycleTemplate;
    private renderPaymentCycleBadge;
    private renderPayment;
    private renderWallet;
    private renderWalletText;
    private getStepsWithStatus;
    private renderStep;
    private renderStatusIndicator;
    private startPolling;
    private stopPolling;
    private fetchQuoteStatus;
    private initializeNamespace;
    private getWalletProperties;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-pay-loading-view': W3mPayLoadingView;
    }
}
