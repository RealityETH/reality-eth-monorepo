import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as h } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as A } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as l } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as H } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as V } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var n = Object.defineProperty, g = Object.getOwnPropertyDescriptor, o = (r, s, i, m) => {
  for (var a = m > 1 ? void 0 : m ? g(s, i) : s, p = r.length - 1, Z; p >= 0; p--)
    (Z = r[p]) && (a = (m ? Z(s, i, a) : Z(a)) || a);
  return m && a && n(s, i, a), a;
};
let t = class extends A {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var r;
    return h`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((r = this.weight) != null ? r : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    e`<path d="M208,36H48A12,12,0,0,0,36,48V208a12,12,0,0,0,12,12H208a12,12,0,0,0,12-12V48A12,12,0,0,0,208,36Zm4,172a4,4,0,0,1-4,4H48a4,4,0,0,1-4-4V48a4,4,0,0,1,4-4H208a4,4,0,0,1,4,4ZM76,76a8,8,0,1,1,8,8A8,8,0,0,1,76,76Zm44,0a8,8,0,1,1,8,8A8,8,0,0,1,120,76Zm44,0a8,8,0,1,1,8,8A8,8,0,0,1,164,76Zm20,32H72a4,4,0,0,0-4,4v72a4,4,0,0,0,4,4H184a4,4,0,0,0,4-4V112A4,4,0,0,0,184,108Zm-4,72H76V116H180Z"/>`
  ],
  [
    "light",
    e`<path d="M208,34H48A14,14,0,0,0,34,48V208a14,14,0,0,0,14,14H208a14,14,0,0,0,14-14V48A14,14,0,0,0,208,34Zm2,174a2,2,0,0,1-2,2H48a2,2,0,0,1-2-2V48a2,2,0,0,1,2-2H208a2,2,0,0,1,2,2ZM74,76A10,10,0,1,1,84,86,10,10,0,0,1,74,76Zm44,0a10,10,0,1,1,10,10A10,10,0,0,1,118,76Zm44,0a10,10,0,1,1,10,10A10,10,0,0,1,162,76Zm22,30H72a6,6,0,0,0-6,6v72a6,6,0,0,0,6,6H184a6,6,0,0,0,6-6V112A6,6,0,0,0,184,106Zm-6,72H78V118H178Z"/>`
  ],
  [
    "regular",
    e`<path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208ZM72,76A12,12,0,1,1,84,88,12,12,0,0,1,72,76Zm44,0a12,12,0,1,1,12,12A12,12,0,0,1,116,76Zm44,0a12,12,0,1,1,12,12A12,12,0,0,1,160,76Zm24,28H72a8,8,0,0,0-8,8v72a8,8,0,0,0,8,8H184a8,8,0,0,0,8-8V112A8,8,0,0,0,184,104Zm-8,72H80V120h96Z"/>`
  ],
  [
    "bold",
    e`<path d="M208,28H48A20,20,0,0,0,28,48V208a20,20,0,0,0,20,20H208a20,20,0,0,0,20-20V48A20,20,0,0,0,208,28Zm-4,176H52V52H204ZM68,80A16,16,0,1,1,84,96,16,16,0,0,1,68,80Zm44,0a16,16,0,1,1,16,16A16,16,0,0,1,112,80Zm44,0a16,16,0,1,1,16,16A16,16,0,0,1,156,80ZM76,192H180a12,12,0,0,0,12-12V120a12,12,0,0,0-12-12H76a12,12,0,0,0-12,12v60A12,12,0,0,0,76,192Zm12-60h80v36H88Z"/>`
  ],
  [
    "fill",
    e`<path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM172,56a12,12,0,1,1-12,12A12,12,0,0,1,172,56Zm-44,0a12,12,0,1,1-12,12A12,12,0,0,1,128,56ZM84,56A12,12,0,1,1,72,68,12,12,0,0,1,84,56ZM192,192H64V104H192Z"/>`
  ],
  [
    "duotone",
    e`<path d="M184,112v72H72V112Z" opacity="0.2"/><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208ZM72,76A12,12,0,1,1,84,88,12,12,0,0,1,72,76Zm44,0a12,12,0,1,1,12,12A12,12,0,0,1,116,76Zm44,0a12,12,0,1,1,12,12A12,12,0,0,1,160,76Zm24,28H72a8,8,0,0,0-8,8v72a8,8,0,0,0,8,8H184a8,8,0,0,0,8-8V112A8,8,0,0,0,184,104Zm-8,72H80V120h96Z"/>`
  ]
]);
t.styles = V`
    :host {
      display: contents;
    }
  `;
o([
  H({ type: String, reflect: !0 })
], t.prototype, "size", 2);
o([
  H({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
o([
  H({ type: String, reflect: !0 })
], t.prototype, "color", 2);
o([
  H({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = o([
  l("ph-oven")
], t);
export {
  t as PhOven
};
