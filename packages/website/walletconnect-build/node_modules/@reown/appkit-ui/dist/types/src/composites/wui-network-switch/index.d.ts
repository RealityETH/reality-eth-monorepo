import { LitElement } from 'lit';
import '../../components/wui-icon/index.js';
import '../../components/wui-image/index.js';
import '../../components/wui-text/index.js';
import type { ButtonSize, IconType } from '../../utils/TypeUtil.js';
export declare class WuiNetworkSwitch extends LitElement {
    static styles: import("lit").CSSResult[];
    imageSrc: string;
    icon: IconType;
    size: ButtonSize;
    disabled: boolean;
    render(): import("lit").TemplateResult<1>;
    private leftIconTemplate;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-network-switch': WuiNetworkSwitch;
    }
}
