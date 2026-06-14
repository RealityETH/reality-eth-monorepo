import { LitElement } from 'lit';
import '../wui-toggle/index.js';
export declare class WuiCertifiedSwitch extends LitElement {
    static styles: import("lit").CSSResult[];
    checked?: boolean;
    render(): import("lit").TemplateResult<1>;
    private handleToggleChange;
    private dispatchSwitchEvent;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-certified-switch': WuiCertifiedSwitch;
    }
}
