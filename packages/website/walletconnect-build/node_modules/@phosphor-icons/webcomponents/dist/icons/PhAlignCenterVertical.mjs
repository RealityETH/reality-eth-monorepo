import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as l } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as v } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as m } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as H } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var g = Object.defineProperty, c = Object.getOwnPropertyDescriptor, h = (r, o, i, s) => {
  for (var t = s > 1 ? void 0 : s ? c(o, i) : o, p = r.length - 1, V; p >= 0; p--)
    (V = r[p]) && (t = (s ? V(o, i, t) : V(t)) || t);
  return s && t && g(o, i, t), t;
};
let a = class extends v {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var r;
    return l`<svg
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
    e`<path d="M224,124H204V72a12,12,0,0,0-12-12H152a12,12,0,0,0-12,12v52H116V48a12,12,0,0,0-12-12H64A12,12,0,0,0,52,48v76H32a4,4,0,0,0,0,8H52v76a12,12,0,0,0,12,12h40a12,12,0,0,0,12-12V132h24v52a12,12,0,0,0,12,12h40a12,12,0,0,0,12-12V132h20a4,4,0,0,0,0-8ZM108,208a4,4,0,0,1-4,4H64a4,4,0,0,1-4-4V48a4,4,0,0,1,4-4h40a4,4,0,0,1,4,4Zm88-24a4,4,0,0,1-4,4H152a4,4,0,0,1-4-4V72a4,4,0,0,1,4-4h40a4,4,0,0,1,4,4Z"/>`
  ],
  [
    "light",
    e`<path d="M224,122H206V72a14,14,0,0,0-14-14H152a14,14,0,0,0-14,14v50H118V48a14,14,0,0,0-14-14H64A14,14,0,0,0,50,48v74H32a6,6,0,0,0,0,12H50v74a14,14,0,0,0,14,14h40a14,14,0,0,0,14-14V134h20v50a14,14,0,0,0,14,14h40a14,14,0,0,0,14-14V134h18a6,6,0,0,0,0-12ZM106,208a2,2,0,0,1-2,2H64a2,2,0,0,1-2-2V48a2,2,0,0,1,2-2h40a2,2,0,0,1,2,2Zm88-24a2,2,0,0,1-2,2H152a2,2,0,0,1-2-2V72a2,2,0,0,1,2-2h40a2,2,0,0,1,2,2Z"/>`
  ],
  [
    "regular",
    e`<path d="M224,120H208V72a16,16,0,0,0-16-16H152a16,16,0,0,0-16,16v48H120V48a16,16,0,0,0-16-16H64A16,16,0,0,0,48,48v72H32a8,8,0,0,0,0,16H48v72a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16V136h16v48a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16V136h16a8,8,0,0,0,0-16ZM104,208H64V48h40Zm88-24H152V72h40Z"/>`
  ],
  [
    "bold",
    e`<path d="M224,116h-8V72a20,20,0,0,0-20-20H156a20,20,0,0,0-20,20v44H120V48a20,20,0,0,0-20-20H60A20,20,0,0,0,40,48v68H32a12,12,0,0,0,0,24h8v68a20,20,0,0,0,20,20h40a20,20,0,0,0,20-20V140h16v44a20,20,0,0,0,20,20h40a20,20,0,0,0,20-20V140h8a12,12,0,0,0,0-24ZM96,204H64V52H96Zm96-24H160V76h32Z"/>`
  ],
  [
    "fill",
    e`<path d="M232,128a8,8,0,0,1-8,8H208v48a16,16,0,0,1-16,16H152a16,16,0,0,1-16-16V136H120v72a16,16,0,0,1-16,16H64a16,16,0,0,1-16-16V136H32a8,8,0,0,1,0-16H48V48A16,16,0,0,1,64,32h40a16,16,0,0,1,16,16v72h16V72a16,16,0,0,1,16-16h40a16,16,0,0,1,16,16v48h16A8,8,0,0,1,232,128Z"/>`
  ],
  [
    "duotone",
    e`<path d="M200,72V184a8,8,0,0,1-8,8H152a8,8,0,0,1-8-8V72a8,8,0,0,1,8-8h40A8,8,0,0,1,200,72ZM104,40H64a8,8,0,0,0-8,8V208a8,8,0,0,0,8,8h40a8,8,0,0,0,8-8V48A8,8,0,0,0,104,40Z" opacity="0.2"/><path d="M224,120H208V72a16,16,0,0,0-16-16H152a16,16,0,0,0-16,16v48H120V48a16,16,0,0,0-16-16H64A16,16,0,0,0,48,48v72H32a8,8,0,0,0,0,16H48v72a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16V136h16v48a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16V136h16a8,8,0,0,0,0-16ZM104,208H64V48h40Zm88-24H152V72h40Z"/>`
  ]
]);
a.styles = n`
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
  m("ph-align-center-vertical")
], a);
export {
  a as PhAlignCenterVertical
};
