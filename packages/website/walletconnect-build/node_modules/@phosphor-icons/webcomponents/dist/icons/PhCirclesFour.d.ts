import { LitElement } from "lit";
import type { IconWeight, IconAttrs } from "../types";
declare global {
    interface HTMLElementTagNameMap {
        "ph-circles-four": IconAttrs;
    }
    namespace JSX {
        interface IntrinsicElements {
            "ph-circles-four": IconAttrs;
        }
    }
}
declare class PhCirclesFour extends LitElement {
    static weightsMap: Map<IconWeight, import("lit").TemplateResult<2>>;
    size?: string | number;
    weight?: IconWeight;
    color?: string;
    mirrored?: boolean;
    render(): import("lit").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export { PhCirclesFour };
