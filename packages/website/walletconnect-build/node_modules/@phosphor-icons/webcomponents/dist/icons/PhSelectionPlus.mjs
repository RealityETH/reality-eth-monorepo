import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as p } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as v } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as m } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as s } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as l } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var M = Object.defineProperty, A = Object.getOwnPropertyDescriptor, h = (r, H, o, V) => {
  for (var t = V > 1 ? void 0 : V ? A(H, o) : H, Z = r.length - 1, i; Z >= 0; Z--)
    (i = r[Z]) && (t = (V ? i(H, o, t) : i(t)) || t);
  return V && t && M(H, o, t), t;
};
let a = class extends v {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var r;
    return p`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${a.weightsMap.get((r = this.weight) != null ? r : "regular")}
    </svg>`;
  }
};
a.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    e`<path d="M148,40a4,4,0,0,1-4,4H112a4,4,0,0,1,0-8h32A4,4,0,0,1,148,40Zm-4,172H112a4,4,0,0,0,0,8h32a4,4,0,0,0,0-8ZM212,48V72a4,4,0,0,0,8,0V48a12,12,0,0,0-12-12H184a4,4,0,0,0,0,8h24A4,4,0,0,1,212,48Zm4,60a4,4,0,0,0-4,4v32a4,4,0,0,0,8,0V112A4,4,0,0,0,216,108ZM40,148a4,4,0,0,0,4-4V112a4,4,0,0,0-8,0v32A4,4,0,0,0,40,148Zm32,64H48a4,4,0,0,1-4-4V184a4,4,0,0,0-8,0v24a12,12,0,0,0,12,12H72a4,4,0,0,0,0-8ZM72,36H48A12,12,0,0,0,36,48V72a4,4,0,0,0,8,0V48a4,4,0,0,1,4-4H72a4,4,0,0,0,0-8ZM240,212H220V192a4,4,0,0,0-8,0v20H192a4,4,0,0,0,0,8h20v20a4,4,0,0,0,8,0V220h20a4,4,0,0,0,0-8Z"/>`
  ],
  [
    "light",
    e`<path d="M150,40a6,6,0,0,1-6,6H112a6,6,0,0,1,0-12h32A6,6,0,0,1,150,40Zm-6,170H112a6,6,0,0,0,0,12h32a6,6,0,0,0,0-12ZM210,48V72a6,6,0,0,0,12,0V48a14,14,0,0,0-14-14H184a6,6,0,0,0,0,12h24A2,2,0,0,1,210,48Zm6,58a6,6,0,0,0-6,6v32a6,6,0,0,0,12,0V112A6,6,0,0,0,216,106ZM40,150a6,6,0,0,0,6-6V112a6,6,0,0,0-12,0v32A6,6,0,0,0,40,150Zm32,60H48a2,2,0,0,1-2-2V184a6,6,0,0,0-12,0v24a14,14,0,0,0,14,14H72a6,6,0,0,0,0-12ZM72,34H48A14,14,0,0,0,34,48V72a6,6,0,0,0,12,0V48a2,2,0,0,1,2-2H72a6,6,0,0,0,0-12ZM240,210H222V192a6,6,0,0,0-12,0v18H192a6,6,0,0,0,0,12h18v18a6,6,0,0,0,12,0V222h18a6,6,0,0,0,0-12Z"/>`
  ],
  [
    "regular",
    e`<path d="M152,40a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h32A8,8,0,0,1,152,40Zm-8,168H112a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16ZM208,48V72a8,8,0,0,0,16,0V48a16,16,0,0,0-16-16H184a8,8,0,0,0,0,16Zm8,56a8,8,0,0,0-8,8v32a8,8,0,0,0,16,0V112A8,8,0,0,0,216,104ZM40,152a8,8,0,0,0,8-8V112a8,8,0,0,0-16,0v32A8,8,0,0,0,40,152Zm32,56H48V184a8,8,0,0,0-16,0v24a16,16,0,0,0,16,16H72a8,8,0,0,0,0-16ZM72,32H48A16,16,0,0,0,32,48V72a8,8,0,0,0,16,0V48H72a8,8,0,0,0,0-16ZM240,208H224V192a8,8,0,0,0-16,0v16H192a8,8,0,0,0,0,16h16v16a8,8,0,0,0,16,0V224h16a8,8,0,0,0,0-16Z"/>`
  ],
  [
    "bold",
    e`<path d="M156,40a12,12,0,0,1-12,12H112a12,12,0,0,1,0-24h32A12,12,0,0,1,156,40ZM144,204H112a12,12,0,0,0,0,24h32a12,12,0,0,0,0-24ZM204,52V72a12,12,0,0,0,24,0V48a20,20,0,0,0-20-20H184a12,12,0,0,0,0,24Zm12,48a12,12,0,0,0-12,12v32a12,12,0,0,0,24,0V112A12,12,0,0,0,216,100ZM40,156a12,12,0,0,0,12-12V112a12,12,0,0,0-24,0v32A12,12,0,0,0,40,156Zm32,48H52V184a12,12,0,0,0-24,0v24a20,20,0,0,0,20,20H72a12,12,0,0,0,0-24ZM72,28H48A20,20,0,0,0,28,48V72a12,12,0,0,0,24,0V52H72a12,12,0,0,0,0-24ZM240,204H228V192a12,12,0,0,0-24,0v12H192a12,12,0,0,0,0,24h12v12a12,12,0,0,0,24,0V228h12a12,12,0,0,0,0-24Z"/>`
  ],
  [
    "fill",
    e`<path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM56,72A16,16,0,0,1,72,56H96a8,8,0,0,1,0,16H72V96a8,8,0,0,1-16,0Zm56,112H72a16,16,0,0,1-16-16V136a8,8,0,0,1,16,0v32h40a8,8,0,0,1,0,16ZM128,64a8,8,0,0,1,8-8h32a16,16,0,0,1,16,16v40a8,8,0,0,1-16,0V72H136A8,8,0,0,1,128,64Zm72,120H184v16a8,8,0,0,1-16,0V184H152a8,8,0,0,1,0-16h16V152a8,8,0,0,1,16,0v16h16a8,8,0,0,1,0,16Z"/>`
  ],
  [
    "duotone",
    e`<path d="M216,40V216H40V40Z" opacity="0.2"/><path d="M152,40a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h32A8,8,0,0,1,152,40Zm-8,168H112a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16ZM208,48V72a8,8,0,0,0,16,0V48a16,16,0,0,0-16-16H184a8,8,0,0,0,0,16Zm8,56a8,8,0,0,0-8,8v32a8,8,0,0,0,16,0V112A8,8,0,0,0,216,104ZM40,152a8,8,0,0,0,8-8V112a8,8,0,0,0-16,0v32A8,8,0,0,0,40,152Zm32,56H48V184a8,8,0,0,0-16,0v24a16,16,0,0,0,16,16H72a8,8,0,0,0,0-16ZM72,32H48A16,16,0,0,0,32,48V72a8,8,0,0,0,16,0V48H72a8,8,0,0,0,0-16ZM240,208H224V192a8,8,0,0,0-16,0v16H192a8,8,0,0,0,0,16h16v16a8,8,0,0,0,16,0V224h16a8,8,0,0,0,0-16Z"/>`
  ]
]);
a.styles = l`
    :host {
      display: contents;
    }
  `;
h([
  s({ type: String, reflect: !0 })
], a.prototype, "size", 2);
h([
  s({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
h([
  s({ type: String, reflect: !0 })
], a.prototype, "color", 2);
h([
  s({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = h([
  m("ph-selection-plus")
], a);
export {
  a as PhSelectionPlus
};
