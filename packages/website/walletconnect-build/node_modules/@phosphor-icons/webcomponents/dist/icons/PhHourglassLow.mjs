import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as V } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var v = Object.defineProperty, M = Object.getOwnPropertyDescriptor, o = (e, s, p, l) => {
  for (var a = l > 1 ? void 0 : l ? M(s, p) : s, h = e.length - 1, H; h >= 0; h--)
    (H = e[h]) && (a = (l ? H(s, p, a) : H(a)) || a);
  return l && a && v(s, p, a), a;
};
let t = class extends m {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return V`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((e = this.weight) != null ? e : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    r`<path d="M196,75.64V40a12,12,0,0,0-12-12H72A12,12,0,0,0,60,40V76a12,12,0,0,0,4.8,9.6L121.33,128,64.8,170.4A12,12,0,0,0,60,180v36a12,12,0,0,0,12,12H184a12,12,0,0,0,12-12V180.36a12.05,12.05,0,0,0-4.76-9.57L134.63,128l56.61-42.79A12.05,12.05,0,0,0,196,75.64ZM184,220H72a4,4,0,0,1-4-4V188H188v28A4,4,0,0,1,184,220Zm4-40H68a4,4,0,0,1,1.6-3.2L128,133l58.42,44.16A4,4,0,0,1,188,180Zm0-104.36a4,4,0,0,1-1.59,3.19L128,123,69.6,79.2A4,4,0,0,1,68,76V40a4,4,0,0,1,4-4H184a4,4,0,0,1,4,4Z"/>`
  ],
  [
    "light",
    r`<path d="M198,75.64V40a14,14,0,0,0-14-14H72A14,14,0,0,0,58,40V76a14.06,14.06,0,0,0,5.6,11.2L118,128,63.6,168.8A14.06,14.06,0,0,0,58,180v36a14,14,0,0,0,14,14H184a14,14,0,0,0,14-14V180.36a14.08,14.08,0,0,0-5.56-11.17L138,128l54.49-41.19A14.08,14.08,0,0,0,198,75.64ZM184.2,178H71.33L128,135.51Zm-.2,40H72a2,2,0,0,1-2-2V190H186v26A2,2,0,0,1,184,218Zm2-142.36a2,2,0,0,1-.79,1.6L128,120.49,70.8,77.6A2,2,0,0,1,70,76V40a2,2,0,0,1,2-2H184a2,2,0,0,1,2,2Z"/>`
  ],
  [
    "regular",
    r`<path d="M200,75.64V40a16,16,0,0,0-16-16H72A16,16,0,0,0,56,40V76a16.07,16.07,0,0,0,6.4,12.8L114.67,128,62.4,167.2A16.07,16.07,0,0,0,56,180v36a16,16,0,0,0,16,16H184a16,16,0,0,0,16-16V180.36a16.08,16.08,0,0,0-6.35-12.76L141.27,128l52.38-39.6A16.05,16.05,0,0,0,200,75.64ZM178.23,176H77.33L128,138ZM72,216V192H184v24ZM184,75.64,128,118,72,76V40H184Z"/>`
  ],
  [
    "bold",
    r`<path d="M204,75.64V40a20,20,0,0,0-20-20H72A20,20,0,0,0,52,40V76a20.1,20.1,0,0,0,8,16l48,36L60,164a20.1,20.1,0,0,0-8,16v36a20,20,0,0,0,20,20H184a20,20,0,0,0,20-20V180.36a20.13,20.13,0,0,0-7.94-16L147.9,128l48.16-36.4A20.13,20.13,0,0,0,204,75.64ZM166.31,172h-77L128,143ZM76,212V196H180v16ZM180,73.65,128,113,76,74V44H180Z"/>`
  ],
  [
    "fill",
    r`<path d="M200,75.64V40a16,16,0,0,0-16-16H72A16,16,0,0,0,56,40V76a16.07,16.07,0,0,0,6.4,12.8L114.67,128,62.4,167.2A16.07,16.07,0,0,0,56,180v36a16,16,0,0,0,16,16H184a16,16,0,0,0,16-16V180.36a16.08,16.08,0,0,0-6.35-12.76L141.27,128l52.38-39.59A16.09,16.09,0,0,0,200,75.64ZM178.23,176H77.33L128,138ZM184,75.64,128,118,72,76V40H184Z"/>`
  ],
  [
    "duotone",
    r`<path d="M192,184v32a8,8,0,0,1-8,8H72a8,8,0,0,1-8-8V184Z" opacity="0.2"/><path d="M200,75.64V40a16,16,0,0,0-16-16H72A16,16,0,0,0,56,40V76a16.07,16.07,0,0,0,6.4,12.8L114.67,128,62.4,167.2A16.07,16.07,0,0,0,56,180v36a16,16,0,0,0,16,16H184a16,16,0,0,0,16-16V180.36a16.08,16.08,0,0,0-6.35-12.76L141.27,128l52.38-39.59A16.09,16.09,0,0,0,200,75.64ZM178.23,176H77.33L128,138ZM72,216V192H184v24ZM184,75.64,128,118,72,76V40H184Z"/>`
  ]
]);
t.styles = n`
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
  Z("ph-hourglass-low")
], t);
export {
  t as PhHourglassLow
};
