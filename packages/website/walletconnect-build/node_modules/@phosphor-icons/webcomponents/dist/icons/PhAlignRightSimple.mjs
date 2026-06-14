import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as g } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as H } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as v } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var V = Object.defineProperty, c = Object.getOwnPropertyDescriptor, s = (a, o, l, i) => {
  for (var e = i > 1 ? void 0 : i ? c(o, l) : o, h = a.length - 1, m; h >= 0; h--)
    (m = a[h]) && (e = (i ? m(o, l, e) : m(e)) || e);
  return i && e && V(o, l, e), e;
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
    r`<path d="M228,56V200a4,4,0,0,1-8,0V56a4,4,0,0,1,8,0ZM196,96v64a12,12,0,0,1-12,12H32a12,12,0,0,1-12-12V96A12,12,0,0,1,32,84H184A12,12,0,0,1,196,96Zm-8,0a4,4,0,0,0-4-4H32a4,4,0,0,0-4,4v64a4,4,0,0,0,4,4H184a4,4,0,0,0,4-4Z"/>`
  ],
  [
    "light",
    r`<path d="M230,56V200a6,6,0,0,1-12,0V56a6,6,0,0,1,12,0ZM198,96v64a14,14,0,0,1-14,14H32a14,14,0,0,1-14-14V96A14,14,0,0,1,32,82H184A14,14,0,0,1,198,96Zm-12,0a2,2,0,0,0-2-2H32a2,2,0,0,0-2,2v64a2,2,0,0,0,2,2H184a2,2,0,0,0,2-2Z"/>`
  ],
  [
    "regular",
    r`<path d="M232,56V200a8,8,0,0,1-16,0V56a8,8,0,0,1,16,0ZM200,96v64a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V96A16,16,0,0,1,32,80H184A16,16,0,0,1,200,96Zm-16,0H32v64H184Z"/>`
  ],
  [
    "bold",
    r`<path d="M236,56V200a12,12,0,0,1-24,0V56a12,12,0,0,1,24,0ZM196,96v64a20,20,0,0,1-20,20H32a20,20,0,0,1-20-20V96A20,20,0,0,1,32,76H176A20,20,0,0,1,196,96Zm-24,4H36v56H172Z"/>`
  ],
  [
    "fill",
    r`<path d="M232,56V200a8,8,0,0,1-16,0V56a8,8,0,0,1,16,0ZM184,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H184a16,16,0,0,0,16-16V96A16,16,0,0,0,184,80Z"/>`
  ],
  [
    "duotone",
    r`<path d="M192,96v64a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V96a8,8,0,0,1,8-8H184A8,8,0,0,1,192,96Z" opacity="0.2"/><path d="M232,56V200a8,8,0,0,1-16,0V56a8,8,0,0,1,16,0ZM200,96v64a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V96A16,16,0,0,1,32,80H184A16,16,0,0,1,200,96Zm-16,0H32v64H184Z"/>`
  ]
]);
t.styles = v`
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
  H("ph-align-right-simple")
], t);
export {
  t as PhAlignRightSimple
};
