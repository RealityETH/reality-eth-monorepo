import { LitElement } from 'lit';
import '@reown/appkit-ui/wui-button';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-icon';
import '@reown/appkit-ui/wui-text';
export declare class W3mPayOptionsEmpty extends LitElement {
    static styles: import("lit").CSSResult[];
    private unsubscribe;
    selectedExchange: import("../../types/exchange.js").Exchange | undefined;
    constructor();
    disconnectedCallback(): void;
    render(): import("lit").TemplateResult<1>;
    private dispatchConnectOtherWalletEvent;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-pay-options-empty': W3mPayOptionsEmpty;
    }
}
