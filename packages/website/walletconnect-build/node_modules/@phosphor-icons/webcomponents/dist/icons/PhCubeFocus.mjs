import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as p } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as A } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as M } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as s } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as m } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var H = Object.defineProperty, v = Object.getOwnPropertyDescriptor, l = (r, V, Z, o) => {
  for (var t = o > 1 ? void 0 : o ? v(V, Z) : V, h = r.length - 1, i; h >= 0; h--)
    (i = r[h]) && (t = (o ? i(V, Z, t) : i(t)) || t);
  return o && t && H(V, Z, t), t;
};
let a = class extends A {
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
    e`<path d="M228,48V88a4,4,0,0,1-8,0V52H184a4,4,0,0,1,0-8h40A4,4,0,0,1,228,48ZM72,204H36V168a4,4,0,0,0-8,0v40a4,4,0,0,0,4,4H72a4,4,0,0,0,0-8Zm152-40a4,4,0,0,0-4,4v36H184a4,4,0,0,0,0,8h40a4,4,0,0,0,4-4V168A4,4,0,0,0,224,164ZM32,92a4,4,0,0,0,4-4V52H72a4,4,0,0,0,0-8H32a4,4,0,0,0-4,4V88A4,4,0,0,0,32,92Zm154,71.47-56,32a4,4,0,0,1-4,0l-56-32A4,4,0,0,1,68,160V96a4,4,0,0,1,2-3.47l56-32a4,4,0,0,1,4,0l56,32A4,4,0,0,1,188,96v64A4,4,0,0,1,186,163.47ZM80.06,96,128,123.39,175.94,96,128,68.61ZM76,157.68l48,27.43V130.32L76,102.89Zm104,0V102.89l-48,27.43v54.79Z"/>`
  ],
  [
    "light",
    e`<path d="M230,48V88a6,6,0,0,1-12,0V54H184a6,6,0,0,1,0-12h40A6,6,0,0,1,230,48ZM72,202H38V168a6,6,0,0,0-12,0v40a6,6,0,0,0,6,6H72a6,6,0,0,0,0-12Zm152-40a6,6,0,0,0-6,6v34H184a6,6,0,0,0,0,12h40a6,6,0,0,0,6-6V168A6,6,0,0,0,224,162ZM32,94a6,6,0,0,0,6-6V54H72a6,6,0,0,0,0-12H32a6,6,0,0,0-6,6V88A6,6,0,0,0,32,94Zm155,71.21-56,32a6,6,0,0,1-6,0l-56-32A6,6,0,0,1,66,160V96a6,6,0,0,1,3-5.21l56-32a6,6,0,0,1,6,0l56,32A6,6,0,0,1,190,96v64A6,6,0,0,1,187,165.21ZM84.09,96,128,121.09,171.91,96,128,70.91ZM78,156.52l44,25.14V131.48L78,106.34Zm100,0V106.34l-44,25.14v50.18Z"/>`
  ],
  [
    "regular",
    e`<path d="M232,48V88a8,8,0,0,1-16,0V56H184a8,8,0,0,1,0-16h40A8,8,0,0,1,232,48ZM72,200H40V168a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H72a8,8,0,0,0,0-16Zm152-40a8,8,0,0,0-8,8v32H184a8,8,0,0,0,0,16h40a8,8,0,0,0,8-8V168A8,8,0,0,0,224,160ZM32,96a8,8,0,0,0,8-8V56H72a8,8,0,0,0,0-16H32a8,8,0,0,0-8,8V88A8,8,0,0,0,32,96ZM188,167l-56,32a8,8,0,0,1-7.94,0L68,167A8,8,0,0,1,64,160V96a8,8,0,0,1,4-7l56-32a8,8,0,0,1,7.94,0l56,32a8,8,0,0,1,4,7v64A8,8,0,0,1,188,167ZM88.12,96,128,118.79,167.88,96,128,73.21ZM80,155.36l40,22.85V132.64L80,109.79Zm96,0V109.79l-40,22.85v45.57Z"/>`
  ],
  [
    "bold",
    e`<path d="M236,48V88a12,12,0,0,1-24,0V60H184a12,12,0,0,1,0-24h40A12,12,0,0,1,236,48ZM72,196H44V168a12,12,0,0,0-24,0v40a12,12,0,0,0,12,12H72a12,12,0,0,0,0-24Zm152-40a12,12,0,0,0-12,12v28H184a12,12,0,0,0,0,24h40a12,12,0,0,0,12-12V168A12,12,0,0,0,224,156ZM32,100A12,12,0,0,0,44,88V60H72a12,12,0,0,0,0-24H32A12,12,0,0,0,20,48V88A12,12,0,0,0,32,100Zm158,70.42-56,32a12,12,0,0,1-11.9,0l-56-32A12,12,0,0,1,60,160V96a12,12,0,0,1,6-10.42l56-32a12,12,0,0,1,11.9,0l56,32A12,12,0,0,1,196,96v64A12,12,0,0,1,190,170.42ZM96.19,96,128,114.18,159.81,96,128,77.82ZM84,153l32,18.28V135L84,116.68Zm88,0V116.68L140,135v36.36Z"/>`
  ],
  [
    "fill",
    e`<path d="M232,48V88a8,8,0,0,1-16,0V56H184a8,8,0,0,1,0-16h40A8,8,0,0,1,232,48ZM72,200H40V168a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H72a8,8,0,0,0,0-16Zm152-40a8,8,0,0,0-8,8v32H184a8,8,0,0,0,0,16h40a8,8,0,0,0,8-8V168A8,8,0,0,0,224,160ZM32,96a8,8,0,0,0,8-8V56H72a8,8,0,0,0,0-16H32a8,8,0,0,0-8,8V88A8,8,0,0,0,32,96ZM177.92,83.31,132,57.05a8,8,0,0,0-7.94,0L78.08,83.31a4,4,0,0,0,0,7L128,118.79l49.92-28.53A4,4,0,0,0,177.92,83.31ZM64,107.53V160A8,8,0,0,0,68,167l46,26.27a4,4,0,0,0,6-3.47V132.64L70,104.06A4,4,0,0,0,64,107.53ZM192,160V107.53a4,4,0,0,0-6-3.47l-50,28.58v57.11a4,4,0,0,0,6,3.47L188,167A8,8,0,0,0,192,160Z"/>`
  ],
  [
    "duotone",
    e`<path d="M184,96v64l-56,32L72,160V96l56-32Z" opacity="0.2"/><path d="M232,48V88a8,8,0,0,1-16,0V56H184a8,8,0,0,1,0-16h40A8,8,0,0,1,232,48ZM72,200H40V168a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H72a8,8,0,0,0,0-16Zm152-40a8,8,0,0,0-8,8v32H184a8,8,0,0,0,0,16h40a8,8,0,0,0,8-8V168A8,8,0,0,0,224,160ZM32,96a8,8,0,0,0,8-8V56H72a8,8,0,0,0,0-16H32a8,8,0,0,0-8,8V88A8,8,0,0,0,32,96ZM188,167l-56,32a8,8,0,0,1-7.94,0L68,167A8,8,0,0,1,64,160V96a8,8,0,0,1,4-7l56-32a8,8,0,0,1,7.94,0l56,32a8,8,0,0,1,4,7v64A8,8,0,0,1,188,167ZM88.12,96,128,118.79,167.88,96,128,73.21ZM80,155.36l40,22.85V132.64L80,109.79Zm96,0V109.79l-40,22.85v45.57Z"/>`
  ]
]);
a.styles = m`
    :host {
      display: contents;
    }
  `;
l([
  s({ type: String, reflect: !0 })
], a.prototype, "size", 2);
l([
  s({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
l([
  s({ type: String, reflect: !0 })
], a.prototype, "color", 2);
l([
  s({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = l([
  M("ph-cube-focus")
], a);
export {
  a as PhCubeFocus
};
