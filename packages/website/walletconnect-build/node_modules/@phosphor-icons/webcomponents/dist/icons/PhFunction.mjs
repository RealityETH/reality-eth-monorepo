import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as A } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as m } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as H } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var g = Object.defineProperty, f = Object.getOwnPropertyDescriptor, l = (a, o, i, s) => {
  for (var r = s > 1 ? void 0 : s ? f(o, i) : o, p = a.length - 1, h; p >= 0; p--)
    (h = a[p]) && (r = (s ? h(o, i, r) : h(r)) || r);
  return s && r && g(o, i, r), r;
};
let t = class extends A {
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
    e`<path d="M204,40a4,4,0,0,1-4,4H170.71a28,28,0,0,0-27.55,23l-10.37,57H184a4,4,0,0,1,0,8H131.34l-10.63,58.44A36,36,0,0,1,85.29,220H56a4,4,0,0,1,0-8H85.29a28,28,0,0,0,27.55-23l10.37-57H72a4,4,0,0,1,0-8h52.66l10.63-58.44A36,36,0,0,1,170.71,36H200A4,4,0,0,1,204,40Z"/>`
  ],
  [
    "light",
    e`<path d="M206,40a6,6,0,0,1-6,6H170.71a26,26,0,0,0-25.58,21.35L135.19,122H184a6,6,0,0,1,0,12H133l-10.33,56.8A38,38,0,0,1,85.29,222H56a6,6,0,0,1,0-12H85.29a26,26,0,0,0,25.58-21.35L120.81,134H72a6,6,0,0,1,0-12h51l10.33-56.8A38,38,0,0,1,170.71,34H200A6,6,0,0,1,206,40Z"/>`
  ],
  [
    "regular",
    e`<path d="M208,40a8,8,0,0,1-8,8H170.71a24,24,0,0,0-23.62,19.71L137.59,120H184a8,8,0,0,1,0,16H134.68l-10,55.16A40,40,0,0,1,85.29,224H56a8,8,0,0,1,0-16H85.29a24,24,0,0,0,23.62-19.71l9.5-52.29H72a8,8,0,0,1,0-16h49.32l10-55.16A40,40,0,0,1,170.71,32H200A8,8,0,0,1,208,40Z"/>`
  ],
  [
    "bold",
    e`<path d="M212,40a12,12,0,0,1-12,12H170.71A20,20,0,0,0,151,68.42L142.38,116H184a12,12,0,0,1,0,24H138l-9.44,51.87A44,44,0,0,1,85.29,228H56a12,12,0,0,1,0-24H85.29A20,20,0,0,0,105,187.58L113.62,140H72a12,12,0,0,1,0-24h46l9.44-51.87A44,44,0,0,1,170.71,28H200A12,12,0,0,1,212,40Z"/>`
  ],
  [
    "fill",
    e`<path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM176,72H159.92a16,16,0,0,0-15.73,13l-6.55,35H168a8,8,0,0,1,0,16H134.64l-7.11,37.9A32,32,0,0,1,96.08,200H80a8,8,0,0,1,0-16H96.08A16,16,0,0,0,111.81,171L118.36,136H88a8,8,0,0,1,0-16h33.36l7.11-37.9A32,32,0,0,1,159.92,56H176a8,8,0,0,1,0,16Z"/>`
  ],
  [
    "duotone",
    e`<path d="M200,40V200a16,16,0,0,1-16,16H56V56A16,16,0,0,1,72,40Z" opacity="0.2"/><path d="M208,40a8,8,0,0,1-8,8H170.71a24,24,0,0,0-23.62,19.71L137.59,120H184a8,8,0,0,1,0,16H134.68l-10,55.16A40,40,0,0,1,85.29,224H56a8,8,0,0,1,0-16H85.29a24,24,0,0,0,23.62-19.71l9.5-52.29H72a8,8,0,0,1,0-16h49.32l10-55.16A40,40,0,0,1,170.71,32H200A8,8,0,0,1,208,40Z"/>`
  ]
]);
t.styles = c`
    :host {
      display: contents;
    }
  `;
l([
  H({ type: String, reflect: !0 })
], t.prototype, "size", 2);
l([
  H({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
l([
  H({ type: String, reflect: !0 })
], t.prototype, "color", 2);
l([
  H({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = l([
  m("ph-function")
], t);
export {
  t as PhFunction
};
