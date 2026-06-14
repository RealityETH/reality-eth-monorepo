import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as H } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as h } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var M = Object.defineProperty, c = Object.getOwnPropertyDescriptor, l = (r, s, i, o) => {
  for (var t = o > 1 ? void 0 : o ? c(s, i) : s, p = r.length - 1, m; p >= 0; p--)
    (m = r[p]) && (t = (o ? m(s, i, t) : m(t)) || t);
  return o && t && M(s, i, t), t;
};
let a = class extends H {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var r;
    return n`<svg
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
    e`<path d="M44,128a4,4,0,0,1,4-4h72a4,4,0,0,1,0,8H48A4,4,0,0,1,44,128Zm4-60h56a4,4,0,0,0,0-8H48a4,4,0,0,0,0,8ZM184,188H48a4,4,0,0,0,0,8H184a4,4,0,0,0,0-8ZM226.83,85.17l-40-40a4,4,0,0,0-5.66,0l-40,40a4,4,0,0,0,5.66,5.66L180,57.66V144a4,4,0,0,0,8,0V57.66l33.17,33.17a4,4,0,1,0,5.66-5.66Z"/>`
  ],
  [
    "light",
    e`<path d="M42,128a6,6,0,0,1,6-6h72a6,6,0,0,1,0,12H48A6,6,0,0,1,42,128Zm6-58h56a6,6,0,0,0,0-12H48a6,6,0,0,0,0,12ZM184,186H48a6,6,0,0,0,0,12H184a6,6,0,0,0,0-12ZM228.24,83.76l-40-40a6,6,0,0,0-8.48,0l-40,40a6,6,0,0,0,8.48,8.48L178,62.49V144a6,6,0,0,0,12,0V62.49l29.76,29.75a6,6,0,0,0,8.48-8.48Z"/>`
  ],
  [
    "regular",
    e`<path d="M40,128a8,8,0,0,1,8-8h72a8,8,0,0,1,0,16H48A8,8,0,0,1,40,128Zm8-56h56a8,8,0,0,0,0-16H48a8,8,0,0,0,0,16ZM184,184H48a8,8,0,0,0,0,16H184a8,8,0,0,0,0-16ZM229.66,82.34l-40-40a8,8,0,0,0-11.32,0l-40,40a8,8,0,0,0,11.32,11.32L176,67.31V144a8,8,0,0,0,16,0V67.31l26.34,26.35a8,8,0,0,0,11.32-11.32Z"/>`
  ],
  [
    "bold",
    e`<path d="M36,128a12,12,0,0,1,12-12h68a12,12,0,0,1,0,24H48A12,12,0,0,1,36,128ZM48,76h52a12,12,0,0,0,0-24H48a12,12,0,0,0,0,24ZM180,180H48a12,12,0,0,0,0,24H180a12,12,0,0,0,0-24ZM232.49,79.51l-40-40a12,12,0,0,0-17,0l-40,40a12,12,0,0,0,17,17L172,77v67a12,12,0,0,0,24,0V77l19.51,19.52a12,12,0,0,0,17-17Z"/>`
  ],
  [
    "fill",
    e`<path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,72h40a8,8,0,0,1,0,16H72a8,8,0,0,1,0-16Zm0,48h48a8,8,0,0,1,0,16H72a8,8,0,0,1,0-16Zm96,64H72a8,8,0,0,1,0-16h96a8,8,0,0,1,0,16Zm29.66-82.34a8,8,0,0,1-11.32,0L176,91.31V136a8,8,0,0,1-16,0V91.31l-10.34,10.35a8,8,0,0,1-11.32-11.32l24-24a8,8,0,0,1,11.32,0l24,24A8,8,0,0,1,197.66,101.66Z"/>`
  ],
  [
    "duotone",
    e`<path d="M224,88v88a16,16,0,0,1-16,16H48V64H200Z" opacity="0.2"/><path d="M40,128a8,8,0,0,1,8-8h72a8,8,0,0,1,0,16H48A8,8,0,0,1,40,128Zm8-56h56a8,8,0,0,0,0-16H48a8,8,0,0,0,0,16ZM184,184H48a8,8,0,0,0,0,16H184a8,8,0,0,0,0-16ZM229.66,82.34l-40-40a8,8,0,0,0-11.32,0l-40,40a8,8,0,0,0,11.32,11.32L176,67.31V144a8,8,0,0,0,16,0V67.31l26.34,26.35a8,8,0,0,0,11.32-11.32Z"/>`
  ]
]);
a.styles = g`
    :host {
      display: contents;
    }
  `;
l([
  h({ type: String, reflect: !0 })
], a.prototype, "size", 2);
l([
  h({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
l([
  h({ type: String, reflect: !0 })
], a.prototype, "color", 2);
l([
  h({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = l([
  Z("ph-sort-descending")
], a);
export {
  a as PhSortDescending
};
