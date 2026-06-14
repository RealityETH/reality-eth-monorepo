import { LitElement } from 'lit';
import { type Ref } from 'lit/directives/ref.js';
import { vars } from '../../utils/ThemeHelperUtil.js';
export declare class WuiInputAmount extends LitElement {
    static styles: import("lit").CSSResult[];
    inputElementRef: Ref<HTMLInputElement>;
    disabled: boolean;
    value: string;
    placeholder: string;
    widthVariant: 'fit' | 'auto';
    maxDecimals?: number;
    maxIntegers?: number;
    fontSize: keyof typeof vars.textSize;
    error: boolean;
    firstUpdated(): void;
    updated(): void;
    render(): import("lit").TemplateResult<1>;
    private inputTemplate;
    private dispatchInputChangeEvent;
    private resizeInput;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-input-amount': WuiInputAmount;
    }
}
