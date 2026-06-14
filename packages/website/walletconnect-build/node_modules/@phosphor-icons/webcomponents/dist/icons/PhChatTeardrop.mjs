import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as g } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as h } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as f } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var u = Object.defineProperty, d = Object.getOwnPropertyDescriptor, o = (a, s, i, p) => {
  for (var r = p > 1 ? void 0 : p ? d(s, i) : s, l = a.length - 1, m; l >= 0; l--)
    (m = a[l]) && (r = (p ? m(s, i, r) : m(r)) || r);
  return p && r && u(s, i, r), r;
};
let t = class extends g {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return n`<svg
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
    e`<path d="M132,28a96.11,96.11,0,0,0-96,96v84a12,12,0,0,0,12,12h84a96,96,0,0,0,0-192Zm0,184H48a4,4,0,0,1-4-4V124a88,88,0,1,1,88,88Z"/>`
  ],
  [
    "light",
    e`<path d="M132,26a98.11,98.11,0,0,0-98,98v84a14,14,0,0,0,14,14h84a98,98,0,0,0,0-196Zm0,184H48a2,2,0,0,1-2-2V124a86,86,0,1,1,86,86Z"/>`
  ],
  [
    "regular",
    e`<path d="M132,24A100.11,100.11,0,0,0,32,124v84a16,16,0,0,0,16,16h84a100,100,0,0,0,0-200Zm0,184H48V124a84,84,0,1,1,84,84Z"/>`
  ],
  [
    "bold",
    e`<path d="M132,20A104.11,104.11,0,0,0,28,124v84a20,20,0,0,0,20,20h84a104,104,0,0,0,0-208Zm0,184H52V124a80,80,0,1,1,80,80Z"/>`
  ],
  [
    "fill",
    e`<path d="M232,124A100.11,100.11,0,0,1,132,224H48a16,16,0,0,1-16-16V124a100,100,0,0,1,200,0Z"/>`
  ],
  [
    "duotone",
    e`<path d="M224,124h0a92,92,0,0,1-92,92H48a8,8,0,0,1-8-8V124a92,92,0,0,1,92-92h0A92,92,0,0,1,224,124Z" opacity="0.2"/><path d="M132,24A100.11,100.11,0,0,0,32,124v84a16,16,0,0,0,16,16h84a100,100,0,0,0,0-200Zm0,184H48V124a84,84,0,1,1,84,84Z"/>`
  ]
]);
t.styles = f`
    :host {
      display: contents;
    }
  `;
o([
  h({ type: String, reflect: !0 })
], t.prototype, "size", 2);
o([
  h({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
o([
  h({ type: String, reflect: !0 })
], t.prototype, "color", 2);
o([
  h({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = o([
  c("ph-chat-teardrop")
], t);
export {
  t as PhChatTeardrop
};
