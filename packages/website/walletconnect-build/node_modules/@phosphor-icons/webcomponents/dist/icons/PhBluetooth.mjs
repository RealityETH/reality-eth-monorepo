import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as L } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as v } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var u = Object.defineProperty, c = Object.getOwnPropertyDescriptor, a = (l, o, p, s) => {
  for (var e = s > 1 ? void 0 : s ? c(o, p) : o, h = l.length - 1, m; h >= 0; h--)
    (m = l[h]) && (e = (s ? m(o, p, e) : m(e)) || e);
  return s && e && u(o, p, e), e;
};
let t = class extends L {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var l;
    return n`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((l = this.weight) != null ? l : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    r`<path d="M194.4,172.8,134.67,128,194.4,83.2a4,4,0,0,0,0-6.4l-64-48A4,4,0,0,0,124,32v88L66.4,76.8a4,4,0,0,0-4.8,6.4L121.33,128,61.6,172.8a4,4,0,0,0,4.8,6.4L124,136v88a4,4,0,0,0,6.4,3.2l64-48a4,4,0,0,0,0-6.4ZM132,40l53.33,40L132,120Zm0,176V136l53.33,40Z"/>`
  ],
  [
    "light",
    r`<path d="M195.6,171.2,138,128l57.6-43.2a6,6,0,0,0,0-9.6l-64-48A6,6,0,0,0,122,32v84L67.6,75.2a6,6,0,0,0-7.2,9.6L118,128,60.4,171.2a6,6,0,1,0,7.2,9.6L122,140v84a6,6,0,0,0,9.6,4.8l64-48a6,6,0,0,0,0-9.6ZM134,44l48,36-48,36Zm0,168V140l48,36Z"/>`
  ],
  [
    "regular",
    r`<path d="M196.8,169.6,141.33,128,196.8,86.4a8,8,0,0,0,0-12.8l-64-48A8,8,0,0,0,120,32v80L68.8,73.6a8,8,0,0,0-9.6,12.8L114.67,128,59.2,169.6a8,8,0,1,0,9.6,12.8L120,144v80a8,8,0,0,0,12.8,6.4l64-48a8,8,0,0,0,0-12.8ZM136,48l42.67,32L136,112Zm0,160V144l42.67,32Z"/>`
  ],
  [
    "bold",
    r`<path d="M199.2,166.4,148,128l51.2-38.4a12,12,0,0,0,0-19.2l-64-48A12,12,0,0,0,116,32v72L71.2,70.4A12,12,0,0,0,56.8,89.6L108,128,56.8,166.4a12,12,0,1,0,14.4,19.2L116,152v72a12,12,0,0,0,19.2,9.6l64-48a12,12,0,0,0,0-19.2ZM140,56l32,24-32,24Zm0,144V152l32,24Z"/>`
  ],
  [
    "fill",
    r`<path d="M200,176a8,8,0,0,1-3.2,6.4l-64,48A8,8,0,0,1,128,232a8,8,0,0,1-8-8V144L68.8,182.4a8,8,0,0,1-9.6-12.8L114.67,128,59.2,86.4a8,8,0,0,1,9.6-12.8L120,112V32a8,8,0,0,1,12.8-6.4l64,48a8,8,0,0,1,0,12.8L141.33,128l55.47,41.6A8,8,0,0,1,200,176Z"/>`
  ],
  [
    "duotone",
    r`<path d="M192,80l-64,48V32ZM128,224l64-48-64-48Z" opacity="0.2"/><path d="M196.8,169.6,141.33,128,196.8,86.4a8,8,0,0,0,0-12.8l-64-48A8,8,0,0,0,120,32v80L68.8,73.6a8,8,0,0,0-9.6,12.8L114.67,128,59.2,169.6a8,8,0,1,0,9.6,12.8L120,144v80a8,8,0,0,0,12.8,6.4l64-48a8,8,0,0,0,0-12.8ZM136,48l42.67,32L136,112Zm0,160V144l42.67,32Z"/>`
  ]
]);
t.styles = g`
    :host {
      display: contents;
    }
  `;
a([
  i({ type: String, reflect: !0 })
], t.prototype, "size", 2);
a([
  i({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
a([
  i({ type: String, reflect: !0 })
], t.prototype, "color", 2);
a([
  i({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = a([
  v("ph-bluetooth")
], t);
export {
  t as PhBluetooth
};
