import { LitElement } from 'lit';
import '../../components/wui-text/index.js';
import '../../layout/wui-flex/index.js';
import type { IconType } from '../../utils/TypeUtil.js';
import '../wui-button/index.js';
import '../wui-icon-box/index.js';
export declare class WuiNoticeCard extends LitElement {
    static styles: import("lit").CSSResult[];
    label: string;
    description: string;
    icon: IconType;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-notice-card': WuiNoticeCard;
    }
}
