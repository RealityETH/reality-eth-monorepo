import { LitElement } from 'lit';
import type { IconColorType, IconType, LogoType, SizeType } from '../../utils/TypeUtil.js';
export declare class WuiImage extends LitElement {
    static styles: import("lit").CSSResult[];
    src?: string;
    logo?: LogoType;
    icon?: IconType;
    iconColor?: IconColorType;
    alt: string;
    size?: SizeType;
    boxed?: boolean;
    rounded?: boolean;
    fullSize?: boolean;
    render(): import("lit").TemplateResult<1>;
    private handleImageError;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-image': WuiImage;
    }
}
