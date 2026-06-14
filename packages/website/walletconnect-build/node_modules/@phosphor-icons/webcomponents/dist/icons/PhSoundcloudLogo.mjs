import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as V } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as A } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var v = Object.defineProperty, g = Object.getOwnPropertyDescriptor, o = (e, s, h, i) => {
  for (var t = i > 1 ? void 0 : i ? g(s, h) : s, m = e.length - 1, l; m >= 0; m--)
    (l = e[m]) && (t = (i ? l(s, h, t) : l(t)) || t);
  return i && t && v(s, h, t), t;
};
let a = class extends A {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return V`<svg
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
    r`<path d="M20,120v48a4,4,0,0,1-8,0V120a4,4,0,0,1,8,0ZM48,92a4,4,0,0,0-4,4v96a4,4,0,0,0,8,0V96A4,4,0,0,0,48,92Zm32-8a4,4,0,0,0-4,4V192a4,4,0,0,0,8,0V88A4,4,0,0,0,80,84Zm32-32a4,4,0,0,0-4,4V192a4,4,0,0,0,8,0V56A4,4,0,0,0,112,52Zm107.27,57.46A76,76,0,0,0,144,44a4,4,0,0,0,0,8,67.75,67.75,0,0,1,67.66,61.13,4,4,0,0,0,3.22,3.53A36,36,0,0,1,208,188H144a4,4,0,0,0,0,8h64a44,44,0,0,0,11.27-86.54Z"/>`
  ],
  [
    "light",
    r`<path d="M22,120v48a6,6,0,0,1-12,0V120a6,6,0,0,1,12,0ZM48,90a6,6,0,0,0-6,6v96a6,6,0,0,0,12,0V96A6,6,0,0,0,48,90Zm32-8a6,6,0,0,0-6,6V192a6,6,0,0,0,12,0V88A6,6,0,0,0,80,82Zm32-32a6,6,0,0,0-6,6V192a6,6,0,0,0,12,0V56A6,6,0,0,0,112,50Zm109.06,57.88A78,78,0,0,0,144,42a6,6,0,0,0,0,12,65.75,65.75,0,0,1,65.67,59.33,6,6,0,0,0,4.83,5.29A34,34,0,0,1,208,186H144a6,6,0,0,0,0,12h64a46,46,0,0,0,13.06-90.12Z"/>`
  ],
  [
    "regular",
    r`<path d="M24,120v48a8,8,0,0,1-16,0V120a8,8,0,0,1,16,0ZM48,88a8,8,0,0,0-8,8v96a8,8,0,0,0,16,0V96A8,8,0,0,0,48,88Zm32-8a8,8,0,0,0-8,8V192a8,8,0,0,0,16,0V88A8,8,0,0,0,80,80Zm32-32a8,8,0,0,0-8,8V192a8,8,0,0,0,16,0V56A8,8,0,0,0,112,48Zm110.84,58.34A80,80,0,0,0,144,40a8,8,0,0,0,0,16,63.76,63.76,0,0,1,63.68,57.53,8,8,0,0,0,6.44,7A32,32,0,0,1,208,184H144a8,8,0,0,0,0,16h64a48,48,0,0,0,14.84-93.66Z"/>`
  ],
  [
    "bold",
    r`<path d="M32,120v48a12,12,0,0,1-24,0V120a12,12,0,0,1,24,0ZM60,84A12,12,0,0,0,48,96v96a12,12,0,0,0,24,0V96A12,12,0,0,0,60,84Zm40-40A12,12,0,0,0,88,56V192a12,12,0,0,0,24,0V56A12,12,0,0,0,100,44Zm122.34,59.33A84,84,0,0,0,140,36a12,12,0,0,0,0,24,59.78,59.78,0,0,1,59.7,53.93,12,12,0,0,0,9.66,10.58A28,28,0,0,1,204,180H140a12,12,0,0,0,0,24h64a52,52,0,0,0,18.34-100.67Z"/>`
  ],
  [
    "fill",
    r`<path d="M24,120v48a8,8,0,0,1-16,0V120a8,8,0,0,1,16,0ZM48,88a8,8,0,0,0-8,8v96a8,8,0,0,0,16,0V96A8,8,0,0,0,48,88Zm32-8a8,8,0,0,0-8,8V192a8,8,0,0,0,16,0V88A8,8,0,0,0,80,80Zm32-32a8,8,0,0,0-8,8V192a8,8,0,0,0,16,0V56A8,8,0,0,0,112,48Zm110.84,58.34A80,80,0,0,0,144,40h-4a4,4,0,0,0-4,4V196a4,4,0,0,0,4,4h67.21c25.58,0,47.27-19.72,48.71-45.26A48.06,48.06,0,0,0,222.84,106.34Z"/>`
  ],
  [
    "duotone",
    r`<path d="M248,152a40,40,0,0,1-40,40H144V48a72,72,0,0,1,71.64,64.73A40,40,0,0,1,248,152Z" opacity="0.2"/><path d="M24,120v48a8,8,0,0,1-16,0V120a8,8,0,0,1,16,0ZM48,88a8,8,0,0,0-8,8v96a8,8,0,0,0,16,0V96A8,8,0,0,0,48,88Zm32-8a8,8,0,0,0-8,8V192a8,8,0,0,0,16,0V88A8,8,0,0,0,80,80Zm32-32a8,8,0,0,0-8,8V192a8,8,0,0,0,16,0V56A8,8,0,0,0,112,48Zm110.84,58.34A80,80,0,0,0,144,40a8,8,0,0,0,0,16,63.76,63.76,0,0,1,63.68,57.53,8,8,0,0,0,6.44,7A32,32,0,0,1,208,184H144a8,8,0,0,0,0,16h64a48,48,0,0,0,14.84-93.66Z"/>`
  ]
]);
a.styles = n`
    :host {
      display: contents;
    }
  `;
o([
  p({ type: String, reflect: !0 })
], a.prototype, "size", 2);
o([
  p({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
o([
  p({ type: String, reflect: !0 })
], a.prototype, "color", 2);
o([
  p({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = o([
  Z("ph-soundcloud-logo")
], a);
export {
  a as PhSoundcloudLogo
};
