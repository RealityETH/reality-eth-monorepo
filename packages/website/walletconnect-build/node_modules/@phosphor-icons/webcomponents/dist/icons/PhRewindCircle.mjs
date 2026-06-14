import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as A } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as Z } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as M } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var c = Object.defineProperty, g = Object.getOwnPropertyDescriptor, l = (a, o, p, s) => {
  for (var e = s > 1 ? void 0 : s ? g(o, p) : o, m = a.length - 1, h; m >= 0; m--)
    (h = a[m]) && (e = (s ? h(o, p, e) : h(e)) || e);
  return s && e && c(o, p, e), e;
};
let t = class extends Z {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return A`<svg
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
    r`<path d="M128,28A100,100,0,1,0,228,128,100.11,100.11,0,0,0,128,28Zm0,192a92,92,0,1,1,92-92A92.1,92.1,0,0,1,128,220ZM117.79,88.42a4,4,0,0,0-4.19.38l-48,36a4,4,0,0,0,0,6.4l48,36a4,4,0,0,0,2.4.8,4.05,4.05,0,0,0,1.79-.42A4,4,0,0,0,120,164V92A4,4,0,0,0,117.79,88.42ZM112,156,74.67,128,112,100Zm61.79-67.58a4,4,0,0,0-4.19.38l-48,36a4,4,0,0,0,0,6.4l48,36a4,4,0,0,0,2.4.8,4.05,4.05,0,0,0,1.79-.42A4,4,0,0,0,176,164V92A4,4,0,0,0,173.79,88.42ZM168,156l-37.33-28L168,100Z"/>`
  ],
  [
    "light",
    r`<path d="M128,26A102,102,0,1,0,230,128,102.12,102.12,0,0,0,128,26Zm0,192a90,90,0,1,1,90-90A90.1,90.1,0,0,1,128,218ZM174.68,86.63a6,6,0,0,0-6.28.57L122,122V92a6,6,0,0,0-9.6-4.8l-48,36a6,6,0,0,0,0,9.6l48,36A6,6,0,0,0,122,164V134l46.4,34.8A6,6,0,0,0,178,164V92A6,6,0,0,0,174.68,86.63ZM110,152,78,128l32-24Zm56,0-32-24,32-24Z"/>`
  ],
  [
    "regular",
    r`<path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM115.58,84.84a8,8,0,0,0-8.38.76l-48,36a8,8,0,0,0,0,12.8l48,36A8,8,0,0,0,112,172a8,8,0,0,0,8-8V92A8,8,0,0,0,115.58,84.84ZM104,148,77.33,128,104,108Zm75.58-63.16a8,8,0,0,0-8.38.76l-48,36a8,8,0,0,0,0,12.8l48,36A8,8,0,0,0,176,172a8,8,0,0,0,8-8V92A8,8,0,0,0,179.58,84.84ZM168,148l-26.67-20L168,108Z"/>`
  ],
  [
    "bold",
    r`<path d="M128,20A108,108,0,1,0,236,128,108.12,108.12,0,0,0,128,20Zm0,192a84,84,0,1,1,84-84A84.09,84.09,0,0,1,128,212ZM180,96v64a12,12,0,0,1-19.5,9.37L124,140.17V160a12,12,0,0,1-19.5,9.37l-40-32a12,12,0,0,1,0-18.74l40-32A12,12,0,0,1,124,96v19.83l36.5-29.2A12,12,0,0,1,180,96Z"/>`
  ],
  [
    "fill",
    r`<path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm56,140a8,8,0,0,1-12.8,6.4l-48-36A8,8,0,0,1,120,128v36a8,8,0,0,1-12.8,6.4l-48-36a8,8,0,0,1,0-12.8l48-36A8,8,0,0,1,120,92v36a8,8,0,0,1,3.2-6.4l48-36A8,8,0,0,1,184,92Z"/>`
  ],
  [
    "duotone",
    r`<path d="M128,32a96,96,0,1,0,96,96A96,96,0,0,0,128,32ZM112,164,64,128l48-36Zm64,0-48-36,48-36Z" opacity="0.2"/><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM115.58,84.84a8,8,0,0,0-8.38.76l-48,36a8,8,0,0,0,0,12.8l48,36A8,8,0,0,0,112,172a8,8,0,0,0,8-8V92A8,8,0,0,0,115.58,84.84ZM104,148,77.33,128,104,108Zm75.58-63.16a8,8,0,0,0-8.38.76l-48,36a8,8,0,0,0,0,12.8l48,36A8,8,0,0,0,176,172a8,8,0,0,0,8-8V92A8,8,0,0,0,179.58,84.84ZM168,148l-26.67-20L168,108Z"/>`
  ]
]);
t.styles = M`
    :host {
      display: contents;
    }
  `;
l([
  i({ type: String, reflect: !0 })
], t.prototype, "size", 2);
l([
  i({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
l([
  i({ type: String, reflect: !0 })
], t.prototype, "color", 2);
l([
  i({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = l([
  n("ph-rewind-circle")
], t);
export {
  t as PhRewindCircle
};
