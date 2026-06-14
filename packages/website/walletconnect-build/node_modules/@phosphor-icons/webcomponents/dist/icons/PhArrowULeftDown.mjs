import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as f } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as v } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var c = Object.defineProperty, u = Object.getOwnPropertyDescriptor, o = (a, l, p, s) => {
  for (var r = s > 1 ? void 0 : s ? u(l, p) : l, h = a.length - 1, n; h >= 0; h--)
    (n = a[h]) && (r = (s ? n(l, p, r) : n(r)) || r);
  return s && r && c(l, p, r), r;
};
let t = class extends f {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return m`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((a = this.weight) != null ? a : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    e`<path d="M204,88v88a4,4,0,0,1-8,0V88A52,52,0,0,0,92,88V214.34l41.17-41.17a4,4,0,0,1,5.66,5.66l-48,48a4,4,0,0,1-5.66,0l-48-48a4,4,0,0,1,5.66-5.66L84,214.34V88a60,60,0,0,1,120,0Z"/>`
  ],
  [
    "light",
    e`<path d="M206,88v88a6,6,0,0,1-12,0V88A50,50,0,0,0,94,88V209.51l37.76-37.75a6,6,0,0,1,8.48,8.48l-48,48a6,6,0,0,1-8.48,0l-48-48a6,6,0,0,1,8.48-8.48L82,209.51V88a62,62,0,0,1,124,0Z"/>`
  ],
  [
    "regular",
    e`<path d="M208,88v88a8,8,0,0,1-16,0V88a48,48,0,0,0-96,0V204.69l34.34-34.35a8,8,0,0,1,11.32,11.32l-48,48a8,8,0,0,1-11.32,0l-48-48a8,8,0,0,1,11.32-11.32L80,204.69V88a64,64,0,0,1,128,0Z"/>`
  ],
  [
    "bold",
    e`<path d="M212,88v88a12,12,0,0,1-24,0V88a44,44,0,0,0-88,0V195l27.51-27.52a12,12,0,0,1,17,17l-48,48a12,12,0,0,1-17,0l-48-48a12,12,0,1,1,17-17L76,195V88a68,68,0,0,1,136,0Z"/>`
  ],
  [
    "fill",
    e`<path d="M208,88v88a8,8,0,0,1-16,0V88a48,48,0,0,0-96,0v80h40a8,8,0,0,1,5.66,13.66l-48,48a8,8,0,0,1-11.32,0l-48-48A8,8,0,0,1,40,168H80V88a64,64,0,0,1,128,0Z"/>`
  ],
  [
    "duotone",
    e`<path d="M136,176,88,224,40,176Z" opacity="0.2"/><path d="M144,24A64.07,64.07,0,0,0,80,88v80H40a8,8,0,0,0-5.66,13.66l48,48a8,8,0,0,0,11.32,0l48-48A8,8,0,0,0,136,168H96V88a48,48,0,0,1,96,0v88a8,8,0,0,0,16,0V88A64.07,64.07,0,0,0,144,24ZM88,212.69,59.31,184h57.38Z"/>`
  ]
]);
t.styles = v`
    :host {
      display: contents;
    }
  `;
o([
  i({ type: String, reflect: !0 })
], t.prototype, "size", 2);
o([
  i({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
o([
  i({ type: String, reflect: !0 })
], t.prototype, "color", 2);
o([
  i({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = o([
  g("ph-arrow-u-left-down")
], t);
export {
  t as PhArrowULeftDown
};
