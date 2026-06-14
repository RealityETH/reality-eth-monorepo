import { LitElement } from 'lit';
import '../../components/wui-icon/index.js';
import '../../components/wui-image/index.js';
import '../../components/wui-loading-spinner/index.js';
import '../../components/wui-text/index.js';
import '../../composites/wui-icon-link/index.js';
import '../../layout/wui-flex/index.js';
import type { ButtonVariant, IconSizeType, IconType } from '../../utils/TypeUtil.js';
import '../wui-button/index.js';
import '../wui-wallet-image/index.js';
export declare class WuiInactiveProfileWalletItem extends LitElement {
    static styles: import("lit").CSSResult[];
    address: string;
    profileName: string;
    alt: string;
    buttonLabel: string;
    buttonVariant: ButtonVariant;
    imageSrc: string;
    icon?: IconType;
    iconSize?: IconSizeType;
    iconBadge?: IconType | undefined;
    iconBadgeSize?: IconSizeType;
    rightIcon?: IconType;
    rightIconSize?: IconSizeType;
    loading: boolean;
    charsStart: number;
    charsEnd: number;
    render(): import("lit").TemplateResult<1>;
    private imageOrIconTemplate;
    labelAndDescriptionTemplate(): import("lit").TemplateResult<1>;
    buttonActionTemplate(): import("lit").TemplateResult<1>;
    private handleButtonClick;
    private handleIconClick;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-inactive-profile-wallet-item': WuiInactiveProfileWalletItem;
    }
}
