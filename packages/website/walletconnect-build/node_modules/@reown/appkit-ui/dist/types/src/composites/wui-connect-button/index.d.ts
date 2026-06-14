import { LitElement } from 'lit';
import '../../components/wui-icon/index.js';
import '../../components/wui-loading-spinner/index.js';
import '../../components/wui-text/index.js';
import type { SizeType } from '../../utils/TypeUtil.js';
export declare class WuiConnectButton extends LitElement {
    static styles: import("lit").CSSResult[];
    size: Exclude<SizeType, 'inherit' | 'xxl' | 'mdl' | 'xl' | 'xs' | 'm' | 'xxs'>;
    variant: 'primary' | 'secondary';
    loading: boolean;
    text: string;
    render(): import("lit").TemplateResult<1>;
    private contentTemplate;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-connect-button': WuiConnectButton;
    }
}
