import { LitElement } from 'lit';
type Variant = 'default' | 'light';
export declare class WuiShimmer extends LitElement {
    static styles: import("lit").CSSResult[];
    width: string;
    height: string;
    variant: Variant;
    rounded: boolean;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-shimmer': WuiShimmer;
    }
}
export {};
