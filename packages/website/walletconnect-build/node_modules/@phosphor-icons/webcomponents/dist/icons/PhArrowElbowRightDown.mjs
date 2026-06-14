import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as g } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as w } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var f = Object.defineProperty, u = Object.getOwnPropertyDescriptor, o = (a, l, p, s) => {
  for (var r = s > 1 ? void 0 : s ? u(l, p) : l, h = a.length - 1, n; h >= 0; h--)
    (n = a[h]) && (r = (s ? n(l, p, r) : n(r)) || r);
  return s && r && f(l, p, r), r;
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
    e`<path d="M226.83,162.83l-48,48a4,4,0,0,1-5.66,0l-48-48a4,4,0,1,1,5.66-5.66L172,198.34V68H32a4,4,0,0,1,0-8H176a4,4,0,0,1,4,4V198.34l41.17-41.17a4,4,0,0,1,5.66,5.66Z"/>`
  ],
  [
    "light",
    e`<path d="M228.24,164.24l-48,48a6,6,0,0,1-8.48,0l-48-48a6,6,0,1,1,8.48-8.48L170,193.51V70H32a6,6,0,0,1,0-12H176a6,6,0,0,1,6,6V193.51l37.76-37.75a6,6,0,0,1,8.48,8.48Z"/>`
  ],
  [
    "regular",
    e`<path d="M229.66,165.66l-48,48a8,8,0,0,1-11.32,0l-48-48a8,8,0,0,1,11.32-11.32L168,188.69V72H32a8,8,0,0,1,0-16H176a8,8,0,0,1,8,8V188.69l34.34-34.35a8,8,0,0,1,11.32,11.32Z"/>`
  ],
  [
    "bold",
    e`<path d="M232.49,168.49l-48,48a12,12,0,0,1-17,0l-48-48a12,12,0,1,1,17-17L164,179V76H32a12,12,0,0,1,0-24H176a12,12,0,0,1,12,12V179l27.51-27.52a12,12,0,0,1,17,17Z"/>`
  ],
  [
    "fill",
    e`<path d="M229.66,165.66l-48,48a8,8,0,0,1-11.32,0l-48-48A8,8,0,0,1,128,152h40V72H32a8,8,0,0,1,0-16H176a8,8,0,0,1,8,8v88h40a8,8,0,0,1,5.66,13.66Z"/>`
  ],
  [
    "duotone",
    e`<path d="M224,160l-48,48-48-48Z" opacity="0.2"/><path d="M231.39,156.94A8,8,0,0,0,224,152H184V64a8,8,0,0,0-8-8H32a8,8,0,0,0,0,16H168v80H128a8,8,0,0,0-5.66,13.66l48,48a8,8,0,0,0,11.32,0l48-48A8,8,0,0,0,231.39,156.94ZM176,196.69,147.31,168h57.38Z"/>`
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
  w("ph-arrow-elbow-right-down")
], t);
export {
  t as PhArrowElbowRightDown
};
