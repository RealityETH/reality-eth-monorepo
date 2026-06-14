import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as a, html as c } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as f } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var u = Object.defineProperty, d = Object.getOwnPropertyDescriptor, l = (e, o, p, s) => {
  for (var r = s > 1 ? void 0 : s ? d(o, p) : o, h = e.length - 1, n; h >= 0; h--)
    (n = e[h]) && (r = (s ? n(o, p, r) : n(r)) || r);
  return s && r && u(o, p, r), r;
};
let t = class extends m {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return c`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((e = this.weight) != null ? e : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    a`<path d="M244,128a52,52,0,0,1-88.77,36.77l-.17-.18L95,96.8a44,44,0,1,0,0,62.4l8.6-9.72a4,4,0,0,1,6,5.3l-8.68,9.81-.17.18a52,52,0,1,1,0-73.54l.17.18,60,67.79a44,44,0,1,0,0-62.4l-8.6,9.72a4,4,0,0,1-6-5.3l8.68-9.81.17-.18A52,52,0,0,1,244,128Z"/>`
  ],
  [
    "light",
    a`<path d="M246,128a54,54,0,0,1-92.18,38.18,3.07,3.07,0,0,1-.25-.26l-60-67.74a42,42,0,1,0,0,59.64l8.57-9.67a6,6,0,1,1,9,8l-8.69,9.81a3.07,3.07,0,0,1-.25.26,54,54,0,1,1,0-76.36,3.07,3.07,0,0,1,.25.26l60,67.74a42,42,0,1,0,0-59.64l-8.57,9.67a6,6,0,1,1-9-8l8.69-9.81a3.07,3.07,0,0,1,.25-.26A54,54,0,0,1,246,128Z"/>`
  ],
  [
    "regular",
    a`<path d="M248,128a56,56,0,0,1-95.6,39.6l-.33-.35L92.12,99.55a40,40,0,1,0,0,56.9l8.52-9.62a8,8,0,1,1,12,10.61l-8.69,9.81-.33.35a56,56,0,1,1,0-79.2l.33.35,59.95,67.7a40,40,0,1,0,0-56.9l-8.52,9.62a8,8,0,1,1-12-10.61l8.69-9.81.33-.35A56,56,0,0,1,248,128Z"/>`
  ],
  [
    "bold",
    a`<path d="M252,128a60,60,0,0,1-102.43,42.43l-.49-.53L89.22,102.31a36,36,0,1,0,0,51.38l3.08-3.48a12,12,0,1,1,18,15.91l-3.35,3.78-.49.53a60,60,0,1,1,0-84.86l.49.53,59.86,67.59a36,36,0,1,0,0-51.38l-3.08,3.48a12,12,0,1,1-18-15.91l3.35-3.78.49-.53A60,60,0,0,1,252,128Z"/>`
  ],
  [
    "fill",
    a`<path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM204.28,156.28a40,40,0,0,1-56.4.17L97.29,111.34,97,111A24,24,0,1,0,97,145c.36-.36.71-.73,1-1.1a8,8,0,1,1,12,10.6c-.55.62-1.13,1.23-1.71,1.81a40,40,0,1,1-.17-56.73l50.58,45.11.33.31A24,24,0,1,0,159,111c-.36.36-.7.72-1,1.1a8,8,0,0,1-12-10.59c.54-.62,1.12-1.24,1.71-1.82a40,40,0,0,1,56.57,56.56Z"/>`
  ],
  [
    "duotone",
    a`<path d="M225.94,161.94a48,48,0,0,1-67.88,0L128,128l30.06-33.94a48,48,0,0,1,67.88,67.88ZM30.06,94.06a48,48,0,0,0,67.88,67.88L128,128,97.94,94.06A48,48,0,0,0,30.06,94.06Z" opacity="0.2"/><path d="M248,128a56,56,0,0,1-95.6,39.6l-.33-.35L92.12,99.55a40,40,0,1,0,0,56.9l8.52-9.62a8,8,0,1,1,12,10.61l-8.69,9.81-.33.35a56,56,0,1,1,0-79.2l.33.35,59.95,67.7a40,40,0,1,0,0-56.9l-8.52,9.62a8,8,0,1,1-12-10.61l8.69-9.81.33-.35A56,56,0,0,1,248,128Z"/>`
  ]
]);
t.styles = g`
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
  f("ph-infinity")
], t);
export {
  t as PhInfinity
};
