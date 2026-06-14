import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as p } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as l } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as o } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var n = Object.defineProperty, g = Object.getOwnPropertyDescriptor, H = (e, h, s, V) => {
  for (var t = V > 1 ? void 0 : V ? g(h, s) : h, i = e.length - 1, v; i >= 0; i--)
    (v = e[i]) && (t = (V ? v(h, s, t) : v(t)) || t);
  return V && t && n(h, s, t), t;
};
let a = class extends m {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return p`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${a.weightsMap.get((e = this.weight) != null ? e : "regular")}
    </svg>`;
  }
};
a.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    r`<path d="M208,140H172V100h20a12,12,0,0,0,12-12V40a12,12,0,0,0-12-12H64A12,12,0,0,0,52,40V88a12,12,0,0,0,12,12H84v40H48a12,12,0,0,0-12,12v16a12,12,0,0,0,12,12H60v44a4,4,0,0,0,8,0V180H188v44a4,4,0,0,0,8,0V180h12a12,12,0,0,0,12-12V152A12,12,0,0,0,208,140ZM60,88V40a4,4,0,0,1,4-4H192a4,4,0,0,1,4,4V88a4,4,0,0,1-4,4H64A4,4,0,0,1,60,88Zm32,12h72v40H92Zm120,68a4,4,0,0,1-4,4H48a4,4,0,0,1-4-4V152a4,4,0,0,1,4-4H208a4,4,0,0,1,4,4Z"/>`
  ],
  [
    "light",
    r`<path d="M208,138H174V102h18a14,14,0,0,0,14-14V40a14,14,0,0,0-14-14H64A14,14,0,0,0,50,40V88a14,14,0,0,0,14,14H82v36H48a14,14,0,0,0-14,14v16a14,14,0,0,0,14,14H58v42a6,6,0,0,0,12,0V182H186v42a6,6,0,0,0,12,0V182h10a14,14,0,0,0,14-14V152A14,14,0,0,0,208,138ZM62,88V40a2,2,0,0,1,2-2H192a2,2,0,0,1,2,2V88a2,2,0,0,1-2,2H64A2,2,0,0,1,62,88Zm32,14h68v36H94Zm116,66a2,2,0,0,1-2,2H48a2,2,0,0,1-2-2V152a2,2,0,0,1,2-2H208a2,2,0,0,1,2,2Z"/>`
  ],
  [
    "regular",
    r`<path d="M208,136H176V104h16a16,16,0,0,0,16-16V40a16,16,0,0,0-16-16H64A16,16,0,0,0,48,40V88a16,16,0,0,0,16,16H80v32H48a16,16,0,0,0-16,16v16a16,16,0,0,0,16,16h8v40a8,8,0,0,0,16,0V184H184v40a8,8,0,0,0,16,0V184h8a16,16,0,0,0,16-16V152A16,16,0,0,0,208,136ZM64,40H192V88H64Zm32,64h64v32H96Zm112,64H48V152H208v16Z"/>`
  ],
  [
    "bold",
    r`<path d="M208,128H180V108h12a20,20,0,0,0,20-20V40a20,20,0,0,0-20-20H64A20,20,0,0,0,44,40V88a20,20,0,0,0,20,20H76v20H48a20,20,0,0,0-20,20v24a20,20,0,0,0,20,20h8v32a12,12,0,0,0,24,0V192h96v32a12,12,0,0,0,24,0V192h8a20,20,0,0,0,20-20V148A20,20,0,0,0,208,128ZM68,44H188V84H68Zm32,64h56v20H100Zm104,60H52V152H204Z"/>`
  ],
  [
    "fill",
    r`<path d="M208,136H176V104h16a16,16,0,0,0,16-16V40a16,16,0,0,0-16-16H64A16,16,0,0,0,48,40V88a16,16,0,0,0,16,16H80v32H48a16,16,0,0,0-16,16v16a16,16,0,0,0,16,16h8v40a8,8,0,0,0,16,0V184H184v40a8,8,0,0,0,16,0V184h8a16,16,0,0,0,16-16V152A16,16,0,0,0,208,136Zm-48,0H96V104h64Z"/>`
  ],
  [
    "duotone",
    r`<path d="M56,88V40a8,8,0,0,1,8-8H192a8,8,0,0,1,8,8V88a8,8,0,0,1-8,8H64A8,8,0,0,1,56,88Zm152,56H48a8,8,0,0,0-8,8v16a8,8,0,0,0,8,8H208a8,8,0,0,0,8-8V152A8,8,0,0,0,208,144Z" opacity="0.2"/><path d="M208,136H176V104h16a16,16,0,0,0,16-16V40a16,16,0,0,0-16-16H64A16,16,0,0,0,48,40V88a16,16,0,0,0,16,16H80v32H48a16,16,0,0,0-16,16v16a16,16,0,0,0,16,16h8v40a8,8,0,0,0,16,0V184H184v40a8,8,0,0,0,16,0V184h8a16,16,0,0,0,16-16V152A16,16,0,0,0,208,136ZM64,40H192V88H64Zm32,64h64v32H96Zm112,64H48V152H208v16Z"/>`
  ]
]);
a.styles = Z`
    :host {
      display: contents;
    }
  `;
H([
  o({ type: String, reflect: !0 })
], a.prototype, "size", 2);
H([
  o({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
H([
  o({ type: String, reflect: !0 })
], a.prototype, "color", 2);
H([
  o({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = H([
  l("ph-chair")
], a);
export {
  a as PhChair
};
