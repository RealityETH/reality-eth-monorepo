import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as v } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as V } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var A = Object.defineProperty, g = Object.getOwnPropertyDescriptor, l = (e, o, p, s) => {
  for (var a = s > 1 ? void 0 : s ? g(o, p) : o, h = e.length - 1, m; h >= 0; h--)
    (m = e[h]) && (a = (s ? m(o, p, a) : m(a)) || a);
  return s && a && A(o, p, a), a;
};
let t = class extends v {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return n`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((e = this.weight) != null ? e : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    r`<path d="M128,28A100,100,0,1,0,228,128,100.11,100.11,0,0,0,128,28Zm0,192a92,92,0,1,1,92-92A92.1,92.1,0,0,1,128,220ZM108,104a4,4,0,0,1-4,4H92v44a4,4,0,0,1-8,0V108H72a4,4,0,0,1,0-8h32A4,4,0,0,1,108,104Zm80,0v48a4,4,0,0,1-8,0V114.65l-21,24a4,4,0,0,1-6,0l-21-24V152a4,4,0,0,1-8,0V104a4,4,0,0,1,7-2.63l25,28.56,25-28.56a4,4,0,0,1,7,2.63Z"/>`
  ],
  [
    "light",
    r`<path d="M128,26A102,102,0,1,0,230,128,102.12,102.12,0,0,0,128,26Zm0,192a90,90,0,1,1,90-90A90.1,90.1,0,0,1,128,218ZM110,104a6,6,0,0,1-6,6H94v42a6,6,0,0,1-12,0V110H72a6,6,0,0,1,0-12h32A6,6,0,0,1,110,104Zm80,0v48a6,6,0,0,1-12,0V120l-17.48,20a6,6,0,0,1-9,0L134,120v32a6,6,0,0,1-12,0V104a6,6,0,0,1,10.52-4L156,126.89l23.48-26.84A6,6,0,0,1,190,104Z"/>`
  ],
  [
    "regular",
    r`<path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM112,104a8,8,0,0,1-8,8H96v40a8,8,0,0,1-16,0V112H72a8,8,0,0,1,0-16h32A8,8,0,0,1,112,104Zm80,0v48a8,8,0,0,1-16,0V125.29l-14,16a8,8,0,0,1-12,0l-14-16V152a8,8,0,0,1-16,0V104a8,8,0,0,1,14-5.27l22,25.12,22-25.12A8,8,0,0,1,192,104Z"/>`
  ],
  [
    "bold",
    r`<path d="M128,20A108,108,0,1,0,236,128,108.12,108.12,0,0,0,128,20Zm0,192a84,84,0,1,1,84-84A84.09,84.09,0,0,1,128,212Zm64-104v40a12,12,0,0,1-24,0V134.09l-8.19,7a12,12,0,0,1-15.62,0l-8.19-7V148a12,12,0,0,1-24,0V120H100v28a12,12,0,0,1-24,0V120H72a12,12,0,0,1,0-24h52a12,12,0,0,1,7.81,2.89L152,116.2l20.19-17.31A12,12,0,0,1,192,108Z"/>`
  ],
  [
    "fill",
    r`<path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm-24,88H96v40a8,8,0,0,1-16,0V112H72a8,8,0,0,1,0-16h32a8,8,0,0,1,0,16Zm88,40a8,8,0,0,1-16,0V125.29l-14,16a8,8,0,0,1-12,0l-14-16V152a8,8,0,0,1-16,0V104a8,8,0,0,1,14-5.27l22,25.12,22-25.12A8,8,0,0,1,192,104Z"/>`
  ],
  [
    "duotone",
    r`<path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"/><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM112,104a8,8,0,0,1-8,8H96v40a8,8,0,0,1-16,0V112H72a8,8,0,0,1,0-16h32A8,8,0,0,1,112,104Zm80,0v48a8,8,0,0,1-16,0V125.29l-14,16a8,8,0,0,1-12,0l-14-16V152a8,8,0,0,1-16,0V104a8,8,0,0,1,14-5.27l22,25.12,22-25.12A8,8,0,0,1,192,104Z"/>`
  ]
]);
t.styles = Z`
    :host {
      display: contents;
    }
  `;
l([
  i({ type: String, reflect: !0 })
], t.prototype, "size", 2);
l([
  i({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
l([
  i({ type: String, reflect: !0 })
], t.prototype, "color", 2);
l([
  i({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = l([
  V("ph-trademark")
], t);
export {
  t as PhTrademark
};
