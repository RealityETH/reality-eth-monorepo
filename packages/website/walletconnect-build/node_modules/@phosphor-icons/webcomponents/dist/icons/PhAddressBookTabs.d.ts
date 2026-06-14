import { LitElement } from "lit";
import type { IconWeight, IconAttrs } from "../types";
declare global {
    interface HTMLElementTagNameMap {
        "ph-address-book-tabs": IconAttrs;
    }
    namespace JSX {
        interface IntrinsicElements {
            "ph-address-book-tabs": IconAttrs;
        }
    }
}
declare class PhAddressBookTabs extends LitElement {
    static weightsMap: Map<IconWeight, import("lit").TemplateResult<2>>;
    size?: string | number;
    weight?: IconWeight;
    color?: string;
    mirrored?: boolean;
    render(): import("lit").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export { PhAddressBookTabs };
