import type { TemplateResult } from 'lit';
import { LitElement } from 'lit';
import type { IconColorType, IconSizeType, IconType, IconWeightType } from '../../utils/TypeUtil.js';
export declare const ICON_COLOR: {
    'accent-primary': string;
    'accent-certified': string;
    'foreground-secondary': string;
    default: string;
    success: string;
    error: string;
    warning: string;
    inverse: string;
};
export declare class WuiIcon extends LitElement {
    static styles: import("lit").CSSResult[];
    size: IconSizeType;
    name: IconType;
    weight: IconWeightType;
    color: IconColorType;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-icon': WuiIcon;
    }
}
