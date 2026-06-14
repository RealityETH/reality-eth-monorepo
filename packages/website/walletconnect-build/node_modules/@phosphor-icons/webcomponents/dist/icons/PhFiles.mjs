import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as p } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as A } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as m } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as H } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var n = Object.defineProperty, c = Object.getOwnPropertyDescriptor, h = (r, s, o, l) => {
  for (var t = l > 1 ? void 0 : l ? c(s, o) : s, V = r.length - 1, i; V >= 0; V--)
    (i = r[V]) && (t = (l ? i(s, o, t) : i(t)) || t);
  return l && t && n(s, o, t), t;
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
    e`<path d="M210.83,69.17l-40-40A4,4,0,0,0,168,28H88A12,12,0,0,0,76,40V60H56A12,12,0,0,0,44,72V216a12,12,0,0,0,12,12H168a12,12,0,0,0,12-12V196h20a12,12,0,0,0,12-12V72A4,4,0,0,0,210.83,69.17ZM172,216a4,4,0,0,1-4,4H56a4,4,0,0,1-4-4V72a4,4,0,0,1,4-4h78.34L172,105.66Zm32-32a4,4,0,0,1-4,4H180V104a4,4,0,0,0-1.17-2.83l-40-40A4,4,0,0,0,136,60H84V40a4,4,0,0,1,4-4h78.34L204,73.66Zm-64-32a4,4,0,0,1-4,4H88a4,4,0,0,1,0-8h48A4,4,0,0,1,140,152Zm0,32a4,4,0,0,1-4,4H88a4,4,0,0,1,0-8h48A4,4,0,0,1,140,184Z"/>`
  ],
  [
    "light",
    e`<path d="M212.24,67.76l-40-40A6,6,0,0,0,168,26H88A14,14,0,0,0,74,40V58H56A14,14,0,0,0,42,72V216a14,14,0,0,0,14,14H168a14,14,0,0,0,14-14V198h18a14,14,0,0,0,14-14V72A6,6,0,0,0,212.24,67.76ZM170,216a2,2,0,0,1-2,2H56a2,2,0,0,1-2-2V72a2,2,0,0,1,2-2h77.51L170,106.49Zm32-32a2,2,0,0,1-2,2H182V104a6,6,0,0,0-1.76-4.24l-40-40A6,6,0,0,0,136,58H86V40a2,2,0,0,1,2-2h77.51L202,74.49Zm-60-32a6,6,0,0,1-6,6H88a6,6,0,0,1,0-12h48A6,6,0,0,1,142,152Zm0,32a6,6,0,0,1-6,6H88a6,6,0,0,1,0-12h48A6,6,0,0,1,142,184Z"/>`
  ],
  [
    "regular",
    e`<path d="M213.66,66.34l-40-40A8,8,0,0,0,168,24H88A16,16,0,0,0,72,40V56H56A16,16,0,0,0,40,72V216a16,16,0,0,0,16,16H168a16,16,0,0,0,16-16V200h16a16,16,0,0,0,16-16V72A8,8,0,0,0,213.66,66.34ZM168,216H56V72h76.69L168,107.31v84.53c0,.06,0,.11,0,.16s0,.1,0,.16V216Zm32-32H184V104a8,8,0,0,0-2.34-5.66l-40-40A8,8,0,0,0,136,56H88V40h76.69L200,75.31Zm-56-32a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h48A8,8,0,0,1,144,152Zm0,32a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h48A8,8,0,0,1,144,184Z"/>`
  ],
  [
    "bold",
    e`<path d="M220.49,59.51l-40-40A12,12,0,0,0,172,16H92A20,20,0,0,0,72,36V56H56A20,20,0,0,0,36,76V216a20,20,0,0,0,20,20H164a20,20,0,0,0,20-20V196h20a20,20,0,0,0,20-20V68A12,12,0,0,0,220.49,59.51ZM160,212H60V80h67l33,33Zm40-40H184V108a12,12,0,0,0-3.51-8.49l-40-40A12,12,0,0,0,132,56H96V40h71l33,33Zm-56-28a12,12,0,0,1-12,12H88a12,12,0,0,1,0-24h44A12,12,0,0,1,144,144Zm0,40a12,12,0,0,1-12,12H88a12,12,0,0,1,0-24h44A12,12,0,0,1,144,184Z"/>`
  ],
  [
    "fill",
    e`<path d="M213.66,66.34l-40-40A8,8,0,0,0,168,24H88A16,16,0,0,0,72,40V56H56A16,16,0,0,0,40,72V216a16,16,0,0,0,16,16H168a16,16,0,0,0,16-16V200h16a16,16,0,0,0,16-16V72A8,8,0,0,0,213.66,66.34ZM136,192H88a8,8,0,0,1,0-16h48a8,8,0,0,1,0,16Zm0-32H88a8,8,0,0,1,0-16h48a8,8,0,0,1,0,16Zm64,24H184V104a8,8,0,0,0-2.34-5.66l-40-40A8,8,0,0,0,136,56H88V40h76.69L200,75.31Z"/>`
  ],
  [
    "duotone",
    e`<path d="M208,72V184a8,8,0,0,1-8,8H176V104L136,64H80V40a8,8,0,0,1,8-8h80Z" opacity="0.2"/><path d="M213.66,66.34l-40-40A8,8,0,0,0,168,24H88A16,16,0,0,0,72,40V56H56A16,16,0,0,0,40,72V216a16,16,0,0,0,16,16H168a16,16,0,0,0,16-16V200h16a16,16,0,0,0,16-16V72A8,8,0,0,0,213.66,66.34ZM168,216H56V72h76.69L168,107.31v84.53c0,.06,0,.11,0,.16s0,.1,0,.16V216Zm32-32H184V104a8,8,0,0,0-2.34-5.66l-40-40A8,8,0,0,0,136,56H88V40h76.69L200,75.31Zm-56-32a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h48A8,8,0,0,1,144,152Zm0,32a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h48A8,8,0,0,1,144,184Z"/>`
  ]
]);
a.styles = Z`
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
  m("ph-files")
], a);
export {
  a as PhFiles
};
