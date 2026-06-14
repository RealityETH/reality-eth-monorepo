import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as Z } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as h } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var g = Object.defineProperty, u = Object.getOwnPropertyDescriptor, o = (a, s, p, m) => {
  for (var e = m > 1 ? void 0 : m ? u(s, p) : s, l = a.length - 1, A; l >= 0; l--)
    (A = a[l]) && (e = (m ? A(s, p, e) : A(e)) || e);
  return m && e && g(s, p, e), e;
};
let t = class extends h {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return Z`<svg
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
    r`<path d="M128,100a28,28,0,1,0,28,28A28,28,0,0,0,128,100Zm0,48a20,20,0,1,1,20-20A20,20,0,0,1,128,148Zm0-72a28,28,0,1,0-28-28A28,28,0,0,0,128,76Zm0-48a20,20,0,1,1-20,20A20,20,0,0,1,128,28Zm0,152a28,28,0,1,0,28,28A28,28,0,0,0,128,180Zm0,48a20,20,0,1,1,20-20A20,20,0,0,1,128,228Z"/>`
  ],
  [
    "light",
    r`<path d="M128,98a30,30,0,1,0,30,30A30,30,0,0,0,128,98Zm0,48a18,18,0,1,1,18-18A18,18,0,0,1,128,146Zm0-68A30,30,0,1,0,98,48,30,30,0,0,0,128,78Zm0-48a18,18,0,1,1-18,18A18,18,0,0,1,128,30Zm0,148a30,30,0,1,0,30,30A30,30,0,0,0,128,178Zm0,48a18,18,0,1,1,18-18A18,18,0,0,1,128,226Z"/>`
  ],
  [
    "regular",
    r`<path d="M128,96a32,32,0,1,0,32,32A32,32,0,0,0,128,96Zm0,48a16,16,0,1,1,16-16A16,16,0,0,1,128,144Zm0-64A32,32,0,1,0,96,48,32,32,0,0,0,128,80Zm0-48a16,16,0,1,1-16,16A16,16,0,0,1,128,32Zm0,144a32,32,0,1,0,32,32A32,32,0,0,0,128,176Zm0,48a16,16,0,1,1,16-16A16,16,0,0,1,128,224Z"/>`
  ],
  [
    "bold",
    r`<path d="M128,96a32,32,0,1,0,32,32A32,32,0,0,0,128,96Zm0,40a8,8,0,1,1,8-8A8,8,0,0,1,128,136Zm0-56A32,32,0,1,0,96,48,32,32,0,0,0,128,80Zm0-40a8,8,0,1,1-8,8A8,8,0,0,1,128,40Zm0,136a32,32,0,1,0,32,32A32,32,0,0,0,128,176Zm0,40a8,8,0,1,1,8-8A8,8,0,0,1,128,216Z"/>`
  ],
  [
    "fill",
    r`<path d="M156,128a28,28,0,1,1-28-28A28,28,0,0,1,156,128ZM128,76a28,28,0,1,0-28-28A28,28,0,0,0,128,76Zm0,104a28,28,0,1,0,28,28A28,28,0,0,0,128,180Z"/>`
  ],
  [
    "duotone",
    r`<path d="M152,128a24,24,0,1,1-24-24A24,24,0,0,1,152,128ZM128,72a24,24,0,1,0-24-24A24,24,0,0,0,128,72Zm0,112a24,24,0,1,0,24,24A24,24,0,0,0,128,184Z" opacity="0.2"/><path d="M128,96a32,32,0,1,0,32,32A32,32,0,0,0,128,96Zm0,48a16,16,0,1,1,16-16A16,16,0,0,1,128,144Zm0-64A32,32,0,1,0,96,48,32,32,0,0,0,128,80Zm0-48a16,16,0,1,1-16,16A16,16,0,0,1,128,32Zm0,144a32,32,0,1,0,32,32A32,32,0,0,0,128,176Zm0,48a16,16,0,1,1,16-16A16,16,0,0,1,128,224Z"/>`
  ]
]);
t.styles = c`
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
  n("ph-dots-three-outline-vertical")
], t);
export {
  t as PhDotsThreeOutlineVertical
};
