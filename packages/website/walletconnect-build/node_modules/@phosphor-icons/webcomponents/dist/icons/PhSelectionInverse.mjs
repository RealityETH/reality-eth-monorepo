import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as V } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as A } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var n = Object.defineProperty, v = Object.getOwnPropertyDescriptor, s = (r, o, p, h) => {
  for (var t = h > 1 ? void 0 : h ? v(o, p) : o, H = r.length - 1, l; H >= 0; H--)
    (l = r[H]) && (t = (h ? l(o, p, t) : l(t)) || t);
  return h && t && n(o, p, t), t;
};
let a = class extends V {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var r;
    return m`<svg
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
    e`<path d="M148,216a4,4,0,0,1-4,4H112a4,4,0,0,1,0-8h32A4,4,0,0,1,148,216ZM40,148a4,4,0,0,0,4-4V112a4,4,0,0,0-8,0v32A4,4,0,0,0,40,148Zm32,64H48a4,4,0,0,1-4-4V184a4,4,0,0,0-8,0v24a12,12,0,0,0,12,12H72a4,4,0,0,0,0-8ZM220,48V208a12,12,0,0,1-12,12H184a4,4,0,0,1,0-8h22.34L44,49.66V72a4,4,0,0,1-8,0V48A12,12,0,0,1,48,36H208A12,12,0,0,1,220,48Zm-12-4H49.66L212,206.34V48A4,4,0,0,0,208,44Z"/>`
  ],
  [
    "light",
    e`<path d="M150,216a6,6,0,0,1-6,6H112a6,6,0,0,1,0-12h32A6,6,0,0,1,150,216ZM40,150a6,6,0,0,0,6-6V112a6,6,0,0,0-12,0v32A6,6,0,0,0,40,150Zm32,60H48a2,2,0,0,1-2-2V184a6,6,0,0,0-12,0v24a14,14,0,0,0,14,14H72a6,6,0,0,0,0-12ZM222,48V208a14,14,0,0,1-14,14H184a6,6,0,0,1,0-12h17.51L46,54.48V72a6,6,0,0,1-12,0V48A14,14,0,0,1,48,34H208A14,14,0,0,1,222,48Zm-14-2H54.49L210,201.52V48A2,2,0,0,0,208,46Z"/>`
  ],
  [
    "regular",
    e`<path d="M152,216a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h32A8,8,0,0,1,152,216ZM40,152a8,8,0,0,0,8-8V112a8,8,0,0,0-16,0v32A8,8,0,0,0,40,152Zm32,56H48V184a8,8,0,0,0-16,0v24a16,16,0,0,0,16,16H72a8,8,0,0,0,0-16ZM224,48V208a16,16,0,0,1-16,16H184a8,8,0,0,1,0-16h12.69L48,59.31V72a8,8,0,0,1-16,0V48A16,16,0,0,1,48,32H208A16,16,0,0,1,224,48Zm-16,0H59.31L208,196.69Z"/>`
  ],
  [
    "bold",
    e`<path d="M156,216a12,12,0,0,1-12,12H112a12,12,0,0,1,0-24h32A12,12,0,0,1,156,216ZM40,156a12,12,0,0,0,12-12V112a12,12,0,0,0-24,0v32A12,12,0,0,0,40,156Zm32,48H52V184a12,12,0,0,0-24,0v24a20,20,0,0,0,20,20H72a12,12,0,0,0,0-24ZM228,48V208a20,20,0,0,1-20,20H184a12,12,0,0,1,0-24h3L52,69v3a12,12,0,0,1-24,0V48A20,20,0,0,1,48,28H208A20,20,0,0,1,228,48Zm-24,4H69L204,187Z"/>`
  ],
  [
    "fill",
    e`<path d="M152,216a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h32A8,8,0,0,1,152,216ZM40,152a8,8,0,0,0,8-8V112a8,8,0,0,0-16,0v32A8,8,0,0,0,40,152Zm32,56H48V184a8,8,0,0,0-16,0v24a16,16,0,0,0,16,16H72a8,8,0,0,0,0-16ZM224,48a16,16,0,0,0-16-16H48a15.87,15.87,0,0,0-10.66,4.11,7.67,7.67,0,0,0-1.23,1.23A15.87,15.87,0,0,0,32,48V72a8,8,0,0,0,16,0V59.31L196.69,208H184a8,8,0,0,0,0,16h24a15.91,15.91,0,0,0,10.66-4.1,7.35,7.35,0,0,0,.65-.59,6,6,0,0,0,.58-.65A15.87,15.87,0,0,0,224,208Z"/>`
  ],
  [
    "duotone",
    e`<path d="M216,48V208a8,8,0,0,1-2.34,5.66L42.34,42.34A8,8,0,0,1,48,40H208A8,8,0,0,1,216,48Z" opacity="0.2"/><path d="M152,216a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h32A8,8,0,0,1,152,216ZM40,152a8,8,0,0,0,8-8V112a8,8,0,0,0-16,0v32A8,8,0,0,0,40,152Zm32,56H48V184a8,8,0,0,0-16,0v24a16,16,0,0,0,16,16H72a8,8,0,0,0,0-16ZM224,48V208a16,16,0,0,1-16,16H184a8,8,0,0,1,0-16h12.69L48,59.31V72a8,8,0,0,1-16,0V48A16,16,0,0,1,48,32H208A16,16,0,0,1,224,48Zm-16,0H59.31L208,196.69Z"/>`
  ]
]);
a.styles = A`
    :host {
      display: contents;
    }
  `;
s([
  i({ type: String, reflect: !0 })
], a.prototype, "size", 2);
s([
  i({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
s([
  i({ type: String, reflect: !0 })
], a.prototype, "color", 2);
s([
  i({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = s([
  Z("ph-selection-inverse")
], a);
export {
  a as PhSelectionInverse
};
