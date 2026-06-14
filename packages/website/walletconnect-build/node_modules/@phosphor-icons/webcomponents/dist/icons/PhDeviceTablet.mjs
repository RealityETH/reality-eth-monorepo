import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as V } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as v } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as m } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as A } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var M = Object.defineProperty, Z = Object.getOwnPropertyDescriptor, o = (a, s, p, H) => {
  for (var e = H > 1 ? void 0 : H ? Z(s, p) : s, l = a.length - 1, h; l >= 0; l--)
    (h = a[l]) && (e = (H ? h(s, p, e) : h(e)) || e);
  return H && e && M(s, p, e), e;
};
let t = class extends v {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return V`<svg
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
    r`<path d="M192,28H64A20,20,0,0,0,44,48V208a20,20,0,0,0,20,20H192a20,20,0,0,0,20-20V48A20,20,0,0,0,192,28ZM52,68H204V188H52ZM64,36H192a12,12,0,0,1,12,12V60H52V48A12,12,0,0,1,64,36ZM192,220H64a12,12,0,0,1-12-12V196H204v12A12,12,0,0,1,192,220Z"/>`
  ],
  [
    "light",
    r`<path d="M192,26H64A22,22,0,0,0,42,48V208a22,22,0,0,0,22,22H192a22,22,0,0,0,22-22V48A22,22,0,0,0,192,26ZM54,70H202V186H54ZM64,38H192a10,10,0,0,1,10,10V58H54V48A10,10,0,0,1,64,38ZM192,218H64a10,10,0,0,1-10-10V198H202v10A10,10,0,0,1,192,218Z"/>`
  ],
  [
    "regular",
    r`<path d="M192,24H64A24,24,0,0,0,40,48V208a24,24,0,0,0,24,24H192a24,24,0,0,0,24-24V48A24,24,0,0,0,192,24ZM56,72H200V184H56Zm8-32H192a8,8,0,0,1,8,8v8H56V48A8,8,0,0,1,64,40ZM192,216H64a8,8,0,0,1-8-8v-8H200v8A8,8,0,0,1,192,216Z"/>`
  ],
  [
    "bold",
    r`<path d="M192,20H64A28,28,0,0,0,36,48V208a28,28,0,0,0,28,28H192a28,28,0,0,0,28-28V48A28,28,0,0,0,192,20ZM60,84H196v88H60Zm4-40H192a4,4,0,0,1,4,4V60H60V48A4,4,0,0,1,64,44ZM192,212H64a4,4,0,0,1-4-4V196H196v12A4,4,0,0,1,192,212Z"/>`
  ],
  [
    "fill",
    r`<path d="M192,24H64A24,24,0,0,0,40,48V208a24,24,0,0,0,24,24H192a24,24,0,0,0,24-24V48A24,24,0,0,0,192,24ZM64,40H192a8,8,0,0,1,8,8v8H56V48A8,8,0,0,1,64,40ZM192,216H64a8,8,0,0,1-8-8v-8H200v8A8,8,0,0,1,192,216Z"/>`
  ],
  [
    "duotone",
    r`<path d="M208,64V192H48V64Z" opacity="0.2"/><path d="M192,24H64A24,24,0,0,0,40,48V208a24,24,0,0,0,24,24H192a24,24,0,0,0,24-24V48A24,24,0,0,0,192,24ZM56,72H200V184H56Zm8-32H192a8,8,0,0,1,8,8v8H56V48A8,8,0,0,1,64,40ZM192,216H64a8,8,0,0,1-8-8v-8H200v8A8,8,0,0,1,192,216Z"/>`
  ]
]);
t.styles = A`
    :host {
      display: contents;
    }
  `;
o([
  i({ type: String, reflect: !0 })
], t.prototype, "size", 2);
o([
  i({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
o([
  i({ type: String, reflect: !0 })
], t.prototype, "color", 2);
o([
  i({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = o([
  m("ph-device-tablet")
], t);
export {
  t as PhDeviceTablet
};
