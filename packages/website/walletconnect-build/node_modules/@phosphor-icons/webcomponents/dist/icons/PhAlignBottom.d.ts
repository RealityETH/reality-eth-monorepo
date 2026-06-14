import { LitElement } from "lit";
import type { IconWeight, IconAttrs } from "../types";
declare global {
    interface HTMLElementTagNameMap {
        "ph-align-bottom": IconAttrs;
    }
    namespace JSX {
        interface IntrinsicElements {
            "ph-align-bottom": IconAttrs;
        }
    }
}
declare class PhAlignBottom extends LitElement {
    static weightsMap: Map<IconWeight, import("lit").TemplateResult<2>>;
    size?: string | number;
    weight?: IconWeight;
    color?: string;
    mirrored?: boolean;
    render(): import("lit").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export { PhAlignBottom };
