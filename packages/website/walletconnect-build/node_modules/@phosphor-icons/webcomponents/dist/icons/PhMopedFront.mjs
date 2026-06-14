import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as v } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var M = Object.defineProperty, V = Object.getOwnPropertyDescriptor, o = (e, s, h, p) => {
  for (var t = p > 1 ? void 0 : p ? V(s, h) : s, H = e.length - 1, l; H >= 0; H--)
    (l = e[H]) && (t = (p ? l(s, h, t) : l(t)) || t);
  return p && t && M(s, h, t), t;
};
let a = class extends m {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return v`<svg
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
    r`<path d="M208,44H163.77a36,36,0,0,0-71.54,0H48a4,4,0,0,0,0,8H92.23a36.06,36.06,0,0,0,17.34,26.91A60.11,60.11,0,0,0,68,136v64a12,12,0,0,0,12,12h20v4a28,28,0,0,0,56,0v-4h20a12,12,0,0,0,12-12V136a60.11,60.11,0,0,0-41.57-57.09A36.06,36.06,0,0,0,163.77,52H208a4,4,0,0,0,0-8ZM148,216a20,20,0,0,1-40,0V168a20,20,0,0,1,40,0Zm32-80v64a4,4,0,0,1-4,4H156V168a28,28,0,0,0-56,0v36H80a4,4,0,0,1-4-4V136a52,52,0,0,1,104,0ZM128,76a28,28,0,1,1,28-28A28,28,0,0,1,128,76Z"/>`
  ],
  [
    "light",
    r`<path d="M208,42H165.52a38,38,0,0,0-75,0H48a6,6,0,0,0,0,12H90.48a38,38,0,0,0,14.71,24.37A62.09,62.09,0,0,0,66,136v64a14,14,0,0,0,14,14H98v2a30,30,0,0,0,60,0v-2h18a14,14,0,0,0,14-14V136a62.09,62.09,0,0,0-39.19-57.63A38,38,0,0,0,165.52,54H208a6,6,0,0,0,0-12ZM146,216a18,18,0,0,1-36,0V168a18,18,0,0,1,36,0Zm32-80v64a2,2,0,0,1-2,2H158V168a30,30,0,0,0-60,0v34H80a2,2,0,0,1-2-2V136a50,50,0,0,1,100,0ZM128,74a26,26,0,1,1,26-26A26,26,0,0,1,128,74Z"/>`
  ],
  [
    "regular",
    r`<path d="M208,40H167.2a40,40,0,0,0-78.4,0H48a8,8,0,0,0,0,16H88.8a40,40,0,0,0,12.58,21.82A64.08,64.08,0,0,0,64,136v64a16,16,0,0,0,16,16H96a32,32,0,0,0,64,0h16a16,16,0,0,0,16-16V136a64.08,64.08,0,0,0-37.38-58.18A40,40,0,0,0,167.2,56H208a8,8,0,0,0,0-16ZM144,216a16,16,0,0,1-32,0V168a16,16,0,0,1,32,0Zm32-80v64H160V168a32,32,0,0,0-64,0v32H80V136a48,48,0,0,1,96,0ZM104,48a24,24,0,1,1,24,24A24,24,0,0,1,104,48Z"/>`
  ],
  [
    "bold",
    r`<path d="M208,36H170.32a44,44,0,0,0-84.64,0H48a12,12,0,0,0,0,24H85.68a43.89,43.89,0,0,0,9,16.73A68,68,0,0,0,60,136v64a20,20,0,0,0,20,20H96a32,32,0,0,0,64,0h16a20,20,0,0,0,20-20V136a68,68,0,0,0-34.72-59.27,43.89,43.89,0,0,0,9-16.73H208a12,12,0,0,0,0-24ZM136,220a8,8,0,0,1-16,0V164a8,8,0,0,1,16,0Zm36-24H160V164a32,32,0,0,0-64,0v32H84V136a44,44,0,0,1,88,0ZM108,48a20,20,0,1,1,20,20A20,20,0,0,1,108,48Z"/>`
  ],
  [
    "fill",
    r`<path d="M208,40H167.2a40,40,0,0,0-78.4,0H48a8,8,0,0,0,0,16H88.8a40,40,0,0,0,12.58,21.82A64.08,64.08,0,0,0,64,136v64a16,16,0,0,0,16,16H96a32,32,0,0,0,64,0h16a16,16,0,0,0,16-16V136a64.08,64.08,0,0,0-37.38-58.18A40,40,0,0,0,167.2,56H208a8,8,0,0,0,0-16ZM144,216a16,16,0,0,1-32,0V168a16,16,0,0,1,32,0ZM128,72a24,24,0,1,1,24-24A24,24,0,0,1,128,72Z"/>`
  ],
  [
    "duotone",
    r`<path d="M152,168v48a24,24,0,0,1-48,0V168a24,24,0,0,1,48,0ZM128,80A32,32,0,1,0,96,48,32,32,0,0,0,128,80Z" opacity="0.2"/><path d="M208,40H167.2a40,40,0,0,0-78.4,0H48a8,8,0,0,0,0,16H88.8a40,40,0,0,0,12.58,21.82A64.08,64.08,0,0,0,64,136v64a16,16,0,0,0,16,16H96a32,32,0,0,0,64,0h16a16,16,0,0,0,16-16V136a64.08,64.08,0,0,0-37.38-58.18A40,40,0,0,0,167.2,56H208a8,8,0,0,0,0-16ZM144,216a16,16,0,0,1-32,0V168a16,16,0,0,1,32,0Zm32-80v64H160V168a32,32,0,0,0-64,0v32H80V136a48,48,0,0,1,96,0ZM104,48a24,24,0,1,1,24,24A24,24,0,0,1,104,48Z"/>`
  ]
]);
a.styles = Z`
    :host {
      display: contents;
    }
  `;
o([
  i({ type: String, reflect: !0 })
], a.prototype, "size", 2);
o([
  i({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
o([
  i({ type: String, reflect: !0 })
], a.prototype, "color", 2);
o([
  i({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = o([
  n("ph-moped-front")
], a);
export {
  a as PhMopedFront
};
