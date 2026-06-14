import { LitElement } from 'lit';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-text';
export declare class W3mPayHeader extends LitElement {
    static styles: import("lit").CSSResult[];
    private unsubscribe;
    paymentAsset: import("@reown/appkit-pay").PaymentAsset;
    amount: number;
    constructor();
    disconnectedCallback(): void;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-pay-header': W3mPayHeader;
    }
}
