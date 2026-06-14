import { LitElement } from "lit";
import type { IconWeight, IconAttrs } from "../types";
declare global {
    interface HTMLElementTagNameMap {
        "ph-device-mobile-slash": IconAttrs;
    }
    namespace JSX {
        interface IntrinsicElements {
            "ph-device-mobile-slash": IconAttrs;
        }
    }
}
declare class PhDeviceMobileSlash extends LitElement {
    static weightsMap: Map<IconWeight, import("lit").TemplateResult<2>>;
    size?: string | number;
    weight?: IconWeight;
    color?: string;
    mirrored?: boolean;
    render(): import("lit").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export { PhDeviceMobileSlash };
