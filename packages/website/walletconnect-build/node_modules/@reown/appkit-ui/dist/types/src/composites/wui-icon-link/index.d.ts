import { LitElement } from 'lit';
import '../../components/wui-icon/index.js';
import type { IconColorType, IconSizeType, IconType } from '../../utils/TypeUtil.js';
export declare class WuiIconLink extends LitElement {
    static styles: import("lit").CSSResult[];
    size: IconSizeType;
    disabled: boolean;
    icon: IconType;
    iconColor: IconColorType;
    variant: 'accent' | 'primary' | 'secondary';
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-icon-link': WuiIconLink;
    }
}
