import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as v } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as H } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var g = Object.defineProperty, c = Object.getOwnPropertyDescriptor, o = (a, s, p, h) => {
  for (var e = h > 1 ? void 0 : h ? c(s, p) : s, l = a.length - 1, V; l >= 0; l--)
    (V = a[l]) && (e = (h ? V(s, p, e) : V(e)) || e);
  return h && e && g(s, p, e), e;
};
let t = class extends v {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return m`<svg
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
    r`<path d="M216,76H28V48a4,4,0,0,0-8,0V208a4,4,0,0,0,8,0V172H244v36a4,4,0,0,0,8,0V112A36,36,0,0,0,216,76ZM28,84h80v80H28Zm88,80V84H216a28,28,0,0,1,28,28v52Z"/>`
  ],
  [
    "light",
    r`<path d="M216,74H30V48a6,6,0,0,0-12,0V208a6,6,0,0,0,12,0V174H242v34a6,6,0,0,0,12,0V112A38,38,0,0,0,216,74ZM30,86h76v76H30Zm88,76V86h98a26,26,0,0,1,26,26v50Z"/>`
  ],
  [
    "regular",
    r`<path d="M216,72H32V48a8,8,0,0,0-16,0V208a8,8,0,0,0,16,0V176H240v32a8,8,0,0,0,16,0V112A40,40,0,0,0,216,72ZM32,88h72v72H32Zm88,72V88h96a24,24,0,0,1,24,24v48Z"/>`
  ],
  [
    "bold",
    r`<path d="M212,68H36V48a12,12,0,0,0-24,0V208a12,12,0,0,0,24,0V180H232v28a12,12,0,0,0,24,0V112A44.05,44.05,0,0,0,212,68ZM100,156H36V92h64Zm132,0H124V92h88a20,20,0,0,1,20,20Z"/>`
  ],
  [
    "fill",
    r`<path d="M216,72H32V48a8,8,0,0,0-16,0V208a8,8,0,0,0,16,0V176H240v32a8,8,0,0,0,16,0V112A40,40,0,0,0,216,72ZM32,88h72v72H32Z"/>`
  ],
  [
    "duotone",
    r`<path d="M248,112v56H112V80H216A32,32,0,0,1,248,112Z" opacity="0.2"/><path d="M216,72H32V48a8,8,0,0,0-16,0V208a8,8,0,0,0,16,0V176H240v32a8,8,0,0,0,16,0V112A40,40,0,0,0,216,72ZM32,88h72v72H32Zm88,72V88h96a24,24,0,0,1,24,24v48Z"/>`
  ]
]);
t.styles = H`
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
  n("ph-bed")
], t);
export {
  t as PhBed
};
