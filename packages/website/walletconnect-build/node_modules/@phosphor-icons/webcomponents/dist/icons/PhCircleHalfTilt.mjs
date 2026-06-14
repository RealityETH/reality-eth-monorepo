import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as Z } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as M } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var f = Object.defineProperty, g = Object.getOwnPropertyDescriptor, o = (a, s, p, l) => {
  for (var r = l > 1 ? void 0 : l ? g(s, p) : s, m = a.length - 1, h; m >= 0; m--)
    (h = a[m]) && (r = (l ? h(s, p, r) : h(r)) || r);
  return l && r && f(s, p, r), r;
};
let t = class extends M {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return Z`<svg
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
    e`<path d="M198.71,57.29A100,100,0,1,0,57.29,198.71,100,100,0,1,0,198.71,57.29ZM188,197.72a91.35,91.35,0,0,1-24,15v-115l24-24Zm-88-36.06,24-24V219.9a91.91,91.91,0,0,1-24-4.24Zm-8,51a91.69,91.69,0,0,1-26.15-16.89L92,169.66Zm40-83,24-24v110a91.76,91.76,0,0,1-24,4.24ZM36,128A92,92,0,0,1,190.16,60.19l-130,130A91.34,91.34,0,0,1,36,128Zm160,62V66A92,92,0,0,1,196,190Z"/>`
  ],
  [
    "light",
    e`<path d="M200.12,55.88A102,102,0,1,0,55.88,200.13,102,102,0,1,0,200.12,55.88ZM90,209.62a89.61,89.61,0,0,1-21.23-13.89L90,174.49Zm32,8.16a90,90,0,0,1-20-3.58V162.49l20-20Zm32-3.58a89.8,89.8,0,0,1-20,3.58V130.49l20-20Zm32-17.4a89.45,89.45,0,0,1-20,12.83V98.49l20-20ZM60.27,187.24a90,90,0,0,1,127-127ZM198,184.57V71.43a90,90,0,0,1,0,113.14Z"/>`
  ],
  [
    "regular",
    e`<path d="M201.54,54.46A104,104,0,0,0,54.46,201.54,104,104,0,0,0,201.54,54.46ZM184,195.87a87.16,87.16,0,0,1-16,10.5V99.31l16-16Zm-80-32.56,16-16v68.28a88.37,88.37,0,0,1-16-3ZM88,206.37a87,87,0,0,1-16.3-10.76L88,179.31Zm48-75.06,16-16v97.32a88.37,88.37,0,0,1-16,3ZM40,128A88,88,0,0,1,184.3,60.39L60.38,184.31A87.34,87.34,0,0,1,40,128Zm160,50.59V77.41a88,88,0,0,1,0,101.18Z"/>`
  ],
  [
    "bold",
    e`<path d="M204.37,51.6A108.08,108.08,0,1,0,236,128,108.09,108.09,0,0,0,204.37,51.6ZM176,197a83.43,83.43,0,0,1-16,8.75V113l16-16ZM68.6,68.58A84.08,84.08,0,0,1,178.3,60.7L60.72,178.33A84.08,84.08,0,0,1,68.6,68.58ZM96,177v28.69A83.63,83.63,0,0,1,77.7,195.3Zm24,34.62V153l16-16v74.64A84.68,84.68,0,0,1,120,211.62Zm80-40.27V84.65a84.24,84.24,0,0,1,0,86.7Z"/>`
  ],
  [
    "fill",
    e`<path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM40,128A88,88,0,0,1,190.2,65.8L65.8,190.2A87.76,87.76,0,0,1,40,128Z"/>`
  ],
  [
    "duotone",
    e`<path d="M195.88,195.88a96,96,0,0,1-135.76,0L195.88,60.12A96,96,0,0,1,195.88,195.88Z" opacity="0.2"/><path d="M201.54,54.46A104,104,0,0,0,54.46,201.54,104,104,0,0,0,201.54,54.46ZM65.78,65.77A88.08,88.08,0,0,1,184.3,60.39L60.38,184.31a88,88,0,0,1,5.4-118.54ZM190.22,190.23A88.1,88.1,0,0,1,71.7,195.61L195.62,71.69a88,88,0,0,1-5.4,118.54Z"/>`
  ]
]);
t.styles = c`
    :host {
      display: contents;
    }
  `;
o([
  i({ type: String, reflect: !0 })
], t.prototype, "size", 2);
o([
  i({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
o([
  i({ type: String, reflect: !0 })
], t.prototype, "color", 2);
o([
  i({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = o([
  n("ph-circle-half-tilt")
], t);
export {
  t as PhCircleHalfTilt
};
