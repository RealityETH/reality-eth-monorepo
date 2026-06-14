import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as H } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as n } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as V } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var c = Object.defineProperty, f = Object.getOwnPropertyDescriptor, s = (a, o, p, l) => {
  for (var r = l > 1 ? void 0 : l ? f(o, p) : o, h = a.length - 1, m; h >= 0; h--)
    (m = a[h]) && (r = (l ? m(o, p, r) : m(r)) || r);
  return l && r && c(o, p, r), r;
};
let t = class extends n {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return H`<svg
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
    e`<path d="M188,72V52H72.32l58.8,73.5a4,4,0,0,1,0,5L72.32,204H188V184a4,4,0,0,1,8,0v24a4,4,0,0,1-4,4H64a4,4,0,0,1-3.12-6.5l62-77.5-62-77.5A4,4,0,0,1,64,44H192a4,4,0,0,1,4,4V72a4,4,0,0,1-8,0Z"/>`
  ],
  [
    "light",
    e`<path d="M186,72V54H76.48l56.21,70.25a6,6,0,0,1,0,7.5L76.48,202H186V184a6,6,0,0,1,12,0v24a6,6,0,0,1-6,6H64a6,6,0,0,1-4.69-9.75l61-76.25-61-76.25A6,6,0,0,1,64,42H192a6,6,0,0,1,6,6V72a6,6,0,0,1-12,0Z"/>`
  ],
  [
    "regular",
    e`<path d="M184,72V56H80.65l53.6,67a8,8,0,0,1,0,10l-53.6,67H184V184a8,8,0,0,1,16,0v24a8,8,0,0,1-8,8H64a8,8,0,0,1-6.25-13l60-75-60-75A8,8,0,0,1,64,40H192a8,8,0,0,1,8,8V72a8,8,0,0,1-16,0Z"/>`
  ],
  [
    "bold",
    e`<path d="M180,72V60H89l48.4,60.5a12,12,0,0,1,0,15L89,196h91V184a12,12,0,0,1,24,0v24a12,12,0,0,1-12,12H64a12,12,0,0,1-9.37-19.5l58-72.5-58-72.5A12,12,0,0,1,64,36H192a12,12,0,0,1,12,12V72a12,12,0,0,1-24,0Z"/>`
  ],
  [
    "fill",
    e`<path d="M200,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V40A16,16,0,0,0,200,24ZM184,88a8,8,0,0,1-16,0V72H96l38.4,51.2a8,8,0,0,1,0,9.6L96,184h72V168a8,8,0,0,1,16,0v24a8,8,0,0,1-8,8H80a8,8,0,0,1-6.4-12.8L118,128,73.6,68.8A8,8,0,0,1,80,56h96a8,8,0,0,1,8,8Z"/>`
  ],
  [
    "duotone",
    e`<path d="M192,48V208H64l64-80L64,48Z" opacity="0.2"/><path d="M184,72V56H80.65l53.6,67a8,8,0,0,1,0,10l-53.6,67H184V184a8,8,0,0,1,16,0v24a8,8,0,0,1-8,8H64a8,8,0,0,1-6.25-13l60-75-60-75A8,8,0,0,1,64,40H192a8,8,0,0,1,8,8V72a8,8,0,0,1-16,0Z"/>`
  ]
]);
t.styles = V`
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
  g("ph-sigma")
], t);
export {
  t as PhSigma
};
