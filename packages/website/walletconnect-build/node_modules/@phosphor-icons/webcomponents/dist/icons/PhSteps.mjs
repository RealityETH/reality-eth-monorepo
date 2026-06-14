import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as v } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as n } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as V } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as m } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var g = Object.defineProperty, c = Object.getOwnPropertyDescriptor, h = (r, s, i, o) => {
  for (var a = o > 1 ? void 0 : o ? c(s, i) : s, l = r.length - 1, H; l >= 0; l--)
    (H = r[l]) && (a = (o ? H(s, i, a) : H(a)) || a);
  return o && a && g(s, i, a), a;
};
let t = class extends n {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var r;
    return v`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((r = this.weight) != null ? r : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    e`<path d="M244,56a4,4,0,0,1-4,4H188v44a4,4,0,0,1-4,4H132v44a4,4,0,0,1-4,4H76v44a4,4,0,0,1-4,4H16a4,4,0,0,1,0-8H68V152a4,4,0,0,1,4-4h52V104a4,4,0,0,1,4-4h52V56a4,4,0,0,1,4-4h56A4,4,0,0,1,244,56Z"/>`
  ],
  [
    "light",
    e`<path d="M246,56a6,6,0,0,1-6,6H190v42a6,6,0,0,1-6,6H134v42a6,6,0,0,1-6,6H78v42a6,6,0,0,1-6,6H16a6,6,0,0,1,0-12H66V152a6,6,0,0,1,6-6h50V104a6,6,0,0,1,6-6h50V56a6,6,0,0,1,6-6h56A6,6,0,0,1,246,56Z"/>`
  ],
  [
    "regular",
    e`<path d="M248,56a8,8,0,0,1-8,8H192v40a8,8,0,0,1-8,8H136v40a8,8,0,0,1-8,8H80v40a8,8,0,0,1-8,8H16a8,8,0,0,1,0-16H64V152a8,8,0,0,1,8-8h48V104a8,8,0,0,1,8-8h48V56a8,8,0,0,1,8-8h56A8,8,0,0,1,248,56Z"/>`
  ],
  [
    "bold",
    e`<path d="M252,56a12,12,0,0,1-12,12H196v36a12,12,0,0,1-12,12H140v36a12,12,0,0,1-12,12H84v36a12,12,0,0,1-12,12H16a12,12,0,0,1,0-24H60V152a12,12,0,0,1,12-12h44V104a12,12,0,0,1,12-12h44V56a12,12,0,0,1,12-12h56A12,12,0,0,1,252,56Z"/>`
  ],
  [
    "fill",
    e`<path d="M240,56V200a8,8,0,0,1-8,8H8a8,8,0,0,1,0-16H56V152a8,8,0,0,1,8-8h48V104a8,8,0,0,1,8-8h48V56a8,8,0,0,1,8-8h56A8,8,0,0,1,240,56Z"/>`
  ],
  [
    "duotone",
    e`<path d="M240,56V184a16,16,0,0,1-16,16H72V152h56V104h56V56Z" opacity="0.2"/><path d="M248,56a8,8,0,0,1-8,8H192v40a8,8,0,0,1-8,8H136v40a8,8,0,0,1-8,8H80v40a8,8,0,0,1-8,8H16a8,8,0,0,1,0-16H64V152a8,8,0,0,1,8-8h48V104a8,8,0,0,1,8-8h48V56a8,8,0,0,1,8-8h56A8,8,0,0,1,248,56Z"/>`
  ]
]);
t.styles = m`
    :host {
      display: contents;
    }
  `;
h([
  p({ type: String, reflect: !0 })
], t.prototype, "size", 2);
h([
  p({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
h([
  p({ type: String, reflect: !0 })
], t.prototype, "color", 2);
h([
  p({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = h([
  V("ph-steps")
], t);
export {
  t as PhSteps
};
