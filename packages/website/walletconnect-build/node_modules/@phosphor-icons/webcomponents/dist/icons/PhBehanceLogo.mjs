import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as Z } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as l } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as A } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as h } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var M = Object.defineProperty, g = Object.getOwnPropertyDescriptor, H = (r, o, i, s) => {
  for (var t = s > 1 ? void 0 : s ? g(o, i) : o, m = r.length - 1, p; m >= 0; m--)
    (p = r[m]) && (t = (s ? p(o, i, t) : p(t)) || t);
  return s && t && M(o, i, t), t;
};
let a = class extends l {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var r;
    return Z`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${a.weightsMap.get((r = this.weight) != null ? r : "regular")}
    </svg>`;
  }
};
a.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    e`<path d="M108.16,122.74A34,34,0,0,0,90,60H32a4,4,0,0,0-4,4V192a4,4,0,0,0,4,4H94a38,38,0,0,0,14.16-73.26ZM36,68H90a26,26,0,0,1,0,52H36ZM94,188H36V128H94a30,30,0,0,1,0,60ZM164,80a4,4,0,0,1,4-4h64a4,4,0,0,1,0,8H168A4,4,0,0,1,164,80Zm36,28a44,44,0,1,0,35.2,70.41,4,4,0,0,0-6.4-4.81A36,36,0,0,1,164.22,156H240a4,4,0,0,0,4-4A44.05,44.05,0,0,0,200,108Zm-35.78,40a36,36,0,0,1,71.56,0Z"/>`
  ],
  [
    "light",
    e`<path d="M112.15,122.36A36,36,0,0,0,90,58H32a6,6,0,0,0-6,6V192a6,6,0,0,0,6,6H94a40,40,0,0,0,18.15-75.64ZM38,70H90a24,24,0,0,1,0,48H38ZM94,186H38V130H94a28,28,0,0,1,0,56ZM162,80a6,6,0,0,1,6-6h64a6,6,0,0,1,0,12H168A6,6,0,0,1,162,80Zm38,26a46,46,0,1,0,36.8,73.61,6,6,0,0,0-9.6-7.21A34,34,0,0,1,166.53,158H240a6,6,0,0,0,6-6A46.06,46.06,0,0,0,200,106Zm-33.47,40a34,34,0,0,1,66.94,0Z"/>`
  ],
  [
    "regular",
    e`<path d="M160,80a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H168A8,8,0,0,1,160,80Zm-24,78a42,42,0,0,1-42,42H32a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H90a38,38,0,0,1,25.65,66A42,42,0,0,1,136,158ZM40,116H90a22,22,0,0,0,0-44H40Zm80,42a26,26,0,0,0-26-26H40v52H94A26,26,0,0,0,120,158Zm128-6a8,8,0,0,1-8,8H169a32,32,0,0,0,56.59,11.2,8,8,0,0,1,12.8,9.61A48,48,0,1,1,248,152Zm-17-8a32,32,0,0,0-62,0Z"/>`
  ],
  [
    "bold",
    e`<path d="M117.82,121.39A42,42,0,0,0,86,52H32A12,12,0,0,0,20,64V192a12,12,0,0,0,12,12H90a46,46,0,0,0,27.82-82.61ZM44,76H86a18,18,0,0,1,0,36H44ZM90,180H44V136H90a22,22,0,0,1,0,44ZM156,76a12,12,0,0,1,12-12h64a12,12,0,0,1,0,24H168A12,12,0,0,1,156,76Zm44,24a52,52,0,0,0,0,104,51.45,51.45,0,0,0,22.7-5.21,12,12,0,1,0-10.49-21.58A27.73,27.73,0,0,1,200,180a28.05,28.05,0,0,1-25.3-16H240a12,12,0,0,0,12-12A52.06,52.06,0,0,0,200,100Zm-25.3,40a28,28,0,0,1,50.6,0Z"/>`
  ],
  [
    "fill",
    e`<path d="M92,120H64V96H92a12,12,0,0,1,0,24Zm4,16H64v32H96a16,16,0,0,0,0-32Zm80-16a24,24,0,0,0-22.62,16h45.24A24,24,0,0,0,176,120Zm64-64V200a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V56A16,16,0,0,1,32,40H224A16,16,0,0,1,240,56ZM144,88a8,8,0,0,0,8,8h48a8,8,0,0,0,0-16H152A8,8,0,0,0,144,88Zm-16,64a32,32,0,0,0-14.13-26.53A28,28,0,0,0,92,80H56a8,8,0,0,0-8,8v88a8,8,0,0,0,8,8H96A32,32,0,0,0,128,152Zm88-8a40,40,0,1,0-13.54,30,8,8,0,0,0-10.59-12,24,24,0,0,1-38.49-10H208A8,8,0,0,0,216,144Z"/>`
  ],
  [
    "duotone",
    e`<path d="M240,152H160a40,40,0,0,1,80,0ZM94,124H90a30,30,0,0,0,0-60H32V192H94a34,34,0,0,0,0-68Z" opacity="0.2"/><path d="M160,80a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H168A8,8,0,0,1,160,80Zm-24,78a42,42,0,0,1-42,42H32a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H90a38,38,0,0,1,25.65,66A42,42,0,0,1,136,158ZM40,116H90a22,22,0,0,0,0-44H40Zm80,42a26,26,0,0,0-26-26H40v52H94A26,26,0,0,0,120,158Zm128-6a8,8,0,0,1-8,8H169a32,32,0,0,0,56.59,11.2,8,8,0,0,1,12.8,9.61A48,48,0,1,1,248,152Zm-17-8a32,32,0,0,0-62,0Z"/>`
  ]
]);
a.styles = n`
    :host {
      display: contents;
    }
  `;
H([
  h({ type: String, reflect: !0 })
], a.prototype, "size", 2);
H([
  h({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
H([
  h({ type: String, reflect: !0 })
], a.prototype, "color", 2);
H([
  h({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = H([
  A("ph-behance-logo")
], a);
export {
  a as PhBehanceLogo
};
