import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as H } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as o } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var M = Object.defineProperty, g = Object.getOwnPropertyDescriptor, V = (e, s, i, l) => {
  for (var t = l > 1 ? void 0 : l ? g(s, i) : s, h = e.length - 1, p; h >= 0; h--)
    (p = e[h]) && (t = (l ? p(s, i, t) : p(t)) || t);
  return l && t && M(s, i, t), t;
};
let a = class extends m {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return H`<svg
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
    r`<path d="M184,20H72A12,12,0,0,0,60,32V77.33a12.05,12.05,0,0,0,2.4,7.2l20.8,27.74a4,4,0,0,1,.8,2.4V224a12,12,0,0,0,12,12h64a12,12,0,0,0,12-12V114.67a4,4,0,0,1,.8-2.4l20.8-27.74a12.05,12.05,0,0,0,2.4-7.2V32A12,12,0,0,0,184,20ZM72,28H184a4,4,0,0,1,4,4V60H68V32A4,4,0,0,1,72,28ZM187.2,79.73l-20.8,27.74a12.05,12.05,0,0,0-2.4,7.2V224a4,4,0,0,1-4,4H96a4,4,0,0,1-4-4V114.67a12.05,12.05,0,0,0-2.4-7.2L68.8,79.73a4,4,0,0,1-.8-2.4V68H188v9.33A4,4,0,0,1,187.2,79.73ZM132,120v32a4,4,0,0,1-8,0V120a4,4,0,0,1,8,0Z"/>`
  ],
  [
    "light",
    r`<path d="M184,18H72A14,14,0,0,0,58,32V77.33a14,14,0,0,0,2.8,8.4l20.8,27.73a2,2,0,0,1,.4,1.21V224a14,14,0,0,0,14,14h64a14,14,0,0,0,14-14V114.67a2,2,0,0,1,.4-1.2l20.8-27.74a14,14,0,0,0,2.8-8.4V32A14,14,0,0,0,184,18ZM72,30H184a2,2,0,0,1,2,2V58H70V32A2,2,0,0,1,72,30ZM185.6,78.53l-20.8,27.74a14,14,0,0,0-2.8,8.4V224a2,2,0,0,1-2,2H96a2,2,0,0,1-2-2V114.67a14,14,0,0,0-2.8-8.4L70.4,78.54a2,2,0,0,1-.4-1.21V70H186v7.33A2,2,0,0,1,185.6,78.53ZM134,120v32a6,6,0,0,1-12,0V120a6,6,0,0,1,12,0Z"/>`
  ],
  [
    "regular",
    r`<path d="M184,16H72A16,16,0,0,0,56,32V77.33a16.12,16.12,0,0,0,3.2,9.6L80,114.67V224a16,16,0,0,0,16,16h64a16,16,0,0,0,16-16V114.67l20.8-27.74a16.12,16.12,0,0,0,3.2-9.6V32A16,16,0,0,0,184,16ZM72,32H184V56H72V32Zm91.2,73.07a16.12,16.12,0,0,0-3.2,9.6V224H96V114.67a16.12,16.12,0,0,0-3.2-9.6L72,77.33V72H184v5.33ZM136,120v32a8,8,0,0,1-16,0V120a8,8,0,0,1,16,0Z"/>`
  ],
  [
    "bold",
    r`<path d="M184,12H72A20,20,0,0,0,52,32V77.33a20.12,20.12,0,0,0,4,12L76,116V224a20,20,0,0,0,20,20h64a20,20,0,0,0,20-20V116l20-26.67a20.12,20.12,0,0,0,4-12V32A20,20,0,0,0,184,12Zm-4,24V52H76V36Zm-20,66.67a20.12,20.12,0,0,0-4,12V220H100V114.67a20.12,20.12,0,0,0-4-12L76,76H180ZM140,120v32a12,12,0,0,1-24,0V120a12,12,0,0,1,24,0Z"/>`
  ],
  [
    "fill",
    r`<path d="M184,16H72A16,16,0,0,0,56,32V77.33a16.12,16.12,0,0,0,3.2,9.6L80,114.67V224a16,16,0,0,0,16,16h64a16,16,0,0,0,16-16V114.67l20.8-27.74a16.12,16.12,0,0,0,3.2-9.6V32A16,16,0,0,0,184,16ZM136,152a8,8,0,0,1-16,0V120a8,8,0,0,1,16,0ZM72,56V32H184V56Z"/>`
  ],
  [
    "duotone",
    r`<path d="M192,64V77.33a8,8,0,0,1-1.6,4.8l-20.8,27.74a8,8,0,0,0-1.6,4.8V224a8,8,0,0,1-8,8H96a8,8,0,0,1-8-8V114.67a8,8,0,0,0-1.6-4.8L65.6,82.13a8,8,0,0,1-1.6-4.8V64Z" opacity="0.2"/><path d="M184,16H72A16,16,0,0,0,56,32V77.33a16.12,16.12,0,0,0,3.2,9.6L80,114.67V224a16,16,0,0,0,16,16h64a16,16,0,0,0,16-16V114.67l20.8-27.74a16.12,16.12,0,0,0,3.2-9.6V32A16,16,0,0,0,184,16ZM72,32H184V56H72V32Zm91.2,73.07a16.12,16.12,0,0,0-3.2,9.6V224H96V114.67a16.12,16.12,0,0,0-3.2-9.6L72,77.33V72H184v5.33ZM136,120v32a8,8,0,0,1-16,0V120a8,8,0,0,1,16,0Z"/>`
  ]
]);
a.styles = n`
    :host {
      display: contents;
    }
  `;
V([
  o({ type: String, reflect: !0 })
], a.prototype, "size", 2);
V([
  o({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
V([
  o({ type: String, reflect: !0 })
], a.prototype, "color", 2);
V([
  o({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = V([
  Z("ph-flashlight")
], a);
export {
  a as PhFlashlight
};
