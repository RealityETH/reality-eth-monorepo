import { LitElement } from 'lit';
import '@reown/appkit-ui/wui-button';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-icon-box';
import '@reown/appkit-ui/wui-separator';
import '../../partials/w3m-input-address/index.js';
import '../../partials/w3m-input-token/index.js';
export declare class W3mWalletSendView extends LitElement {
    static styles: import("lit").CSSResult;
    private unsubscribe;
    private isTryingToChooseDifferentWallet;
    private token;
    private sendTokenAmount;
    private receiverAddress;
    private receiverProfileName;
    private loading;
    private params;
    private caipAddress;
    private message;
    private disconnecting;
    constructor();
    disconnectedCallback(): void;
    firstUpdated(): Promise<void>;
    render(): import("lit").TemplateResult<1>;
    private fetchBalances;
    private fetchNetworkPrice;
    private onButtonClick;
    private onFundWalletClick;
    private onConnectDifferentWalletClick;
    private getMessage;
    private buttonTemplate;
    private handleSendParameters;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-wallet-send-view': W3mWalletSendView;
    }
}
