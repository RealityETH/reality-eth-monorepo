import { LitElement } from 'lit';
import type { ChainNamespace } from '@reown/appkit-common';
import '../../components/wui-icon/index.js';
import '../../components/wui-text/index.js';
import '../../composites/wui-icon-box/index.js';
import type { IWalletImage, IconType, TagType } from '../../utils/TypeUtil.js';
import '../wui-all-wallets-image/index.js';
import '../wui-tag/index.js';
import '../wui-wallet-image/index.js';
export declare class WuiListWallet extends LitElement {
    static styles: import("lit").CSSResult[];
    walletImages?: IWalletImage[];
    imageSrc?: string | undefined;
    name: string;
    size?: 'sm' | 'md';
    tagLabel?: string;
    tagVariant?: TagType;
    walletIcon?: IconType;
    tabIdx?: number;
    namespaces?: ChainNamespace[];
    disabled: boolean;
    showAllWallets: boolean;
    loading: boolean;
    loadingSpinnerColor: string;
    render(): import("lit").TemplateResult<1>;
    private templateNamespaces;
    private templateAllWallets;
    private templateWalletImage;
    private templateStatus;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-list-wallet': WuiListWallet;
    }
}
