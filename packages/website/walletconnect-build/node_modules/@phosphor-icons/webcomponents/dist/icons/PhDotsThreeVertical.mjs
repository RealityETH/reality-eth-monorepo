import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as A } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var Z = Object.defineProperty, f = Object.getOwnPropertyDescriptor, o = (a, s, h, i) => {
  for (var e = i > 1 ? void 0 : i ? f(s, h) : s, l = a.length - 1, m; l >= 0; l--)
    (m = a[l]) && (e = (i ? m(s, h, e) : m(e)) || e);
  return i && e && Z(s, h, e), e;
};
let t = class extends A {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return n`<svg
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
    r`<path d="M120,60a8,8,0,1,1,8,8A8,8,0,0,1,120,60Zm8,60a8,8,0,1,0,8,8A8,8,0,0,0,128,120Zm0,68a8,8,0,1,0,8,8A8,8,0,0,0,128,188Z"/>`
  ],
  [
    "light",
    r`<path d="M118,60a10,10,0,1,1,10,10A10,10,0,0,1,118,60Zm10,58a10,10,0,1,0,10,10A10,10,0,0,0,128,118Zm0,68a10,10,0,1,0,10,10A10,10,0,0,0,128,186Z"/>`
  ],
  [
    "regular",
    r`<path d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128ZM128,72a12,12,0,1,0-12-12A12,12,0,0,0,128,72Zm0,112a12,12,0,1,0,12,12A12,12,0,0,0,128,184Z"/>`
  ],
  [
    "bold",
    r`<path d="M112,60a16,16,0,1,1,16,16A16,16,0,0,1,112,60Zm16,52a16,16,0,1,0,16,16A16,16,0,0,0,128,112Zm0,68a16,16,0,1,0,16,16A16,16,0,0,0,128,180Z"/>`
  ],
  [
    "fill",
    r`<path d="M160,16H96A16,16,0,0,0,80,32V224a16,16,0,0,0,16,16h64a16,16,0,0,0,16-16V32A16,16,0,0,0,160,16ZM128,208a12,12,0,1,1,12-12A12,12,0,0,1,128,208Zm0-68a12,12,0,1,1,12-12A12,12,0,0,1,128,140Zm0-68a12,12,0,1,1,12-12A12,12,0,0,1,128,72Z"/>`
  ],
  [
    "duotone",
    r`<path d="M176,32V224a16,16,0,0,1-16,16H96a16,16,0,0,1-16-16V32A16,16,0,0,1,96,16h64A16,16,0,0,1,176,32Z" opacity="0.2"/><path d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128ZM128,72a12,12,0,1,0-12-12A12,12,0,0,0,128,72Zm0,112a12,12,0,1,0,12,12A12,12,0,0,0,128,184Z"/>`
  ]
]);
t.styles = g`
    :host {
      display: contents;
    }
  `;
o([
  p({ type: String, reflect: !0 })
], t.prototype, "size", 2);
o([
  p({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
o([
  p({ type: String, reflect: !0 })
], t.prototype, "color", 2);
o([
  p({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = o([
  c("ph-dots-three-vertical")
], t);
export {
  t as PhDotsThreeVertical
};
