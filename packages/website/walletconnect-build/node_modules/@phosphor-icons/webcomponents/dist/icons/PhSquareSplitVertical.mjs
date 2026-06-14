import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as V } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as v } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var c = Object.defineProperty, g = Object.getOwnPropertyDescriptor, s = (a, o, l, i) => {
  for (var r = i > 1 ? void 0 : i ? g(o, l) : o, h = a.length - 1, H; h >= 0; h--)
    (H = a[h]) && (r = (i ? H(o, l, r) : H(r)) || r);
  return i && r && c(o, l, r), r;
};
let t = class extends V {
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
    e`<path d="M200,44H56A12,12,0,0,0,44,56V200a12,12,0,0,0,12,12H200a12,12,0,0,0,12-12V56A12,12,0,0,0,200,44ZM56,52H200a4,4,0,0,1,4,4v68H52V56A4,4,0,0,1,56,52ZM200,204H56a4,4,0,0,1-4-4V132H204v68A4,4,0,0,1,200,204Z"/>`
  ],
  [
    "light",
    e`<path d="M200,42H56A14,14,0,0,0,42,56V200a14,14,0,0,0,14,14H200a14,14,0,0,0,14-14V56A14,14,0,0,0,200,42ZM56,54H200a2,2,0,0,1,2,2v66H54V56A2,2,0,0,1,56,54ZM200,202H56a2,2,0,0,1-2-2V134H202v66A2,2,0,0,1,200,202Z"/>`
  ],
  [
    "regular",
    e`<path d="M200,40H56A16,16,0,0,0,40,56V200a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,16v64H56V56Zm0,144H56V136H200v64Z"/>`
  ],
  [
    "bold",
    e`<path d="M200,36H56A20,20,0,0,0,36,56V200a20,20,0,0,0,20,20H200a20,20,0,0,0,20-20V56A20,20,0,0,0,200,36Zm-4,24v56H60V60ZM60,196V140H196v56Z"/>`
  ],
  [
    "fill",
    e`<path d="M216,56v60a4,4,0,0,1-4,4H44a4,4,0,0,1-4-4V56A16,16,0,0,1,56,40H200A16,16,0,0,1,216,56Zm-4,80H44a4,4,0,0,0-4,4v60a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V140A4,4,0,0,0,212,136Z"/>`
  ],
  [
    "duotone",
    e`<path d="M208,56V200a8,8,0,0,1-8,8H56a8,8,0,0,1-8-8V56a8,8,0,0,1,8-8H200A8,8,0,0,1,208,56Z" opacity="0.2"/><path d="M200,40H56A16,16,0,0,0,40,56V200a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,16v64H56V56Zm0,144H56V136H200v64Z"/>`
  ]
]);
t.styles = n`
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
  v("ph-square-split-vertical")
], t);
export {
  t as PhSquareSplitVertical
};
