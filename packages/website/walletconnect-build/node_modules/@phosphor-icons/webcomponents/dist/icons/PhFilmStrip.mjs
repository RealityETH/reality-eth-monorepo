import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as a } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as p } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as v } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as m } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as l } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var M = Object.defineProperty, n = Object.getOwnPropertyDescriptor, V = (H, e, s, Z) => {
  for (var h = Z > 1 ? void 0 : Z ? n(e, s) : e, o = H.length - 1, i; o >= 0; o--)
    (i = H[o]) && (h = (Z ? i(e, s, h) : i(h)) || h);
  return Z && h && M(e, s, h), h;
};
let t = class extends p {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var H;
    return a`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((H = this.weight) != null ? H : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    r`<path d="M216,44H40A12,12,0,0,0,28,56V200a12,12,0,0,0,12,12H216a12,12,0,0,0,12-12V56A12,12,0,0,0,216,44ZM36,84h88v88H36Zm96-8V52h40V76Zm-8,0H84V52h40Zm0,104v24H84V180Zm8,0h40v24H132Zm0-8V84h88v88ZM220,56V76H180V52h36A4,4,0,0,1,220,56ZM40,52H76V76H36V56A4,4,0,0,1,40,52ZM36,200V180H76v24H40A4,4,0,0,1,36,200Zm180,4H180V180h40v20A4,4,0,0,1,216,204Z"/>`
  ],
  [
    "light",
    r`<path d="M216,42H40A14,14,0,0,0,26,56V200a14,14,0,0,0,14,14H216a14,14,0,0,0,14-14V56A14,14,0,0,0,216,42ZM38,86h84v84H38Zm96-12V54h36V74Zm-12,0H86V54h36Zm0,108v20H86V182Zm12,0h36v20H134Zm0-12V86h84v84ZM218,56V74H182V54h34A2,2,0,0,1,218,56ZM40,54H74V74H38V56A2,2,0,0,1,40,54ZM38,200V182H74v20H40A2,2,0,0,1,38,200Zm178,2H182V182h36v18A2,2,0,0,1,216,202Z"/>`
  ],
  [
    "regular",
    r`<path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,88h80v80H40Zm96-16V56h32V72Zm-16,0H88V56h32Zm0,112v16H88V184Zm16,0h32v16H136Zm0-16V88h80v80Zm80-96H184V56h32ZM72,56V72H40V56ZM40,184H72v16H40Zm176,16H184V184h32v16Z"/>`
  ],
  [
    "bold",
    r`<path d="M216,36H40A20,20,0,0,0,20,56V200a20,20,0,0,0,20,20H216a20,20,0,0,0,20-20V56A20,20,0,0,0,216,36ZM44,100h72v56H44Zm96-24V60h24V76Zm-24,0H92V60h24Zm0,104v16H92V180Zm24,0h24v16H140Zm0-24V100h72v56Zm72-80H188V60h24ZM68,60V76H44V60ZM44,180H68v16H44Zm144,16V180h24v16Z"/>`
  ],
  [
    "fill",
    r`<path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM184,56h32V72H184ZM72,200H40V184H72ZM72,72H40V56H72Zm48,128H88V184h32Zm0-128H88V56h32Zm48,128H136V184h32Zm0-128H136V56h32Zm48,128H184V184h32v16Z"/>`
  ],
  [
    "duotone",
    r`<path d="M32,176H224v24a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8ZM216,48H40a8,8,0,0,0-8,8V80H224V56A8,8,0,0,0,216,48Z" opacity="0.2"/><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,88h80v80H40Zm96-16V56h32V72Zm-16,0H88V56h32Zm0,112v16H88V184Zm16,0h32v16H136Zm0-16V88h80v80Zm80-96H184V56h32ZM72,56V72H40V56ZM40,184H72v16H40Zm176,16H184V184h32v16Z"/>`
  ]
]);
t.styles = l`
    :host {
      display: contents;
    }
  `;
V([
  m({ type: String, reflect: !0 })
], t.prototype, "size", 2);
V([
  m({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
V([
  m({ type: String, reflect: !0 })
], t.prototype, "color", 2);
V([
  m({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = V([
  v("ph-film-strip")
], t);
export {
  t as PhFilmStrip
};
