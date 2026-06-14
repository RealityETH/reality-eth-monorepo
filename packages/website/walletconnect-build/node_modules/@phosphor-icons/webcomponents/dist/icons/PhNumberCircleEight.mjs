import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as Z } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as A } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as m } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var c = Object.defineProperty, u = Object.getOwnPropertyDescriptor, o = (a, s, p, i) => {
  for (var e = i > 1 ? void 0 : i ? u(s, p) : s, l = a.length - 1, h; l >= 0; l--)
    (h = a[l]) && (e = (i ? h(s, p, e) : h(e)) || e);
  return i && e && c(s, p, e), e;
};
let t = class extends A {
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
    r`<path d="M128,28A100,100,0,1,0,228,128,100.11,100.11,0,0,0,128,28Zm0,192a92,92,0,1,1,92-92A92.1,92.1,0,0,1,128,220Zm14.9-96.31a28,28,0,1,0-29.8,0,32,32,0,1,0,29.8,0ZM108,100a20,20,0,1,1,20,20A20,20,0,0,1,108,100Zm20,76a24,24,0,1,1,24-24A24,24,0,0,1,128,176Z"/>`
  ],
  [
    "light",
    r`<path d="M128,26A102,102,0,1,0,230,128,102.12,102.12,0,0,0,128,26Zm0,192a90,90,0,1,1,90-90A90.1,90.1,0,0,1,128,218Zm18.57-94.46a30,30,0,1,0-37.14,0,34,34,0,1,0,37.14,0ZM110,100a18,18,0,1,1,18,18A18,18,0,0,1,110,100Zm18,74a22,22,0,1,1,22-22A22,22,0,0,1,128,174Z"/>`
  ],
  [
    "regular",
    r`<path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm21.81-92.61a32,32,0,1,0-43.62,0,36,36,0,1,0,43.62,0ZM112,100a16,16,0,1,1,16,16A16,16,0,0,1,112,100Zm16,72a20,20,0,1,1,20-20A20,20,0,0,1,128,172Z"/>`
  ],
  [
    "bold",
    r`<path d="M128,20A108,108,0,1,0,236,128,108.12,108.12,0,0,0,128,20Zm0,192a84,84,0,1,1,84-84A84.09,84.09,0,0,1,128,212Zm27.6-88.91a36,36,0,1,0-55.2,0,40,40,0,1,0,55.2,0ZM116,100a12,12,0,1,1,12,12A12,12,0,0,1,116,100Zm12,68a16,16,0,1,1,16-16A16,16,0,0,1,128,168Z"/>`
  ],
  [
    "fill",
    r`<path d="M148,152a20,20,0,1,1-20-20A20,20,0,0,1,148,152Zm-20-36a16,16,0,1,0-16-16A16,16,0,0,0,128,116Zm104,12A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-68,24a35.93,35.93,0,0,0-14.19-28.61,32,32,0,1,0-43.62,0A36,36,0,1,0,164,152Z"/>`
  ],
  [
    "duotone",
    r`<path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"/><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm21.81-92.61a32,32,0,1,0-43.62,0,36,36,0,1,0,43.62,0ZM112,100a16,16,0,1,1,16,16A16,16,0,0,1,112,100Zm16,72a20,20,0,1,1,20-20A20,20,0,0,1,128,172Z"/>`
  ]
]);
t.styles = g`
    :host {
      display: contents;
    }
  `;
o([
  m({ type: String, reflect: !0 })
], t.prototype, "size", 2);
o([
  m({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
o([
  m({ type: String, reflect: !0 })
], t.prototype, "color", 2);
o([
  m({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = o([
  n("ph-number-circle-eight")
], t);
export {
  t as PhNumberCircleEight
};
