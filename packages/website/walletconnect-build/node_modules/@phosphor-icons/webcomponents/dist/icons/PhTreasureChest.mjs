import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as Z } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as i } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as H } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as A } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var l = Object.defineProperty, n = Object.getOwnPropertyDescriptor, a = (h, v, s, V) => {
  for (var e = V > 1 ? void 0 : V ? n(v, s) : v, o = h.length - 1, m; o >= 0; o--)
    (m = h[o]) && (e = (V ? m(v, s, e) : m(e)) || e);
  return V && e && l(v, s, e), e;
};
let t = class extends i {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var h;
    return Z`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((h = this.weight) != null ? h : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    r`<path d="M184,44H72A52.06,52.06,0,0,0,20,96v96a12,12,0,0,0,12,12H224a12,12,0,0,0,12-12V96A52.06,52.06,0,0,0,184,44Zm44,52v12H188V52.19A44.06,44.06,0,0,1,228,96Zm-88,44H116V100h24Zm-28,8h32a4,4,0,0,0,4-4V116h32v80H76V116h32v28A4,4,0,0,0,112,148Zm36-40V96a4,4,0,0,0-4-4H112a4,4,0,0,0-4,4v12H76V52H180v56ZM68,52.19V108H28V96A44.06,44.06,0,0,1,68,52.19ZM28,192V116H68v80H32A4,4,0,0,1,28,192Zm196,4H188V116h40v76A4,4,0,0,1,224,196Z"/>`
  ],
  [
    "light",
    r`<path d="M184,42H72A54.06,54.06,0,0,0,18,96v96a14,14,0,0,0,14,14H224a14,14,0,0,0,14-14V96A54.06,54.06,0,0,0,184,42Zm42,54v10H190V54.44A42.05,42.05,0,0,1,226,96Zm-88,42H118V102h20Zm-26,12h32a6,6,0,0,0,6-6V118h28v76H78V118h28v26A6,6,0,0,0,112,150Zm38-44V96a6,6,0,0,0-6-6H112a6,6,0,0,0-6,6v10H78V54H178v52ZM66,54.44V106H30V96A42.05,42.05,0,0,1,66,54.44ZM30,192V118H66v76H32A2,2,0,0,1,30,192Zm194,2H190V118h36v74A2,2,0,0,1,224,194Z"/>`
  ],
  [
    "regular",
    r`<path d="M184,40H72A56.06,56.06,0,0,0,16,96v96a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V96A56.06,56.06,0,0,0,184,40Zm40,56v8H192V56.8A40.07,40.07,0,0,1,224,96Zm-88,40H120V104h16Zm-24,16h32a8,8,0,0,0,8-8V120h24v72H80V120h24v24A8,8,0,0,0,112,152Zm40-48V96a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v8H80V56h96v48ZM64,56.8V104H32V96A40.07,40.07,0,0,1,64,56.8ZM32,120H64v72H32Zm192,72H192V120h32v72Z"/>`
  ],
  [
    "bold",
    r`<path d="M184,36H72A60.07,60.07,0,0,0,12,96v96a20,20,0,0,0,20,20H224a20,20,0,0,0,20-20V96A60.07,60.07,0,0,0,184,36Zm36,60v4H192V60.91A36.05,36.05,0,0,1,220,96Zm-92,60a12,12,0,0,0,12-12V124h28v64H88V124h28v20A12,12,0,0,0,128,156Zm12-56V96a12,12,0,0,0-24,0v4H88V60h80v40ZM64,60.91V100H36V96A36.05,36.05,0,0,1,64,60.91ZM36,124H64v64H36Zm156,64V124h28v64Z"/>`
  ],
  [
    "fill",
    r`<path d="M240,124v68a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V124a4,4,0,0,1,4-4H56v64a8,8,0,0,0,8.53,8A8.17,8.17,0,0,0,72,183.73V120h40v20a4,4,0,0,0,4,4h24a4,4,0,0,0,4-4V120h40v64a8,8,0,0,0,8.53,8,8.17,8.17,0,0,0,7.47-8.25V120h36A4,4,0,0,1,240,124ZM184,40H72A56,56,0,0,0,16,96v4a4,4,0,0,0,4,4H56V64.27A8.17,8.17,0,0,1,63.47,56,8,8,0,0,1,72,64v40h40V92a4,4,0,0,1,4-4h24a4,4,0,0,1,4,4v12h40V64.27A8.17,8.17,0,0,1,191.47,56,8,8,0,0,1,200,64v40h36a4,4,0,0,0,4-4V96A56,56,0,0,0,184,40Z"/>`
  ],
  [
    "duotone",
    r`<path d="M232,112v80a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V112h88v32h32V112Z" opacity="0.2"/><path d="M184,40H72A56.06,56.06,0,0,0,16,96v96a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V96A56.06,56.06,0,0,0,184,40Zm40,56v8H192V56.8A40.07,40.07,0,0,1,224,96Zm-88,40H120V104h16Zm-24,16h32a8,8,0,0,0,8-8V120h24v72H80V120h24v24A8,8,0,0,0,112,152Zm40-48V96a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v8H80V56h96v48ZM64,56.8V104H32V96A40.07,40.07,0,0,1,64,56.8ZM32,120H64v72H32Zm192,72H192V120h32v72Z"/>`
  ]
]);
t.styles = A`
    :host {
      display: contents;
    }
  `;
a([
  H({ type: String, reflect: !0 })
], t.prototype, "size", 2);
a([
  H({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
a([
  H({ type: String, reflect: !0 })
], t.prototype, "color", 2);
a([
  H({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = a([
  p("ph-treasure-chest")
], t);
export {
  t as PhTreasureChest
};
