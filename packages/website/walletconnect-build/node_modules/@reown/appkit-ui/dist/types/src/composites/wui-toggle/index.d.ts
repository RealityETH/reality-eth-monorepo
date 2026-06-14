import { LitElement } from 'lit';
import { type Ref } from 'lit/directives/ref.js';
import type { ToggleSize } from '../../utils/TypeUtil.js';
export declare class WuiToggle extends LitElement {
    static styles: import("lit").CSSResult[];
    inputElementRef: Ref<HTMLInputElement>;
    checked?: boolean;
    disabled: boolean;
    size: ToggleSize;
    render(): import("lit").TemplateResult<1>;
    private dispatchChangeEvent;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-toggle': WuiToggle;
    }
}
