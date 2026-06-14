import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as h, html as p } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as l } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as A } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as m } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as M } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var V = Object.defineProperty, n = Object.getOwnPropertyDescriptor, r = (t, e, o, Z) => {
  for (var H = Z > 1 ? void 0 : Z ? n(e, o) : e, s = t.length - 1, i; s >= 0; s--)
    (i = t[s]) && (H = (Z ? i(e, o, H) : i(H)) || H);
  return Z && H && V(e, o, H), H;
};
let a = class extends l {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var t;
    return p`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${a.weightsMap.get((t = this.weight) != null ? t : "regular")}
    </svg>`;
  }
};
a.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    h`<path d="M232,228H204V28h12a4,4,0,0,0,0-8H40a4,4,0,0,0,0,8H52V228H24a4,4,0,0,0,0,8H232a4,4,0,0,0,0-8ZM60,28H196V228H156V184a4,4,0,0,0-4-4H104a4,4,0,0,0-4,4v44H60Zm88,200H108V188h40ZM92,64a4,4,0,0,1,4-4h16a4,4,0,0,1,0,8H96A4,4,0,0,1,92,64Zm48,0a4,4,0,0,1,4-4h16a4,4,0,0,1,0,8H144A4,4,0,0,1,140,64ZM92,104a4,4,0,0,1,4-4h16a4,4,0,0,1,0,8H96A4,4,0,0,1,92,104Zm48,0a4,4,0,0,1,4-4h16a4,4,0,0,1,0,8H144A4,4,0,0,1,140,104ZM96,148a4,4,0,0,1,0-8h16a4,4,0,0,1,0,8Zm44-4a4,4,0,0,1,4-4h16a4,4,0,0,1,0,8H144A4,4,0,0,1,140,144Z"/>`
  ],
  [
    "light",
    h`<path d="M232,226H206V30h10a6,6,0,0,0,0-12H40a6,6,0,0,0,0,12H50V226H24a6,6,0,0,0,0,12H232a6,6,0,0,0,0-12ZM62,30H194V226H158V184a6,6,0,0,0-6-6H104a6,6,0,0,0-6,6v42H62Zm84,196H110V190h36ZM90,64a6,6,0,0,1,6-6h16a6,6,0,0,1,0,12H96A6,6,0,0,1,90,64Zm48,0a6,6,0,0,1,6-6h16a6,6,0,0,1,0,12H144A6,6,0,0,1,138,64ZM90,104a6,6,0,0,1,6-6h16a6,6,0,0,1,0,12H96A6,6,0,0,1,90,104Zm48,0a6,6,0,0,1,6-6h16a6,6,0,0,1,0,12H144A6,6,0,0,1,138,104ZM96,150a6,6,0,0,1,0-12h16a6,6,0,0,1,0,12Zm42-6a6,6,0,0,1,6-6h16a6,6,0,0,1,0,12H144A6,6,0,0,1,138,144Z"/>`
  ],
  [
    "regular",
    h`<path d="M232,224H208V32h8a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16h8V224H24a8,8,0,0,0,0,16H232a8,8,0,0,0,0-16ZM64,32H192V224H160V184a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v40H64Zm80,192H112V192h32ZM88,64a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H96A8,8,0,0,1,88,64Zm48,0a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H144A8,8,0,0,1,136,64ZM88,104a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H96A8,8,0,0,1,88,104Zm48,0a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H144A8,8,0,0,1,136,104ZM88,144a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H96A8,8,0,0,1,88,144Zm48,0a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H144A8,8,0,0,1,136,144Z"/>`
  ],
  [
    "bold",
    h`<path d="M232,220H212V36h4a12,12,0,0,0,0-24H40a12,12,0,0,0,0,24h4V220H24a12,12,0,0,0,0,24H232a12,12,0,0,0,0-24ZM68,36H188V220H164V184a12,12,0,0,0-12-12H104a12,12,0,0,0-12,12v36H68Zm72,184H116V196h24ZM84,64A12,12,0,0,1,96,52h12a12,12,0,0,1,0,24H96A12,12,0,0,1,84,64Zm52,0a12,12,0,0,1,12-12h12a12,12,0,0,1,0,24H148A12,12,0,0,1,136,64ZM84,104A12,12,0,0,1,96,92h12a12,12,0,0,1,0,24H96A12,12,0,0,1,84,104Zm52,0a12,12,0,0,1,12-12h12a12,12,0,0,1,0,24H148A12,12,0,0,1,136,104ZM84,144a12,12,0,0,1,12-12h12a12,12,0,0,1,0,24H96A12,12,0,0,1,84,144Zm52,0a12,12,0,0,1,12-12h12a12,12,0,0,1,0,24H148A12,12,0,0,1,136,144Z"/>`
  ],
  [
    "fill",
    h`<path d="M232,224H208V32h8a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16h8V224H24a8,8,0,0,0,0,16H232a8,8,0,0,0,0-16ZM88,56h24a8,8,0,0,1,0,16H88a8,8,0,0,1,0-16Zm0,40h24a8,8,0,0,1,0,16H88a8,8,0,0,1,0-16Zm-8,48a8,8,0,0,1,8-8h24a8,8,0,0,1,0,16H88A8,8,0,0,1,80,144Zm72,80H104V184h48Zm16-72H144a8,8,0,0,1,0-16h24a8,8,0,0,1,0,16Zm0-40H144a8,8,0,0,1,0-16h24a8,8,0,0,1,0,16Zm0-40H144a8,8,0,0,1,0-16h24a8,8,0,0,1,0,16Z"/>`
  ],
  [
    "duotone",
    h`<path d="M200,24V232H152V184H104v48H56V24Z" opacity="0.2"/><path d="M232,224H208V32h8a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16h8V224H24a8,8,0,0,0,0,16H232a8,8,0,0,0,0-16ZM64,32H192V224H160V184a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v40H64Zm80,192H112V192h32ZM88,64a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H96A8,8,0,0,1,88,64Zm48,0a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H144A8,8,0,0,1,136,64ZM88,104a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H96A8,8,0,0,1,88,104Zm48,0a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H144A8,8,0,0,1,136,104ZM88,144a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H96A8,8,0,0,1,88,144Zm48,0a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H144A8,8,0,0,1,136,144Z"/>`
  ]
]);
a.styles = M`
    :host {
      display: contents;
    }
  `;
r([
  m({ type: String, reflect: !0 })
], a.prototype, "size", 2);
r([
  m({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
r([
  m({ type: String, reflect: !0 })
], a.prototype, "color", 2);
r([
  m({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = r([
  A("ph-building")
], a);
export {
  a as PhBuilding
};
