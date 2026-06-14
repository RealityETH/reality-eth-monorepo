import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as p } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as l } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as s } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as M } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var n = Object.defineProperty, v = Object.getOwnPropertyDescriptor, H = (e, h, V, o) => {
  for (var t = o > 1 ? void 0 : o ? v(h, V) : h, Z = e.length - 1, i; Z >= 0; Z--)
    (i = e[Z]) && (t = (o ? i(h, V, t) : i(t)) || t);
  return o && t && n(h, V, t), t;
};
let a = class extends m {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return p`<svg
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
    r`<path d="M188,72a4,4,0,0,1-4,4H160a4,4,0,0,1,0-8h24A4,4,0,0,1,188,72Zm-4,28H160a4,4,0,0,0,0,8h24a4,4,0,0,0,0-8ZM72,76H96a4,4,0,0,0,0-8H72a4,4,0,0,0,0,8Zm24,24H72a4,4,0,0,0,0,8H96a4,4,0,0,0,0-8ZM220,48V224a4,4,0,0,1-8,0V204H132v20a4,4,0,0,1-8,0V204H44v20a4,4,0,0,1-8,0V48A12,12,0,0,1,48,36H208A12,12,0,0,1,220,48ZM124,196V44H48a4,4,0,0,0-4,4V196Zm8,0h80V48a4,4,0,0,0-4-4H132Z"/>`
  ],
  [
    "light",
    r`<path d="M190,72a6,6,0,0,1-6,6H160a6,6,0,0,1,0-12h24A6,6,0,0,1,190,72Zm-6,26H160a6,6,0,0,0,0,12h24a6,6,0,0,0,0-12ZM72,78H96a6,6,0,0,0,0-12H72a6,6,0,0,0,0,12ZM96,98H72a6,6,0,0,0,0,12H96a6,6,0,0,0,0-12ZM222,48V224a6,6,0,0,1-12,0V206H134v18a6,6,0,0,1-12,0V206H46v18a6,6,0,0,1-12,0V48A14,14,0,0,1,48,34H208A14,14,0,0,1,222,48ZM122,194V46H48a2,2,0,0,0-2,2V194Zm12,0h76V48a2,2,0,0,0-2-2H134Z"/>`
  ],
  [
    "regular",
    r`<path d="M192,72a8,8,0,0,1-8,8H160a8,8,0,0,1,0-16h24A8,8,0,0,1,192,72Zm-8,24H160a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16ZM72,80H96a8,8,0,0,0,0-16H72a8,8,0,0,0,0,16ZM96,96H72a8,8,0,0,0,0,16H96a8,8,0,0,0,0-16ZM224,48V224a8,8,0,0,1-16,0V208H136v16a8,8,0,0,1-16,0V208H48v16a8,8,0,0,1-16,0V48A16,16,0,0,1,48,32H208A16,16,0,0,1,224,48ZM120,192V48H48V192Zm16,0h72V48H136Z"/>`
  ],
  [
    "bold",
    r`<path d="M192,80a12,12,0,0,1-12,12H164a12,12,0,0,1,0-24h16A12,12,0,0,1,192,80Zm-12,28H164a12,12,0,0,0,0,24h16a12,12,0,0,0,0-24ZM76,92H92a12,12,0,0,0,0-24H76a12,12,0,0,0,0,24Zm16,16H76a12,12,0,0,0,0,24H92a12,12,0,0,0,0-24ZM228,48V224a12,12,0,0,1-24,0V212H140v12a12,12,0,0,1-24,0V212H52v12a12,12,0,0,1-24,0V48A20,20,0,0,1,48,28H208A20,20,0,0,1,228,48ZM116,188V52H52V188Zm24,0h64V52H140Z"/>`
  ],
  [
    "fill",
    r`<path d="M208,32H48A16,16,0,0,0,32,48V224a8,8,0,0,0,16,0V208h72v16a8,8,0,0,0,16,0V208h72v16a8,8,0,0,0,16,0V48A16,16,0,0,0,208,32ZM96,112H56a8,8,0,0,1,0-16H96a8,8,0,0,1,0,16Zm0-32H56a8,8,0,0,1,0-16H96a8,8,0,0,1,0,16Zm40,104a8,8,0,0,1-16,0V56a8,8,0,0,1,16,0Zm64-72H160a8,8,0,0,1,0-16h40a8,8,0,0,1,0,16Zm0-32H160a8,8,0,0,1,0-16h40a8,8,0,0,1,0,16Z"/>`
  ],
  [
    "duotone",
    r`<path d="M216,48V200H40V48a8,8,0,0,1,8-8H208A8,8,0,0,1,216,48Z" opacity="0.2"/><path d="M192,72a8,8,0,0,1-8,8H160a8,8,0,0,1,0-16h24A8,8,0,0,1,192,72Zm-8,24H160a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16ZM72,80H96a8,8,0,0,0,0-16H72a8,8,0,0,0,0,16ZM96,96H72a8,8,0,0,0,0,16H96a8,8,0,0,0,0-16ZM224,48V224a8,8,0,0,1-16,0V208H136v16a8,8,0,0,1-16,0V208H48v16a8,8,0,0,1-16,0V48A16,16,0,0,1,48,32H208A16,16,0,0,1,224,48ZM120,192V48H48V192Zm16,0h72V48H136Z"/>`
  ]
]);
a.styles = M`
    :host {
      display: contents;
    }
  `;
H([
  s({ type: String, reflect: !0 })
], a.prototype, "size", 2);
H([
  s({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
H([
  s({ type: String, reflect: !0 })
], a.prototype, "color", 2);
H([
  s({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = H([
  l("ph-lockers")
], a);
export {
  a as PhLockers
};
