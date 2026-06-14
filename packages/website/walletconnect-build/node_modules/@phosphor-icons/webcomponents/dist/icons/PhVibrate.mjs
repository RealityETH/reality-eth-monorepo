import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as v } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as Z } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as l } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as M } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var n = Object.defineProperty, g = Object.getOwnPropertyDescriptor, o = (e, s, V, h) => {
  for (var t = h > 1 ? void 0 : h ? g(s, V) : s, p = e.length - 1, m; p >= 0; p--)
    (m = e[p]) && (t = (h ? m(s, V, t) : m(t)) || t);
  return h && t && n(s, V, t), t;
};
let a = class extends Z {
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
    r`<path d="M160,36H96A20,20,0,0,0,76,56V200a20,20,0,0,0,20,20h64a20,20,0,0,0,20-20V56A20,20,0,0,0,160,36Zm12,164a12,12,0,0,1-12,12H96a12,12,0,0,1-12-12V56A12,12,0,0,1,96,44h64a12,12,0,0,1,12,12ZM212,88v80a4,4,0,0,1-8,0V88a4,4,0,0,1,8,0Zm32,16v48a4,4,0,0,1-8,0V104a4,4,0,0,1,8,0ZM52,88v80a4,4,0,0,1-8,0V88a4,4,0,0,1,8,0ZM20,104v48a4,4,0,0,1-8,0V104a4,4,0,0,1,8,0Z"/>`
  ],
  [
    "light",
    r`<path d="M160,34H96A22,22,0,0,0,74,56V200a22,22,0,0,0,22,22h64a22,22,0,0,0,22-22V56A22,22,0,0,0,160,34Zm10,166a10,10,0,0,1-10,10H96a10,10,0,0,1-10-10V56A10,10,0,0,1,96,46h64a10,10,0,0,1,10,10ZM214,88v80a6,6,0,0,1-12,0V88a6,6,0,0,1,12,0Zm32,16v48a6,6,0,0,1-12,0V104a6,6,0,0,1,12,0ZM54,88v80a6,6,0,0,1-12,0V88a6,6,0,0,1,12,0ZM22,104v48a6,6,0,0,1-12,0V104a6,6,0,0,1,12,0Z"/>`
  ],
  [
    "regular",
    r`<path d="M160,32H96A24,24,0,0,0,72,56V200a24,24,0,0,0,24,24h64a24,24,0,0,0,24-24V56A24,24,0,0,0,160,32Zm8,168a8,8,0,0,1-8,8H96a8,8,0,0,1-8-8V56a8,8,0,0,1,8-8h64a8,8,0,0,1,8,8ZM216,88v80a8,8,0,0,1-16,0V88a8,8,0,0,1,16,0Zm32,16v48a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0ZM56,88v80a8,8,0,0,1-16,0V88a8,8,0,0,1,16,0ZM24,104v48a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"/>`
  ],
  [
    "bold",
    r`<path d="M164,28H92A28,28,0,0,0,64,56V200a28,28,0,0,0,28,28h72a28,28,0,0,0,28-28V56A28,28,0,0,0,164,28Zm4,172a4,4,0,0,1-4,4H92a4,4,0,0,1-4-4V56a4,4,0,0,1,4-4h72a4,4,0,0,1,4,4Zm64-100v56a12,12,0,0,1-24,0V100a12,12,0,0,1,24,0ZM48,100v56a12,12,0,0,1-24,0V100a12,12,0,0,1,24,0Z"/>`
  ],
  [
    "fill",
    r`<path d="M184,56V200a24,24,0,0,1-24,24H96a24,24,0,0,1-24-24V56A24,24,0,0,1,96,32h64A24,24,0,0,1,184,56Zm24,24a8,8,0,0,0-8,8v80a8,8,0,0,0,16,0V88A8,8,0,0,0,208,80Zm32,16a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V104A8,8,0,0,0,240,96ZM48,80a8,8,0,0,0-8,8v80a8,8,0,0,0,16,0V88A8,8,0,0,0,48,80ZM16,96a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V104A8,8,0,0,0,16,96Z"/>`
  ],
  [
    "duotone",
    r`<path d="M176,56V200a16,16,0,0,1-16,16H96a16,16,0,0,1-16-16V56A16,16,0,0,1,96,40h64A16,16,0,0,1,176,56Z" opacity="0.2"/><path d="M160,32H96A24,24,0,0,0,72,56V200a24,24,0,0,0,24,24h64a24,24,0,0,0,24-24V56A24,24,0,0,0,160,32Zm8,168a8,8,0,0,1-8,8H96a8,8,0,0,1-8-8V56a8,8,0,0,1,8-8h64a8,8,0,0,1,8,8ZM216,88v80a8,8,0,0,1-16,0V88a8,8,0,0,1,16,0Zm32,16v48a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0ZM56,88v80a8,8,0,0,1-16,0V88a8,8,0,0,1,16,0ZM24,104v48a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"/>`
  ]
]);
a.styles = M`
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
  l("ph-vibrate")
], a);
export {
  a as PhVibrate
};
