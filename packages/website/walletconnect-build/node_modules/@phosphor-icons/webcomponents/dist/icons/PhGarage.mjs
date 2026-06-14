import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as Z } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as v } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as o } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as V } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var M = Object.defineProperty, g = Object.getOwnPropertyDescriptor, h = (a, H, s, l) => {
  for (var r = l > 1 ? void 0 : l ? g(H, s) : H, i = a.length - 1, p; i >= 0; i--)
    (p = a[i]) && (r = (l ? p(H, s, r) : p(r)) || r);
  return l && r && M(H, s, r), r;
};
let t = class extends m {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return Z`<svg
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
    e`<path d="M240,196H228V98.67a12,12,0,0,0-5.34-10L134.66,30a12,12,0,0,0-13.32,0l-88,58.67a12,12,0,0,0-5.34,10V196H16a4,4,0,0,0,0,8H240a4,4,0,0,0,0-8ZM36,98.67a4,4,0,0,1,1.78-3.33l88-58.66a4,4,0,0,1,4.44,0l88,58.66A4,4,0,0,1,220,98.67V196H188V136a4,4,0,0,0-4-4H72a4,4,0,0,0-4,4v60H36ZM180,140v24H132V140Zm-56,24H76V140h48Zm-48,8h48v24H76Zm56,0h48v24H132Z"/>`
  ],
  [
    "light",
    e`<path d="M240,194H230V98.67A14,14,0,0,0,223.77,87l-88-58.66a14,14,0,0,0-15.54,0L32.23,87A14,14,0,0,0,26,98.67V194H16a6,6,0,0,0,0,12H240a6,6,0,0,0,0-12ZM38,98.67A2,2,0,0,1,38.89,97l88-58.67a2,2,0,0,1,2.22,0l88,58.67a2,2,0,0,1,.89,1.66V194H190V136a6,6,0,0,0-6-6H72a6,6,0,0,0-6,6v58H38ZM178,142v20H134V142Zm-56,20H78V142h44ZM78,174h44v20H78Zm56,0h44v20H134Z"/>`
  ],
  [
    "regular",
    e`<path d="M240,192h-8V98.67a16,16,0,0,0-7.12-13.31l-88-58.67a16,16,0,0,0-17.75,0l-88,58.67A16,16,0,0,0,24,98.67V192H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM40,98.67,128,40l88,58.66V192H192V136a8,8,0,0,0-8-8H72a8,8,0,0,0-8,8v56H40ZM176,144v16H136V144Zm-56,16H80V144h40ZM80,176h40v16H80Zm56,0h40v16H136Z"/>`
  ],
  [
    "bold",
    e`<path d="M240,188h-4V98.67A20,20,0,0,0,227.09,82l-88-58.66a19.94,19.94,0,0,0-22.18,0L28.91,82A20,20,0,0,0,20,98.67V188H16a12,12,0,0,0,0,24H240a12,12,0,0,0,0-24ZM44,100.81l84-56,84,56V188H196V120a12,12,0,0,0-12-12H72a12,12,0,0,0-12,12v68H44ZM172,132v16H140V132Zm-56,16H84V132h32ZM84,172h32v16H84Zm56,0h32v16H140Z"/>`
  ],
  [
    "fill",
    e`<path d="M240,192h-8V98.67a16,16,0,0,0-7.12-13.31l-88-58.67a16,16,0,0,0-17.75,0l-88,58.67A16,16,0,0,0,24,98.67V192H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM136,128h56v24H136Zm-16,24H64V128h56ZM64,168h56v24H64Zm72,0h56v24H136Z"/>`
  ],
  [
    "duotone",
    e`<path d="M184,136v64H72V136Z" opacity="0.2"/><path d="M240,192h-8V98.67a16,16,0,0,0-7.12-13.31l-88-58.67a16,16,0,0,0-17.75,0l-88,58.67A16,16,0,0,0,24,98.67V192H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM40,98.67,128,40l88,58.66V192H192V136a8,8,0,0,0-8-8H72a8,8,0,0,0-8,8v56H40ZM176,144v16H136V144Zm-56,16H80V144h40ZM80,176h40v16H80Zm56,0h40v16H136Z"/>`
  ]
]);
t.styles = V`
    :host {
      display: contents;
    }
  `;
h([
  o({ type: String, reflect: !0 })
], t.prototype, "size", 2);
h([
  o({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
h([
  o({ type: String, reflect: !0 })
], t.prototype, "color", 2);
h([
  o({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = h([
  v("ph-garage")
], t);
export {
  t as PhGarage
};
