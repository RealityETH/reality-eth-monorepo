import { LitElement } from "lit";
import type { IconWeight, IconAttrs } from "../types";
declare global {
    interface HTMLElementTagNameMap {
        "ph-terminal-window": IconAttrs;
    }
    namespace JSX {
        interface IntrinsicElements {
            "ph-terminal-window": IconAttrs;
        }
    }
}
declare class PhTerminalWindow extends LitElement {
    static weightsMap: Map<IconWeight, import("lit").TemplateResult<2>>;
    size?: string | number;
    weight?: IconWeight;
    color?: string;
    mirrored?: boolean;
    render(): import("lit").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export { PhTerminalWindow };
