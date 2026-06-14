import { LitElement } from 'lit';
import { type CurrentPayment, type Exchange } from '@reown/appkit-controllers';
import '@reown/appkit-ui/wui-chip-button';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-icon-link';
import '@reown/appkit-ui/wui-image';
import '@reown/appkit-ui/wui-list-item';
import '@reown/appkit-ui/wui-shimmer';
import '@reown/appkit-ui/wui-text';
import '../../partials/w3m-fund-input/index.js';
export declare class W3mDepositFromExchangeView extends LitElement {
    static styles: import("lit").CSSResult;
    private unsubscribe;
    network: import("@reown/appkit-common").CaipNetwork | undefined;
    exchanges: Exchange[];
    isLoading: boolean;
    amount: number | null;
    tokenAmount: number;
    priceLoading: boolean;
    isPaymentInProgress: boolean;
    currentPayment?: CurrentPayment;
    paymentId: string;
    paymentAsset: import("@reown/appkit-controllers").PaymentAsset | null;
    constructor();
    disconnectedCallback(): void;
    firstUpdated(): Promise<void>;
    render(): import("lit").TemplateResult<1>;
    private exchangesLoadingTemplate;
    private _exchangesTemplate;
    private exchangesTemplate;
    private amountInputTemplate;
    private tokenAmountTemplate;
    private onExchangeClick;
    private handlePaymentInProgress;
    private onAmountChange;
    private getPaymentAssets;
    private setDefaultPaymentAsset;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-deposit-from-exchange-view': W3mDepositFromExchangeView;
    }
}
