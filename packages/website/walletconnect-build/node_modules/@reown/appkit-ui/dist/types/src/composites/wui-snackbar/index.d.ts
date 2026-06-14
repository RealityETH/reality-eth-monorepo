import { LitElement } from 'lit';
import '../../components/wui-loading-spinner/index.js';
import '../../components/wui-text/index.js';
import '../wui-icon-box/index.js';
export declare class WuiSnackbar extends LitElement {
    static styles: import("lit").CSSResult[];
    message: string;
    variant: 'success' | 'error' | 'warning' | 'info' | 'loading';
    render(): import("lit").TemplateResult<1>;
    private templateIcon;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-snackbar': WuiSnackbar;
    }
}
