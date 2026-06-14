import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as i } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as p } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as H } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as A } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var l = Object.defineProperty, M = Object.getOwnPropertyDescriptor, V = (e, o, h, s) => {
  for (var t = s > 1 ? void 0 : s ? M(o, h) : o, m = e.length - 1, v; m >= 0; m--)
    (v = e[m]) && (t = (s ? v(o, h, t) : v(t)) || t);
  return s && t && l(o, h, t), t;
};
let a = class extends p {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return i`<svg
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
    r`<path d="M228,48V88a4,4,0,0,1-8,0V52H184a4,4,0,0,1,0-8h40A4,4,0,0,1,228,48ZM72,204H36V168a4,4,0,0,0-8,0v40a4,4,0,0,0,4,4H72a4,4,0,0,0,0-8Zm152-40a4,4,0,0,0-4,4v36H184a4,4,0,0,0,0,8h40a4,4,0,0,0,4-4V168A4,4,0,0,0,224,164ZM32,92a4,4,0,0,0,4-4V52H72a4,4,0,0,0,0-8H32a4,4,0,0,0-4,4V88A4,4,0,0,0,32,92Zm48-8a4,4,0,0,0-4,4v80a4,4,0,0,0,8,0V88A4,4,0,0,0,80,84Zm100,4a4,4,0,0,0-8,0v80a4,4,0,0,0,8,0Zm-36-4a4,4,0,0,0-4,4v80a4,4,0,0,0,8,0V88A4,4,0,0,0,144,84Zm-32,0a4,4,0,0,0-4,4v80a4,4,0,0,0,8,0V88A4,4,0,0,0,112,84Z"/>`
  ],
  [
    "light",
    r`<path d="M230,48V88a6,6,0,0,1-12,0V54H184a6,6,0,0,1,0-12h40A6,6,0,0,1,230,48ZM72,202H38V168a6,6,0,0,0-12,0v40a6,6,0,0,0,6,6H72a6,6,0,0,0,0-12Zm152-40a6,6,0,0,0-6,6v34H184a6,6,0,0,0,0,12h40a6,6,0,0,0,6-6V168A6,6,0,0,0,224,162ZM32,94a6,6,0,0,0,6-6V54H72a6,6,0,0,0,0-12H32a6,6,0,0,0-6,6V88A6,6,0,0,0,32,94ZM80,82a6,6,0,0,0-6,6v80a6,6,0,0,0,12,0V88A6,6,0,0,0,80,82Zm102,86V88a6,6,0,0,0-12,0v80a6,6,0,0,0,12,0ZM144,82a6,6,0,0,0-6,6v80a6,6,0,0,0,12,0V88A6,6,0,0,0,144,82Zm-32,0a6,6,0,0,0-6,6v80a6,6,0,0,0,12,0V88A6,6,0,0,0,112,82Z"/>`
  ],
  [
    "regular",
    r`<path d="M232,48V88a8,8,0,0,1-16,0V56H184a8,8,0,0,1,0-16h40A8,8,0,0,1,232,48ZM72,200H40V168a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H72a8,8,0,0,0,0-16Zm152-40a8,8,0,0,0-8,8v32H184a8,8,0,0,0,0,16h40a8,8,0,0,0,8-8V168A8,8,0,0,0,224,160ZM32,96a8,8,0,0,0,8-8V56H72a8,8,0,0,0,0-16H32a8,8,0,0,0-8,8V88A8,8,0,0,0,32,96ZM80,80a8,8,0,0,0-8,8v80a8,8,0,0,0,16,0V88A8,8,0,0,0,80,80Zm104,88V88a8,8,0,0,0-16,0v80a8,8,0,0,0,16,0ZM144,80a8,8,0,0,0-8,8v80a8,8,0,0,0,16,0V88A8,8,0,0,0,144,80Zm-32,0a8,8,0,0,0-8,8v80a8,8,0,0,0,16,0V88A8,8,0,0,0,112,80Z"/>`
  ],
  [
    "bold",
    r`<path d="M232,52V92a12,12,0,0,1-24,0V64H180a12,12,0,0,1,0-24h40A12,12,0,0,1,232,52ZM76,192H48V164a12,12,0,0,0-24,0v40a12,12,0,0,0,12,12H76a12,12,0,0,0,0-24Zm144-40a12,12,0,0,0-12,12v28H180a12,12,0,0,0,0,24h40a12,12,0,0,0,12-12V164A12,12,0,0,0,220,152ZM36,104A12,12,0,0,0,48,92V64H76a12,12,0,0,0,0-24H36A12,12,0,0,0,24,52V92A12,12,0,0,0,36,104ZM88,80A12,12,0,0,0,76,92v72a12,12,0,0,0,24,0V92A12,12,0,0,0,88,80Zm92,84V92a12,12,0,0,0-24,0v72a12,12,0,0,0,24,0ZM128,80a12,12,0,0,0-12,12v72a12,12,0,0,0,24,0V92A12,12,0,0,0,128,80Z"/>`
  ],
  [
    "fill",
    r`<path d="M224,40H32a8,8,0,0,0-8,8V208a8,8,0,0,0,8,8H224a8,8,0,0,0,8-8V48A8,8,0,0,0,224,40ZM40,64a8,8,0,0,1,8-8H80a8,8,0,0,1,0,16H56V96a8,8,0,0,1-16,0ZM80,200H48a8,8,0,0,1-8-8V160a8,8,0,0,1,16,0v24H80a8,8,0,0,1,0,16Zm24-48a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm32,0a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm24,8a8,8,0,0,1-8-8V104a8,8,0,0,1,16,0v48A8,8,0,0,1,160,160Zm56,32a8,8,0,0,1-8,8H176a8,8,0,0,1,0-16h24V160a8,8,0,0,1,16,0Zm0-96a8,8,0,0,1-16,0V72H176a8,8,0,0,1,0-16h32a8,8,0,0,1,8,8Z"/>`
  ],
  [
    "duotone",
    r`<path d="M224,48V208H32V48Z" opacity="0.2"/><path d="M232,48V88a8,8,0,0,1-16,0V56H184a8,8,0,0,1,0-16h40A8,8,0,0,1,232,48ZM72,200H40V168a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H72a8,8,0,0,0,0-16Zm152-40a8,8,0,0,0-8,8v32H184a8,8,0,0,0,0,16h40a8,8,0,0,0,8-8V168A8,8,0,0,0,224,160ZM32,96a8,8,0,0,0,8-8V56H72a8,8,0,0,0,0-16H32a8,8,0,0,0-8,8V88A8,8,0,0,0,32,96ZM80,80a8,8,0,0,0-8,8v80a8,8,0,0,0,16,0V88A8,8,0,0,0,80,80Zm104,88V88a8,8,0,0,0-16,0v80a8,8,0,0,0,16,0ZM144,80a8,8,0,0,0-8,8v80a8,8,0,0,0,16,0V88A8,8,0,0,0,144,80Zm-32,0a8,8,0,0,0-8,8v80a8,8,0,0,0,16,0V88A8,8,0,0,0,112,80Z"/>`
  ]
]);
a.styles = A`
    :host {
      display: contents;
    }
  `;
V([
  Z({ type: String, reflect: !0 })
], a.prototype, "size", 2);
V([
  Z({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
V([
  Z({ type: String, reflect: !0 })
], a.prototype, "color", 2);
V([
  Z({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = V([
  H("ph-barcode")
], a);
export {
  a as PhBarcode
};
