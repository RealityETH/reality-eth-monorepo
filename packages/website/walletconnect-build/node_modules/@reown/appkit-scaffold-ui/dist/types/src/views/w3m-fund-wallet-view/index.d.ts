import { LitElement } from 'lit';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-list-item';
import '@reown/appkit-ui/wui-text';
export declare class W3mFundWalletView extends LitElement {
    private unsubscribe;
    private activeCaipNetwork;
    private features;
    private remoteFeatures;
    private exchangesLoading;
    private exchanges;
    constructor();
    disconnectedCallback(): void;
    firstUpdated(): Promise<void>;
    render(): import("lit").TemplateResult<1>;
    private setDefaultPaymentAsset;
    private onrampTemplate;
    private depositFromExchangeTemplate;
    private receiveTemplate;
    private onBuyCrypto;
    private onReceive;
    private onDepositFromExchange;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-fund-wallet-view': W3mFundWalletView;
    }
}
