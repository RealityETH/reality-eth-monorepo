import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as H } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as V } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as m } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var g = Object.defineProperty, c = Object.getOwnPropertyDescriptor, s = (a, o, l, p) => {
  for (var r = p > 1 ? void 0 : p ? c(o, l) : o, h = a.length - 1, A; h >= 0; h--)
    (A = a[h]) && (r = (p ? A(o, l, r) : A(r)) || r);
  return p && r && g(o, l, r), r;
};
let t = class extends V {
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
    e`<path d="M240,124H211.9A84.11,84.11,0,0,0,132,44.1V16a4,4,0,0,0-8,0V44.1A84.11,84.11,0,0,0,44.1,124H16a4,4,0,0,0,0,8H44.1A84.11,84.11,0,0,0,124,211.9V240a4,4,0,0,0,8,0V211.9A84.11,84.11,0,0,0,211.9,132H240a4,4,0,0,0,0-8ZM128,204a76,76,0,1,1,76-76A76.08,76.08,0,0,1,128,204Z"/>`
  ],
  [
    "light",
    e`<path d="M240,122H213.77A86.12,86.12,0,0,0,134,42.23V16a6,6,0,0,0-12,0V42.23A86.12,86.12,0,0,0,42.23,122H16a6,6,0,0,0,0,12H42.23A86.12,86.12,0,0,0,122,213.77V240a6,6,0,0,0,12,0V213.77A86.12,86.12,0,0,0,213.77,134H240a6,6,0,0,0,0-12ZM128,202a74,74,0,1,1,74-74A74.09,74.09,0,0,1,128,202Z"/>`
  ],
  [
    "regular",
    e`<path d="M240,120H215.63A88.13,88.13,0,0,0,136,40.37V16a8,8,0,0,0-16,0V40.37A88.13,88.13,0,0,0,40.37,120H16a8,8,0,0,0,0,16H40.37A88.13,88.13,0,0,0,120,215.63V240a8,8,0,0,0,16,0V215.63A88.13,88.13,0,0,0,215.63,136H240a8,8,0,0,0,0-16ZM128,200a72,72,0,1,1,72-72A72.08,72.08,0,0,1,128,200Z"/>`
  ],
  [
    "bold",
    e`<path d="M240,116H219.22A92.21,92.21,0,0,0,140,36.78V16a12,12,0,0,0-24,0V36.78A92.21,92.21,0,0,0,36.78,116H16a12,12,0,0,0,0,24H36.78A92.21,92.21,0,0,0,116,219.22V240a12,12,0,0,0,24,0V219.22A92.21,92.21,0,0,0,219.22,140H240a12,12,0,0,0,0-24ZM128,196a68,68,0,1,1,68-68A68.07,68.07,0,0,1,128,196Z"/>`
  ],
  [
    "fill",
    e`<path d="M248,128a8,8,0,0,1-8,8H215.63A88.13,88.13,0,0,1,136,215.63V240a8,8,0,0,1-16,0V215.63A88.13,88.13,0,0,1,40.37,136H16a8,8,0,0,1,0-16H40.37A88.13,88.13,0,0,1,120,40.37V16a8,8,0,0,1,16,0V40.37A88.13,88.13,0,0,1,215.63,120H240A8,8,0,0,1,248,128Z"/>`
  ],
  [
    "duotone",
    e`<path d="M208,128a80,80,0,1,1-80-80A80,80,0,0,1,208,128Z" opacity="0.2"/><path d="M240,120H215.63A88.13,88.13,0,0,0,136,40.37V16a8,8,0,0,0-16,0V40.37A88.13,88.13,0,0,0,40.37,120H16a8,8,0,0,0,0,16H40.37A88.13,88.13,0,0,0,120,215.63V240a8,8,0,0,0,16,0V215.63A88.13,88.13,0,0,0,215.63,136H240a8,8,0,0,0,0-16ZM128,200a72,72,0,1,1,72-72A72.08,72.08,0,0,1,128,200Z"/>`
  ]
]);
t.styles = m`
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
  n("ph-gps")
], t);
export {
  t as PhGps
};
