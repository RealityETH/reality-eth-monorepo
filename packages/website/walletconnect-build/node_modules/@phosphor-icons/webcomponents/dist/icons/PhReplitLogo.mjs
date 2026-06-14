import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as H } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as V } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as v } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var n = Object.defineProperty, g = Object.getOwnPropertyDescriptor, h = (r, o, i, s) => {
  for (var a = s > 1 ? void 0 : s ? g(o, i) : o, p = r.length - 1, l; p >= 0; p--)
    (l = r[p]) && (a = (s ? l(o, i, a) : l(a)) || a);
  return s && a && n(o, i, a), a;
};
let t = class extends m {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var r;
    return H`<svg
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
    e`<path d="M216,92H148V40a12,12,0,0,0-12-12H72A12,12,0,0,0,60,40V88a12,12,0,0,0,12,12h68v56H72a12,12,0,0,0-12,12v48a12,12,0,0,0,12,12h64a12,12,0,0,0,12-12V164h68a12,12,0,0,0,12-12V104A12,12,0,0,0,216,92ZM140,216a4,4,0,0,1-4,4H72a4,4,0,0,1-4-4V168a4,4,0,0,1,4-4h68Zm0-124H72a4,4,0,0,1-4-4V40a4,4,0,0,1,4-4h64a4,4,0,0,1,4,4Zm80,60a4,4,0,0,1-4,4H148V100h68a4,4,0,0,1,4,4Z"/>`
  ],
  [
    "light",
    e`<path d="M216,90H150V40a14,14,0,0,0-14-14H72A14,14,0,0,0,58,40V88a14,14,0,0,0,14,14h66v52H72a14,14,0,0,0-14,14v48a14,14,0,0,0,14,14h64a14,14,0,0,0,14-14V166h66a14,14,0,0,0,14-14V104A14,14,0,0,0,216,90ZM138,216a2,2,0,0,1-2,2H72a2,2,0,0,1-2-2V168a2,2,0,0,1,2-2h66Zm0-126H72a2,2,0,0,1-2-2V40a2,2,0,0,1,2-2h64a2,2,0,0,1,2,2Zm80,62a2,2,0,0,1-2,2H150V102h66a2,2,0,0,1,2,2Z"/>`
  ],
  [
    "regular",
    e`<path d="M216,88H152V40a16,16,0,0,0-16-16H72A16,16,0,0,0,56,40V88a16,16,0,0,0,16,16h64v48H72a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h64a16,16,0,0,0,16-16V168h64a16,16,0,0,0,16-16V104A16,16,0,0,0,216,88ZM136,216H72V168h64Zm0-176V88H72V40h64Zm80,112H152V104h64Z"/>`
  ],
  [
    "bold",
    e`<path d="M216,84H156V40a20,20,0,0,0-20-20H72A20,20,0,0,0,52,40V88a20,20,0,0,0,20,20h60v40H72a20,20,0,0,0-20,20v48a20,20,0,0,0,20,20h64a20,20,0,0,0,20-20V172h60a20,20,0,0,0,20-20V104A20,20,0,0,0,216,84ZM132,212H76V172h56Zm0-128H76V44h56Zm80,64H156V108h56Z"/>`
  ],
  [
    "fill",
    e`<path d="M72,160h72v56a16,16,0,0,1-16,16H72a16,16,0,0,1-16-16V176A16,16,0,0,1,72,160ZM128,24H72A16,16,0,0,0,56,40V80A16,16,0,0,0,72,96h72V40A16,16,0,0,0,128,24Zm88,72H144v64h72a16,16,0,0,0,16-16V112A16,16,0,0,0,216,96Z"/>`
  ],
  [
    "duotone",
    e`<path d="M72,160h72v56a8,8,0,0,1-8,8H72a8,8,0,0,1-8-8V168A8,8,0,0,1,72,160ZM216,96H144v64h72a8,8,0,0,0,8-8V104A8,8,0,0,0,216,96ZM136,32H72a8,8,0,0,0-8,8V88a8,8,0,0,0,8,8h72V40A8,8,0,0,0,136,32Z" opacity="0.2"/><path d="M216,88H152V40a16,16,0,0,0-16-16H72A16,16,0,0,0,56,40V88a16,16,0,0,0,16,16h64v48H72a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h64a16,16,0,0,0,16-16V168h64a16,16,0,0,0,16-16V104A16,16,0,0,0,216,88ZM136,216H72V168h64Zm0-176V88H72V40h64Zm80,112H152V104h64Z"/>`
  ]
]);
t.styles = v`
    :host {
      display: contents;
    }
  `;
h([
  V({ type: String, reflect: !0 })
], t.prototype, "size", 2);
h([
  V({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
h([
  V({ type: String, reflect: !0 })
], t.prototype, "color", 2);
h([
  V({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = h([
  Z("ph-replit-logo")
], t);
export {
  t as PhReplitLogo
};
