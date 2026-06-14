import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as f } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as H } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var V = Object.defineProperty, g = Object.getOwnPropertyDescriptor, s = (r, o, p, l) => {
  for (var a = l > 1 ? void 0 : l ? g(o, p) : o, h = r.length - 1, m; h >= 0; h--)
    (m = r[h]) && (a = (l ? m(o, p, a) : m(a)) || a);
  return l && a && V(o, p, a), a;
};
let t = class extends f {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var r;
    return n`<svg
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
    e`<path d="M220,48V208a12,12,0,0,1-12,12H136a4,4,0,0,1,0-8h72a4,4,0,0,0,4-4V48a4,4,0,0,0-4-4H48a4,4,0,0,0-4,4v96a4,4,0,0,1-8,0V48A12,12,0,0,1,48,36H208A12,12,0,0,1,220,48ZM117.17,157.17,64,210.34,42.83,189.17a4,4,0,0,0-5.66,5.66l24,24a4,4,0,0,0,5.66,0l56-56a4,4,0,0,0-5.66-5.66Z"/>`
  ],
  [
    "light",
    e`<path d="M222,48V208a14,14,0,0,1-14,14H136a6,6,0,0,1,0-12h72a2,2,0,0,0,2-2V48a2,2,0,0,0-2-2H48a2,2,0,0,0-2,2v96a6,6,0,0,1-12,0V48A14,14,0,0,1,48,34H208A14,14,0,0,1,222,48ZM115.76,155.76,64,207.51,44.24,187.76a6,6,0,0,0-8.48,8.48l24,24a6,6,0,0,0,8.48,0l56-56a6,6,0,0,0-8.48-8.48Z"/>`
  ],
  [
    "regular",
    e`<path d="M224,48V208a16,16,0,0,1-16,16H136a8,8,0,0,1,0-16h72V48H48v96a8,8,0,0,1-16,0V48A16,16,0,0,1,48,32H208A16,16,0,0,1,224,48ZM125.66,154.34a8,8,0,0,0-11.32,0L64,204.69,45.66,186.34a8,8,0,0,0-11.32,11.32l24,24a8,8,0,0,0,11.32,0l56-56A8,8,0,0,0,125.66,154.34Z"/>`
  ],
  [
    "bold",
    e`<path d="M228,48V208a20,20,0,0,1-20,20H140a12,12,0,0,1,0-24h64V52H52v88a12,12,0,0,1-24,0V48A20,20,0,0,1,48,28H208A20,20,0,0,1,228,48ZM128.49,151.51a12,12,0,0,0-17,0L64,199,48.49,183.51a12,12,0,1,0-17,17l24,24a12,12,0,0,0,17,0l56-56A12,12,0,0,0,128.49,151.51Z"/>`
  ],
  [
    "fill",
    e`<path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM80,200a8,8,0,0,1-5.66-2.34l-16-16a8,8,0,0,1,11.32-11.32L80,180.69l34.34-34.35a8,8,0,0,1,11.32,11.32l-40,40A8,8,0,0,1,80,200Zm120-8a8,8,0,0,1-8,8H136a8,8,0,0,1,0-16h48V72H72v64a8,8,0,0,1-16,0V64a8,8,0,0,1,8-8H192a8,8,0,0,1,8,8Z"/>`
  ],
  [
    "duotone",
    e`<path d="M216,48V208a8,8,0,0,1-8,8H64L40,192V48a8,8,0,0,1,8-8H208A8,8,0,0,1,216,48Z" opacity="0.2"/><path d="M224,48V208a16,16,0,0,1-16,16H136a8,8,0,0,1,0-16h72V48H48v96a8,8,0,0,1-16,0V48A16,16,0,0,1,48,32H208A16,16,0,0,1,224,48ZM125.66,154.34a8,8,0,0,0-11.32,0L64,204.69,45.66,186.34a8,8,0,0,0-11.32,11.32l24,24a8,8,0,0,0,11.32,0l56-56A8,8,0,0,0,125.66,154.34Z"/>`
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
  H("ph-check-square-offset")
], t);
export {
  t as PhCheckSquareOffset
};
