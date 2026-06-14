import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as g } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as f } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var u = Object.defineProperty, w = Object.getOwnPropertyDescriptor, o = (a, l, h, s) => {
  for (var r = s > 1 ? void 0 : s ? w(l, h) : l, p = a.length - 1, n; p >= 0; p--)
    (n = a[p]) && (r = (s ? n(l, h, r) : n(r)) || r);
  return s && r && u(l, h, r), r;
};
let t = class extends m {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return g`<svg
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
    e`<path d="M226.83,170.83l-48,48a4,4,0,0,1-5.66-5.66L214.34,172H88A60,60,0,0,1,88,52h88a4,4,0,0,1,0,8H88a52,52,0,0,0,0,104H214.34l-41.17-41.17a4,4,0,0,1,5.66-5.66l48,48A4,4,0,0,1,226.83,170.83Z"/>`
  ],
  [
    "light",
    e`<path d="M228.24,172.24l-48,48a6,6,0,0,1-8.48-8.48L209.51,174H88A62,62,0,0,1,88,50h88a6,6,0,0,1,0,12H88a50,50,0,0,0,0,100H209.51l-37.75-37.76a6,6,0,0,1,8.48-8.48l48,48A6,6,0,0,1,228.24,172.24Z"/>`
  ],
  [
    "regular",
    e`<path d="M229.66,173.66l-48,48a8,8,0,0,1-11.32-11.32L204.69,176H88A64,64,0,0,1,88,48h88a8,8,0,0,1,0,16H88a48,48,0,0,0,0,96H204.69l-34.35-34.34a8,8,0,0,1,11.32-11.32l48,48A8,8,0,0,1,229.66,173.66Z"/>`
  ],
  [
    "bold",
    e`<path d="M232.49,176.49l-48,48a12,12,0,0,1-17-17L195,180H88A68,68,0,0,1,88,44h88a12,12,0,0,1,0,24H88a44,44,0,0,0,0,88H195l-27.52-27.51a12,12,0,1,1,17-17l48,48A12,12,0,0,1,232.49,176.49Z"/>`
  ],
  [
    "fill",
    e`<path d="M229.66,173.66l-48,48A8,8,0,0,1,168,216V176H88A64,64,0,0,1,88,48h88a8,8,0,0,1,0,16H88a48,48,0,0,0,0,96h80V120a8,8,0,0,1,13.66-5.66l48,48A8,8,0,0,1,229.66,173.66Z"/>`
  ],
  [
    "duotone",
    e`<path d="M224,168l-48,48V120Z" opacity="0.2"/><path d="M229.66,162.34l-48-48A8,8,0,0,0,168,120v40H88a48,48,0,0,1,0-96h88a8,8,0,0,0,0-16H88a64,64,0,0,0,0,128h80v40a8,8,0,0,0,13.66,5.66l48-48A8,8,0,0,0,229.66,162.34ZM184,196.69V139.31L212.69,168Z"/>`
  ]
]);
t.styles = f`
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
  c("ph-arrow-u-down-right")
], t);
export {
  t as PhArrowUDownRight
};
