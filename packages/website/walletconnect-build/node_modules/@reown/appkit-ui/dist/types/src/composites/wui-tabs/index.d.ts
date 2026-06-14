import { LitElement } from 'lit';
import type { IconType, TabSize } from '../../utils/TypeUtil.js';
import '../wui-tab-item/index.js';
export declare class WuiTabs extends LitElement {
    static styles: import("lit").CSSResult[];
    tabs: {
        icon: IconType;
        label: string;
    }[];
    onTabChange: (index: number) => void;
    size: TabSize;
    activeTab: number;
    render(): import("lit").TemplateResult<1>[];
    private onTabClick;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-tabs': WuiTabs;
    }
}
