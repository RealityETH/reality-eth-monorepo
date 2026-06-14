import { LitElement } from 'lit';
import '../../components/wui-text/index.js';
import '../wui-logo/index.js';
export declare class WuiListNetwork extends LitElement {
    static styles: import("lit").CSSResult[];
    imageSrc?: string;
    name: string;
    tabIdx?: boolean;
    disabled: boolean;
    render(): import("lit").TemplateResult<1>;
    private imageTemplate;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-list-network': WuiListNetwork;
    }
}
