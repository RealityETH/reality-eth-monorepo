import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as p } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as l } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as m } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as H } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as M } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var v = Object.defineProperty, n = Object.getOwnPropertyDescriptor, o = (h, s, Z, V) => {
  for (var r = V > 1 ? void 0 : V ? n(s, Z) : s, a = h.length - 1, i; a >= 0; a--)
    (i = h[a]) && (r = (V ? i(s, Z, r) : i(r)) || r);
  return V && r && v(s, Z, r), r;
};
let t = class extends l {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var h;
    return p`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((h = this.weight) != null ? h : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    e`<path d="M208,36H48A12,12,0,0,0,36,48V208a12,12,0,0,0,12,12H208a12,12,0,0,0,12-12V48A12,12,0,0,0,208,36Zm-14.34,88L132,62.34V44h18.34L212,105.66V124ZM132,73.66,182.34,124H132ZM212,48V94.34L161.66,44H208A4,4,0,0,1,212,48ZM48,44h76v80H44V48A4,4,0,0,1,48,44Zm57.66,168L44,150.34V132H62.34L124,193.66V212ZM124,182.34,73.66,132H124ZM44,208V161.66L94.34,212H48A4,4,0,0,1,44,208Zm164,4H132V132h80v76A4,4,0,0,1,208,212Z"/>`
  ],
  [
    "light",
    e`<path d="M208,34H48A14,14,0,0,0,34,48V208a14,14,0,0,0,14,14H208a14,14,0,0,0,14-14V48A14,14,0,0,0,208,34Zm-13.52,88L134,61.52V46h15.52L210,106.48V122ZM134,78.48,177.52,122H134ZM210,48V89.52L166.48,46H208A2,2,0,0,1,210,48ZM48,46h74v76H46V48A2,2,0,0,1,48,46Zm58.48,164L46,149.52V134H61.52L122,194.48V210ZM122,177.52,78.48,134H122ZM46,208V166.48L89.52,210H48A2,2,0,0,1,46,208Zm162,2H134V192h0V134h76v74A2,2,0,0,1,208,210Z"/>`
  ],
  [
    "regular",
    e`<path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm-12.69,88L136,60.69V48h12.69L208,107.32V120ZM136,83.31,172.69,120H136Zm72,1.38L171.31,48H208ZM120,48v72H48V48ZM107.31,208,48,148.69V136H60.69L120,195.31V208ZM120,172.69,83.31,136H120Zm-72-1.38L84.69,208H48ZM208,208H136V136h72v72Z"/>`
  ],
  [
    "bold",
    e`<path d="M228,48a20,20,0,0,0-20-20H48A20,20,0,0,0,28,48V208a20,20,0,0,0,20,20H208a20,20,0,0,0,20-20Zm-35,68L140,63V52h11l53,53v11ZM140,97l19,19H140ZM204,71,185,52h19ZM116,52V68h0v48H52V52ZM105,204,52,151V140H63l53,53v11Zm11-45L97,140h19ZM52,185l19,19H52Zm88,19V188h0V140h64v64Z"/>`
  ],
  [
    "fill",
    e`<path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H128V128H48V48h80v80h80v80Z"/>`
  ],
  [
    "duotone",
    e`<path d="M40,128h88v88H48a8,8,0,0,1-8-8ZM208,40H128v88h88V48A8,8,0,0,0,208,40Z" opacity="0.2"/><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,88H136V48h72ZM120,48v72H48V48ZM48,136h72v72H48Zm160,72H136V136h72v72Z"/>`
  ]
]);
t.styles = M`
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
  m("ph-checkerboard")
], t);
export {
  t as PhCheckerboard
};
