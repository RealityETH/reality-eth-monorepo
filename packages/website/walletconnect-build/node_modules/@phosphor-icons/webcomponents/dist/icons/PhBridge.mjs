import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as l } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as v } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var n = Object.defineProperty, g = Object.getOwnPropertyDescriptor, V = (e, o, p, s) => {
  for (var t = s > 1 ? void 0 : s ? g(o, p) : o, h = e.length - 1, H; h >= 0; h--)
    (H = e[h]) && (t = (s ? H(o, p, t) : H(t)) || t);
  return s && t && n(o, p, t), t;
};
let a = class extends m {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return l`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${a.weightsMap.get((e = this.weight) != null ? e : "regular")}
    </svg>`;
  }
};
a.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    r`<path d="M232,164H196V88.09a67.81,67.81,0,0,0,34.5,31,4,4,0,1,0,3-7.42A59.77,59.77,0,0,1,196,56a4,4,0,0,0-8,0A60,60,0,0,1,68,56a4,4,0,0,0-8,0,59.77,59.77,0,0,1-37.5,55.64,4,4,0,0,0,3,7.42,67.81,67.81,0,0,0,34.5-31V164H24a4,4,0,0,0,0,8H60v28a4,4,0,0,0,8,0V172H188v28a4,4,0,0,0,8,0V172h36a4,4,0,0,0,0-8Zm-84-43v43H108V121a68,68,0,0,0,40,0ZM68,88a68.43,68.43,0,0,0,32,30v46H68Zm88,76V118a68.43,68.43,0,0,0,32-30v76Z"/>`
  ],
  [
    "light",
    r`<path d="M232,162H198V95.28a69.81,69.81,0,0,0,31.75,25.63,6,6,0,1,0,4.5-11.12A57.8,57.8,0,0,1,198,56a6,6,0,0,0-12,0A58,58,0,0,1,70,56a6,6,0,0,0-12,0,57.8,57.8,0,0,1-36.25,53.79,6,6,0,1,0,4.5,11.12A69.81,69.81,0,0,0,58,95.28V162H24a6,6,0,0,0,0,12H58v26a6,6,0,0,0,12,0V174H186v26a6,6,0,0,0,12,0V174h34a6,6,0,0,0,0-12Zm-86-38.35V162H110V123.65a70.11,70.11,0,0,0,36,0ZM70,95.15a70.49,70.49,0,0,0,28,24.09V162H70ZM158,162V119.24a70.49,70.49,0,0,0,28-24.09V162Z"/>`
  ],
  [
    "regular",
    r`<path d="M232,160H200V101.34a71.89,71.89,0,0,0,29,21.42,8,8,0,0,0,6-14.83A55.78,55.78,0,0,1,200,56a8,8,0,0,0-16,0A56,56,0,0,1,72,56a8,8,0,0,0-16,0,55.78,55.78,0,0,1-35,51.93,8,8,0,0,0,6,14.83,71.89,71.89,0,0,0,29-21.42V160H24a8,8,0,0,0,0,16H56v24a8,8,0,0,0,16,0V176H184v24a8,8,0,0,0,16,0V176h32a8,8,0,0,0,0-16Zm-88-33.8V160H112V126.2a72,72,0,0,0,32,0Zm-72-25a72.47,72.47,0,0,0,24,19.27V160H72ZM160,160V120.48a72.47,72.47,0,0,0,24-19.27V160Z"/>`
  ],
  [
    "bold",
    r`<path d="M232,156H204V111.49a76.39,76.39,0,0,0,23.49,15,12,12,0,0,0,9-22.25A51.81,51.81,0,0,1,204,56a12,12,0,0,0-24,0A52,52,0,0,1,76,56a12,12,0,0,0-24,0,51.81,51.81,0,0,1-32.5,48.22,12,12,0,1,0,9,22.25,76.39,76.39,0,0,0,23.49-15V156H24a12,12,0,0,0,0,24H52v20a12,12,0,0,0,24,0V180H180v20a12,12,0,0,0,24,0V180h28a12,12,0,0,0,0-24Zm-92-24.95V156H116V131.05a76.26,76.26,0,0,0,24,0ZM76,111.38a76.44,76.44,0,0,0,16,11.53V156H76ZM164,156V122.91a76.44,76.44,0,0,0,16-11.53V156Z"/>`
  ],
  [
    "fill",
    r`<path d="M232,160h-8V120.5c1.63.81,3.29,1.57,5,2.26a8,8,0,0,0,6-14.83A55.78,55.78,0,0,1,200,56a8,8,0,0,0-16,0A56,56,0,0,1,72,56a8,8,0,0,0-16,0,55.78,55.78,0,0,1-35,51.93,8,8,0,0,0,6,14.83c1.71-.69,3.37-1.45,5-2.26V160H24.6c-6.31,0-8.6,4.78-8.6,8a8,8,0,0,0,8,8H56v24a8,8,0,0,0,16,0V176H184v24a8,8,0,0,0,16,0V176h32a8,8,0,0,0,0-16ZM72,152a8,8,0,0,1-16,0V104.12a8,8,0,0,1,16,0Zm40,0a8,8,0,0,1-16,0V132.32a8,8,0,0,1,16,0Zm48,0a8,8,0,0,1-16,0V132.32a8,8,0,0,1,16,0Zm40,0a8,8,0,0,1-16,0V104.12a8,8,0,0,1,16,0Z"/>`
  ],
  [
    "duotone",
    r`<path d="M232,168H24V115.35A64,64,0,0,0,64,56a64,64,0,0,0,128,0,64,64,0,0,0,40,59.35Z" opacity="0.2"/><path d="M232,160H200V101.34a71.89,71.89,0,0,0,29,21.42,8,8,0,0,0,6-14.83A55.78,55.78,0,0,1,200,56a8,8,0,0,0-16,0A56,56,0,0,1,72,56a8,8,0,0,0-16,0,55.78,55.78,0,0,1-35,51.93,8,8,0,0,0,6,14.83,71.89,71.89,0,0,0,29-21.42V160H24a8,8,0,0,0,0,16H56v24a8,8,0,0,0,16,0V176H184v24a8,8,0,0,0,16,0V176h32a8,8,0,0,0,0-16Zm-88-33.8V160H112V126.2a72,72,0,0,0,32,0Zm-72-25a72.47,72.47,0,0,0,24,19.27V160H72ZM160,160V120.48a72.47,72.47,0,0,0,24-19.27V160Z"/>`
  ]
]);
a.styles = Z`
    :host {
      display: contents;
    }
  `;
V([
  i({ type: String, reflect: !0 })
], a.prototype, "size", 2);
V([
  i({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
V([
  i({ type: String, reflect: !0 })
], a.prototype, "color", 2);
V([
  i({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = V([
  v("ph-bridge")
], a);
export {
  a as PhBridge
};
