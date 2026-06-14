import { LitElement } from 'lit';
import '../../components/wui-image/index.js';
import '../../components/wui-text/index.js';
import '../wui-icon-box/index.js';
import '../wui-tag/index.js';
export declare class WuiListSelectWallet extends LitElement {
    static styles: import("lit").CSSResult[];
    imageSrc?: string | undefined;
    name: string;
    tagLabel?: string;
    qrCode: boolean;
    allWallets: boolean;
    disabled: boolean;
    render(): import("lit").TemplateResult<1>;
    private leftImageTemplate;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-list-select-wallet': WuiListSelectWallet;
    }
}
