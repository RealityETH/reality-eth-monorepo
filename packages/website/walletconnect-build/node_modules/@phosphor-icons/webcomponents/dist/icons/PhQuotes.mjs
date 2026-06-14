import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as H } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as V } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var n = Object.defineProperty, g = Object.getOwnPropertyDescriptor, h = (r, o, p, s) => {
  for (var a = s > 1 ? void 0 : s ? g(o, p) : o, v = r.length - 1, l; v >= 0; v--)
    (l = r[v]) && (a = (s ? l(o, p, a) : l(a)) || a);
  return s && a && n(o, p, a), a;
};
let t = class extends H {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var r;
    return m`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((r = this.weight) != null ? r : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    e`<path d="M100,60H40A12,12,0,0,0,28,72v64a12,12,0,0,0,12,12h64v12a36,36,0,0,1-36,36,4,4,0,0,0,0,8,44.05,44.05,0,0,0,44-44V72A12,12,0,0,0,100,60Zm4,80H40a4,4,0,0,1-4-4V72a4,4,0,0,1,4-4h60a4,4,0,0,1,4,4ZM216,60H156a12,12,0,0,0-12,12v64a12,12,0,0,0,12,12h64v12a36,36,0,0,1-36,36,4,4,0,0,0,0,8,44.05,44.05,0,0,0,44-44V72A12,12,0,0,0,216,60Zm4,80H156a4,4,0,0,1-4-4V72a4,4,0,0,1,4-4h60a4,4,0,0,1,4,4Z"/>`
  ],
  [
    "light",
    e`<path d="M100,58H40A14,14,0,0,0,26,72v64a14,14,0,0,0,14,14h62v10a34,34,0,0,1-34,34,6,6,0,0,0,0,12,46.06,46.06,0,0,0,46-46V72A14,14,0,0,0,100,58Zm2,80H40a2,2,0,0,1-2-2V72a2,2,0,0,1,2-2h60a2,2,0,0,1,2,2ZM216,58H156a14,14,0,0,0-14,14v64a14,14,0,0,0,14,14h62v10a34,34,0,0,1-34,34,6,6,0,0,0,0,12,46.06,46.06,0,0,0,46-46V72A14,14,0,0,0,216,58Zm2,80H156a2,2,0,0,1-2-2V72a2,2,0,0,1,2-2h60a2,2,0,0,1,2,2Z"/>`
  ],
  [
    "regular",
    e`<path d="M100,56H40A16,16,0,0,0,24,72v64a16,16,0,0,0,16,16h60v8a32,32,0,0,1-32,32,8,8,0,0,0,0,16,48.05,48.05,0,0,0,48-48V72A16,16,0,0,0,100,56Zm0,80H40V72h60ZM216,56H156a16,16,0,0,0-16,16v64a16,16,0,0,0,16,16h60v8a32,32,0,0,1-32,32,8,8,0,0,0,0,16,48.05,48.05,0,0,0,48-48V72A16,16,0,0,0,216,56Zm0,80H156V72h60Z"/>`
  ],
  [
    "bold",
    e`<path d="M100,52H40A20,20,0,0,0,20,72v64a20,20,0,0,0,20,20H96v4a28,28,0,0,1-28,28,12,12,0,0,0,0,24,52.06,52.06,0,0,0,52-52V72A20,20,0,0,0,100,52Zm-4,80H44V76H96ZM216,52H156a20,20,0,0,0-20,20v64a20,20,0,0,0,20,20h56v4a28,28,0,0,1-28,28,12,12,0,0,0,0,24,52.06,52.06,0,0,0,52-52V72A20,20,0,0,0,216,52Zm-4,80H160V76h52Z"/>`
  ],
  [
    "fill",
    e`<path d="M116,72v88a48.05,48.05,0,0,1-48,48,8,8,0,0,1,0-16,32,32,0,0,0,32-32v-8H40a16,16,0,0,1-16-16V72A16,16,0,0,1,40,56h60A16,16,0,0,1,116,72ZM216,56H156a16,16,0,0,0-16,16v64a16,16,0,0,0,16,16h60v8a32,32,0,0,1-32,32,8,8,0,0,0,0,16,48.05,48.05,0,0,0,48-48V72A16,16,0,0,0,216,56Z"/>`
  ],
  [
    "duotone",
    e`<path d="M108,72v72H40a8,8,0,0,1-8-8V72a8,8,0,0,1,8-8h60A8,8,0,0,1,108,72Zm108-8H156a8,8,0,0,0-8,8v64a8,8,0,0,0,8,8h68V72A8,8,0,0,0,216,64Z" opacity="0.2"/><path d="M100,56H40A16,16,0,0,0,24,72v64a16,16,0,0,0,16,16h60v8a32,32,0,0,1-32,32,8,8,0,0,0,0,16,48.05,48.05,0,0,0,48-48V72A16,16,0,0,0,100,56Zm0,80H40V72h60ZM216,56H156a16,16,0,0,0-16,16v64a16,16,0,0,0,16,16h60v8a32,32,0,0,1-32,32,8,8,0,0,0,0,16,48.05,48.05,0,0,0,48-48V72A16,16,0,0,0,216,56Zm0,80H156V72h60Z"/>`
  ]
]);
t.styles = Z`
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
  V("ph-quotes")
], t);
export {
  t as PhQuotes
};
