import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as Z } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as l } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as A } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as s } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as V } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var n = Object.defineProperty, M = Object.getOwnPropertyDescriptor, h = (r, o, p, H) => {
  for (var t = H > 1 ? void 0 : H ? M(o, p) : o, i = r.length - 1, m; i >= 0; i--)
    (m = r[i]) && (t = (H ? m(o, p, t) : m(t)) || t);
  return H && t && n(o, p, t), t;
};
let a = class extends l {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var r;
    return Z`<svg
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
    e`<path d="M232,52H160a36,36,0,0,0-32,19.54A36,36,0,0,0,96,52H24a4,4,0,0,0-4,4V200a4,4,0,0,0,4,4H96a28,28,0,0,1,28,28,4,4,0,0,0,8,0,28,28,0,0,1,28-28h72a4,4,0,0,0,4-4V56A4,4,0,0,0,232,52ZM96,196H28V60H96a28,28,0,0,1,28,28V209.4A35.94,35.94,0,0,0,96,196Zm132,0H160a35.94,35.94,0,0,0-28,13.41V88a28,28,0,0,1,28-28h68ZM160,92h40a4,4,0,0,1,0,8H160a4,4,0,0,1,0-8Zm44,36a4,4,0,0,1-4,4H160a4,4,0,0,1,0-8h40A4,4,0,0,1,204,128Zm0,32a4,4,0,0,1-4,4H160a4,4,0,0,1,0-8h40A4,4,0,0,1,204,160Z"/>`
  ],
  [
    "light",
    e`<path d="M232,50H160a38,38,0,0,0-32,17.55A38,38,0,0,0,96,50H24a6,6,0,0,0-6,6V200a6,6,0,0,0,6,6H96a26,26,0,0,1,26,26,6,6,0,0,0,12,0,26,26,0,0,1,26-26h72a6,6,0,0,0,6-6V56A6,6,0,0,0,232,50ZM96,194H30V62H96a26,26,0,0,1,26,26V204.31A37.86,37.86,0,0,0,96,194Zm130,0H160a37.87,37.87,0,0,0-26,10.32V88a26,26,0,0,1,26-26h66ZM160,90h40a6,6,0,0,1,0,12H160a6,6,0,0,1,0-12Zm46,38a6,6,0,0,1-6,6H160a6,6,0,0,1,0-12h40A6,6,0,0,1,206,128Zm0,32a6,6,0,0,1-6,6H160a6,6,0,0,1,0-12h40A6,6,0,0,1,206,160Z"/>`
  ],
  [
    "regular",
    e`<path d="M232,48H160a40,40,0,0,0-32,16A40,40,0,0,0,96,48H24a8,8,0,0,0-8,8V200a8,8,0,0,0,8,8H96a24,24,0,0,1,24,24,8,8,0,0,0,16,0,24,24,0,0,1,24-24h72a8,8,0,0,0,8-8V56A8,8,0,0,0,232,48ZM96,192H32V64H96a24,24,0,0,1,24,24V200A39.81,39.81,0,0,0,96,192Zm128,0H160a39.81,39.81,0,0,0-24,8V88a24,24,0,0,1,24-24h64ZM160,88h40a8,8,0,0,1,0,16H160a8,8,0,0,1,0-16Zm48,40a8,8,0,0,1-8,8H160a8,8,0,0,1,0-16h40A8,8,0,0,1,208,128Zm0,32a8,8,0,0,1-8,8H160a8,8,0,0,1,0-16h40A8,8,0,0,1,208,160Z"/>`
  ],
  [
    "bold",
    e`<path d="M232,44H160a43.86,43.86,0,0,0-32,13.85A43.86,43.86,0,0,0,96,44H24A12,12,0,0,0,12,56V200a12,12,0,0,0,12,12H96a20,20,0,0,1,20,20,12,12,0,0,0,24,0,20,20,0,0,1,20-20h72a12,12,0,0,0,12-12V56A12,12,0,0,0,232,44ZM96,188H36V68H96a20,20,0,0,1,20,20V192.81A43.79,43.79,0,0,0,96,188Zm124,0H160a43.71,43.71,0,0,0-20,4.83V88a20,20,0,0,1,20-20h60ZM164,96h32a12,12,0,0,1,0,24H164a12,12,0,0,1,0-24Zm44,52a12,12,0,0,1-12,12H164a12,12,0,0,1,0-24h32A12,12,0,0,1,208,148Z"/>`
  ],
  [
    "fill",
    e`<path d="M232,48H168a32,32,0,0,0-32,32v87.73a8.17,8.17,0,0,1-7.47,8.25,8,8,0,0,1-8.53-8V80A32,32,0,0,0,88,48H24a8,8,0,0,0-8,8V200a8,8,0,0,0,8,8H96a24,24,0,0,1,24,23.94,7.9,7.9,0,0,0,5.12,7.55A8,8,0,0,0,136,232a24,24,0,0,1,24-24h72a8,8,0,0,0,8-8V56A8,8,0,0,0,232,48ZM208,168H168.27a8.17,8.17,0,0,1-8.25-7.47,8,8,0,0,1,8-8.53h39.73a8.17,8.17,0,0,1,8.25,7.47A8,8,0,0,1,208,168Zm0-32H168.27a8.17,8.17,0,0,1-8.25-7.47,8,8,0,0,1,8-8.53h39.73a8.17,8.17,0,0,1,8.25,7.47A8,8,0,0,1,208,136Zm0-32H168.27A8.17,8.17,0,0,1,160,96.53,8,8,0,0,1,168,88h39.73A8.17,8.17,0,0,1,216,95.47,8,8,0,0,1,208,104Z"/>`
  ],
  [
    "duotone",
    e`<path d="M232,56V200H160a32,32,0,0,0-32,32V88a32,32,0,0,1,32-32Z" opacity="0.2"/><path d="M232,48H160a40,40,0,0,0-32,16A40,40,0,0,0,96,48H24a8,8,0,0,0-8,8V200a8,8,0,0,0,8,8H96a24,24,0,0,1,24,24,8,8,0,0,0,16,0,24,24,0,0,1,24-24h72a8,8,0,0,0,8-8V56A8,8,0,0,0,232,48ZM96,192H32V64H96a24,24,0,0,1,24,24V200A39.81,39.81,0,0,0,96,192Zm128,0H160a39.81,39.81,0,0,0-24,8V88a24,24,0,0,1,24-24h64ZM160,88h40a8,8,0,0,1,0,16H160a8,8,0,0,1,0-16Zm48,40a8,8,0,0,1-8,8H160a8,8,0,0,1,0-16h40A8,8,0,0,1,208,128Zm0,32a8,8,0,0,1-8,8H160a8,8,0,0,1,0-16h40A8,8,0,0,1,208,160Z"/>`
  ]
]);
a.styles = V`
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
  A("ph-book-open-text")
], a);
export {
  a as PhBookOpenText
};
