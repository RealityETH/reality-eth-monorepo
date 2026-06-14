import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as a, html as v } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as H } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var f = Object.defineProperty, c = Object.getOwnPropertyDescriptor, o = (e, s, h, l) => {
  for (var r = l > 1 ? void 0 : l ? c(s, h) : s, i = e.length - 1, n; i >= 0; i--)
    (n = e[i]) && (r = (l ? n(s, h, r) : n(r)) || r);
  return l && r && f(s, h, r), r;
};
let t = class extends m {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return v`<svg
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
    a`<path d="M226.83,117.17l-96-96a4,4,0,0,0-5.66,0l-96,96A4,4,0,0,0,32,124H76v84a12,12,0,0,0,12,12h80a12,12,0,0,0,12-12V124h44a4,4,0,0,0,2.83-6.83ZM176,116a4,4,0,0,0-4,4v88a4,4,0,0,1-4,4H88a4,4,0,0,1-4-4V120a4,4,0,0,0-4-4H41.66L128,29.66,214.34,116Z"/>`
  ],
  [
    "light",
    a`<path d="M228.24,115.76l-96-96a6,6,0,0,0-8.48,0l-96,96A6,6,0,0,0,32,126H74v82a14,14,0,0,0,14,14h80a14,14,0,0,0,14-14V126h42a6,6,0,0,0,4.24-10.24ZM176,114a6,6,0,0,0-6,6v88a2,2,0,0,1-2,2H88a2,2,0,0,1-2-2V120a6,6,0,0,0-6-6H46.49L128,32.49,209.51,114Z"/>`
  ],
  [
    "regular",
    a`<path d="M229.66,114.34l-96-96a8,8,0,0,0-11.32,0l-96,96A8,8,0,0,0,32,128H72v80a16,16,0,0,0,16,16h80a16,16,0,0,0,16-16V128h40a8,8,0,0,0,5.66-13.66ZM176,112a8,8,0,0,0-8,8v88H88V120a8,8,0,0,0-8-8H51.31L128,35.31,204.69,112Z"/>`
  ],
  [
    "bold",
    a`<path d="M232.48,111.51l-96-96a12,12,0,0,0-17,0l-96,96A12,12,0,0,0,32,132H68v76a20,20,0,0,0,20,20h80a20,20,0,0,0,20-20V132h36a12,12,0,0,0,8.48-20.49ZM176,108a12,12,0,0,0-12,12v84H92V120a12,12,0,0,0-12-12H61l67-67,67,67Z"/>`
  ],
  [
    "fill",
    a`<path d="M231.39,123.06A8,8,0,0,1,224,128H184v80a16,16,0,0,1-16,16H88a16,16,0,0,1-16-16V128H32a8,8,0,0,1-5.66-13.66l96-96a8,8,0,0,1,11.32,0l96,96A8,8,0,0,1,231.39,123.06Z"/>`
  ],
  [
    "duotone",
    a`<path d="M224,120H176v88a8,8,0,0,1-8,8H88a8,8,0,0,1-8-8V120H32l96-96Z" opacity="0.2"/><path d="M229.66,114.34l-96-96a8,8,0,0,0-11.32,0l-96,96A8,8,0,0,0,32,128H72v80a16,16,0,0,0,16,16h80a16,16,0,0,0,16-16V128h40a8,8,0,0,0,5.66-13.66ZM176,112a8,8,0,0,0-8,8v88H88V120a8,8,0,0,0-8-8H51.31L128,35.31,204.69,112Z"/>`
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
  H("ph-arrow-fat-up")
], t);
export {
  t as PhArrowFatUp
};
