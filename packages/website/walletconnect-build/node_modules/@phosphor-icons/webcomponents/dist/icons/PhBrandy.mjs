import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as A } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as n } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as m } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var M = Object.defineProperty, c = Object.getOwnPropertyDescriptor, h = (a, o, p, s) => {
  for (var r = s > 1 ? void 0 : s ? c(o, p) : o, H = a.length - 1, l; H >= 0; H--)
    (l = a[H]) && (r = (s ? l(o, p, r) : l(r)) || r);
  return s && r && M(o, p, r), r;
};
let t = class extends n {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return A`<svg
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
    e`<path d="M220,88h0a91.67,91.67,0,0,0-14.88-50.18A4,4,0,0,0,201.77,36H54.23a4,4,0,0,0-3.35,1.82A91.67,91.67,0,0,0,36,88h0a92.11,92.11,0,0,0,88,91.91V220H88a4,4,0,0,0,0,8h80a4,4,0,0,0,0-8H132V179.91A92.11,92.11,0,0,0,220,88ZM56.43,44H199.57a83.5,83.5,0,0,1,12.32,40H44.11A83.5,83.5,0,0,1,56.43,44ZM128,172A84.1,84.1,0,0,1,44.1,92H211.9A84.1,84.1,0,0,1,128,172Z"/>`
  ],
  [
    "light",
    e`<path d="M222,88h0a93.64,93.64,0,0,0-15.21-51.28,6,6,0,0,0-5-2.72H54.23a6,6,0,0,0-5,2.72A93.64,93.64,0,0,0,34,88h0a94.1,94.1,0,0,0,88,93.8V218H88a6,6,0,0,0,0,12h80a6,6,0,0,0,0-12H134V181.8A94.1,94.1,0,0,0,222,88ZM57.56,46H198.44a81.62,81.62,0,0,1,11.34,36H46.22A81.62,81.62,0,0,1,57.56,46ZM128,170A82.09,82.09,0,0,1,46.24,94H209.76A82.09,82.09,0,0,1,128,170Z"/>`
  ],
  [
    "regular",
    e`<path d="M224,88h0a95.63,95.63,0,0,0-15.53-52.37,8,8,0,0,0-6.7-3.63H54.23a8,8,0,0,0-6.7,3.63A95.63,95.63,0,0,0,32,88h0a96.12,96.12,0,0,0,88,95.66V216H88a8,8,0,0,0,0,16h80a8,8,0,0,0,0-16H136V183.66A96.12,96.12,0,0,0,224,88ZM58.7,48H197.3a79.52,79.52,0,0,1,10.3,32H48.4A79.52,79.52,0,0,1,58.7,48ZM128,168A80.11,80.11,0,0,1,48.4,96H207.6A80.11,80.11,0,0,1,128,168Z"/>`
  ],
  [
    "bold",
    e`<path d="M228,88h0a99.63,99.63,0,0,0-16.18-54.55,12,12,0,0,0-10-5.45H54.23a12,12,0,0,0-10,5.45A99.63,99.63,0,0,0,28,88h0a100.15,100.15,0,0,0,88,99.28V212H88a12,12,0,0,0,0,24h80a12,12,0,0,0,0-24H140V187.28A100.15,100.15,0,0,0,228,88ZM61.05,52H195a75.43,75.43,0,0,1,8.1,24H53A75.43,75.43,0,0,1,61.05,52Zm67,112a76.12,76.12,0,0,1-75-64H203A76.12,76.12,0,0,1,128,164Z"/>`
  ],
  [
    "fill",
    e`<path d="M224,88h0a95.63,95.63,0,0,0-15.53-52.37,8,8,0,0,0-6.7-3.63H54.23a8,8,0,0,0-6.7,3.63A95.63,95.63,0,0,0,32,88h0a96.12,96.12,0,0,0,88,95.66V216H88a8,8,0,0,0,0,16h80a8,8,0,0,0,0-16H136V183.66A96.12,96.12,0,0,0,224,88ZM58.7,48H197.3a79.52,79.52,0,0,1,10.3,32H48.4A79.52,79.52,0,0,1,58.7,48Z"/>`
  ],
  [
    "duotone",
    e`<path d="M216,88A88,88,0,0,1,40,88Z" opacity="0.2"/><path d="M224,88h0a95.63,95.63,0,0,0-15.53-52.37,8,8,0,0,0-6.7-3.63H54.23a8,8,0,0,0-6.7,3.63A95.63,95.63,0,0,0,32,88h0a96.12,96.12,0,0,0,88,95.66V216H88a8,8,0,0,0,0,16h80a8,8,0,0,0,0-16H136V183.66A96.12,96.12,0,0,0,224,88ZM58.7,48H197.3a79.52,79.52,0,0,1,10.3,32H48.4A79.52,79.52,0,0,1,58.7,48ZM128,168A80.11,80.11,0,0,1,48.4,96H207.6A80.11,80.11,0,0,1,128,168Z"/>`
  ]
]);
t.styles = g`
    :host {
      display: contents;
    }
  `;
h([
  i({ type: String, reflect: !0 })
], t.prototype, "size", 2);
h([
  i({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
h([
  i({ type: String, reflect: !0 })
], t.prototype, "color", 2);
h([
  i({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = h([
  m("ph-brandy")
], t);
export {
  t as PhBrandy
};
