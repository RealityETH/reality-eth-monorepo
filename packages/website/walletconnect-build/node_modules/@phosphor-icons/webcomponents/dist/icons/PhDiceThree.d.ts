import { LitElement } from "lit";
import type { IconWeight, IconAttrs } from "../types";
declare global {
    interface HTMLElementTagNameMap {
        "ph-dice-three": IconAttrs;
    }
    namespace JSX {
        interface IntrinsicElements {
            "ph-dice-three": IconAttrs;
        }
    }
}
declare class PhDiceThree extends LitElement {
    static weightsMap: Map<IconWeight, import("lit").TemplateResult<2>>;
    size?: string | number;
    weight?: IconWeight;
    color?: string;
    mirrored?: boolean;
    render(): import("lit").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export { PhDiceThree };
