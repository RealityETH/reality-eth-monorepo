import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as f } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as w } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var c = Object.defineProperty, u = Object.getOwnPropertyDescriptor, o = (a, l, p, s) => {
  for (var r = s > 1 ? void 0 : s ? u(l, p) : l, h = a.length - 1, n; h >= 0; h--)
    (n = a[h]) && (r = (s ? n(l, p, r) : n(r)) || r);
  return s && r && c(l, p, r), r;
};
let t = class extends f {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return m`<svg
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
    e`<path d="M236,72a4,4,0,0,1-4,4H92V206.34l41.17-41.17a4,4,0,0,1,5.66,5.66l-48,48a4,4,0,0,1-5.66,0l-48-48a4,4,0,0,1,5.66-5.66L84,206.34V72a4,4,0,0,1,4-4H232A4,4,0,0,1,236,72Z"/>`
  ],
  [
    "light",
    e`<path d="M238,72a6,6,0,0,1-6,6H94V201.51l37.76-37.75a6,6,0,0,1,8.48,8.48l-48,48a6,6,0,0,1-8.48,0l-48-48a6,6,0,0,1,8.48-8.48L82,201.51V72a6,6,0,0,1,6-6H232A6,6,0,0,1,238,72Z"/>`
  ],
  [
    "regular",
    e`<path d="M240,72a8,8,0,0,1-8,8H96V196.69l34.34-34.35a8,8,0,0,1,11.32,11.32l-48,48a8,8,0,0,1-11.32,0l-48-48a8,8,0,0,1,11.32-11.32L80,196.69V72a8,8,0,0,1,8-8H232A8,8,0,0,1,240,72Z"/>`
  ],
  [
    "bold",
    e`<path d="M244,72a12,12,0,0,1-12,12H100V187l27.51-27.52a12,12,0,0,1,17,17l-48,48a12,12,0,0,1-17,0l-48-48a12,12,0,1,1,17-17L76,187V72A12,12,0,0,1,88,60H232A12,12,0,0,1,244,72Z"/>`
  ],
  [
    "fill",
    e`<path d="M240,72a8,8,0,0,1-8,8H96v80h40a8,8,0,0,1,5.66,13.66l-48,48a8,8,0,0,1-11.32,0l-48-48A8,8,0,0,1,40,160H80V72a8,8,0,0,1,8-8H232A8,8,0,0,1,240,72Z"/>`
  ],
  [
    "duotone",
    e`<path d="M136,168,88,216,40,168Z" opacity="0.2"/><path d="M232,64H88a8,8,0,0,0-8,8v88H40a8,8,0,0,0-5.66,13.66l48,48a8,8,0,0,0,11.32,0l48-48A8,8,0,0,0,136,160H96V80H232a8,8,0,0,0,0-16ZM88,204.69,59.31,176h57.38Z"/>`
  ]
]);
t.styles = w`
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
  g("ph-arrow-elbow-left-down")
], t);
export {
  t as PhArrowElbowLeftDown
};
