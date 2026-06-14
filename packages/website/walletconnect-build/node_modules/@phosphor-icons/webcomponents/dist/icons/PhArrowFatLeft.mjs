import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as V } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as f } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as h } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var v = Object.defineProperty, c = Object.getOwnPropertyDescriptor, o = (a, l, i, s) => {
  for (var r = s > 1 ? void 0 : s ? c(l, i) : l, p = a.length - 1, m; p >= 0; p--)
    (m = a[p]) && (r = (s ? m(l, i, r) : m(r)) || r);
  return s && r && v(l, i, r), r;
};
let t = class extends V {
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
    e`<path d="M208,76H124V32a4,4,0,0,0-6.83-2.83l-96,96a4,4,0,0,0,0,5.66l96,96A4,4,0,0,0,124,224V180h84a12,12,0,0,0,12-12V88A12,12,0,0,0,208,76Zm4,92a4,4,0,0,1-4,4H120a4,4,0,0,0-4,4v38.34L29.66,128,116,41.66V80a4,4,0,0,0,4,4h88a4,4,0,0,1,4,4Z"/>`
  ],
  [
    "light",
    e`<path d="M208,74H126V32a6,6,0,0,0-10.24-4.24l-96,96a6,6,0,0,0,0,8.48l96,96A6,6,0,0,0,126,224V182h82a14,14,0,0,0,14-14V88A14,14,0,0,0,208,74Zm2,94a2,2,0,0,1-2,2H120a6,6,0,0,0-6,6v33.51L32.49,128,114,46.49V80a6,6,0,0,0,6,6h88a2,2,0,0,1,2,2Z"/>`
  ],
  [
    "regular",
    e`<path d="M208,72H128V32a8,8,0,0,0-13.66-5.66l-96,96a8,8,0,0,0,0,11.32l96,96A8,8,0,0,0,128,224V184h80a16,16,0,0,0,16-16V88A16,16,0,0,0,208,72Zm0,96H120a8,8,0,0,0-8,8v28.69L35.31,128,112,51.31V80a8,8,0,0,0,8,8h88Z"/>`
  ],
  [
    "bold",
    e`<path d="M208,68H132V32a12,12,0,0,0-20.49-8.48l-96,96a12,12,0,0,0,0,17l96,96A12,12,0,0,0,132,224V188h76a20,20,0,0,0,20-20V88A20,20,0,0,0,208,68Zm-4,96H120a12,12,0,0,0-12,12v19L41,128l67-67V80a12,12,0,0,0,12,12h84Z"/>`
  ],
  [
    "fill",
    e`<path d="M224,88v80a16,16,0,0,1-16,16H128v40a8,8,0,0,1-13.66,5.66l-96-96a8,8,0,0,1,0-11.32l96-96A8,8,0,0,1,128,32V72h80A16,16,0,0,1,224,88Z"/>`
  ],
  [
    "duotone",
    e`<path d="M216,88v80a8,8,0,0,1-8,8H120v48L24,128l96-96V80h88A8,8,0,0,1,216,88Z" opacity="0.2"/><path d="M208,72H128V32a8,8,0,0,0-13.66-5.66l-96,96a8,8,0,0,0,0,11.32l96,96A8,8,0,0,0,128,224V184h80a16,16,0,0,0,16-16V88A16,16,0,0,0,208,72Zm0,96H120a8,8,0,0,0-8,8v28.69L35.31,128,112,51.31V80a8,8,0,0,0,8,8h88Z"/>`
  ]
]);
t.styles = g`
    :host {
      display: contents;
    }
  `;
o([
  h({ type: String, reflect: !0 })
], t.prototype, "size", 2);
o([
  h({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
o([
  h({ type: String, reflect: !0 })
], t.prototype, "color", 2);
o([
  h({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = o([
  f("ph-arrow-fat-left")
], t);
export {
  t as PhArrowFatLeft
};
