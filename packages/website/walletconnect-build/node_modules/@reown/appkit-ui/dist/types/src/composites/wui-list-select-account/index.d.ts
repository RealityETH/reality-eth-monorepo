import { LitElement } from 'lit';
import '../../components/wui-icon/index.js';
import '../../components/wui-text/index.js';
import type { IconType } from '../../utils/TypeUtil.js';
import '../wui-avatar/index.js';
export declare class WuiListSelectAccount extends LitElement {
    static styles: import("lit").CSSResult[];
    address: string;
    description: string;
    icon: IconType;
    currency: Intl.NumberFormatOptions['currency'];
    amount: number;
    disabled: boolean;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-list-select-account': WuiListSelectAccount;
    }
}
