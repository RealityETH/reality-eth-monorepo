import { LitElement } from "lit";
import type { IconWeight, IconAttrs } from "../types";
declare global {
    interface HTMLElementTagNameMap {
        "ph-hands-clapping": IconAttrs;
    }
    namespace JSX {
        interface IntrinsicElements {
            "ph-hands-clapping": IconAttrs;
        }
    }
}
declare class PhHandsClapping extends LitElement {
    static weightsMap: Map<IconWeight, import("lit").TemplateResult<2>>;
    size?: string | number;
    weight?: IconWeight;
    color?: string;
    mirrored?: boolean;
    render(): import("lit").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export { PhHandsClapping };
