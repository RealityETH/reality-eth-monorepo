import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as A } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var g = Object.defineProperty, M = Object.getOwnPropertyDescriptor, l = (a, o, h, s) => {
  for (var r = s > 1 ? void 0 : s ? M(o, h) : o, p = a.length - 1, m; p >= 0; p--)
    (m = a[p]) && (r = (s ? m(o, h, r) : m(r)) || r);
  return s && r && g(o, h, r), r;
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
    e`<path d="M106.38,28.26a11.76,11.76,0,0,0-13.44,7.08l0,.08L29,195.32A12,12,0,0,0,40,212h64a12,12,0,0,0,12-12V40A11.75,11.75,0,0,0,106.38,28.26ZM108,200a4,4,0,0,1-4,4H40a3.93,3.93,0,0,1-3.33-1.79,4,4,0,0,1-.32-3.84l64-159.94A4,4,0,0,1,108,40Zm119.07-4.6-64-160,0-.08A12,12,0,0,0,140,40V200a12,12,0,0,0,12,12h64a12,12,0,0,0,11.08-16.6Zm-7.75,6.81A3.93,3.93,0,0,1,216,204H152a4,4,0,0,1-4-4V40a3.81,3.81,0,0,1,3.2-3.92,4.64,4.64,0,0,1,.9-.09,3.69,3.69,0,0,1,3.57,2.42l64,160A3.9,3.9,0,0,1,219.32,202.21Z"/>`
  ],
  [
    "light",
    e`<path d="M106.78,26.29A13.88,13.88,0,0,0,91.1,34.55s0,.08,0,.12l-64,159.94A14,14,0,0,0,40,214h64a14,14,0,0,0,14-14V40A13.87,13.87,0,0,0,106.78,26.29ZM106,200a2,2,0,0,1-2,2H40a2,2,0,0,1-1.85-2.78l.05-.11,64-159.92A2,2,0,0,1,106,40Zm122.92-5.39-64-159.94s0-.08,0-.12A14,14,0,0,0,138,40V200a14,14,0,0,0,14,14h64a14,14,0,0,0,12.93-19.39Zm-11.26,6.49a1.93,1.93,0,0,1-1.67.9H152a2,2,0,0,1-2-2V40a1.82,1.82,0,0,1,1.6-2,2.62,2.62,0,0,1,.54-.06,1.76,1.76,0,0,1,1.69,1.2l64,159.92.05.11A2,2,0,0,1,217.66,201.1Z"/>`
  ],
  [
    "regular",
    e`<path d="M107.18,24.33a15.86,15.86,0,0,0-17.92,9.45l-.06.14-64,159.93A16,16,0,0,0,40,216h64a16,16,0,0,0,16-16V40A15.85,15.85,0,0,0,107.18,24.33ZM104,200H40l.06-.15L104,40Zm126.77-6.15-64-159.93-.06-.14A16,16,0,0,0,136,40V200a16,16,0,0,0,16,16h64a16,16,0,0,0,14.78-22.15ZM152,200V40l63.93,159.84.06.15Z"/>`
  ],
  [
    "bold",
    e`<path d="M104,20.41a19.83,19.83,0,0,0-22.4,11.81c-.07.15-.13.31-.19.46L21.47,192.49A20,20,0,0,0,40,220h60a20,20,0,0,0,20-20V40A19.83,19.83,0,0,0,104,20.41ZM96,196H45.79L96,62.09Zm138.53-3.51L174.61,32.68c-.06-.15-.12-.31-.19-.46A20,20,0,0,0,136,40V200a20,20,0,0,0,20,20h60a20,20,0,0,0,18.54-27.51ZM160,196V62.09L210.21,196Z"/>`
  ],
  [
    "fill",
    e`<path d="M120,40V200a16,16,0,0,1-16,16H40a16,16,0,0,1-14.78-22.15l64-159.93.06-.14A16,16,0,0,1,120,40ZM229.33,208.84A16,16,0,0,1,216,216H152a16,16,0,0,1-16-16V40a16,16,0,0,1,30.74-6.23l.06.14,64,159.93A16,16,0,0,1,229.33,208.84ZM216,200l-.06-.15L152,40V200Z"/>`
  ],
  [
    "duotone",
    e`<path d="M112,40V200a8,8,0,0,1-8,8H40a8,8,0,0,1-7.37-11.12l64-160C100,28.86,112,31.29,112,40Z" opacity="0.2"/><path d="M107.18,24.33a15.86,15.86,0,0,0-17.92,9.45l-.06.14-64,159.93A16,16,0,0,0,40,216h64a16,16,0,0,0,16-16V40A15.85,15.85,0,0,0,107.18,24.33ZM104,200H40l.06-.15L104,40Zm126.77-6.15-64-159.93-.06-.14A16,16,0,0,0,136,40V200a16,16,0,0,0,16,16h64a16,16,0,0,0,14.78-22.15ZM152,200V40l63.93,159.84.06.15Z"/>`
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
  Z("ph-flip-horizontal")
], t);
export {
  t as PhFlipHorizontal
};
