import { LitElement } from 'lit';
import type { SizeType, TextColorType } from '../../utils/TypeUtil.js';
export declare class WuiLoadingSpinner extends LitElement {
    static styles: import("lit").CSSResult[];
    color: TextColorType;
    size: Exclude<SizeType, 'inherit' | 'xs' | 'xxs' | 'mdl'>;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-loading-spinner': WuiLoadingSpinner;
    }
}
