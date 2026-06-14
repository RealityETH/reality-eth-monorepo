import { LitElement, type PropertyValues } from 'lit';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-text';
import '@reown/appkit-ui/wui-wallet-switch';
import '../../partials/w3m-pay-fees-skeleton/index.js';
import '../../partials/w3m-pay-fees/index.js';
import '../../partials/w3m-pay-options-empty/index.js';
import '../../partials/w3m-pay-options-skeleton/index.js';
import '../../partials/w3m-pay-options/index.js';
export declare class W3mPayQuoteView extends LitElement {
    static styles: import("lit").CSSResult;
    private unsubscribe;
    private profileName;
    private paymentAsset;
    private namespace;
    private caipAddress;
    private amount;
    private recipient;
    private activeConnectorIds;
    private selectedPaymentAsset;
    private selectedExchange;
    private isFetchingQuote;
    private quoteError;
    private quote;
    private isFetchingTokenBalances;
    private tokenBalances;
    private isPaymentInProgress;
    private exchangeUrlForQuote;
    private completedTransactionsCount;
    constructor();
    disconnectedCallback(): void;
    updated(changedProperties: PropertyValues): void;
    render(): import("lit").TemplateResult<1>;
    private profileTemplate;
    private initializeNamespace;
    private fetchTokens;
    private fetchQuote;
    private getWalletProperties;
    private paymentOptionsViewTemplate;
    private paymentOptionsTemplate;
    private amountWithFeeTemplate;
    private paymentActionsTemplate;
    private actionButtonTemplate;
    private getPaymentAssetFromTokenBalances;
    private onTokenBalancesChanged;
    private onConnectOtherWallet;
    private onAccountStateChanged;
    private onSelectedPaymentAssetChanged;
    private onTransfer;
    private onSendTransactions;
    private onPayWithExchange;
    private resetAssetsState;
    private resetQuoteState;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-pay-quote-view': W3mPayQuoteView;
    }
}
