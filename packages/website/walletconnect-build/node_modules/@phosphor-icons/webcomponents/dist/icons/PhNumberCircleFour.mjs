import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as Z } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as u } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var g = Object.defineProperty, f = Object.getOwnPropertyDescriptor, o = (a, h, l, s) => {
  for (var r = s > 1 ? void 0 : s ? f(h, l) : h, p = a.length - 1, m; p >= 0; p--)
    (m = a[p]) && (r = (s ? m(h, l, r) : m(r)) || r);
  return s && r && g(h, l, r), r;
};
let t = class extends Z {
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
    e`<path d="M128,28A100,100,0,1,0,228,128,100.11,100.11,0,0,0,128,28Zm0,192a92,92,0,1,1,92-92A92.1,92.1,0,0,1,128,220Zm32-72H148V80a4,4,0,0,0-7.16-2.46l-56,72A4,4,0,0,0,88,156h52v20a4,4,0,0,0,8,0V156h12a4,4,0,0,0,0-8Zm-20,0H96.18L140,91.66Z"/>`
  ],
  [
    "light",
    e`<path d="M128,26A102,102,0,1,0,230,128,102.12,102.12,0,0,0,128,26Zm0,192a90,90,0,1,1,90-90A90.1,90.1,0,0,1,128,218Zm32-72H150V80a6,6,0,0,0-10.74-3.68l-56,72A6,6,0,0,0,88,158h50v18a6,6,0,0,0,12,0V158h10a6,6,0,0,0,0-12Zm-22,0H100.27L138,97.49Z"/>`
  ],
  [
    "regular",
    e`<path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm32-72h-8V80a8,8,0,0,0-14.31-4.91l-56,72A8,8,0,0,0,88,160h48v16a8,8,0,0,0,16,0V160h8a8,8,0,0,0,0-16Zm-24,0H104.36L136,103.32Z"/>`
  ],
  [
    "bold",
    e`<path d="M128,20A108,108,0,1,0,236,128,108.12,108.12,0,0,0,128,20Zm0,192a84,84,0,1,1,84-84A84.09,84.09,0,0,1,128,212Zm32-72h-4V80a12,12,0,0,0-21.47-7.37l-56,72A12,12,0,0,0,88,164h44v12a12,12,0,0,0,24,0V164h4a12,12,0,0,0,0-24Zm-28,0H112.54L132,115Z"/>`
  ],
  [
    "fill",
    e`<path d="M104.36,144,136,103.32V144ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-64,24a8,8,0,0,0-8-8h-8V80a8,8,0,0,0-14.31-4.91l-56,72A8,8,0,0,0,88,160h48v16a8,8,0,0,0,16,0V160h8A8,8,0,0,0,168,152Z"/>`
  ],
  [
    "duotone",
    e`<path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"/><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm32-72h-8V80a8,8,0,0,0-14.31-4.91l-56,72A8,8,0,0,0,88,160h48v16a8,8,0,0,0,16,0V160h8a8,8,0,0,0,0-16Zm-24,0H104.36L136,103.32Z"/>`
  ]
]);
t.styles = u`
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
  c("ph-number-circle-four")
], t);
export {
  t as PhNumberCircleFour
};
