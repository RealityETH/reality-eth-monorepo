import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as h } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as n } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as A } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as V } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as H } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var L = Object.defineProperty, Z = Object.getOwnPropertyDescriptor, l = (e, o, i, s) => {
  for (var t = s > 1 ? void 0 : s ? Z(o, i) : o, p = e.length - 1, m; p >= 0; p--)
    (m = e[p]) && (t = (s ? m(o, i, t) : m(t)) || t);
  return s && t && L(o, i, t), t;
};
let a = class extends n {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return h`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${a.weightsMap.get((e = this.weight) != null ? e : "regular")}
    </svg>`;
  }
};
a.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    r`<path d="M232,52H24A12,12,0,0,0,12,64V192a12,12,0,0,0,12,12H232a12,12,0,0,0,12-12V64A12,12,0,0,0,232,52Zm4,140a4,4,0,0,1-4,4H24a4,4,0,0,1-4-4V64a4,4,0,0,1,4-4H232a4,4,0,0,1,4,4ZM124,104v48a4,4,0,0,1-8,0V113.66L90.83,138.83a4,4,0,0,1-5.66,0L60,113.66V152a4,4,0,0,1-8,0V104a4,4,0,0,1,6.83-2.83L88,130.34l29.17-29.17A4,4,0,0,1,124,104Zm78.83,21.17a4,4,0,0,1,0,5.66l-24,24a4,4,0,0,1-5.66,0l-24-24a4,4,0,1,1,5.66-5.66L172,142.34V104a4,4,0,0,1,8,0v38.34l17.17-17.17A4,4,0,0,1,202.83,125.17Z"/>`
  ],
  [
    "light",
    r`<path d="M232,50H24A14,14,0,0,0,10,64V192a14,14,0,0,0,14,14H232a14,14,0,0,0,14-14V64A14,14,0,0,0,232,50Zm2,142a2,2,0,0,1-2,2H24a2,2,0,0,1-2-2V64a2,2,0,0,1,2-2H232a2,2,0,0,1,2,2ZM126,104v48a6,6,0,0,1-12,0V118.49L92.24,140.24a6,6,0,0,1-8.48,0L62,118.49V152a6,6,0,0,1-12,0V104a6,6,0,0,1,10.24-4.24L88,127.51l27.76-27.75A6,6,0,0,1,126,104Zm78.24,19.76a6,6,0,0,1,0,8.48l-24,24a6,6,0,0,1-8.48,0l-24-24a6,6,0,1,1,8.48-8.48L170,137.51V104a6,6,0,0,1,12,0v33.51l13.76-13.75A6,6,0,0,1,204.24,123.76Z"/>`
  ],
  [
    "regular",
    r`<path d="M232,48H24A16,16,0,0,0,8,64V192a16,16,0,0,0,16,16H232a16,16,0,0,0,16-16V64A16,16,0,0,0,232,48Zm0,144H24V64H232V192ZM128,104v48a8,8,0,0,1-16,0V123.31L93.66,141.66a8,8,0,0,1-11.32,0L64,123.31V152a8,8,0,0,1-16,0V104a8,8,0,0,1,13.66-5.66L88,124.69l26.34-26.35A8,8,0,0,1,128,104Zm77.66,18.34a8,8,0,0,1,0,11.32l-24,24a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L168,132.69V104a8,8,0,0,1,16,0v28.69l10.34-10.35A8,8,0,0,1,205.66,122.34Z"/>`
  ],
  [
    "bold",
    r`<path d="M232,44H24A20,20,0,0,0,4,64V192a20,20,0,0,0,20,20H232a20,20,0,0,0,20-20V64A20,20,0,0,0,232,44Zm-4,144H28V68H228ZM48,148V108a12,12,0,0,1,20.49-8.49L88,119l19.51-19.52A12,12,0,0,1,128,108v40a12,12,0,0,1-24,0V137l-7.51,7.52a12,12,0,0,1-17,0L72,137v11a12,12,0,0,1-24,0Zm98.63-23.5a12,12,0,0,1,16.87-1.87l.5.4V108a12,12,0,0,1,24,0v15l.5-.4a12,12,0,0,1,15,18.74l-20,16a12,12,0,0,1-15,0l-20-16A12,12,0,0,1,146.63,124.5Z"/>`
  ],
  [
    "fill",
    r`<path d="M232,48H24A16,16,0,0,0,8,64V192a16,16,0,0,0,16,16H232a16,16,0,0,0,16-16V64A16,16,0,0,0,232,48ZM128,152a8,8,0,0,1-16,0V123.31L93.66,141.66a8,8,0,0,1-11.32,0L64,123.31V152a8,8,0,0,1-16,0V104a8,8,0,0,1,13.66-5.66L88,124.69l26.34-26.35A8,8,0,0,1,128,104Zm77.66-18.34-24,24a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L168,132.69V104a8,8,0,0,1,16,0v28.69l10.34-10.35a8,8,0,0,1,11.32,11.32Z"/>`
  ],
  [
    "duotone",
    r`<path d="M240,64V192a8,8,0,0,1-8,8H24a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H232A8,8,0,0,1,240,64Z" opacity="0.2"/><path d="M232,48H24A16,16,0,0,0,8,64V192a16,16,0,0,0,16,16H232a16,16,0,0,0,16-16V64A16,16,0,0,0,232,48Zm0,144H24V64H232V192ZM128,104v48a8,8,0,0,1-16,0V123.31L93.66,141.66a8,8,0,0,1-11.32,0L64,123.31V152a8,8,0,0,1-16,0V104a8,8,0,0,1,13.66-5.66L88,124.69l26.34-26.35A8,8,0,0,1,128,104Zm77.66,18.34a8,8,0,0,1,0,11.32l-24,24a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L168,132.69V104a8,8,0,0,1,16,0v28.69l10.34-10.35A8,8,0,0,1,205.66,122.34Z"/>`
  ]
]);
a.styles = H`
    :host {
      display: contents;
    }
  `;
l([
  V({ type: String, reflect: !0 })
], a.prototype, "size", 2);
l([
  V({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
l([
  V({ type: String, reflect: !0 })
], a.prototype, "color", 2);
l([
  V({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = l([
  A("ph-markdown-logo")
], a);
export {
  a as PhMarkdownLogo
};
