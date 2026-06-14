import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as c } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as n } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var f = Object.defineProperty, u = Object.getOwnPropertyDescriptor, s = (a, o, l, i) => {
  for (var e = i > 1 ? void 0 : i ? u(o, l) : o, h = a.length - 1, m; h >= 0; h--)
    (m = a[h]) && (e = (i ? m(o, l, e) : m(e)) || e);
  return i && e && f(o, l, e), e;
};
let t = class extends n {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return c`<svg
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
    r`<path d="M220,192a4,4,0,0,1-8,0c0-81.61-66.39-148-148-148a4,4,0,0,1,0-8C150,36,220,106,220,192ZM64,108a4,4,0,0,0,0,8,76.08,76.08,0,0,1,76,76,4,4,0,0,0,8,0A84.09,84.09,0,0,0,64,108Zm4,72a8,8,0,1,0,8,8A8,8,0,0,0,68,180Z"/>`
  ],
  [
    "light",
    r`<path d="M222,192a6,6,0,0,1-12,0c0-80.5-65.5-146-146-146a6,6,0,0,1,0-12C151.12,34,222,104.88,222,192ZM64,106a6,6,0,0,0,0,12,74.09,74.09,0,0,1,74,74,6,6,0,0,0,12,0A86.1,86.1,0,0,0,64,106Zm4,72a10,10,0,1,0,10,10A10,10,0,0,0,68,178Z"/>`
  ],
  [
    "regular",
    r`<path d="M224,192a8,8,0,0,1-16,0c0-79.4-64.6-144-144-144a8,8,0,0,1,0-16C152.22,32,224,103.78,224,192ZM64,104a8,8,0,0,0,0,16,72.08,72.08,0,0,1,72,72,8,8,0,0,0,16,0A88.1,88.1,0,0,0,64,104Zm4,72a12,12,0,1,0,12,12A12,12,0,0,0,68,176Z"/>`
  ],
  [
    "bold",
    r`<path d="M228,192a12,12,0,0,1-24,0c0-77.2-62.8-140-140-140a12,12,0,0,1,0-24C154.43,28,228,101.57,228,192ZM64,100a12,12,0,0,0,0,24,68.07,68.07,0,0,1,68,68,12,12,0,0,0,24,0A92.1,92.1,0,0,0,64,100Zm4,72a16,16,0,1,0,16,16A16,16,0,0,0,68,172Z"/>`
  ],
  [
    "fill",
    r`<path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM76,192a12,12,0,1,1,12-12A12,12,0,0,1,76,192Zm60,0a8,8,0,0,1-8-8,56.06,56.06,0,0,0-56-56,8,8,0,0,1,0-16,72.08,72.08,0,0,1,72,72A8,8,0,0,1,136,192Zm48,0a8,8,0,0,1-8-8A104.11,104.11,0,0,0,72,80a8,8,0,0,1,0-16A120.13,120.13,0,0,1,192,184,8,8,0,0,1,184,192Z"/>`
  ],
  [
    "duotone",
    r`<path d="M216,192H64V40A152,152,0,0,1,216,192Z" opacity="0.2"/><path d="M224,192a8,8,0,0,1-16,0c0-79.4-64.6-144-144-144a8,8,0,0,1,0-16C152.22,32,224,103.78,224,192ZM64,104a8,8,0,0,0,0,16,72.08,72.08,0,0,1,72,72,8,8,0,0,0,16,0A88.1,88.1,0,0,0,64,104Zm4,72a12,12,0,1,0,12,12A12,12,0,0,0,68,176Z"/>`
  ]
]);
t.styles = Z`
    :host {
      display: contents;
    }
  `;
s([
  p({ type: String, reflect: !0 })
], t.prototype, "size", 2);
s([
  p({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
s([
  p({ type: String, reflect: !0 })
], t.prototype, "color", 2);
s([
  p({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = s([
  g("ph-rss-simple")
], t);
export {
  t as PhRssSimple
};
