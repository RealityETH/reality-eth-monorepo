import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as Z } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as l } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as s } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as A } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var g = Object.defineProperty, c = Object.getOwnPropertyDescriptor, h = (e, H, m, o) => {
  for (var t = o > 1 ? void 0 : o ? c(H, m) : H, i = e.length - 1, p; i >= 0; i--)
    (p = e[i]) && (t = (o ? p(H, m, t) : p(t)) || t);
  return o && t && g(H, m, t), t;
};
let a = class extends l {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return Z`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${a.weightsMap.get((e = this.weight) != null ? e : "regular")}
    </svg>`;
  }
};
a.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    r`<path d="M228,40a4,4,0,0,1-4,4H56a4,4,0,0,1,0-8H224A4,4,0,0,1,228,40ZM180,72a4,4,0,0,0-4-4H32a4,4,0,0,0,0,8H176A4,4,0,0,0,180,72Zm-16,32a4,4,0,0,0-4-4H56a4,4,0,0,0,0,8H160A4,4,0,0,0,164,104Zm16,32a4,4,0,0,0-4-4H88a4,4,0,0,0,0,8h88A4,4,0,0,0,180,136Zm4,28H120a4,4,0,0,0,0,8h64a4,4,0,0,0,0-8Zm-24,32H128a4,4,0,0,0,0,8h32a4,4,0,0,0,0-8Zm-32,32H112a4,4,0,0,0,0,8h16a4,4,0,0,0,0-8Z"/>`
  ],
  [
    "light",
    r`<path d="M230,40a6,6,0,0,1-6,6H56a6,6,0,0,1,0-12H224A6,6,0,0,1,230,40ZM182,72a6,6,0,0,0-6-6H32a6,6,0,0,0,0,12H176A6,6,0,0,0,182,72Zm-16,32a6,6,0,0,0-6-6H56a6,6,0,0,0,0,12H160A6,6,0,0,0,166,104Zm16,32a6,6,0,0,0-6-6H88a6,6,0,0,0,0,12h88A6,6,0,0,0,182,136Zm2,26H120a6,6,0,0,0,0,12h64a6,6,0,0,0,0-12Zm-24,32H128a6,6,0,0,0,0,12h32a6,6,0,0,0,0-12Zm-32,32H112a6,6,0,0,0,0,12h16a6,6,0,0,0,0-12Z"/>`
  ],
  [
    "regular",
    r`<path d="M232,40a8,8,0,0,1-8,8H56a8,8,0,0,1,0-16H224A8,8,0,0,1,232,40ZM184,72a8,8,0,0,0-8-8H32a8,8,0,0,0,0,16H176A8,8,0,0,0,184,72Zm-16,32a8,8,0,0,0-8-8H56a8,8,0,0,0,0,16H160A8,8,0,0,0,168,104Zm16,32a8,8,0,0,0-8-8H88a8,8,0,0,0,0,16h88A8,8,0,0,0,184,136Zm0,24H120a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Zm-24,32H128a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16Zm-32,32H112a8,8,0,0,0,0,16h16a8,8,0,0,0,0-16Z"/>`
  ],
  [
    "bold",
    r`<path d="M232,44a12,12,0,0,1-12,12H60a12,12,0,0,1,0-24H220A12,12,0,0,1,232,44ZM176,88a12,12,0,0,0-12-12H44a12,12,0,0,0,0,24H164A12,12,0,0,0,176,88Zm0,44a12,12,0,0,0-12-12H76a12,12,0,0,0,0,24h88A12,12,0,0,0,176,132Zm-4,32H132a12,12,0,0,0,0,24h40a12,12,0,0,0,0-24Zm-32,44H124a12,12,0,0,0,0,24h16a12,12,0,0,0,0-24Z"/>`
  ],
  [
    "fill",
    r`<path d="M144,228a12,12,0,0,1-12,12H116a12,12,0,0,1,0-24h16A12,12,0,0,1,144,228ZM220,32H60a12,12,0,0,0,0,24,12,12,0,0,1,0,24H44a12,12,0,0,0,0,24H76a12,12,0,0,1,0,24,12,12,0,0,0,0,24h48a12,12,0,0,1,0,24,12,12,0,0,0,0,24h48a12,12,0,0,0,0-24,12,12,0,0,1,0-24h16a12,12,0,0,0,0-24H164a12,12,0,0,1,0-24,12,12,0,0,0,0-24,12,12,0,0,1,0-24h56a12,12,0,0,0,0-24Z"/>`
  ],
  [
    "duotone",
    r`<path d="M216,40V216a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V40A16,16,0,0,1,56,24H200A16,16,0,0,1,216,40Z" opacity="0.2"/><path d="M232,40a8,8,0,0,1-8,8H56a8,8,0,0,1,0-16H224A8,8,0,0,1,232,40ZM184,72a8,8,0,0,0-8-8H32a8,8,0,0,0,0,16H176A8,8,0,0,0,184,72Zm-16,32a8,8,0,0,0-8-8H56a8,8,0,0,0,0,16H160A8,8,0,0,0,168,104Zm16,32a8,8,0,0,0-8-8H88a8,8,0,0,0,0,16h88A8,8,0,0,0,184,136Zm0,24H120a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Zm-24,32H128a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16Zm-32,32H112a8,8,0,0,0,0,16h16a8,8,0,0,0,0-16Z"/>`
  ]
]);
a.styles = A`
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
  n("ph-tornado")
], a);
export {
  a as PhTornado
};
