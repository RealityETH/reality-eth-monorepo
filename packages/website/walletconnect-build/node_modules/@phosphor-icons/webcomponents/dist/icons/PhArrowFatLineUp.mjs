import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as H } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as v } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as l } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var f = Object.defineProperty, c = Object.getOwnPropertyDescriptor, h = (e, o, i, s) => {
  for (var a = s > 1 ? void 0 : s ? c(o, i) : o, p = e.length - 1, m; p >= 0; p--)
    (m = e[p]) && (a = (s ? m(o, i, a) : m(a)) || a);
  return s && a && f(o, i, a), a;
};
let t = class extends H {
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
    r`<path d="M226.83,117.17l-96-96a4,4,0,0,0-5.66,0l-96,96A4,4,0,0,0,32,124H76v60a4,4,0,0,0,4,4h96a4,4,0,0,0,4-4V124h44a4,4,0,0,0,2.83-6.83ZM176,116a4,4,0,0,0-4,4v60H84V120a4,4,0,0,0-4-4H41.66L128,29.66,214.34,116Zm4,100a4,4,0,0,1-4,4H80a4,4,0,0,1,0-8h96A4,4,0,0,1,180,216Z"/>`
  ],
  [
    "light",
    r`<path d="M228.24,115.76l-96-96a6,6,0,0,0-8.48,0l-96,96A6,6,0,0,0,32,126H74v58a6,6,0,0,0,6,6h96a6,6,0,0,0,6-6V126h42a6,6,0,0,0,4.24-10.24ZM176,114a6,6,0,0,0-6,6v58H86V120a6,6,0,0,0-6-6H46.49L128,32.49,209.51,114Zm6,102a6,6,0,0,1-6,6H80a6,6,0,0,1,0-12h96A6,6,0,0,1,182,216Z"/>`
  ],
  [
    "regular",
    r`<path d="M229.66,114.34l-96-96a8,8,0,0,0-11.32,0l-96,96A8,8,0,0,0,32,128H72v56a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8V128h40a8,8,0,0,0,5.66-13.66ZM176,112a8,8,0,0,0-8,8v56H88V120a8,8,0,0,0-8-8H51.31L128,35.31,204.69,112Zm8,104a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,216Z"/>`
  ],
  [
    "bold",
    r`<path d="M232.48,111.51l-96-96a12,12,0,0,0-17,0l-96,96A12,12,0,0,0,32,132H68v44a12,12,0,0,0,12,12h96a12,12,0,0,0,12-12V132h36a12,12,0,0,0,8.48-20.49ZM176,108a12,12,0,0,0-12,12v44H92V120a12,12,0,0,0-12-12H61l67-67,67,67Zm12,108a12,12,0,0,1-12,12H80a12,12,0,0,1,0-24h96A12,12,0,0,1,188,216Z"/>`
  ],
  [
    "fill",
    r`<path d="M184,216a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,216Zm45.66-101.66-96-96a8,8,0,0,0-11.32,0l-96,96A8,8,0,0,0,32,128H72v56a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8V128h40a8,8,0,0,0,5.66-13.66Z"/>`
  ],
  [
    "duotone",
    r`<path d="M224,120H176v64H80V120H32l96-96Z" opacity="0.2"/><path d="M229.66,114.34l-96-96a8,8,0,0,0-11.32,0l-96,96A8,8,0,0,0,32,128H72v56a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8V128h40a8,8,0,0,0,5.66-13.66ZM176,112a8,8,0,0,0-8,8v56H88V120a8,8,0,0,0-8-8H51.31L128,35.31,204.69,112Zm8,104a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,216Z"/>`
  ]
]);
t.styles = g`
    :host {
      display: contents;
    }
  `;
h([
  l({ type: String, reflect: !0 })
], t.prototype, "size", 2);
h([
  l({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
h([
  l({ type: String, reflect: !0 })
], t.prototype, "color", 2);
h([
  l({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = h([
  v("ph-arrow-fat-line-up")
], t);
export {
  t as PhArrowFatLineUp
};
