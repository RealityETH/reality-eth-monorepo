import { LitElement } from 'lit';
import '../../components/wui-icon/index.js';
import '../../components/wui-text/index.js';
import '../wui-input-text/index.js';
export declare class WuiEnsInput extends LitElement {
    static styles: import("lit").CSSResult[];
    errorMessage?: string;
    disabled: boolean;
    value?: string;
    loading: boolean;
    onKeyDown?: (event: KeyboardEvent) => void;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-ens-input': WuiEnsInput;
    }
}
