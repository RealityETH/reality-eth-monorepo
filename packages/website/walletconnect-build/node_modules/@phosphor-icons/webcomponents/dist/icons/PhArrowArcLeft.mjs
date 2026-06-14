import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as c } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as f } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var u = Object.defineProperty, v = Object.getOwnPropertyDescriptor, o = (a, s, l, i) => {
  for (var r = i > 1 ? void 0 : i ? v(s, l) : s, h = a.length - 1, n; h >= 0; h--)
    (n = a[h]) && (r = (i ? n(s, l, r) : n(r)) || r);
  return i && r && u(s, l, r), r;
};
let t = class extends c {
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
    e`<path d="M228,184a4,4,0,0,1-8,0A92,92,0,0,0,63,119L33.7,148H88a4,4,0,0,1,0,8H24a4,4,0,0,1-4-4V88a4,4,0,0,1,8,0v54.39l29.3-29.11A100,100,0,0,1,228,184Z"/>`
  ],
  [
    "light",
    e`<path d="M230,184a6,6,0,0,1-12,0A90,90,0,0,0,64.36,120.36L38.55,146H88a6,6,0,0,1,0,12H24a6,6,0,0,1-6-6V88a6,6,0,0,1,12,0v49.58l25.89-25.72A102,102,0,0,1,230,184Z"/>`
  ],
  [
    "regular",
    e`<path d="M232,184a8,8,0,0,1-16,0A88,88,0,0,0,65.78,121.78L43.4,144H88a8,8,0,0,1,0,16H24a8,8,0,0,1-8-8V88a8,8,0,0,1,16,0v44.77l22.48-22.33A104,104,0,0,1,232,184Z"/>`
  ],
  [
    "bold",
    e`<path d="M236,184a12,12,0,0,1-24,0A84,84,0,0,0,68.6,124.6L53.11,140H88a12,12,0,0,1,0,24H24a12,12,0,0,1-12-12V88a12,12,0,0,1,24,0v35.16l15.66-15.55A108,108,0,0,1,236,184Z"/>`
  ],
  [
    "fill",
    e`<path d="M232,184a8,8,0,0,1-16,0A88,88,0,0,0,67.47,120.16l26.19,26.18A8,8,0,0,1,88,160H24a8,8,0,0,1-8-8V88a8,8,0,0,1,13.66-5.66l26.48,26.48A104,104,0,0,1,232,184Z"/>`
  ],
  [
    "duotone",
    e`<path d="M88,152H24V88Z" opacity="0.2"/><path d="M201.54,110.46a104,104,0,0,0-145.4-1.63L29.66,82.34A8,8,0,0,0,16,88v64a8,8,0,0,0,8,8H88a8,8,0,0,0,5.66-13.66L67.47,120.16A88,88,0,0,1,216,184a8,8,0,0,0,16,0A103.33,103.33,0,0,0,201.54,110.46ZM32,144V107.31L68.69,144Z"/>`
  ]
]);
t.styles = g`
    :host {
      display: contents;
    }
  `;
o([
  p({ type: String, reflect: !0 })
], t.prototype, "size", 2);
o([
  p({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
o([
  p({ type: String, reflect: !0 })
], t.prototype, "color", 2);
o([
  p({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = o([
  f("ph-arrow-arc-left")
], t);
export {
  t as PhArrowArcLeft
};
