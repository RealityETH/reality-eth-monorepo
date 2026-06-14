import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as A } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as Z } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as m } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var g = Object.defineProperty, f = Object.getOwnPropertyDescriptor, o = (a, s, p, i) => {
  for (var e = i > 1 ? void 0 : i ? f(s, p) : s, l = a.length - 1, h; l >= 0; l--)
    (h = a[l]) && (e = (i ? h(s, p, e) : h(e)) || e);
  return i && e && g(s, p, e), e;
};
let t = class extends Z {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return A`<svg
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
    r`<path d="M128,28A100,100,0,1,0,228,128,100.11,100.11,0,0,0,128,28Zm0,192a92,92,0,1,1,92-92A92.1,92.1,0,0,1,128,220Zm8-92a8,8,0,1,1-8-8A8,8,0,0,1,136,128Zm-44,0a8,8,0,1,1-8-8A8,8,0,0,1,92,128Zm88,0a8,8,0,1,1-8-8A8,8,0,0,1,180,128Z"/>`
  ],
  [
    "light",
    r`<path d="M128,26A102,102,0,1,0,230,128,102.12,102.12,0,0,0,128,26Zm0,192a90,90,0,1,1,90-90A90.1,90.1,0,0,1,128,218Zm10-90a10,10,0,1,1-10-10A10,10,0,0,1,138,128Zm-44,0a10,10,0,1,1-10-10A10,10,0,0,1,94,128Zm88,0a10,10,0,1,1-10-10A10,10,0,0,1,182,128Z"/>`
  ],
  [
    "regular",
    r`<path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm12-88a12,12,0,1,1-12-12A12,12,0,0,1,140,128Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,184,128Zm-88,0a12,12,0,1,1-12-12A12,12,0,0,1,96,128Z"/>`
  ],
  [
    "bold",
    r`<path d="M128,20A108,108,0,1,0,236,128,108.12,108.12,0,0,0,128,20Zm0,192a84,84,0,1,1,84-84A84.09,84.09,0,0,1,128,212Zm-16-84a16,16,0,1,1-16-16A16,16,0,0,1,112,128Zm64,0a16,16,0,1,1-16-16A16,16,0,0,1,176,128Z"/>`
  ],
  [
    "fill",
    r`<path d="M128,24A104,104,0,1,0,232,128,104.13,104.13,0,0,0,128,24ZM84,140a12,12,0,1,1,12-12A12,12,0,0,1,84,140Zm44,0a12,12,0,1,1,12-12A12,12,0,0,1,128,140Zm44,0a12,12,0,1,1,12-12A12,12,0,0,1,172,140Z"/>`
  ],
  [
    "duotone",
    r`<path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"/><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm56-88a12,12,0,1,1-12-12A12,12,0,0,1,184,128Zm-44,0a12,12,0,1,1-12-12A12,12,0,0,1,140,128Zm-44,0a12,12,0,1,1-12-12A12,12,0,0,1,96,128Z"/>`
  ]
]);
t.styles = c`
    :host {
      display: contents;
    }
  `;
o([
  m({ type: String, reflect: !0 })
], t.prototype, "size", 2);
o([
  m({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
o([
  m({ type: String, reflect: !0 })
], t.prototype, "color", 2);
o([
  m({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = o([
  n("ph-dots-three-circle")
], t);
export {
  t as PhDotsThreeCircle
};
