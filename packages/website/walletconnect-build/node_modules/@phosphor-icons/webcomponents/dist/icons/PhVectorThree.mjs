import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as l, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as v } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as h } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var H = Object.defineProperty, L = Object.getOwnPropertyDescriptor, a = (r, o, i, s) => {
  for (var e = s > 1 ? void 0 : s ? L(o, i) : o, p = r.length - 1, n; p >= 0; p--)
    (n = r[p]) && (e = (s ? n(o, i, e) : n(e)) || e);
  return s && e && H(o, i, e), e;
};
let t = class extends v {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var r;
    return m`<svg
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
    l`<path d="M234.83,138.83l-32,32a4,4,0,0,1-5.66-5.66L222.34,140H121.66l-64,64H96a4,4,0,0,1,0,8H48a4,4,0,0,1-4-4V160a4,4,0,0,1,8,0v38.34l64-64V33.66L90.83,58.83a4,4,0,0,1-5.66-5.66l32-32a4,4,0,0,1,5.66,0l32,32a4,4,0,0,1-5.66,5.66L124,33.66V132h98.34l-25.17-25.17a4,4,0,0,1,5.66-5.66l32,32A4,4,0,0,1,234.83,138.83Z"/>`
  ],
  [
    "light",
    l`<path d="M236.24,140.24l-32,32a6,6,0,0,1-8.48-8.48L217.51,142h-95l-60,60H96a6,6,0,0,1,0,12H48a6,6,0,0,1-6-6V160a6,6,0,0,1,12,0v33.51l60-60v-95L92.24,60.24a6,6,0,0,1-8.48-8.48l32-32a6,6,0,0,1,8.48,0l32,32a6,6,0,1,1-8.48,8.48L126,38.49V130h91.51l-21.75-21.76a6,6,0,0,1,8.48-8.48l32,32A6,6,0,0,1,236.24,140.24Z"/>`
  ],
  [
    "regular",
    l`<path d="M237.66,141.66l-32,32a8,8,0,0,1-11.32-11.32L212.69,144H123.31l-56,56H96a8,8,0,0,1,0,16H48a8,8,0,0,1-8-8V160a8,8,0,0,1,16,0v28.69l56-56V43.31L93.66,61.66A8,8,0,0,1,82.34,50.34l32-32a8,8,0,0,1,11.32,0l32,32a8,8,0,0,1-11.32,11.32L128,43.31V128h84.69l-18.35-18.34a8,8,0,0,1,11.32-11.32l32,32A8,8,0,0,1,237.66,141.66Z"/>`
  ],
  [
    "bold",
    l`<path d="M240.49,144.49l-32,32a12,12,0,0,1-17-17L203,148H125L77,196H96a12,12,0,0,1,0,24H48a12,12,0,0,1-12-12V160a12,12,0,0,1,24,0v19l48-48V53L96.49,64.49a12,12,0,1,1-17-17l32-32a12,12,0,0,1,17,0l32,32a12,12,0,0,1-17,17L132,53v71h71l-11.52-11.51a12,12,0,0,1,17-17l32,32A12,12,0,0,1,240.49,144.49Z"/>`
  ],
  [
    "fill",
    l`<path d="M237.66,141.66l-32,32A8,8,0,0,1,192,168V144H123.31l-40,40,18.35,18.34A8,8,0,0,1,96,216H48a8,8,0,0,1-8-8V160a8,8,0,0,1,13.66-5.66L72,172.69l40-40V64H88a8,8,0,0,1-5.66-13.66l32-32a8,8,0,0,1,11.32,0l32,32A8,8,0,0,1,152,64H128v64h64V104a8,8,0,0,1,13.66-5.66l32,32A8,8,0,0,1,237.66,141.66Z"/>`
  ],
  [
    "duotone",
    l`<path d="M232,40v96l-67.31,67.31A16,16,0,0,1,153.37,208H48V102.63a16,16,0,0,1,4.69-11.32L120,24h96A16,16,0,0,1,232,40Z" opacity="0.2"/><path d="M237.66,141.66l-32,32a8,8,0,0,1-11.32-11.32L212.69,144H123.31l-56,56H96a8,8,0,0,1,0,16H48a8,8,0,0,1-8-8V160a8,8,0,0,1,16,0v28.69l56-56V43.31L93.66,61.66A8,8,0,0,1,82.34,50.34l32-32a8,8,0,0,1,11.32,0l32,32a8,8,0,0,1-11.32,11.32L128,43.31V128h84.69l-18.35-18.34a8,8,0,0,1,11.32-11.32l32,32A8,8,0,0,1,237.66,141.66Z"/>`
  ]
]);
t.styles = g`
    :host {
      display: contents;
    }
  `;
a([
  h({ type: String, reflect: !0 })
], t.prototype, "size", 2);
a([
  h({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
a([
  h({ type: String, reflect: !0 })
], t.prototype, "color", 2);
a([
  h({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = a([
  c("ph-vector-three")
], t);
export {
  t as PhVectorThree
};
