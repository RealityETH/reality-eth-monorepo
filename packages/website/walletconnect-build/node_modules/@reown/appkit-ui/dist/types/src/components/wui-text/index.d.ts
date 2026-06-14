import { LitElement } from 'lit';
import type { LineClamp, TextAlign, TextColorType, TextType } from '../../utils/TypeUtil.js';
export declare const TEXT_VARS_BY_COLOR: {
    primary: string;
    secondary: string;
    tertiary: string;
    invert: string;
    error: string;
    success: string;
    warning: string;
    'accent-primary': string;
};
export declare class WuiText extends LitElement {
    static styles: import("lit").CSSResult[];
    variant: TextType;
    color?: TextColorType;
    align?: TextAlign;
    lineClamp?: LineClamp;
    display: 'inline-flex' | 'inline';
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-text': WuiText;
    }
}
