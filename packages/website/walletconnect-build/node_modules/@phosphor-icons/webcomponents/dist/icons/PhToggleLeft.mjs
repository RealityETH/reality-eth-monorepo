import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as g } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as n } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as f } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var c = Object.defineProperty, u = Object.getOwnPropertyDescriptor, o = (a, s, p, h) => {
  for (var e = h > 1 ? void 0 : h ? u(s, p) : s, l = a.length - 1, m; l >= 0; l--)
    (m = a[l]) && (e = (h ? m(s, p, e) : m(e)) || e);
  return h && e && c(s, p, e), e;
};
let t = class extends n {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return g`<svg
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
    r`<path d="M176,60H80a68,68,0,0,0,0,136h96a68,68,0,0,0,0-136Zm0,128H80A60,60,0,0,1,80,68h96a60,60,0,0,1,0,120ZM80,92a36,36,0,1,0,36,36A36,36,0,0,0,80,92Zm0,64a28,28,0,1,1,28-28A28,28,0,0,1,80,156Z"/>`
  ],
  [
    "light",
    r`<path d="M176,58H80a70,70,0,0,0,0,140h96a70,70,0,0,0,0-140Zm0,128H80A58,58,0,0,1,80,70h96a58,58,0,0,1,0,116ZM80,90a38,38,0,1,0,38,38A38,38,0,0,0,80,90Zm0,64a26,26,0,1,1,26-26A26,26,0,0,1,80,154Z"/>`
  ],
  [
    "regular",
    r`<path d="M176,56H80a72,72,0,0,0,0,144h96a72,72,0,0,0,0-144Zm0,128H80A56,56,0,0,1,80,72h96a56,56,0,0,1,0,112ZM80,88a40,40,0,1,0,40,40A40,40,0,0,0,80,88Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,80,152Z"/>`
  ],
  [
    "bold",
    r`<path d="M176,52H80a76,76,0,0,0,0,152h96a76,76,0,0,0,0-152Zm0,128H80A52,52,0,0,1,80,76h96a52,52,0,0,1,0,104ZM80,88a40,40,0,1,0,40,40A40,40,0,0,0,80,88Zm0,56a16,16,0,1,1,16-16A16,16,0,0,1,80,144Z"/>`
  ],
  [
    "fill",
    r`<path d="M176,56H80a72,72,0,0,0,0,144h96a72,72,0,0,0,0-144ZM80,168a40,40,0,1,1,40-40A40,40,0,0,1,80,168Z"/>`
  ],
  [
    "duotone",
    r`<path d="M112,128A32,32,0,1,1,80,96,32,32,0,0,1,112,128Z" opacity="0.2"/><path d="M176,56H80a72,72,0,0,0,0,144h96a72,72,0,0,0,0-144Zm0,128H80A56,56,0,0,1,80,72h96a56,56,0,0,1,0,112ZM80,88a40,40,0,1,0,40,40A40,40,0,0,0,80,88Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,80,152Z"/>`
  ]
]);
t.styles = f`
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
  Z("ph-toggle-left")
], t);
export {
  t as PhToggleLeft
};
