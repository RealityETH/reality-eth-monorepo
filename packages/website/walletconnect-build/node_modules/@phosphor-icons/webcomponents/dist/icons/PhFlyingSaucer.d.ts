import { LitElement } from "lit";
import type { IconWeight, IconAttrs } from "../types";
declare global {
    interface HTMLElementTagNameMap {
        "ph-flying-saucer": IconAttrs;
    }
    namespace JSX {
        interface IntrinsicElements {
            "ph-flying-saucer": IconAttrs;
        }
    }
}
declare class PhFlyingSaucer extends LitElement {
    static weightsMap: Map<IconWeight, import("lit").TemplateResult<2>>;
    size?: string | number;
    weight?: IconWeight;
    color?: string;
    mirrored?: boolean;
    render(): import("lit").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export { PhFlyingSaucer };
