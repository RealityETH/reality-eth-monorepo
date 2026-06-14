import { LitElement } from 'lit';
import '../../components/wui-icon/index.js';
import '../../components/wui-text/index.js';
import type { IconType, TabSize } from '../../utils/TypeUtil.js';
export declare class WuiTab extends LitElement {
    static styles: import("lit").CSSResult[];
    icon: IconType;
    size: TabSize;
    label: string;
    active: boolean;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-tab-item': WuiTab;
    }
}
