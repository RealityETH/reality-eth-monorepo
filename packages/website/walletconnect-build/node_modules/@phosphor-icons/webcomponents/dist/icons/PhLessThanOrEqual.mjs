import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as g } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as u } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var f = Object.defineProperty, d = Object.getOwnPropertyDescriptor, l = (a, s, p, o) => {
  for (var e = o > 1 ? void 0 : o ? d(s, p) : s, h = a.length - 1, m; h >= 0; h--)
    (m = a[h]) && (e = (o ? m(s, p, e) : m(e)) || e);
  return o && e && f(s, p, e), e;
};
let t = class extends g {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return n`<svg
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
    r`<path d="M44,104a4,4,0,0,1,2.62-3.75l152-56a4,4,0,1,1,2.76,7.5L59.57,104l141.81,52.25A4,4,0,0,1,200,164a3.91,3.91,0,0,1-1.38-.25l-152-56A4,4,0,0,1,44,104Zm156,92H48a4,4,0,0,0,0,8H200a4,4,0,0,0,0-8Z"/>`
  ],
  [
    "light",
    r`<path d="M42,104a6,6,0,0,1,3.93-5.63l152-56a6,6,0,1,1,4.15,11.26L65.36,104l136.71,50.37A6,6,0,0,1,200,166a6.09,6.09,0,0,1-2.08-.37l-152-56A6,6,0,0,1,42,104Zm158,90H48a6,6,0,0,0,0,12H200a6,6,0,0,0,0-12Z"/>`
  ],
  [
    "regular",
    r`<path d="M40,104a8,8,0,0,1,5.23-7.5l152-56a8,8,0,0,1,5.53,15L71.14,104l131.62,48.49A8,8,0,0,1,200,168a8.13,8.13,0,0,1-2.77-.49l-152-56A8,8,0,0,1,40,104Zm160,88H48a8,8,0,0,0,0,16H200a8,8,0,0,0,0-16Z"/>`
  ],
  [
    "bold",
    r`<path d="M36,104a12,12,0,0,1,7.85-11.26l152-56a12,12,0,1,1,8.3,22.52L82.71,104l121.44,44.74A12,12,0,0,1,200,172a11.85,11.85,0,0,1-4.15-.74l-152-56A12,12,0,0,1,36,104Zm164,84H48a12,12,0,0,0,0,24H200a12,12,0,0,0,0-24Z"/>`
  ],
  [
    "fill",
    r`<path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM176,184H72a8,8,0,0,1,0-16H176a8,8,0,0,1,0,16Zm2.35-55.65a8,8,0,0,1-4.7,15.3l-104-32a8,8,0,0,1,0-15.3l104-32a8,8,0,0,1,4.7,15.3L99.2,104Z"/>`
  ],
  [
    "duotone",
    r`<path d="M200,48V160L48,104Z" opacity="0.2"/><path d="M40,104a8,8,0,0,1,5.23-7.5l152-56a8,8,0,0,1,5.53,15L71.14,104l131.62,48.49A8,8,0,0,1,200,168a8.13,8.13,0,0,1-2.77-.49l-152-56A8,8,0,0,1,40,104Zm160,88H48a8,8,0,0,0,0,16H200a8,8,0,0,0,0-16Z"/>`
  ]
]);
t.styles = c`
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
  u("ph-less-than-or-equal")
], t);
export {
  t as PhLessThanOrEqual
};
