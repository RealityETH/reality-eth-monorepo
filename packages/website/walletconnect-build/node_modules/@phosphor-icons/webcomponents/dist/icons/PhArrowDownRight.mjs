import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as g } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as f } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var w = Object.defineProperty, u = Object.getOwnPropertyDescriptor, a = (o, s, h, i) => {
  for (var r = i > 1 ? void 0 : i ? u(s, h) : s, l = o.length - 1, n; l >= 0; l--)
    (n = o[l]) && (r = (i ? n(s, h, r) : n(r)) || r);
  return i && r && w(s, h, r), r;
};
let t = class extends m {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var o;
    return g`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((o = this.weight) != null ? o : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    e`<path d="M196,88V192a4,4,0,0,1-4,4H88a4,4,0,0,1,0-8h94.34L61.17,66.83a4,4,0,0,1,5.66-5.66L188,182.34V88a4,4,0,0,1,8,0Z"/>`
  ],
  [
    "light",
    e`<path d="M198,88V192a6,6,0,0,1-6,6H88a6,6,0,0,1,0-12h89.52L59.76,68.24a6,6,0,0,1,8.48-8.48L186,177.52V88a6,6,0,0,1,12,0Z"/>`
  ],
  [
    "regular",
    e`<path d="M200,88V192a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h84.69L58.34,69.66A8,8,0,0,1,69.66,58.34L184,172.69V88a8,8,0,0,1,16,0Z"/>`
  ],
  [
    "bold",
    e`<path d="M204,88V192a12,12,0,0,1-12,12H88a12,12,0,0,1,0-24h75L55.51,72.48a12,12,0,0,1,17-17L180,163V88a12,12,0,0,1,24,0Z"/>`
  ],
  [
    "fill",
    e`<path d="M200,88V192a8,8,0,0,1-8,8H88a8,8,0,0,1-5.66-13.66L128.69,140,58.34,69.66A8,8,0,0,1,69.66,58.34L140,128.69l46.34-46.35A8,8,0,0,1,200,88Z"/>`
  ],
  [
    "duotone",
    e`<path d="M192,88V192H88Z" opacity="0.2"/><path d="M195.06,80.61a8,8,0,0,0-8.72,1.73L140,128.69,69.66,58.34A8,8,0,0,0,58.34,69.66L128.69,140,82.34,186.34A8,8,0,0,0,88,200H192a8,8,0,0,0,8-8V88A8,8,0,0,0,195.06,80.61ZM184,184H107.31l38.34-38.34h0L184,107.31Z"/>`
  ]
]);
t.styles = f`
    :host {
      display: contents;
    }
  `;
a([
  p({ type: String, reflect: !0 })
], t.prototype, "size", 2);
a([
  p({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
a([
  p({ type: String, reflect: !0 })
], t.prototype, "color", 2);
a([
  p({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = a([
  c("ph-arrow-down-right")
], t);
export {
  t as PhArrowDownRight
};
