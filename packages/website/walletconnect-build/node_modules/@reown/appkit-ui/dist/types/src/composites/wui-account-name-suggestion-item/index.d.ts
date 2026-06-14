import { LitElement } from 'lit';
import '../../components/wui-loading-spinner/index.js';
import '../../components/wui-text/index.js';
import '../../composites/wui-tag/index.js';
export declare class WuiAccountNameSuggestionItem extends LitElement {
    static styles: import("lit").CSSResult[];
    name: string;
    registered: boolean;
    loading: boolean;
    disabled: boolean;
    render(): import("lit").TemplateResult<1>;
    private templateRightContent;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-account-name-suggestion-item': WuiAccountNameSuggestionItem;
    }
}
