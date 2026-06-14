import { LitElement } from 'lit';
import '../../components/wui-loading-spinner/index.js';
import '../../components/wui-text/index.js';
import type { BackgroundColorType, IconColorType, IconType, SizeType } from '../../utils/TypeUtil.js';
export declare class WuiListItem extends LitElement {
    static styles: import("lit").CSSResult[];
    type?: 'primary' | 'secondary';
    imageSrc: string;
    imageSize?: SizeType;
    icon?: IconType;
    iconColor?: IconColorType;
    loading: boolean;
    tabIdx?: boolean;
    boxColor?: BackgroundColorType;
    disabled: boolean;
    rightIcon: boolean;
    boxed: boolean;
    rounded: boolean;
    fullSize: boolean;
    render(): import("lit").TemplateResult<1>;
    private templateLeftIcon;
    private templateRightIcon;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-list-item': WuiListItem;
    }
}
