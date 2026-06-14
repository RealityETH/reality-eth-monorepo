import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as g } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as f } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var d = Object.defineProperty, u = Object.getOwnPropertyDescriptor, l = (a, o, p, s) => {
  for (var r = s > 1 ? void 0 : s ? u(o, p) : o, h = a.length - 1, m; h >= 0; h--)
    (m = a[h]) && (r = (s ? m(o, p, r) : m(r)) || r);
  return s && r && d(o, p, r), r;
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
    e`<path d="M232.5,119.55,136.45,23.49a12,12,0,0,0-16.9,0l-96,96.06a12,12,0,0,0,0,16.9l96.05,96.06a12,12,0,0,0,16.9,0l96.05-96.06a12,12,0,0,0,0-16.9Zm-5.66,11.24-96.05,96.06a4,4,0,0,1-5.58,0l-96-96.06a3.94,3.94,0,0,1,0-5.58l96.05-96.06a4,4,0,0,1,5.58,0l96.05,96.06a3.94,3.94,0,0,1,0,5.58Z"/>`
  ],
  [
    "light",
    e`<path d="M233.92,118.14,137.86,22.08a14,14,0,0,0-19.72,0L22.08,118.14a14,14,0,0,0,0,19.72l96.06,96.06h0a14,14,0,0,0,19.72,0l96-96.06a13.94,13.94,0,0,0,0-19.72Zm-8.49,11.24-96.05,96.06a2,2,0,0,1-2.76,0L30.57,129.38a2,2,0,0,1,0-2.76l96.05-96.06a2,2,0,0,1,2.76,0l96.05,96.06a2,2,0,0,1,0,2.76Z"/>`
  ],
  [
    "regular",
    e`<path d="M235.33,116.72,139.28,20.66a16,16,0,0,0-22.56,0l-96,96.06a16,16,0,0,0,0,22.56l96.05,96.06h0a16,16,0,0,0,22.56,0l96.05-96.06a16,16,0,0,0,0-22.56ZM128,224h0L32,128,128,32,224,128Z"/>`
  ],
  [
    "bold",
    e`<path d="M238.16,113.89,142.1,17.83a20,20,0,0,0-28.21,0l-96,96.06a20,20,0,0,0,0,28.22l96.05,96.06h0a20,20,0,0,0,28.21,0l96-96.06a20,20,0,0,0,0-28.22ZM128,218.33,37.68,128,128,37.67,218.32,128Z"/>`
  ],
  [
    "fill",
    e`<path d="M240,128a15.85,15.85,0,0,1-4.67,11.28l-96.05,96.06a16,16,0,0,1-22.56,0h0l-96-96.06a16,16,0,0,1,0-22.56l96.05-96.06a16,16,0,0,1,22.56,0l96.05,96.06A15.85,15.85,0,0,1,240,128Z"/>`
  ],
  [
    "duotone",
    e`<path d="M229.67,133.62l-96,96a7.94,7.94,0,0,1-11.24,0l-96-96a7.94,7.94,0,0,1,0-11.24l96.05-96a7.94,7.94,0,0,1,11.24,0l96,96.05A7.94,7.94,0,0,1,229.67,133.62Z" opacity="0.2"/><path d="M235.33,116.72,139.28,20.66a16,16,0,0,0-22.56,0l-96,96.06a16,16,0,0,0,0,22.56l96.05,96.06h0a16,16,0,0,0,22.56,0l96.05-96.06a16,16,0,0,0,0-22.56ZM128,224h0L32,128,128,32,224,128Z"/>`
  ]
]);
t.styles = f`
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
  c("ph-diamond")
], t);
export {
  t as PhDiamond
};
