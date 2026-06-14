import { LitElement } from 'lit';
import '@reown/appkit-ui/wui-button';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-icon';
import '@reown/appkit-ui/wui-text';
export declare class W3mUsageExceededView extends LitElement {
    static styles: import("lit").CSSResult;
    constructor();
    render(): import("lit").TemplateResult<1>;
    private onTryAgainClick;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-usage-exceeded-view': W3mUsageExceededView;
    }
}
