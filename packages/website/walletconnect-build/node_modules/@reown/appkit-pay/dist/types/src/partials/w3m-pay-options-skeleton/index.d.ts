import { LitElement } from 'lit';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-shimmer';
export declare class W3mPayOptionsSkeleton extends LitElement {
    static styles: import("lit").CSSResult[];
    render(): import("lit").TemplateResult<1>;
    private renderOptionEntry;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-pay-options-skeleton': W3mPayOptionsSkeleton;
    }
}
