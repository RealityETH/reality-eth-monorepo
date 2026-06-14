import { LitElement } from 'lit';
import '../../components/wui-text/index.js';
import type { IconType } from '../../utils/TypeUtil.js';
export declare class WuiListButton extends LitElement {
    static styles: import("lit").CSSResult[];
    text: string;
    disabled: boolean;
    size: 'sm' | 'md' | 'lg';
    icon: IconType;
    tabIdx?: number;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-list-button': WuiListButton;
    }
}
