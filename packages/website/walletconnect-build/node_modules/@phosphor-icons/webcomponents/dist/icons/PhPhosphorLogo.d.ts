import { LitElement } from "lit";
import type { IconWeight, IconAttrs } from "../types";
declare global {
    interface HTMLElementTagNameMap {
        "ph-phosphor-logo": IconAttrs;
    }
    namespace JSX {
        interface IntrinsicElements {
            "ph-phosphor-logo": IconAttrs;
        }
    }
}
declare class PhPhosphorLogo extends LitElement {
    static weightsMap: Map<IconWeight, import("lit").TemplateResult<2>>;
    size?: string | number;
    weight?: IconWeight;
    color?: string;
    mirrored?: boolean;
    render(): import("lit").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export { PhPhosphorLogo };
