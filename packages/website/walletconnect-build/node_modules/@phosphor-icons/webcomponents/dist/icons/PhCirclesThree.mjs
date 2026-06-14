import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as l } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as h } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var g = Object.defineProperty, f = Object.getOwnPropertyDescriptor, s = (a, o, p, m) => {
  for (var e = m > 1 ? void 0 : m ? f(o, p) : o, A = a.length - 1, Z; A >= 0; A--)
    (Z = a[A]) && (e = (m ? Z(o, p, e) : Z(e)) || e);
  return m && e && g(o, p, e), e;
};
let t = class extends h {
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
    r`<path d="M168,76a40,40,0,1,0-40,40A40,40,0,0,0,168,76Zm-40,32a32,32,0,1,1,32-32A32,32,0,0,1,128,108Zm60,24a40,40,0,1,0,40,40A40,40,0,0,0,188,132Zm0,72a32,32,0,1,1,32-32A32,32,0,0,1,188,204ZM68,132a40,40,0,1,0,40,40A40,40,0,0,0,68,132Zm0,72a32,32,0,1,1,32-32A32,32,0,0,1,68,204Z"/>`
  ],
  [
    "light",
    r`<path d="M170,76a42,42,0,1,0-42,42A42,42,0,0,0,170,76Zm-42,30a30,30,0,1,1,30-30A30,30,0,0,1,128,106Zm60,24a42,42,0,1,0,42,42A42,42,0,0,0,188,130Zm0,72a30,30,0,1,1,30-30A30,30,0,0,1,188,202ZM68,130a42,42,0,1,0,42,42A42,42,0,0,0,68,130Zm0,72a30,30,0,1,1,30-30A30,30,0,0,1,68,202Z"/>`
  ],
  [
    "regular",
    r`<path d="M172,76a44,44,0,1,0-44,44A44.05,44.05,0,0,0,172,76Zm-44,28a28,28,0,1,1,28-28A28,28,0,0,1,128,104Zm60,24a44,44,0,1,0,44,44A44.05,44.05,0,0,0,188,128Zm0,72a28,28,0,1,1,28-28A28,28,0,0,1,188,200ZM68,128a44,44,0,1,0,44,44A44.05,44.05,0,0,0,68,128Zm0,72a28,28,0,1,1,28-28A28,28,0,0,1,68,200Z"/>`
  ],
  [
    "bold",
    r`<path d="M176,76a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,76Zm-48,24a24,24,0,1,1,24-24A24,24,0,0,1,128,100Zm60,24a48,48,0,1,0,48,48A48.05,48.05,0,0,0,188,124Zm0,72a24,24,0,1,1,24-24A24,24,0,0,1,188,196ZM68,124a48,48,0,1,0,48,48A48.05,48.05,0,0,0,68,124Zm0,72a24,24,0,1,1,24-24A24,24,0,0,1,68,196Z"/>`
  ],
  [
    "fill",
    r`<path d="M128,120a44,44,0,1,1,44-44A44.05,44.05,0,0,1,128,120Zm60,8a44,44,0,1,0,44,44A44.05,44.05,0,0,0,188,128ZM68,128a44,44,0,1,0,44,44A44.05,44.05,0,0,0,68,128Z"/>`
  ],
  [
    "duotone",
    r`<path d="M128,112a36,36,0,1,1,36-36A36,36,0,0,1,128,112Zm60,24a36,36,0,1,0,36,36A36,36,0,0,0,188,136ZM68,136a36,36,0,1,0,36,36A36,36,0,0,0,68,136Z" opacity="0.2"/><path d="M172,76a44,44,0,1,0-44,44A44.05,44.05,0,0,0,172,76Zm-44,28a28,28,0,1,1,28-28A28,28,0,0,1,128,104Zm60,24a44,44,0,1,0,44,44A44.05,44.05,0,0,0,188,128Zm0,72a28,28,0,1,1,28-28A28,28,0,0,1,188,200ZM68,128a44,44,0,1,0,44,44A44.05,44.05,0,0,0,68,128Zm0,72a28,28,0,1,1,28-28A28,28,0,0,1,68,200Z"/>`
  ]
]);
t.styles = c`
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
  n("ph-circles-three")
], t);
export {
  t as PhCirclesThree
};
