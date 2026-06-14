import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as V } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as s } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var v = Object.defineProperty, c = Object.getOwnPropertyDescriptor, l = (e, h, H, o) => {
  for (var t = o > 1 ? void 0 : o ? c(h, H) : h, i = e.length - 1, p; i >= 0; i--)
    (p = e[i]) && (t = (o ? p(h, H, t) : p(t)) || t);
  return o && t && v(h, H, t), t;
};
let a = class extends m {
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
      ${a.weightsMap.get((e = this.weight) != null ? e : "regular")}
    </svg>`;
  }
};
a.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    r`<path d="M224,60H172V16a4,4,0,0,0-8,0V60H92V16a4,4,0,0,0-8,0V60H32.55C28.13,60,28,63.59,28,64a4,4,0,0,0,4,4H52v92a36,36,0,0,0,36,36h36v44a4,4,0,0,0,8,0V196h36a36,36,0,0,0,36-36V68h20a4,4,0,0,0,0-8ZM196,160a28,28,0,0,1-28,28H88a28,28,0,0,1-28-28V68H196Zm-87.29-29.72a4,4,0,0,1-.46-3.68l12-32a4,4,0,0,1,7.5,2.8l-10,26.6H144a4,4,0,0,1,3.75,5.4l-12,32a4,4,0,1,1-7.5-2.8l10-26.6H112A4,4,0,0,1,108.71,130.28Z"/>`
  ],
  [
    "light",
    r`<path d="M224,58H174V16a6,6,0,0,0-12,0V58H94V16a6,6,0,0,0-12,0V58H32.55A6.1,6.1,0,0,0,26,64a6,6,0,0,0,6,6H50v90a38,38,0,0,0,38,38h34v42a6,6,0,0,0,12,0V198h34a38,38,0,0,0,38-38V70h18a6,6,0,0,0,0-12ZM194,160a26,26,0,0,1-26,26H88a26,26,0,0,1-26-26V70H194Zm-86.93-28.58a6,6,0,0,1-.69-5.53l12-32a6,6,0,1,1,11.24,4.22l-9,23.89H144a6,6,0,0,1,5.62,8.11l-12,32a6,6,0,0,1-11.24-4.22l9-23.89H112A6,6,0,0,1,107.07,131.42Z"/>`
  ],
  [
    "regular",
    r`<path d="M224,56H176V16a8,8,0,0,0-16,0V56H96V16a8,8,0,0,0-16,0V56H32.55C26.28,56,24,60.78,24,64a8,8,0,0,0,8,8H48v88a40,40,0,0,0,40,40h32v40a8,8,0,0,0,16,0V200h32a40,40,0,0,0,40-40V72h16a8,8,0,0,0,0-16ZM168,184H88a24,24,0,0,1-24-24V72H192v88A24,24,0,0,1,168,184Zm-17.42-60.56a8,8,0,0,1,.91,7.37l-12,32a8,8,0,0,1-15-5.62l8-21.19H112a8,8,0,0,1-7.49-10.81l12-32a8,8,0,1,1,15,5.62l-8,21.19H144A8,8,0,0,1,150.58,123.44Z"/>`
  ],
  [
    "bold",
    r`<path d="M224,48H180V16a12,12,0,0,0-24,0V48H100V16a12,12,0,0,0-24,0V48H32.55C24.4,48,20,54.18,20,60A12,12,0,0,0,32,72H44v92a44.05,44.05,0,0,0,44,44h28v32a12,12,0,0,0,24,0V208h28a44.05,44.05,0,0,0,44-44V72h12a12,12,0,0,0,0-24ZM188,164a20,20,0,0,1-20,20H88a20,20,0,0,1-20-20V72H188Zm-85.86-29.17a12,12,0,0,1-1.38-11l12-32a12,12,0,1,1,22.48,8.42L129.32,116H144a12,12,0,0,1,11.24,16.21l-12,32a12,12,0,0,1-22.48-8.42L126.68,140H112A12,12,0,0,1,102.14,134.83Z"/>`
  ],
  [
    "fill",
    r`<path d="M224,56H176V16a8,8,0,0,0-16,0V56H96V16a8,8,0,0,0-8-8c-3.21,0-8,2.27-8,8.54V56H32.55C26.28,56,24,60.78,24,64a8,8,0,0,0,8,8H48v88a40,40,0,0,0,40,40h32v40a8,8,0,0,0,16,0V200h32a40,40,0,0,0,40-40V72h16a8,8,0,0,0,0-16Zm-72.51,74.81-12,32a8,8,0,0,1-15-5.62l8-21.19H112a8,8,0,0,1-7.49-10.81l12-32a8,8,0,1,1,15,5.62l-8,21.19H144a8,8,0,0,1,7.49,10.81Z"/>`
  ],
  [
    "duotone",
    r`<path d="M200,64v96a32,32,0,0,1-32,32H88a32,32,0,0,1-32-32V64Z" opacity="0.2"/><path d="M224,56H176V16a8,8,0,0,0-16,0V56H96V16a8,8,0,0,0-16,0V56H32.55C26.28,56,24,60.78,24,64a8,8,0,0,0,8,8H48v88a40,40,0,0,0,40,40h32v40a8,8,0,0,0,16,0V200h32a40,40,0,0,0,40-40V72h16a8,8,0,0,0,0-16ZM192,160a24,24,0,0,1-24,24H88a24,24,0,0,1-24-24V72H192Zm-86.58-27.44a8,8,0,0,1-.91-7.37l12-32a8,8,0,1,1,15,5.62l-8,21.19H144a8,8,0,0,1,7.49,10.81l-12,32a8,8,0,0,1-15-5.62l8-21.19H112A8,8,0,0,1,105.42,132.56Z"/>`
  ]
]);
a.styles = n`
    :host {
      display: contents;
    }
  `;
l([
  s({ type: String, reflect: !0 })
], a.prototype, "size", 2);
l([
  s({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
l([
  s({ type: String, reflect: !0 })
], a.prototype, "color", 2);
l([
  s({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = l([
  g("ph-plug-charging")
], a);
export {
  a as PhPlugCharging
};
