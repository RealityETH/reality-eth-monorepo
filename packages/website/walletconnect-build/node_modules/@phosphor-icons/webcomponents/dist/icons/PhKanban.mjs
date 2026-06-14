import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as p } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as Z } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as l } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as H } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as v } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var n = Object.defineProperty, g = Object.getOwnPropertyDescriptor, h = (e, o, V, s) => {
  for (var a = s > 1 ? void 0 : s ? g(o, V) : o, m = e.length - 1, i; m >= 0; m--)
    (i = e[m]) && (a = (s ? i(o, V, a) : i(a)) || a);
  return s && a && n(o, V, a), a;
};
let t = class extends Z {
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
      ${t.weightsMap.get((e = this.weight) != null ? e : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    r`<path d="M216,52H40a4,4,0,0,0-4,4V208a12,12,0,0,0,12,12H88a12,12,0,0,0,12-12V156h56v20a12,12,0,0,0,12,12h40a12,12,0,0,0,12-12V56A4,4,0,0,0,216,52ZM92,208a4,4,0,0,1-4,4H48a4,4,0,0,1-4-4V124H92Zm0-92H44V60H92Zm64,32H100V60h56Zm56,28a4,4,0,0,1-4,4H168a4,4,0,0,1-4-4V124h48Zm0-60H164V60h48Z"/>`
  ],
  [
    "light",
    r`<path d="M216,50H40a6,6,0,0,0-6,6V208a14,14,0,0,0,14,14H88a14,14,0,0,0,14-14V158h52v18a14,14,0,0,0,14,14h40a14,14,0,0,0,14-14V56A6,6,0,0,0,216,50Zm-6,64H166V62h44ZM90,62v52H46V62Zm0,146a2,2,0,0,1-2,2H48a2,2,0,0,1-2-2V126H90Zm12-62V62h52v84Zm106,32H168a2,2,0,0,1-2-2V126h44v50A2,2,0,0,1,208,178Z"/>`
  ],
  [
    "regular",
    r`<path d="M216,48H40a8,8,0,0,0-8,8V208a16,16,0,0,0,16,16H88a16,16,0,0,0,16-16V160h48v16a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16V56A8,8,0,0,0,216,48ZM88,208H48V128H88Zm0-96H48V64H88Zm64,32H104V64h48Zm56,32H168V128h40Zm0-64H168V64h40Z"/>`
  ],
  [
    "bold",
    r`<path d="M216,44H40A12,12,0,0,0,28,56V208a20,20,0,0,0,20,20H88a20,20,0,0,0,20-20V164h40v12a20,20,0,0,0,20,20h40a20,20,0,0,0,20-20V56A12,12,0,0,0,216,44Zm-12,64H172V68h32ZM84,68v40H52V68Zm0,136H52V132H84Zm24-64V68h40v72Zm64,32V132h32v40Z"/>`
  ],
  [
    "fill",
    r`<path d="M160,56v96a8,8,0,0,1-8,8H112a8,8,0,0,1-8-8V56a8,8,0,0,1,8-8h40A8,8,0,0,1,160,56Zm64-8H184a8,8,0,0,0-8,8v52a4,4,0,0,0,4,4h48a4,4,0,0,0,4-4V56A8,8,0,0,0,224,48Zm4,80H180a4,4,0,0,0-4,4v44a16,16,0,0,0,16,16h24a16,16,0,0,0,16-16V132A4,4,0,0,0,228,128ZM80,48H40a8,8,0,0,0-8,8v52a4,4,0,0,0,4,4H84a4,4,0,0,0,4-4V56A8,8,0,0,0,80,48Zm4,80H36a4,4,0,0,0-4,4v76a16,16,0,0,0,16,16H72a16,16,0,0,0,16-16V132A4,4,0,0,0,84,128Z"/>`
  ],
  [
    "duotone",
    r`<path d="M216,56v64H160V56ZM40,208a8,8,0,0,0,8,8H88a8,8,0,0,0,8-8V120H40Z" opacity="0.2"/><path d="M216,48H40a8,8,0,0,0-8,8V208a16,16,0,0,0,16,16H88a16,16,0,0,0,16-16V160h48v16a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16V56A8,8,0,0,0,216,48Zm-8,64H168V64h40ZM88,64v48H48V64Zm0,144H48V128H88Zm16-64V64h48v80Zm64,32V128h40v48Z"/>`
  ]
]);
t.styles = v`
    :host {
      display: contents;
    }
  `;
h([
  H({ type: String, reflect: !0 })
], t.prototype, "size", 2);
h([
  H({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
h([
  H({ type: String, reflect: !0 })
], t.prototype, "color", 2);
h([
  H({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = h([
  l("ph-kanban")
], t);
export {
  t as PhKanban
};
