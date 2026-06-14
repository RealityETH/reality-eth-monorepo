import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as Z } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as n } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as A } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as a } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var M = Object.defineProperty, c = Object.getOwnPropertyDescriptor, s = (o, i, h, p) => {
  for (var r = p > 1 ? void 0 : p ? c(i, h) : i, l = o.length - 1, m; l >= 0; l--)
    (m = o[l]) && (r = (p ? m(i, h, r) : m(r)) || r);
  return p && r && M(i, h, r), r;
};
let t = class extends n {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var o;
    return Z`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((o = this.weight) != null ? o : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    e`<path d="M128,28A100,100,0,1,0,228,128,100.11,100.11,0,0,0,128,28Zm77.58,50.59L132,121.07v-85A92.07,92.07,0,0,1,205.58,78.59ZM124,36.09v89.6L46.42,170.48A92,92,0,0,1,124,36.09ZM128,220a92,92,0,0,1-77.58-42.59L209.58,85.52A92,92,0,0,1,128,220Z"/>`
  ],
  [
    "light",
    e`<path d="M128,26A102,102,0,1,0,230,128,102.12,102.12,0,0,0,128,26Zm74.74,51.92L134,117.61V38.2A90,90,0,0,1,202.74,77.92ZM122,38.2v86.34L47.24,167.7A90,90,0,0,1,122,38.2ZM128,218a90,90,0,0,1-74.74-39.92L208.76,88.3A90,90,0,0,1,128,218Z"/>`
  ],
  [
    "regular",
    e`<path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm71.87,53.27L136,114.14V40.37A88,88,0,0,1,199.87,77.27ZM120,40.37v83l-71.89,41.5A88,88,0,0,1,120,40.37ZM128,216a88,88,0,0,1-71.87-37.27L207.89,91.12A88,88,0,0,1,128,216Z"/>`
  ],
  [
    "bold",
    e`<path d="M128,20A108,108,0,1,0,236,128,108.12,108.12,0,0,0,128,20Zm12,24.87A84,84,0,0,1,194,76.07L140,107.22ZM50,159.17a83.94,83.94,0,0,1,66-114.3v76.2ZM128,212a83.88,83.88,0,0,1-65.95-32.07L206,96.83A84,84,0,0,1,128,212Z"/>`
  ],
  [
    "fill",
    e`<path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,16a88,88,0,0,1,71.87,37.27L128,118.76Zm0,176a88,88,0,0,1-71.87-37.27L207.89,91.12A88,88,0,0,1,128,216Z"/>`
  ],
  [
    "duotone",
    e`<path d="M128,32v96L44.86,176h0A96,96,0,0,1,128,32Z" opacity="0.2"/><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm71.87,53.27L136,114.14V40.37A88,88,0,0,1,199.87,77.27ZM120,40.37v83l-71.89,41.5A88,88,0,0,1,120,40.37ZM128,216a88,88,0,0,1-71.87-37.27L207.89,91.12A88,88,0,0,1,128,216Z"/>`
  ]
]);
t.styles = g`
    :host {
      display: contents;
    }
  `;
s([
  a({ type: String, reflect: !0 })
], t.prototype, "size", 2);
s([
  a({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
s([
  a({ type: String, reflect: !0 })
], t.prototype, "color", 2);
s([
  a({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = s([
  A("ph-chart-pie")
], t);
export {
  t as PhChartPie
};
