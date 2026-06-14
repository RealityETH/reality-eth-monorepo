import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as g } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as f } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var A = Object.defineProperty, c = Object.getOwnPropertyDescriptor, o = (a, s, h, i) => {
  for (var r = i > 1 ? void 0 : i ? c(s, h) : s, l = a.length - 1, m; l >= 0; l--)
    (m = a[l]) && (r = (i ? m(s, h, r) : m(r)) || r);
  return i && r && A(s, h, r), r;
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
    e`<path d="M136,204a8,8,0,1,1-8-8A8,8,0,0,1,136,204ZM234.54,90.1a168,168,0,0,0-213.08,0,4,4,0,1,0,5.08,6.18,160,160,0,0,1,202.92,0,4,4,0,0,0,5.08-6.18Zm-32.06,35.81a120,120,0,0,0-149,0,4,4,0,0,0,5,6.27,112,112,0,0,1,139,0,4,4,0,0,0,5-6.27Zm-32.13,35.86a72,72,0,0,0-84.7,0,4,4,0,1,0,4.7,6.46,64.07,64.07,0,0,1,75.3,0,4,4,0,0,0,5.58-.87A4,4,0,0,0,170.35,161.77Z"/>`
  ],
  [
    "light",
    e`<path d="M138,204a10,10,0,1,1-10-10A10,10,0,0,1,138,204ZM235.81,88.55a170,170,0,0,0-215.62,0,6,6,0,1,0,7.62,9.27,158,158,0,0,1,200.38,0,6,6,0,1,0,7.62-9.27Zm-32.08,35.79a122,122,0,0,0-151.46,0,6,6,0,0,0,7.46,9.41,110,110,0,0,1,136.54,0A6,6,0,0,0,200,135a6,6,0,0,0,3.73-10.7Zm-32.2,35.81a74,74,0,0,0-87.06,0,6,6,0,0,0,7.06,9.7,62,62,0,0,1,72.94,0,6,6,0,0,0,8.38-1.32A6,6,0,0,0,171.53,160.15Z"/>`
  ],
  [
    "regular",
    e`<path d="M140,204a12,12,0,1,1-12-12A12,12,0,0,1,140,204ZM237.08,87A172,172,0,0,0,18.92,87,8,8,0,0,0,29.08,99.37a156,156,0,0,1,197.84,0A8,8,0,0,0,237.08,87ZM205,122.77a124,124,0,0,0-153.94,0A8,8,0,0,0,61,135.31a108,108,0,0,1,134.06,0,8,8,0,0,0,11.24-1.3A8,8,0,0,0,205,122.77Zm-32.26,35.76a76.05,76.05,0,0,0-89.42,0,8,8,0,0,0,9.42,12.94,60,60,0,0,1,70.58,0,8,8,0,1,0,9.42-12.94Z"/>`
  ],
  [
    "bold",
    e`<path d="M144,204a16,16,0,1,1-16-16A16,16,0,0,1,144,204ZM239.61,83.91a176,176,0,0,0-223.22,0,12,12,0,1,0,15.23,18.55,152,152,0,0,1,192.76,0,12,12,0,1,0,15.23-18.55Zm-32.16,35.73a128,128,0,0,0-158.9,0,12,12,0,0,0,14.9,18.81,104,104,0,0,1,129.1,0,12,12,0,0,0,14.9-18.81ZM175.07,155.3a80.05,80.05,0,0,0-94.14,0,12,12,0,0,0,14.14,19.4,56,56,0,0,1,65.86,0,12,12,0,1,0,14.14-19.4Z"/>`
  ],
  [
    "fill",
    e`<path d="M244.35,92.8l-104,125.43A15.93,15.93,0,0,1,128,224h0a15.93,15.93,0,0,1-12.31-5.77L11.65,92.8A15.65,15.65,0,0,1,8.11,80.91,15.93,15.93,0,0,1,14.28,70.1,186.67,186.67,0,0,1,128,32,186.67,186.67,0,0,1,241.72,70.1a15.93,15.93,0,0,1,6.17,10.81A15.65,15.65,0,0,1,244.35,92.8Z"/>`
  ],
  [
    "duotone",
    e`<path d="M238.2,87.69l-104,125.43a8,8,0,0,1-12.3,0L17.8,87.69a7.79,7.79,0,0,1,1.31-11.21,180.75,180.75,0,0,1,217.78,0A7.79,7.79,0,0,1,238.2,87.69Z" opacity="0.2"/><path d="M247.89,80.91a15.93,15.93,0,0,0-6.17-10.81A186.67,186.67,0,0,0,128,32,186.67,186.67,0,0,0,14.28,70.1,15.93,15.93,0,0,0,8.11,80.91,15.65,15.65,0,0,0,11.65,92.8l104,125.43A15.93,15.93,0,0,0,128,224h0a15.93,15.93,0,0,0,12.31-5.77l104-125.43A15.65,15.65,0,0,0,247.89,80.91ZM128,208,24.09,82.74A170.76,170.76,0,0,1,128,48,170.76,170.76,0,0,1,231.91,82.74Z"/>`
  ]
]);
t.styles = Z`
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
  f("ph-wifi-high")
], t);
export {
  t as PhWifiHigh
};
