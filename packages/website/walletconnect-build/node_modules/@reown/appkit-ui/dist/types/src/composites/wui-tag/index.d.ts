import { LitElement } from 'lit';
import '../../components/wui-icon/index.js';
import '../../components/wui-text/index.js';
import type { IconType, TagSize, TagVariant } from '../../utils/TypeUtil.js';
export declare class WuiTag extends LitElement {
    static styles: import("lit").CSSResult[];
    variant: TagVariant;
    size: TagSize;
    icon: IconType | undefined;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-tag': WuiTag;
    }
}
