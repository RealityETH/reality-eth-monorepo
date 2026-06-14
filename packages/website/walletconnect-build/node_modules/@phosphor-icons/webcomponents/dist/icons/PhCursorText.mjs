import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as n } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as v } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as H } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var A = Object.defineProperty, c = Object.getOwnPropertyDescriptor, h = (e, o, i, s) => {
  for (var t = s > 1 ? void 0 : s ? c(o, i) : o, p = e.length - 1, l; p >= 0; p--)
    (l = e[p]) && (t = (s ? l(o, i, t) : l(t)) || t);
  return s && t && A(o, i, t), t;
};
let a = class extends n {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return m`<svg
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
    r`<path d="M180,208a4,4,0,0,1-4,4H160a36,36,0,0,1-32-19.54A36,36,0,0,1,96,212H80a4,4,0,0,1,0-8H96a28,28,0,0,0,28-28V132H104a4,4,0,0,1,0-8h20V80A28,28,0,0,0,96,52H80a4,4,0,0,1,0-8H96a36,36,0,0,1,32,19.54A36,36,0,0,1,160,44h16a4,4,0,0,1,0,8H160a28,28,0,0,0-28,28v44h20a4,4,0,0,1,0,8H132v44a28,28,0,0,0,28,28h16A4,4,0,0,1,180,208Z"/>`
  ],
  [
    "light",
    r`<path d="M182,208a6,6,0,0,1-6,6H160a38,38,0,0,1-32-17.55A38,38,0,0,1,96,214H80a6,6,0,0,1,0-12H96a26,26,0,0,0,26-26V134H104a6,6,0,0,1,0-12h18V80A26,26,0,0,0,96,54H80a6,6,0,0,1,0-12H96a38,38,0,0,1,32,17.55A38,38,0,0,1,160,42h16a6,6,0,0,1,0,12H160a26,26,0,0,0-26,26v42h18a6,6,0,0,1,0,12H134v42a26,26,0,0,0,26,26h16A6,6,0,0,1,182,208Z"/>`
  ],
  [
    "regular",
    r`<path d="M184,208a8,8,0,0,1-8,8H160a40,40,0,0,1-32-16,40,40,0,0,1-32,16H80a8,8,0,0,1,0-16H96a24,24,0,0,0,24-24V136H104a8,8,0,0,1,0-16h16V80A24,24,0,0,0,96,56H80a8,8,0,0,1,0-16H96a40,40,0,0,1,32,16,40,40,0,0,1,32-16h16a8,8,0,0,1,0,16H160a24,24,0,0,0-24,24v40h16a8,8,0,0,1,0,16H136v40a24,24,0,0,0,24,24h16A8,8,0,0,1,184,208Z"/>`
  ],
  [
    "bold",
    r`<path d="M188,208a12,12,0,0,1-12,12H160a43.86,43.86,0,0,1-32-13.85A43.86,43.86,0,0,1,96,220H80a12,12,0,0,1,0-24H96a20,20,0,0,0,20-20V140H104a12,12,0,0,1,0-24h12V80A20,20,0,0,0,96,60H80a12,12,0,0,1,0-24H96a43.86,43.86,0,0,1,32,13.85A43.86,43.86,0,0,1,160,36h16a12,12,0,0,1,0,24H160a20,20,0,0,0-20,20v36h12a12,12,0,0,1,0,24H140v36a20,20,0,0,0,20,20h16A12,12,0,0,1,188,208Z"/>`
  ],
  [
    "fill",
    r`<path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm-64,88a8,8,0,0,1,0,16h-8v24a16,16,0,0,0,16,16h8a8,8,0,0,1,0,16h-8a31.92,31.92,0,0,1-24-10.87A31.92,31.92,0,0,1,104,192H96a8,8,0,0,1,0-16h8a16,16,0,0,0,16-16V136h-8a8,8,0,0,1,0-16h8V96a16,16,0,0,0-16-16H96a8,8,0,0,1,0-16h8a31.92,31.92,0,0,1,24,10.87A31.92,31.92,0,0,1,152,64h8a8,8,0,0,1,0,16h-8a16,16,0,0,0-16,16v24Z"/>`
  ],
  [
    "duotone",
    r`<path d="M176,48V208H160a32,32,0,0,1-32-32,32,32,0,0,1-32,32H80V48H96a32,32,0,0,1,32,32,32,32,0,0,1,32-32Z" opacity="0.2"/><path d="M184,208a8,8,0,0,1-8,8H160a40,40,0,0,1-32-16,40,40,0,0,1-32,16H80a8,8,0,0,1,0-16H96a24,24,0,0,0,24-24V136H104a8,8,0,0,1,0-16h16V80A24,24,0,0,0,96,56H80a8,8,0,0,1,0-16H96a40,40,0,0,1,32,16,40,40,0,0,1,32-16h16a8,8,0,0,1,0,16H160a24,24,0,0,0-24,24v40h16a8,8,0,0,1,0,16H136v40a24,24,0,0,0,24,24h16A8,8,0,0,1,184,208Z"/>`
  ]
]);
a.styles = g`
    :host {
      display: contents;
    }
  `;
h([
  H({ type: String, reflect: !0 })
], a.prototype, "size", 2);
h([
  H({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
h([
  H({ type: String, reflect: !0 })
], a.prototype, "color", 2);
h([
  H({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = h([
  v("ph-cursor-text")
], a);
export {
  a as PhCursorText
};
