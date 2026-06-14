import { LitElement } from 'lit';
import '../../components/wui-icon/index.js';
import '../../components/wui-image/index.js';
import '../../components/wui-loading-spinner/index.js';
import '../../components/wui-text/index.js';
import type { IconType } from '../../utils/TypeUtil.js';
export declare class WuiWalletButton extends LitElement {
    static styles: import("lit").CSSResult[];
    imageSrc?: string | undefined;
    name?: string | undefined;
    size: 'lg' | 'md' | 'sm';
    walletConnect: boolean;
    icon?: IconType;
    loading: boolean;
    error: boolean;
    disabled: boolean;
    render(): import("lit").TemplateResult<1>;
    private leftViewTemplate;
    private rightViewTemplate;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-wallet-button': WuiWalletButton;
    }
}
