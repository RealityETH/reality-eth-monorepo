import { LitElement } from 'lit';
import '../../components/wui-image/index.js';
import '../../components/wui-text/index.js';
import '../../layout/wui-flex/index.js';
import type { IconType } from '../../utils/TypeUtil.js';
import '../wui-icon-box/index.js';
import '../wui-tag/index.js';
export declare class WuiListDescription extends LitElement {
    static styles: import("lit").CSSResult[];
    icon: IconType;
    text: string;
    description: string;
    tag?: string;
    disabled: boolean;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-list-description': WuiListDescription;
    }
}
