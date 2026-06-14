import { LitElement } from 'lit';
import '../../components/wui-icon/index.js';
import '../../components/wui-text/index.js';
import '../../layout/wui-flex/index.js';
import '../wui-button/index.js';
export declare class WuiCtaButton extends LitElement {
    static styles: import("lit").CSSResult[];
    disabled: boolean;
    label: string;
    buttonLabel: string;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-cta-button': WuiCtaButton;
    }
}
