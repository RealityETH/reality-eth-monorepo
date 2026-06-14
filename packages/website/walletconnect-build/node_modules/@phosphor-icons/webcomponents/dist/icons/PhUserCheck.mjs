import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as c } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as n } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as f } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var u = Object.defineProperty, Z = Object.getOwnPropertyDescriptor, s = (a, o, p, l) => {
  for (var e = l > 1 ? void 0 : l ? Z(o, p) : o, h = a.length - 1, m; h >= 0; h--)
    (m = a[h]) && (e = (l ? m(o, p, e) : m(e)) || e);
  return l && e && u(o, p, e), e;
};
let t = class extends n {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return c`<svg
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
    r`<path d="M133.17,158.84a64,64,0,1,0-50.34,0c-23.76,5.46-45.18,18.69-61.89,38.59a4,4,0,1,0,6.12,5.14C48,177.7,76.71,164,108,164s60,13.7,80.94,38.57a4,4,0,0,0,6.12-5.14C178.35,177.53,156.93,164.3,133.17,158.84ZM52,100a56,56,0,1,1,56,56A56.06,56.06,0,0,1,52,100Zm198.83,30.83-32,32a4,4,0,0,1-5.66,0l-16-16a4,4,0,0,1,5.66-5.66L216,154.34l29.17-29.17a4,4,0,1,1,5.66,5.66Z"/>`
  ],
  [
    "light",
    r`<path d="M139,158.25a66,66,0,1,0-62,0c-22,6.23-41.88,19.16-57.61,37.89a6,6,0,0,0,9.18,7.72C49.11,179.44,77.31,166,108,166s58.9,13.44,79.41,37.86a6,6,0,1,0,9.18-7.72C180.86,177.41,161,164.48,139,158.25ZM54,100a54,54,0,1,1,54,54A54.06,54.06,0,0,1,54,100Zm198.24,32.24-32,32a6,6,0,0,1-8.48,0l-16-16a6,6,0,0,1,8.48-8.48L216,151.51l27.76-27.75a6,6,0,1,1,8.48,8.48Z"/>`
  ],
  [
    "regular",
    r`<path d="M144,157.68a68,68,0,1,0-71.9,0c-20.65,6.76-39.23,19.39-54.17,37.17a8,8,0,0,0,12.25,10.3C50.25,181.19,77.91,168,108,168s57.75,13.19,77.87,37.15a8,8,0,0,0,12.25-10.3C183.18,177.07,164.6,164.44,144,157.68ZM56,100a52,52,0,1,1,52,52A52.06,52.06,0,0,1,56,100Zm197.66,33.66-32,32a8,8,0,0,1-11.32,0l-16-16a8,8,0,0,1,11.32-11.32L216,148.69l26.34-26.35a8,8,0,0,1,11.32,11.32Z"/>`
  ],
  [
    "bold",
    r`<path d="M152.5,156.54a72,72,0,1,0-89,0,124,124,0,0,0-48.69,35.74,12,12,0,0,0,18.38,15.44C46.88,191.42,71,172,108,172s61.12,19.42,74.81,35.72a12,12,0,1,0,18.38-15.44A123.89,123.89,0,0,0,152.5,156.54ZM60,100a48,48,0,1,1,48,48A48.05,48.05,0,0,1,60,100Zm192.49,36.49-32,32a12,12,0,0,1-17,0l-16-16a12,12,0,0,1,17-17L212,143l23.51-23.52a12,12,0,1,1,17,17Z"/>`
  ],
  [
    "fill",
    r`<path d="M253.66,133.66l-32,32a8,8,0,0,1-11.32,0l-16-16a8,8,0,0,1,11.32-11.32L216,148.69l26.34-26.35a8,8,0,0,1,11.32,11.32ZM144,157.68a68,68,0,1,0-71.9,0c-20.65,6.76-39.23,19.39-54.17,37.17A8,8,0,0,0,24,208H192a8,8,0,0,0,6.13-13.15C183.18,177.07,164.6,164.44,144,157.68Z"/>`
  ],
  [
    "duotone",
    r`<path d="M168,100a60,60,0,1,1-60-60A60,60,0,0,1,168,100Z" opacity="0.2"/><path d="M144,157.68a68,68,0,1,0-71.9,0c-20.65,6.76-39.23,19.39-54.17,37.17a8,8,0,0,0,12.25,10.3C50.25,181.19,77.91,168,108,168s57.75,13.19,77.87,37.15a8,8,0,0,0,12.25-10.3C183.18,177.07,164.6,164.44,144,157.68ZM56,100a52,52,0,1,1,52,52A52.06,52.06,0,0,1,56,100Zm197.66,33.66-32,32a8,8,0,0,1-11.32,0l-16-16a8,8,0,0,1,11.32-11.32L216,148.69l26.34-26.35a8,8,0,0,1,11.32,11.32Z"/>`
  ]
]);
t.styles = f`
    :host {
      display: contents;
    }
  `;
s([
  i({ type: String, reflect: !0 })
], t.prototype, "size", 2);
s([
  i({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
s([
  i({ type: String, reflect: !0 })
], t.prototype, "color", 2);
s([
  i({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = s([
  g("ph-user-check")
], t);
export {
  t as PhUserCheck
};
