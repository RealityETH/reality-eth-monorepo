import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as H } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as V } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var g = Object.defineProperty, f = Object.getOwnPropertyDescriptor, o = (e, s, p, h) => {
  for (var t = h > 1 ? void 0 : h ? f(s, p) : s, l = e.length - 1, m; l >= 0; l--)
    (m = e[l]) && (t = (h ? m(s, p, t) : m(t)) || t);
  return h && t && g(s, p, t), t;
};
let a = class extends V {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return H`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${a.weightsMap.get((e = this.weight) != null ? e : "regular")}
    </svg>`;
  }
};
a.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    r`<path d="M236,80a36,36,0,0,0-36-36H48a36,36,0,0,0-12,69.94V200a12,12,0,0,0,12,12H200a12,12,0,0,0,12-12V113.94A36.07,36.07,0,0,0,236,80ZM44,200V115.77a35.22,35.22,0,0,0,4,.23,4,4,0,0,0,0-8,28,28,0,0,1,0-56h96a28,28,0,0,1,0,56,4,4,0,0,0,0,8,35.22,35.22,0,0,0,4-.23V200a4,4,0,0,1-4,4H48A4,4,0,0,1,44,200Zm156-92a4,4,0,0,0,0,8,35.22,35.22,0,0,0,4-.23V200a4,4,0,0,1-4,4H155.3a11.8,11.8,0,0,0,.7-4V113.94A36,36,0,0,0,166.59,52H200a28,28,0,0,1,0,56Z"/>`
  ],
  [
    "light",
    r`<path d="M238,80a38,38,0,0,0-38-38H48a38,38,0,0,0-14,73.32V200a14,14,0,0,0,14,14H200a14,14,0,0,0,14-14V115.32A38.07,38.07,0,0,0,238,80ZM46,200V118c.66,0,1.33,0,2,0a6,6,0,0,0,0-12,26,26,0,0,1,0-52h96a26,26,0,0,1,0,52,6,6,0,0,0,0,12c.67,0,1.34,0,2,0V200a2,2,0,0,1-2,2H48A2,2,0,0,1,46,200Zm154-94a6,6,0,0,0,0,12c.67,0,1.34,0,2,0V200a2,2,0,0,1-2,2H157.84a14.71,14.71,0,0,0,.16-2V115.32A38,38,0,0,0,171.68,54H200a26,26,0,0,1,0,52Z"/>`
  ],
  [
    "regular",
    r`<path d="M240,80a40,40,0,0,0-40-40H48a40,40,0,0,0-16,76.65V200a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V116.65A40.06,40.06,0,0,0,240,80ZM48,120a8,8,0,0,0,0-16,24,24,0,0,1,0-48h96a24,24,0,0,1,0,48,8,8,0,0,0,0,16v80H48Zm152-16a8,8,0,0,0,0,16v80H160V116.65A40,40,0,0,0,176,56h24a24,24,0,0,1,0,48Z"/>`
  ],
  [
    "bold",
    r`<path d="M244,80a44.05,44.05,0,0,0-44-44H48a44,44,0,0,0-20,83.17V200a20,20,0,0,0,20,20H200a20,20,0,0,0,20-20V119.17A44,44,0,0,0,244,80ZM52,123.3A12,12,0,0,0,48,100a20,20,0,0,1,0-40h92a20,20,0,0,1,0,40,12,12,0,0,0-4,23.3V196H52ZM200,100a12,12,0,0,0-4,23.3V196H160V119.17A43.92,43.92,0,0,0,179.17,60H200a20,20,0,0,1,0,40Z"/>`
  ],
  [
    "fill",
    r`<path d="M200,40H48a40,40,0,0,0-16,76.65V200a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V116.65A40,40,0,0,0,200,40Zm-56,64a8,8,0,0,0,0,16v80H48V120a8,8,0,0,0,0-16,24,24,0,0,1,0-48h96a24,24,0,0,1,0,48Z"/>`
  ],
  [
    "duotone",
    r`<path d="M208,111v89a8,8,0,0,1-8,8H144a8,8,0,0,0,8-8V111a32,32,0,0,0-8-63h56a32,32,0,0,1,8,63Z" opacity="0.2"/><path d="M240,80a40,40,0,0,0-40-40H48a40,40,0,0,0-16,76.65V200a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V116.65A40.06,40.06,0,0,0,240,80ZM48,120a8,8,0,0,0,0-16,24,24,0,0,1,0-48h96a24,24,0,0,1,0,48,8,8,0,0,0,0,16v80H48Zm152-16a8,8,0,0,0,0,16v80H160V116.65A40,40,0,0,0,176,56h24a24,24,0,0,1,0,48Z"/>`
  ]
]);
a.styles = c`
    :host {
      display: contents;
    }
  `;
o([
  i({ type: String, reflect: !0 })
], a.prototype, "size", 2);
o([
  i({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
o([
  i({ type: String, reflect: !0 })
], a.prototype, "color", 2);
o([
  i({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = o([
  n("ph-bread")
], a);
export {
  a as PhBread
};
