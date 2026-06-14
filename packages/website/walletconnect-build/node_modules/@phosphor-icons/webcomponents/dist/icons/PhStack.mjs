import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as a, html as A } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as Z } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as M } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var c = Object.defineProperty, g = Object.getOwnPropertyDescriptor, e = (r, s, i, o) => {
  for (var t = o > 1 ? void 0 : o ? g(s, i) : s, h = r.length - 1, m; h >= 0; h--)
    (m = r[h]) && (t = (o ? m(s, i, t) : m(t)) || t);
  return o && t && c(s, i, t), t;
};
let l = class extends Z {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var r;
    return A`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${l.weightsMap.get((r = this.weight) != null ? r : "regular")}
    </svg>`;
  }
};
l.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    a`<path d="M227.45,174a4,4,0,0,1-1.44,5.48l-96,56a4,4,0,0,1-4,0l-96-56a4,4,0,0,1,4-6.92l94,54.83,94-54.83A4,4,0,0,1,227.45,174ZM222,124.54l-94,54.83L34,124.54a4,4,0,0,0-4,6.92l96,56a4,4,0,0,0,4,0l96-56a4,4,0,0,0-4-6.92ZM28,80a4,4,0,0,1,2-3.46l96-56a4,4,0,0,1,4,0l96,56a4,4,0,0,1,0,6.92l-96,56a4,4,0,0,1-4,0l-96-56A4,4,0,0,1,28,80Zm11.94,0L128,131.37,216.06,80,128,28.63Z"/>`
  ],
  [
    "light",
    a`<path d="M229.18,173a6,6,0,0,1-2.16,8.2l-96,56a6,6,0,0,1-6,0l-96-56a6,6,0,0,1,6-10.36l93,54.23,93-54.23A6,6,0,0,1,229.18,173ZM221,122.82l-93,54.23L35,122.82a6,6,0,0,0-6,10.36l96,56a6,6,0,0,0,6,0l96-56a6,6,0,0,0-6-10.36ZM26,80a6,6,0,0,1,3-5.18l96-56a6,6,0,0,1,6,0l96,56a6,6,0,0,1,0,10.36l-96,56a6,6,0,0,1-6,0l-96-56A6,6,0,0,1,26,80Zm17.91,0L128,129.05,212.09,80,128,31Z"/>`
  ],
  [
    "regular",
    a`<path d="M230.91,172A8,8,0,0,1,228,182.91l-96,56a8,8,0,0,1-8.06,0l-96-56A8,8,0,0,1,36,169.09l92,53.65,92-53.65A8,8,0,0,1,230.91,172ZM220,121.09l-92,53.65L36,121.09A8,8,0,0,0,28,134.91l96,56a8,8,0,0,0,8.06,0l96-56A8,8,0,1,0,220,121.09ZM24,80a8,8,0,0,1,4-6.91l96-56a8,8,0,0,1,8.06,0l96,56a8,8,0,0,1,0,13.82l-96,56a8,8,0,0,1-8.06,0l-96-56A8,8,0,0,1,24,80Zm23.88,0L128,126.74,208.12,80,128,33.26Z"/>`
  ],
  [
    "bold",
    a`<path d="M234.36,170A12,12,0,0,1,230,186.37l-96,56a12,12,0,0,1-12.1,0l-96-56a12,12,0,0,1,12.09-20.74l90,52.48L218,165.63A12,12,0,0,1,234.36,170ZM218,117.63,128,170.11,38.05,117.63A12,12,0,0,0,26,138.37l96,56a12,12,0,0,0,12.1,0l96-56A12,12,0,0,0,218,117.63ZM20,80a12,12,0,0,1,6-10.37l96-56a12.06,12.06,0,0,1,12.1,0l96,56a12,12,0,0,1,0,20.74l-96,56a12,12,0,0,1-12.1,0l-96-56A12,12,0,0,1,20,80Zm35.82,0L128,122.11,200.18,80,128,37.89Z"/>`
  ],
  [
    "fill",
    a`<path d="M220,169.09l-92,53.65L36,169.09A8,8,0,0,0,28,182.91l96,56a8,8,0,0,0,8.06,0l96-56A8,8,0,1,0,220,169.09Z"/><path d="M220,121.09l-92,53.65L36,121.09A8,8,0,0,0,28,134.91l96,56a8,8,0,0,0,8.06,0l96-56A8,8,0,1,0,220,121.09Z"/><path d="M28,86.91l96,56a8,8,0,0,0,8.06,0l96-56a8,8,0,0,0,0-13.82l-96-56a8,8,0,0,0-8.06,0l-96,56a8,8,0,0,0,0,13.82Z"/>`
  ],
  [
    "duotone",
    a`<path d="M224,80l-96,56L32,80l96-56Z" opacity="0.2"/><path d="M230.91,172A8,8,0,0,1,228,182.91l-96,56a8,8,0,0,1-8.06,0l-96-56A8,8,0,0,1,36,169.09l92,53.65,92-53.65A8,8,0,0,1,230.91,172ZM220,121.09l-92,53.65L36,121.09A8,8,0,0,0,28,134.91l96,56a8,8,0,0,0,8.06,0l96-56A8,8,0,1,0,220,121.09ZM24,80a8,8,0,0,1,4-6.91l96-56a8,8,0,0,1,8.06,0l96,56a8,8,0,0,1,0,13.82l-96,56a8,8,0,0,1-8.06,0l-96-56A8,8,0,0,1,24,80Zm23.88,0L128,126.74,208.12,80,128,33.26Z"/>`
  ]
]);
l.styles = M`
    :host {
      display: contents;
    }
  `;
e([
  p({ type: String, reflect: !0 })
], l.prototype, "size", 2);
e([
  p({ type: String, reflect: !0 })
], l.prototype, "weight", 2);
e([
  p({ type: String, reflect: !0 })
], l.prototype, "color", 2);
e([
  p({ type: Boolean, reflect: !0 })
], l.prototype, "mirrored", 2);
l = e([
  n("ph-stack")
], l);
export {
  l as PhStack
};
