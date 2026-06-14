import { LitElement } from 'lit';
import '@reown/appkit-ui/wui-button';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-input-amount';
import '@reown/appkit-ui/wui-link';
import '@reown/appkit-ui/wui-text';
export declare class W3mFundInput extends LitElement {
    amount?: number;
    maxDecimals?: number | undefined;
    maxIntegers?: number | undefined;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-fund-input': W3mFundInput;
    }
}
