import { LitElement } from 'lit';
import '../../components/wui-icon/index.js';
import '../../components/wui-text/index.js';
import type { ToastMessageVariant } from '../../utils/TypeUtil.js';
export declare class WuiToastMessage extends LitElement {
    static styles: import("lit").CSSResult[];
    message: string;
    variant: ToastMessageVariant;
    render(): import("lit").TemplateResult<1>;
    private onClose;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-toast-message': WuiToastMessage;
    }
}
