import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as H } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as l } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as v } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var n = Object.defineProperty, f = Object.getOwnPropertyDescriptor, s = (h, o, p, a) => {
  for (var r = a > 1 ? void 0 : a ? f(o, p) : o, m = h.length - 1, V; m >= 0; m--)
    (V = h[m]) && (r = (a ? V(o, p, r) : V(r)) || r);
  return a && r && n(o, p, r), r;
};
let t = class extends l {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var h;
    return H`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((h = this.weight) != null ? h : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    e`<path d="M200,44H56A12,12,0,0,0,44,56V200a12,12,0,0,0,12,12H200a12,12,0,0,0,12-12V56A12,12,0,0,0,200,44Zm-68,72h72v24H132Zm0-8V84h72v24Zm0,40h72v24H132Zm72-92V76H132V52h68A4,4,0,0,1,204,56ZM52,200V56a4,4,0,0,1,4-4h68V204H56A4,4,0,0,1,52,200Zm148,4H132V180h72v20A4,4,0,0,1,200,204Z"/>`
  ],
  [
    "light",
    e`<path d="M200,42H56A14,14,0,0,0,42,56V200a14,14,0,0,0,14,14H200a14,14,0,0,0,14-14V56A14,14,0,0,0,200,42Zm-66,76h68v20H134Zm0-12V86h68v20Zm0,44h68v20H134Zm68-94V74H134V54h66A2,2,0,0,1,202,56ZM54,200V56a2,2,0,0,1,2-2h66V202H56A2,2,0,0,1,54,200Zm146,2H134V182h68v18A2,2,0,0,1,200,202Z"/>`
  ],
  [
    "regular",
    e`<path d="M200,40H56A16,16,0,0,0,40,56V200a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm-64,80h64v16H136Zm0-16V88h64v16Zm0,48h64v16H136Zm64-80H136V56h64ZM56,56h64V200H56ZM200,200H136V184h64v16Z"/>`
  ],
  [
    "bold",
    e`<path d="M200,36H56A20,20,0,0,0,36,56V200a20,20,0,0,0,20,20H200a20,20,0,0,0,20-20V56A20,20,0,0,0,200,36Zm-60,64h56v16H140Zm0,40h56v16H140Zm56-64H140V60h56ZM60,60h56V196H60Zm80,136V180h56v16Z"/>`
  ],
  [
    "fill",
    e`<path d="M200,40H56A16,16,0,0,0,40,56V200a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40ZM56,56h72V200H56Z"/>`
  ],
  [
    "duotone",
    e`<path d="M208,56V200a8,8,0,0,1-8,8H128V48h72A8,8,0,0,1,208,56Z" opacity="0.2"/><path d="M200,40H56A16,16,0,0,0,40,56V200a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40ZM56,56h64V200H56ZM200,200H136V56h64V200Z"/>`
  ]
]);
t.styles = v`
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
  Z("ph-square-half")
], t);
export {
  t as PhSquareHalf
};
