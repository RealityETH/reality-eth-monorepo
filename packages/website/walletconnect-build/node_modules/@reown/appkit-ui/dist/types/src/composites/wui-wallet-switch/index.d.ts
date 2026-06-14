import { LitElement } from 'lit';
import '../../components/wui-icon/index.js';
import '../../components/wui-image/index.js';
import '../../components/wui-text/index.js';
import '../../layout/wui-flex/index.js';
import type { IconSizeType, IconType } from '../../utils/TypeUtil.js';
export declare class WuiWalletSwitch extends LitElement {
    static styles: import("lit").CSSResult[];
    address: string;
    profileName: string;
    alt: string;
    imageSrc: string;
    icon?: IconType;
    iconSize?: IconSizeType;
    enableGreenCircle?: boolean;
    loading: boolean;
    charsStart: number;
    charsEnd: number;
    render(): import("lit").TemplateResult<1>;
    private leftImageTemplate;
    textTemplate(): import("lit").TemplateResult<1>;
    rightImageTemplate(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-wallet-switch': WuiWalletSwitch;
    }
}
