import { LitElement } from 'lit';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-text';
import type { PaymentAssetWithAmount } from '../../types/options.js';
export declare class W3mPayOptions extends LitElement {
    static styles: import("lit").CSSResult[];
    private unsubscribe;
    private resizeObserver?;
    options: PaymentAssetWithAmount[];
    selectedPaymentAsset: PaymentAssetWithAmount | null;
    onSelect?: (selectedPaymentAsset: PaymentAssetWithAmount) => void;
    constructor();
    disconnectedCallback(): void;
    firstUpdated(): void;
    render(): import("lit").TemplateResult<1>;
    private payOptionTemplate;
    private handleOptionsListScroll;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-pay-options': W3mPayOptions;
    }
}
