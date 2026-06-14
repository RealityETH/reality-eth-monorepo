import { LitElement } from 'lit';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-icon';
import '@reown/appkit-ui/wui-icon-box';
import '@reown/appkit-ui/wui-input-text';
import '@reown/appkit-ui/wui-link';
import '@reown/appkit-ui/wui-list-token';
import '@reown/appkit-ui/wui-separator';
import '@reown/appkit-ui/wui-text';
export declare class W3mDepositFromExchangeSelectAssetView extends LitElement {
    static styles: import("lit").CSSResult;
    private unsubscribe;
    private assets;
    private search;
    constructor();
    disconnectedCallback(): void;
    render(): import("lit").TemplateResult<1>;
    private templateSearchInput;
    private templateTokens;
    private onBuyClick;
    private onInputChange;
    private onDebouncedSearch;
    private handleTokenClick;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-deposit-from-exchange-select-asset-view': W3mDepositFromExchangeSelectAssetView;
    }
}
