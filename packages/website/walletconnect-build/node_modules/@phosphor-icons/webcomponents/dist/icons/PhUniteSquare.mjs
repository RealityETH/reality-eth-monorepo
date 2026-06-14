import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as l } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as Z } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as V } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var v = Object.defineProperty, M = Object.getOwnPropertyDescriptor, s = (a, o, h, H) => {
  for (var e = H > 1 ? void 0 : H ? M(o, h) : o, p = a.length - 1, m; p >= 0; p--)
    (m = a[p]) && (e = (H ? m(o, h, e) : m(e)) || e);
  return H && e && v(o, h, e), e;
};
let t = class extends Z {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return l`<svg
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
    r`<path d="M216,92H164V40a4,4,0,0,0-4-4H40a4,4,0,0,0-4,4V160a4,4,0,0,0,4,4H92v52a4,4,0,0,0,4,4H216a4,4,0,0,0,4-4V96A4,4,0,0,0,216,92ZM153.66,212,44,102.34V49.66L206.34,212ZM49.66,44h52.68L212,153.66v52.68ZM212,142.34,169.66,100H212Zm-56-56L113.66,44H156ZM44,113.66,86.34,156H44Zm56,56L142.34,212H100Z"/>`
  ],
  [
    "light",
    r`<path d="M216,90H166V40a6,6,0,0,0-6-6H40a6,6,0,0,0-6,6V160a6,6,0,0,0,6,6H90v50a6,6,0,0,0,6,6H216a6,6,0,0,0,6-6V96A6,6,0,0,0,216,90ZM154.48,210,46,101.52v-47L201.52,210ZM54.48,46h47L210,154.48v47ZM210,137.52,174.48,102H210Zm-56-56L118.48,46H154Zm-108,37L81.52,154H46Zm56,56L137.52,210H102Z"/>`
  ],
  [
    "regular",
    r`<path d="M224,152V96a8,8,0,0,0-8-8H168V40a8,8,0,0,0-8-8H40a8,8,0,0,0-8,8v64h0v56a8,8,0,0,0,8,8H88v48a8,8,0,0,0,8,8H216a8,8,0,0,0,8-8V152Zm-68.69,56L48,100.69V59.31L196.69,208Zm-96-160h41.38L208,155.31v41.38ZM208,132.69,179.31,104H208Zm-56-56L123.31,48H152ZM48,123.31,76.69,152H48Zm56,56L132.69,208H104Z"/>`
  ],
  [
    "bold",
    r`<path d="M228,160V96a12,12,0,0,0-12-12H172V40a12,12,0,0,0-12-12H40A12,12,0,0,0,28,40V96h0v64a12,12,0,0,0,12,12H84v44a12,12,0,0,0,12,12H216a12,12,0,0,0,12-12V160Zm-63,44L52,91V69L187,204ZM69,52H91L204,165V187Zm135,79-23-23h23ZM148,75,125,52h23ZM52,125l23,23H52Zm56,56,23,23H108Z"/>`
  ],
  [
    "fill",
    r`<path d="M224,96V216a8,8,0,0,1-8,8H96a8,8,0,0,1-8-8V168H40a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8H160a8,8,0,0,1,8,8V88h48A8,8,0,0,1,224,96Z"/>`
  ],
  [
    "duotone",
    r`<path d="M216,96V216H96V160H40V40H160V96Z" opacity="0.2"/><path d="M216,88H168V40a8,8,0,0,0-8-8H40a8,8,0,0,0-8,8V160a8,8,0,0,0,8,8H88v48a8,8,0,0,0,8,8H216a8,8,0,0,0,8-8V96A8,8,0,0,0,216,88Zm-8,120H104V160a8,8,0,0,0-8-8H48V48H152V96a8,8,0,0,0,8,8h48Z"/>`
  ]
]);
t.styles = n`
    :host {
      display: contents;
    }
  `;
s([
  i({ type: String, reflect: !0 })
], t.prototype, "size", 2);
s([
  i({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
s([
  i({ type: String, reflect: !0 })
], t.prototype, "color", 2);
s([
  i({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = s([
  V("ph-unite-square")
], t);
export {
  t as PhUniteSquare
};
