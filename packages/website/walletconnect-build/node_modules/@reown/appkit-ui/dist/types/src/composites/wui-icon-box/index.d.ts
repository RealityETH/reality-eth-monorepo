import { LitElement } from 'lit';
import '../../components/wui-icon/index.js';
import type { IconColorType, IconType } from '../../utils/TypeUtil.js';
export declare class WuiIconBox extends LitElement {
    static styles: import("lit").CSSResult[];
    icon: IconType;
    size: 'sm' | 'md' | 'lg' | 'xl';
    padding?: '1' | '2';
    color: IconColorType | 'secondary';
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-icon-box': WuiIconBox;
    }
}
