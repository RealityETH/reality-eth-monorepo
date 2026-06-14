import { LitElement } from "lit";
import type { IconWeight, IconAttrs } from "../types";
declare global {
    interface HTMLElementTagNameMap {
        "ph-threads-logo": IconAttrs;
    }
    namespace JSX {
        interface IntrinsicElements {
            "ph-threads-logo": IconAttrs;
        }
    }
}
declare class PhThreadsLogo extends LitElement {
    static weightsMap: Map<IconWeight, import("lit").TemplateResult<2>>;
    size?: string | number;
    weight?: IconWeight;
    color?: string;
    mirrored?: boolean;
    render(): import("lit").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export { PhThreadsLogo };
