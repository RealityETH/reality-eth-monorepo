import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as h } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var c = Object.defineProperty, A = Object.getOwnPropertyDescriptor, s = (a, o, H, i) => {
  for (var r = i > 1 ? void 0 : i ? A(o, H) : o, l = a.length - 1, V; l >= 0; l--)
    (V = a[l]) && (r = (i ? V(o, H, r) : V(r)) || r);
  return i && r && c(o, H, r), r;
};
let t = class extends m {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return h`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((a = this.weight) != null ? a : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    e`<path d="M184,76H40A12,12,0,0,0,28,88V200a12,12,0,0,0,12,12H184a12,12,0,0,0,12-12V88A12,12,0,0,0,184,76Zm4,124a4,4,0,0,1-4,4H40a4,4,0,0,1-4-4V88a4,4,0,0,1,4-4H184a4,4,0,0,1,4,4ZM228,56V176a4,4,0,0,1-8,0V56a4,4,0,0,0-4-4H64a4,4,0,0,1,0-8H216A12,12,0,0,1,228,56Z"/>`
  ],
  [
    "light",
    e`<path d="M184,74H40A14,14,0,0,0,26,88V200a14,14,0,0,0,14,14H184a14,14,0,0,0,14-14V88A14,14,0,0,0,184,74Zm2,126a2,2,0,0,1-2,2H40a2,2,0,0,1-2-2V88a2,2,0,0,1,2-2H184a2,2,0,0,1,2,2ZM230,56V176a6,6,0,0,1-12,0V56a2,2,0,0,0-2-2H64a6,6,0,0,1,0-12H216A14,14,0,0,1,230,56Z"/>`
  ],
  [
    "regular",
    e`<path d="M184,72H40A16,16,0,0,0,24,88V200a16,16,0,0,0,16,16H184a16,16,0,0,0,16-16V88A16,16,0,0,0,184,72Zm0,128H40V88H184V200ZM232,56V176a8,8,0,0,1-16,0V56H64a8,8,0,0,1,0-16H216A16,16,0,0,1,232,56Z"/>`
  ],
  [
    "bold",
    e`<path d="M180,72H36A20,20,0,0,0,16,92V204a20,20,0,0,0,20,20H180a20,20,0,0,0,20-20V92A20,20,0,0,0,180,72Zm-4,128H40V96H176ZM240,52V176a12,12,0,0,1-24,0V56H64a12,12,0,0,1,0-24H220A20,20,0,0,1,240,52Z"/>`
  ],
  [
    "fill",
    e`<path d="M200,88V200a16,16,0,0,1-16,16H40a16,16,0,0,1-16-16V88A16,16,0,0,1,40,72H184A16,16,0,0,1,200,88Zm16-48H64a8,8,0,0,0,0,16H216V176a8,8,0,0,0,16,0V56A16,16,0,0,0,216,40Z"/>`
  ],
  [
    "duotone",
    e`<path d="M192,88V200a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V88a8,8,0,0,1,8-8H184A8,8,0,0,1,192,88Z" opacity="0.2"/><path d="M184,72H40A16,16,0,0,0,24,88V200a16,16,0,0,0,16,16H184a16,16,0,0,0,16-16V88A16,16,0,0,0,184,72Zm0,128H40V88H184V200ZM232,56V176a8,8,0,0,1-16,0V56H64a8,8,0,0,1,0-16H216A16,16,0,0,1,232,56Z"/>`
  ]
]);
t.styles = g`
    :host {
      display: contents;
    }
  `;
s([
  p({ type: String, reflect: !0 })
], t.prototype, "size", 2);
s([
  p({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
s([
  p({ type: String, reflect: !0 })
], t.prototype, "color", 2);
s([
  p({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = s([
  n("ph-cards")
], t);
export {
  t as PhCards
};
