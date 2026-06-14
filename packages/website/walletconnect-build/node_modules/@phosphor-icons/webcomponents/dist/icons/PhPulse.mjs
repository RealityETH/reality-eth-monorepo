import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as A } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as H } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as h } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var u = Object.defineProperty, c = Object.getOwnPropertyDescriptor, s = (a, l, p, o) => {
  for (var e = o > 1 ? void 0 : o ? c(l, p) : l, i = a.length - 1, m; i >= 0; i--)
    (m = a[i]) && (e = (o ? m(l, p, e) : m(e)) || e);
  return o && e && u(l, p, e), e;
};
let t = class extends A {
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
    r`<path d="M236,128a4,4,0,0,1-4,4H202.47l-38.89,77.79A4,4,0,0,1,160,212h-.2a4,4,0,0,1-3.54-2.58l-60.59-159-36,79.28A4,4,0,0,1,56,132H24a4,4,0,0,1,0-8H53.42L92.36,38.35a4,4,0,0,1,7.38.23L160.5,198.06l35.92-71.85A4,4,0,0,1,200,124h32A4,4,0,0,1,236,128Z"/>`
  ],
  [
    "light",
    r`<path d="M238,128a6,6,0,0,1-6,6H203.71l-38.34,76.68A6,6,0,0,1,160,214h-.3a6,6,0,0,1-5.31-3.85L95.51,55.57,61.46,130.48A6,6,0,0,1,56,134H24a6,6,0,0,1,0-12H52.14l38.4-84.48a6,6,0,0,1,11.07.34L160.74,193.1l33.89-67.78A6,6,0,0,1,200,122h32A6,6,0,0,1,238,128Z"/>`
  ],
  [
    "regular",
    r`<path d="M240,128a8,8,0,0,1-8,8H204.94l-37.78,75.58A8,8,0,0,1,160,216h-.4a8,8,0,0,1-7.08-5.14L95.35,60.76,63.28,131.31A8,8,0,0,1,56,136H24a8,8,0,0,1,0-16H50.85L88.72,36.69a8,8,0,0,1,14.76.46l57.51,151,31.85-63.71A8,8,0,0,1,200,120h32A8,8,0,0,1,240,128Z"/>`
  ],
  [
    "bold",
    r`<path d="M244,128a12,12,0,0,1-12,12H207.42l-36.69,73.37A12,12,0,0,1,160,220h-.6a12,12,0,0,1-10.61-7.72L95,71.15,66.92,133A12,12,0,0,1,56,140H24a12,12,0,0,1,0-24H48.27L85.08,35a12,12,0,0,1,22.13.7l54.28,142.46,27.78-55.56A12,12,0,0,1,200,116h32A12,12,0,0,1,244,128Z"/>`
  ],
  [
    "fill",
    r`<path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm-8,96H188.64L159,188a8,8,0,0,1-6.95,4h-.46a8,8,0,0,1-6.89-4.84L103,89.92,79,132a8,8,0,0,1-7,4H48a8,8,0,0,1,0-16H67.36L97.05,68a8,8,0,0,1,14.3.82L153,166.08l24-42.05a8,8,0,0,1,6.95-4h24a8,8,0,0,1,0,16Z"/>`
  ],
  [
    "duotone",
    r`<path d="M96,40l33.52,88H56Zm104,88H129.52L160,208Z" opacity="0.2"/><path d="M240,128a8,8,0,0,1-8,8H204.94l-37.78,75.58A8,8,0,0,1,160,216h-.4a8,8,0,0,1-7.08-5.14L95.35,60.76,63.28,131.31A8,8,0,0,1,56,136H24a8,8,0,0,1,0-16H50.85L88.72,36.69a8,8,0,0,1,14.76.46l57.51,151,31.85-63.71A8,8,0,0,1,200,120h32A8,8,0,0,1,240,128Z"/>`
  ]
]);
t.styles = g`
    :host {
      display: contents;
    }
  `;
s([
  h({ type: String, reflect: !0 })
], t.prototype, "size", 2);
s([
  h({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
s([
  h({ type: String, reflect: !0 })
], t.prototype, "color", 2);
s([
  h({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = s([
  H("ph-pulse")
], t);
export {
  t as PhPulse
};
