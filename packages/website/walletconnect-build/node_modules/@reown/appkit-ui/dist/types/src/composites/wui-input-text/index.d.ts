import { LitElement } from 'lit';
import { type Ref } from 'lit/directives/ref.js';
import '../../components/wui-icon/index.js';
import '../../components/wui-text/index.js';
import type { IconType, InputType } from '../../utils/TypeUtil.js';
export declare class WuiInputText extends LitElement {
    static styles: import("lit").CSSResult[];
    inputElementRef: Ref<HTMLInputElement>;
    icon?: IconType;
    disabled: boolean;
    loading: boolean;
    placeholder: string;
    type: InputType;
    value?: string;
    errorText?: string;
    warningText?: string;
    onSubmit?: () => void;
    size: 'md' | 'lg';
    onKeyDown?: (event: KeyboardEvent) => void;
    render(): import("lit").TemplateResult<1>;
    private templateLeftIcon;
    private templateSubmitButton;
    private templateError;
    private templateWarning;
    private dispatchInputChangeEvent;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-input-text': WuiInputText;
    }
}
