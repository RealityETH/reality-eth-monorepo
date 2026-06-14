import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as Z } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as l } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as A } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as o } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var V = Object.defineProperty, g = Object.getOwnPropertyDescriptor, H = (r, s, m, h) => {
  for (var t = h > 1 ? void 0 : h ? g(s, m) : s, i = r.length - 1, p; i >= 0; i--)
    (p = r[i]) && (t = (h ? p(s, m, t) : p(t)) || t);
  return h && t && V(s, m, t), t;
};
let a = class extends l {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var r;
    return Z`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${a.weightsMap.get((r = this.weight) != null ? r : "regular")}
    </svg>`;
  }
};
a.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    e`<path d="M224,52H32A12,12,0,0,0,20,64V192a12,12,0,0,0,12,12H224a12,12,0,0,0,12-12V64A12,12,0,0,0,224,52Zm4,140a4,4,0,0,1-4,4H32a4,4,0,0,1-4-4V64a4,4,0,0,1,4-4H224a4,4,0,0,1,4,4ZM52,136a4,4,0,0,1,4-4H72a4,4,0,0,1,0,8H56A4,4,0,0,1,52,136Zm152,0a4,4,0,0,1-4,4H104a4,4,0,0,1,0-8h96A4,4,0,0,1,204,136Zm-48,32a4,4,0,0,1-4,4H56a4,4,0,0,1,0-8h96A4,4,0,0,1,156,168Zm48,0a4,4,0,0,1-4,4H184a4,4,0,0,1,0-8h16A4,4,0,0,1,204,168Z"/>`
  ],
  [
    "light",
    e`<path d="M224,50H32A14,14,0,0,0,18,64V192a14,14,0,0,0,14,14H224a14,14,0,0,0,14-14V64A14,14,0,0,0,224,50Zm2,142a2,2,0,0,1-2,2H32a2,2,0,0,1-2-2V64a2,2,0,0,1,2-2H224a2,2,0,0,1,2,2ZM50,136a6,6,0,0,1,6-6H72a6,6,0,0,1,0,12H56A6,6,0,0,1,50,136Zm156,0a6,6,0,0,1-6,6H104a6,6,0,0,1,0-12h96A6,6,0,0,1,206,136Zm-48,32a6,6,0,0,1-6,6H56a6,6,0,0,1,0-12h96A6,6,0,0,1,158,168Zm48,0a6,6,0,0,1-6,6H184a6,6,0,0,1,0-12h16A6,6,0,0,1,206,168Z"/>`
  ],
  [
    "regular",
    e`<path d="M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48Zm0,144H32V64H224V192ZM48,136a8,8,0,0,1,8-8H72a8,8,0,0,1,0,16H56A8,8,0,0,1,48,136Zm160,0a8,8,0,0,1-8,8H104a8,8,0,0,1,0-16h96A8,8,0,0,1,208,136Zm-48,32a8,8,0,0,1-8,8H56a8,8,0,0,1,0-16h96A8,8,0,0,1,160,168Zm48,0a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16h16A8,8,0,0,1,208,168Z"/>`
  ],
  [
    "bold",
    e`<path d="M224,44H32A20,20,0,0,0,12,64V192a20,20,0,0,0,20,20H224a20,20,0,0,0,20-20V64A20,20,0,0,0,224,44Zm-4,144H36V68H220ZM48,128a12,12,0,0,1,12-12H76a12,12,0,0,1,0,24H60A12,12,0,0,1,48,128Zm56,0a12,12,0,0,1,12-12h80a12,12,0,0,1,0,24H116A12,12,0,0,1,104,128ZM48,164a12,12,0,0,1,12-12h80a12,12,0,0,1,0,24H60A12,12,0,0,1,48,164Zm160,0a12,12,0,0,1-12,12H180a12,12,0,0,1,0-24h16A12,12,0,0,1,208,164Z"/>`
  ],
  [
    "fill",
    e`<path d="M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48ZM56,128H72a8,8,0,0,1,0,16H56a8,8,0,0,1,0-16Zm96,48H56a8,8,0,0,1,0-16h96a8,8,0,0,1,0,16Zm48,0H184a8,8,0,0,1,0-16h16a8,8,0,0,1,0,16Zm0-32H104a8,8,0,0,1,0-16h96a8,8,0,0,1,0,16Z"/>`
  ],
  [
    "duotone",
    e`<path d="M232,64V192a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H224A8,8,0,0,1,232,64Z" opacity="0.2"/><path d="M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48Zm0,144H32V64H224V192ZM48,136a8,8,0,0,1,8-8H72a8,8,0,0,1,0,16H56A8,8,0,0,1,48,136Zm160,0a8,8,0,0,1-8,8H104a8,8,0,0,1,0-16h96A8,8,0,0,1,208,136Zm-48,32a8,8,0,0,1-8,8H56a8,8,0,0,1,0-16h96A8,8,0,0,1,160,168Zm48,0a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16h16A8,8,0,0,1,208,168Z"/>`
  ]
]);
a.styles = n`
    :host {
      display: contents;
    }
  `;
H([
  o({ type: String, reflect: !0 })
], a.prototype, "size", 2);
H([
  o({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
H([
  o({ type: String, reflect: !0 })
], a.prototype, "color", 2);
H([
  o({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = H([
  A("ph-subtitles")
], a);
export {
  a as PhSubtitles
};
