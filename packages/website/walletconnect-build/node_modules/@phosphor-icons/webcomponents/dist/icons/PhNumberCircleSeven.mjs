import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as A } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var u = Object.defineProperty, f = Object.getOwnPropertyDescriptor, s = (a, o, l, i) => {
  for (var e = i > 1 ? void 0 : i ? f(o, l) : o, h = a.length - 1, m; h >= 0; h--)
    (m = a[h]) && (e = (i ? m(o, l, e) : m(e)) || e);
  return i && e && u(o, l, e), e;
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
    r`<path d="M128,28A100,100,0,1,0,228,128,100.11,100.11,0,0,0,128,28Zm0,192a92,92,0,1,1,92-92A92.1,92.1,0,0,1,128,220ZM155.28,85.71a4,4,0,0,1,.48,3.66l-32,88A4,4,0,0,1,120,180a4.12,4.12,0,0,1-1.37-.24,4,4,0,0,1-2.39-5.13L146.29,92H104a4,4,0,0,1,0-8h48A4,4,0,0,1,155.28,85.71Z"/>`
  ],
  [
    "light",
    r`<path d="M128,26A102,102,0,1,0,230,128,102.12,102.12,0,0,0,128,26Zm0,192a90,90,0,1,1,90-90A90.1,90.1,0,0,1,128,218ZM156.91,84.56a6,6,0,0,1,.73,5.49l-32,88A6,6,0,0,1,120,182a6.15,6.15,0,0,1-2-.36,6,6,0,0,1-3.59-7.69L143.43,94H104a6,6,0,0,1,0-12h48A6,6,0,0,1,156.91,84.56Z"/>`
  ],
  [
    "regular",
    r`<path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM158.55,83.41a8,8,0,0,1,1,7.32l-32,88A8,8,0,0,1,120,184a7.9,7.9,0,0,1-2.73-.48,8,8,0,0,1-4.79-10.25L140.58,96H104a8,8,0,0,1,0-16h48A8,8,0,0,1,158.55,83.41Z"/>`
  ],
  [
    "bold",
    r`<path d="M128,20A108,108,0,1,0,236,128,108.12,108.12,0,0,0,128,20Zm0,192a84,84,0,1,1,84-84A84.09,84.09,0,0,1,128,212ZM161.83,81.12a12,12,0,0,1,1.45,11l-32,88a12,12,0,0,1-22.56-8.2L134.87,100H104a12,12,0,0,1,0-24h48A12,12,0,0,1,161.83,81.12Z"/>`
  ],
  [
    "fill",
    r`<path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm31.52,66.73-32,88A8,8,0,0,1,120,184a7.9,7.9,0,0,1-2.73-.48,8,8,0,0,1-4.79-10.25L140.58,96H104a8,8,0,0,1,0-16h48a8,8,0,0,1,7.52,10.73Z"/>`
  ],
  [
    "duotone",
    r`<path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"/><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM158.55,83.41a8,8,0,0,1,1,7.32l-32,88A8,8,0,0,1,120,184a7.9,7.9,0,0,1-2.73-.48,8,8,0,0,1-4.79-10.25L140.58,96H104a8,8,0,0,1,0-16h48A8,8,0,0,1,158.55,83.41Z"/>`
  ]
]);
t.styles = g`
    :host {
      display: contents;
    }
  `;
s([
  p({ type: String, reflect: !0 })
], t.prototype, "size", 2);
s([
  p({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
s([
  p({ type: String, reflect: !0 })
], t.prototype, "color", 2);
s([
  p({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = s([
  c("ph-number-circle-seven")
], t);
export {
  t as PhNumberCircleSeven
};
