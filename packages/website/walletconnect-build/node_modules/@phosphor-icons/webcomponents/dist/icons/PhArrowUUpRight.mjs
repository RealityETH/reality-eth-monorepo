import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as g } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as u } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var f = Object.defineProperty, w = Object.getOwnPropertyDescriptor, o = (a, s, p, l) => {
  for (var r = l > 1 ? void 0 : l ? w(s, p) : s, h = a.length - 1, n; h >= 0; h--)
    (n = a[h]) && (r = (l ? n(s, p, r) : n(r)) || r);
  return l && r && f(s, p, r), r;
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
    e`<path d="M173.17,133.17,214.34,92H88a52,52,0,0,0,0,104h88a4,4,0,0,1,0,8H88A60,60,0,0,1,88,84H214.34L173.17,42.83a4,4,0,0,1,5.66-5.66l48,48a4,4,0,0,1,0,5.66l-48,48a4,4,0,0,1-5.66-5.66Z"/>`
  ],
  [
    "light",
    e`<path d="M171.76,131.76,209.51,94H88a50,50,0,0,0,0,100h88a6,6,0,0,1,0,12H88A62,62,0,0,1,88,82H209.51L171.76,44.24a6,6,0,0,1,8.48-8.48l48,48a6,6,0,0,1,0,8.48l-48,48a6,6,0,0,1-8.48-8.48Z"/>`
  ],
  [
    "regular",
    e`<path d="M170.34,130.34,204.69,96H88a48,48,0,0,0,0,96h88a8,8,0,0,1,0,16H88A64,64,0,0,1,88,80H204.69L170.34,45.66a8,8,0,0,1,11.32-11.32l48,48a8,8,0,0,1,0,11.32l-48,48a8,8,0,0,1-11.32-11.32Z"/>`
  ],
  [
    "bold",
    e`<path d="M167.51,127.51,195,100H88a44,44,0,0,0,0,88h88a12,12,0,0,1,0,24H88A68,68,0,0,1,88,76H195L167.51,48.49a12,12,0,1,1,17-17l48,48a12,12,0,0,1,0,17l-48,48a12,12,0,0,1-17-17Z"/>`
  ],
  [
    "fill",
    e`<path d="M168,136V96H88a48,48,0,0,0,0,96h88a8,8,0,0,1,0,16H88A64,64,0,0,1,88,80h80V40a8,8,0,0,1,13.66-5.66l48,48a8,8,0,0,1,0,11.32l-48,48A8,8,0,0,1,168,136Z"/>`
  ],
  [
    "duotone",
    e`<path d="M224,88l-48,48V40Z" opacity="0.2"/><path d="M172.94,143.39a8,8,0,0,0,8.72-1.73l48-48a8,8,0,0,0,0-11.32l-48-48A8,8,0,0,0,168,40V80H88a64,64,0,0,0,0,128h88a8,8,0,0,0,0-16H88a48,48,0,0,1,0-96h80v40A8,8,0,0,0,172.94,143.39ZM184,59.31,212.69,88,184,116.69Z"/>`
  ]
]);
t.styles = c`
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
  u("ph-arrow-u-up-right")
], t);
export {
  t as PhArrowUUpRight
};
