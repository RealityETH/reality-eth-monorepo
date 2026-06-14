import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as H } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as n } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as f } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var u = Object.defineProperty, c = Object.getOwnPropertyDescriptor, s = (a, o, p, h) => {
  for (var e = h > 1 ? void 0 : h ? c(o, p) : o, l = a.length - 1, m; l >= 0; l--)
    (m = a[l]) && (e = (h ? m(o, p, e) : m(e)) || e);
  return h && e && u(o, p, e), e;
};
let t = class extends n {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return H`<svg
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
    r`<path d="M204,208a4,4,0,0,1-4,4H48a4,4,0,0,1,0-8H200A4,4,0,0,1,204,208Zm-4-44H104a52,52,0,0,1,0-104h96a4,4,0,0,0,0-8H104a60,60,0,0,0,0,120h96a4,4,0,0,0,0-8Z"/>`
  ],
  [
    "light",
    r`<path d="M206,208a6,6,0,0,1-6,6H48a6,6,0,0,1,0-12H200A6,6,0,0,1,206,208Zm-6-46H104a50,50,0,0,1,0-100h96a6,6,0,0,0,0-12H104a62,62,0,0,0,0,124h96a6,6,0,0,0,0-12Z"/>`
  ],
  [
    "regular",
    r`<path d="M208,208a8,8,0,0,1-8,8H48a8,8,0,0,1,0-16H200A8,8,0,0,1,208,208Zm-8-48H104a48,48,0,0,1,0-96h96a8,8,0,0,0,0-16H104a64,64,0,0,0,0,128h96a8,8,0,0,0,0-16Z"/>`
  ],
  [
    "bold",
    r`<path d="M212,208a12,12,0,0,1-12,12H48a12,12,0,0,1,0-24H200A12,12,0,0,1,212,208Zm-12-52H104a44,44,0,0,1,0-88h96a12,12,0,0,0,0-24H104a68,68,0,0,0,0,136h96a12,12,0,0,0,0-24Z"/>`
  ],
  [
    "fill",
    r`<path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM176,184H80a8,8,0,0,1,0-16h96a8,8,0,0,1,0,16Zm-64-48h64a8,8,0,0,1,0,16H112a40,40,0,0,1,0-80h64a8,8,0,0,1,0,16H112a24,24,0,0,0,0,48Z"/>`
  ],
  [
    "duotone",
    r`<path d="M200,56V168H104a56,56,0,0,1,0-112Z" opacity="0.2"/><path d="M208,208a8,8,0,0,1-8,8H48a8,8,0,0,1,0-16H200A8,8,0,0,1,208,208Zm-8-48H104a48,48,0,0,1,0-96h96a8,8,0,0,0,0-16H104a64,64,0,0,0,0,128h96a8,8,0,0,0,0-16Z"/>`
  ]
]);
t.styles = g`
    :host {
      display: contents;
    }
  `;
s([
  i({ type: String, reflect: !0 })
], t.prototype, "size", 2);
s([
  i({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
s([
  i({ type: String, reflect: !0 })
], t.prototype, "color", 2);
s([
  i({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = s([
  f("ph-subset-of")
], t);
export {
  t as PhSubsetOf
};
