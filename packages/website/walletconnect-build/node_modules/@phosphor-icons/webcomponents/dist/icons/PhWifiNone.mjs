import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as f } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as l } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var u = Object.defineProperty, w = Object.getOwnPropertyDescriptor, s = (o, i, h, p) => {
  for (var e = p > 1 ? void 0 : p ? w(i, h) : i, a = o.length - 1, n; a >= 0; a--)
    (n = o[a]) && (e = (p ? n(i, h, e) : n(e)) || e);
  return p && e && u(i, h, e), e;
};
let t = class extends f {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var o;
    return m`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((o = this.weight) != null ? o : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  ["thin", r`<path d="M136,204a8,8,0,1,1-8-8A8,8,0,0,1,136,204Z"/>`],
  ["light", r`<path d="M138,204a10,10,0,1,1-10-10A10,10,0,0,1,138,204Z"/>`],
  [
    "regular",
    r`<path d="M140,204a12,12,0,1,1-12-12A12,12,0,0,1,140,204Z"/>`
  ],
  ["bold", r`<path d="M144,204a16,16,0,1,1-16-16A16,16,0,0,1,144,204Z"/>`],
  [
    "fill",
    r`<path d="M247.89,80.91a15.93,15.93,0,0,0-6.17-10.81A186.67,186.67,0,0,0,128,32,186.67,186.67,0,0,0,14.28,70.1,15.93,15.93,0,0,0,8.11,80.91,15.65,15.65,0,0,0,11.65,92.8l104,125.43A15.93,15.93,0,0,0,128,224h0a15.93,15.93,0,0,0,12.31-5.77h0l104-125.43A15.65,15.65,0,0,0,247.89,80.91ZM128,208,24.09,82.74A170.76,170.76,0,0,1,128,48,170.76,170.76,0,0,1,231.91,82.74Z"/>`
  ],
  [
    "duotone",
    r`<path d="M247.89,80.91a15.93,15.93,0,0,0-6.17-10.81A186.67,186.67,0,0,0,128,32,186.67,186.67,0,0,0,14.28,70.1,15.93,15.93,0,0,0,8.11,80.91,15.65,15.65,0,0,0,11.65,92.8l104,125.43A15.93,15.93,0,0,0,128,224h0a15.93,15.93,0,0,0,12.31-5.77h0l104-125.43A15.65,15.65,0,0,0,247.89,80.91ZM128,208,24.09,82.74A170.76,170.76,0,0,1,128,48,170.76,170.76,0,0,1,231.91,82.74Z"/>`
  ]
]);
t.styles = c`
    :host {
      display: contents;
    }
  `;
s([
  l({ type: String, reflect: !0 })
], t.prototype, "size", 2);
s([
  l({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
s([
  l({ type: String, reflect: !0 })
], t.prototype, "color", 2);
s([
  l({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = s([
  g("ph-wifi-none")
], t);
export {
  t as PhWifiNone
};
