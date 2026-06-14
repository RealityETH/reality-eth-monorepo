import { LitElement } from 'lit';
import '../../components/wui-icon/index.js';
import '../../components/wui-image/index.js';
import '../../components/wui-text/index.js';
import type { SelectSize } from '../../utils/TypeUtil.js';
export declare class WuiSelect extends LitElement {
    static styles: import("lit").CSSResult[];
    imageSrc: string;
    text: string;
    size: SelectSize;
    type: 'filled-dropdown' | 'text-dropdown';
    disabled: boolean;
    render(): import("lit").TemplateResult<1>;
    private textTemplate;
    private imageTemplate;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-select': WuiSelect;
    }
}
