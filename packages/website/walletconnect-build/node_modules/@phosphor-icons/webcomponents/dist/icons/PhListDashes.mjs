import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as Z } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as l } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as m } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var c = Object.defineProperty, f = Object.getOwnPropertyDescriptor, H = (r, s, i, o) => {
  for (var t = o > 1 ? void 0 : o ? f(s, i) : s, p = r.length - 1, h; p >= 0; p--)
    (h = r[p]) && (t = (o ? h(s, i, t) : h(t)) || t);
  return o && t && c(s, i, t), t;
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
    e`<path d="M92,64a4,4,0,0,1,4-4H216a4,4,0,0,1,0,8H96A4,4,0,0,1,92,64Zm124,60H96a4,4,0,0,0,0,8H216a4,4,0,0,0,0-8Zm0,64H96a4,4,0,0,0,0,8H216a4,4,0,0,0,0-8ZM56,60H40a4,4,0,0,0,0,8H56a4,4,0,0,0,0-8Zm0,64H40a4,4,0,0,0,0,8H56a4,4,0,0,0,0-8Zm0,64H40a4,4,0,0,0,0,8H56a4,4,0,0,0,0-8Z"/>`
  ],
  [
    "light",
    e`<path d="M90,64a6,6,0,0,1,6-6H216a6,6,0,0,1,0,12H96A6,6,0,0,1,90,64Zm126,58H96a6,6,0,0,0,0,12H216a6,6,0,0,0,0-12Zm0,64H96a6,6,0,0,0,0,12H216a6,6,0,0,0,0-12ZM56,58H40a6,6,0,0,0,0,12H56a6,6,0,0,0,0-12Zm0,64H40a6,6,0,0,0,0,12H56a6,6,0,0,0,0-12Zm0,64H40a6,6,0,0,0,0,12H56a6,6,0,0,0,0-12Z"/>`
  ],
  [
    "regular",
    e`<path d="M88,64a8,8,0,0,1,8-8H216a8,8,0,0,1,0,16H96A8,8,0,0,1,88,64Zm128,56H96a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Zm0,64H96a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16ZM56,56H40a8,8,0,0,0,0,16H56a8,8,0,0,0,0-16Zm0,64H40a8,8,0,0,0,0,16H56a8,8,0,0,0,0-16Zm0,64H40a8,8,0,0,0,0,16H56a8,8,0,0,0,0-16Z"/>`
  ],
  [
    "bold",
    e`<path d="M84,64A12,12,0,0,1,96,52H216a12,12,0,0,1,0,24H96A12,12,0,0,1,84,64Zm132,52H96a12,12,0,0,0,0,24H216a12,12,0,0,0,0-24Zm0,64H96a12,12,0,0,0,0,24H216a12,12,0,0,0,0-24ZM56,52H40a12,12,0,0,0,0,24H56a12,12,0,0,0,0-24Zm0,64H40a12,12,0,0,0,0,24H56a12,12,0,0,0,0-24Zm0,64H40a12,12,0,0,0,0,24H56a12,12,0,0,0,0-24Z"/>`
  ],
  [
    "fill",
    e`<path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,184H64a8,8,0,0,1,0-16h8a8,8,0,0,1,0,16Zm0-48H64a8,8,0,0,1,0-16h8a8,8,0,0,1,0,16Zm0-48H64a8,8,0,0,1,0-16h8a8,8,0,0,1,0,16Zm120,96H104a8,8,0,0,1,0-16h88a8,8,0,0,1,0,16Zm0-48H104a8,8,0,0,1,0-16h88a8,8,0,0,1,0,16Zm0-48H104a8,8,0,0,1,0-16h88a8,8,0,0,1,0,16Z"/>`
  ],
  [
    "duotone",
    e`<path d="M216,64V192H96V64Z" opacity="0.2"/><path d="M88,64a8,8,0,0,1,8-8H216a8,8,0,0,1,0,16H96A8,8,0,0,1,88,64Zm128,56H96a8,8,0,1,0,0,16H216a8,8,0,0,0,0-16Zm0,64H96a8,8,0,1,0,0,16H216a8,8,0,0,0,0-16ZM56,56H40a8,8,0,0,0,0,16H56a8,8,0,0,0,0-16Zm0,64H40a8,8,0,1,0,0,16H56a8,8,0,0,0,0-16Zm0,64H40a8,8,0,1,0,0,16H56a8,8,0,0,0,0-16Z"/>`
  ]
]);
a.styles = g`
    :host {
      display: contents;
    }
  `;
H([
  m({ type: String, reflect: !0 })
], a.prototype, "size", 2);
H([
  m({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
H([
  m({ type: String, reflect: !0 })
], a.prototype, "color", 2);
H([
  m({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = H([
  n("ph-list-dashes")
], a);
export {
  a as PhListDashes
};
