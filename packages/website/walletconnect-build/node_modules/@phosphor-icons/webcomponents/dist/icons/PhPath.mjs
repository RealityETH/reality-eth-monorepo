import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as g } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as H } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var f = Object.defineProperty, u = Object.getOwnPropertyDescriptor, h = (e, o, i, s) => {
  for (var a = s > 1 ? void 0 : s ? u(o, i) : o, l = e.length - 1, m; l >= 0; l--)
    (m = e[l]) && (a = (s ? m(o, i, a) : m(a)) || a);
  return s && a && f(o, i, a), a;
};
let t = class extends g {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return n`<svg
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
    r`<path d="M200,172a28,28,0,0,0-27.71,24H72a36,36,0,0,1,0-72h96a36,36,0,0,0,0-72H72a4,4,0,0,0,0,8h96a28,28,0,0,1,0,56H72a44,44,0,0,0,0,88H172.29A28,28,0,1,0,200,172Zm0,48a20,20,0,1,1,20-20A20,20,0,0,1,200,220Z"/>`
  ],
  [
    "light",
    r`<path d="M200,170a30.05,30.05,0,0,0-29.4,24H72a34,34,0,0,1,0-68h96a38,38,0,0,0,0-76H72a6,6,0,0,0,0,12h96a26,26,0,0,1,0,52H72a46,46,0,0,0,0,92h98.6A30,30,0,1,0,200,170Zm0,48a18,18,0,1,1,18-18A18,18,0,0,1,200,218Z"/>`
  ],
  [
    "regular",
    r`<path d="M200,168a32.06,32.06,0,0,0-31,24H72a32,32,0,0,1,0-64h96a40,40,0,0,0,0-80H72a8,8,0,0,0,0,16h96a24,24,0,0,1,0,48H72a48,48,0,0,0,0,96h97a32,32,0,1,0,31-40Zm0,48a16,16,0,1,1,16-16A16,16,0,0,1,200,216Z"/>`
  ],
  [
    "bold",
    r`<path d="M200,164a36.07,36.07,0,0,0-33.94,24H72a28,28,0,0,1,0-56h96a44,44,0,0,0,0-88H72a12,12,0,0,0,0,24h96a20,20,0,0,1,0,40H72a52,52,0,0,0,0,104h94.06A36,36,0,1,0,200,164Zm0,48a12,12,0,1,1,12-12A12,12,0,0,1,200,212Z"/>`
  ],
  [
    "fill",
    r`<path d="M228,200a28,28,0,0,1-54.83,8H72a48,48,0,0,1,0-96h96a24,24,0,0,0,0-48H72a8,8,0,0,1,0-16h96a40,40,0,0,1,0,80H72a32,32,0,0,0,0,64H173.17A28,28,0,0,1,228,200Z"/>`
  ],
  [
    "duotone",
    r`<path d="M224,200a24,24,0,1,1-24-24A24,24,0,0,1,224,200Z" opacity="0.2"/><path d="M200,168a32.06,32.06,0,0,0-31,24H72a32,32,0,0,1,0-64h96a40,40,0,0,0,0-80H72a8,8,0,0,0,0,16h96a24,24,0,0,1,0,48H72a48,48,0,0,0,0,96h97a32,32,0,1,0,31-40Zm0,48a16,16,0,1,1,16-16A16,16,0,0,1,200,216Z"/>`
  ]
]);
t.styles = c`
    :host {
      display: contents;
    }
  `;
h([
  p({ type: String, reflect: !0 })
], t.prototype, "size", 2);
h([
  p({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
h([
  p({ type: String, reflect: !0 })
], t.prototype, "color", 2);
h([
  p({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = h([
  H("ph-path")
], t);
export {
  t as PhPath
};
