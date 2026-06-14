import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as A } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as H } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var Z = Object.defineProperty, c = Object.getOwnPropertyDescriptor, o = (a, s, l, i) => {
  for (var r = i > 1 ? void 0 : i ? c(s, l) : s, m = a.length - 1, h; m >= 0; m--)
    (h = a[m]) && (r = (i ? h(s, l, r) : h(r)) || r);
  return i && r && Z(s, l, r), r;
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
    e`<path d="M84,224a12,12,0,1,1-12-12A12,12,0,0,1,84,224Zm132-12a12,12,0,1,0,12,12A12,12,0,0,0,216,212Zm24-32H52V75.31a12,12,0,0,0-3.51-8.48L26.83,45.17a4,4,0,0,0-5.66,5.66L42.83,72.48A4,4,0,0,1,44,75.31V180H32a4,4,0,0,0,0,8H240a4,4,0,0,0,0-8Z"/>`
  ],
  [
    "light",
    e`<path d="M86,224a14,14,0,1,1-14-14A14,14,0,0,1,86,224Zm130-14a14,14,0,1,0,14,14A14,14,0,0,0,216,210Zm24-32H54V75.31a13.94,13.94,0,0,0-4.1-9.9L28.24,43.76a6,6,0,1,0-8.48,8.48L41.41,73.9A2,2,0,0,1,42,75.31V178H32a6,6,0,0,0,0,12H240a6,6,0,0,0,0-12Z"/>`
  ],
  [
    "regular",
    e`<path d="M88,224a16,16,0,1,1-16-16A16,16,0,0,1,88,224Zm128-16a16,16,0,1,0,16,16A16,16,0,0,0,216,208Zm24-32H56V75.31A15.86,15.86,0,0,0,51.31,64L29.66,42.34A8,8,0,0,0,18.34,53.66L40,75.31V176H32a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16Z"/>`
  ],
  [
    "bold",
    e`<path d="M92,224a20,20,0,1,1-20-20A20,20,0,0,1,92,224Zm124-20a20,20,0,1,0,20,20A20,20,0,0,0,216,204Zm24-36H60V75.31a19.86,19.86,0,0,0-5.86-14.14L32.49,39.51a12,12,0,0,0-17,17L36,77v91H32a12,12,0,0,0,0,24H240a12,12,0,0,0,0-24Z"/>`
  ],
  [
    "fill",
    e`<path d="M88,224a16,16,0,1,1-16-16A16,16,0,0,1,88,224Zm128-16a16,16,0,1,0,16,16A16,16,0,0,0,216,208Zm24-32H56V75.31A15.86,15.86,0,0,0,51.31,64L29.66,42.34A8,8,0,0,0,18.34,53.66L40,75.31V176H32a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM88,160H216a16,16,0,0,0,16-16V80a16,16,0,0,0-16-16H88A16,16,0,0,0,72,80v64A16,16,0,0,0,88,160Z"/>`
  ],
  [
    "duotone",
    e`<path d="M240,88v96H48V72H224A16,16,0,0,1,240,88Z" opacity="0.2"/><path d="M88,224a16,16,0,1,1-16-16A16,16,0,0,1,88,224Zm128-16a16,16,0,1,0,16,16A16,16,0,0,0,216,208Zm24-32H56V75.31A15.86,15.86,0,0,0,51.31,64L29.66,42.34A8,8,0,0,0,18.34,53.66L40,75.31V176H32a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16Z"/>`
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
  H("ph-trolley")
], t);
export {
  t as PhTrolley
};
