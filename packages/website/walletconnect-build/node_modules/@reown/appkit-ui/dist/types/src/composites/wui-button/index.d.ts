import { LitElement } from 'lit';
import '../../components/wui-icon/index.js';
import '../../components/wui-loading-spinner/index.js';
import '../../components/wui-text/index.js';
import type { ButtonSize, ButtonVariant, TextType } from '../../utils/TypeUtil.js';
export declare class WuiButton extends LitElement {
    static styles: import("lit").CSSResult[];
    size: ButtonSize;
    disabled: boolean;
    fullWidth: boolean;
    loading: boolean;
    variant: ButtonVariant;
    textVariant?: TextType;
    render(): import("lit").TemplateResult<1>;
    loadingTemplate(): import("lit").TemplateResult<1> | null;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-button': WuiButton;
    }
}
