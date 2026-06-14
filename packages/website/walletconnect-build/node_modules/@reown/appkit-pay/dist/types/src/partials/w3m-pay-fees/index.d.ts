import { LitElement } from 'lit';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-image';
import '@reown/appkit-ui/wui-text';
export declare class W3mPayFees extends LitElement {
    static styles: import("lit").CSSResult[];
    private unsubscribe;
    private quote;
    constructor();
    disconnectedCallback(): void;
    render(): import("lit").TemplateResult<1>;
    private renderFee;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-pay-fees': W3mPayFees;
    }
}
