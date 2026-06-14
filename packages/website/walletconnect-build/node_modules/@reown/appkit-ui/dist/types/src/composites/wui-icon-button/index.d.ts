import { LitElement } from 'lit';
import '../../components/wui-icon/index.js';
import type { IconButtonSize, IconSizeType, IconType } from '../../utils/TypeUtil.js';
export declare class WuiIconButton extends LitElement {
    static styles: import("lit").CSSResult[];
    icon: IconType;
    variant: 'primary' | 'secondary';
    type: 'accent' | 'neutral' | 'success' | 'error';
    size: IconButtonSize;
    iconSize?: IconSizeType;
    fullWidth: boolean;
    disabled: boolean;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-icon-button': WuiIconButton;
    }
}
