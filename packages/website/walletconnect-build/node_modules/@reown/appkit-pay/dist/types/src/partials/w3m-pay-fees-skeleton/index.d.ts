import { LitElement } from 'lit';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-shimmer';
import '@reown/appkit-ui/wui-text';
export declare class W3mPayFeesSkeleton extends LitElement {
    static styles: import("lit").CSSResult[];
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-pay-fees-skeleton': W3mPayFeesSkeleton;
    }
}
