import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as v } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as i } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as o } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as l } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var M = Object.defineProperty, n = Object.getOwnPropertyDescriptor, a = (h, V, s, Z) => {
  for (var r = Z > 1 ? void 0 : Z ? n(V, s) : V, m = h.length - 1, H; m >= 0; m--)
    (H = h[m]) && (r = (Z ? H(V, s, r) : H(r)) || r);
  return Z && r && M(V, s, r), r;
};
let t = class extends i {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var h;
    return v`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((h = this.weight) != null ? h : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    e`<path d="M224,52H32a4,4,0,0,0-4,4V200a4,4,0,0,0,4,4H224a4,4,0,0,0,4-4V56A4,4,0,0,0,224,52ZM84,148V108h88v40Zm-48,0V108H76v40Zm144-40h40v40H180Zm40-8H132V60h88ZM124,60v40H36V60ZM36,156h88v40H36Zm96,40V156h88v40Z"/>`
  ],
  [
    "light",
    e`<path d="M224,50H32a6,6,0,0,0-6,6V200a6,6,0,0,0,6,6H224a6,6,0,0,0,6-6V56A6,6,0,0,0,224,50ZM86,146V110h84v36Zm-48,0V110H74v36Zm144-36h36v36H182Zm36-12H134V62h84ZM122,62V98H38V62ZM38,158h84v36H38Zm96,36V158h84v36Z"/>`
  ],
  [
    "regular",
    e`<path d="M224,48H32a8,8,0,0,0-8,8V200a8,8,0,0,0,8,8H224a8,8,0,0,0,8-8V56A8,8,0,0,0,224,48ZM88,144V112h80v32Zm-48,0V112H72v32Zm144-32h32v32H184Zm32-16H136V64h80ZM120,64V96H40V64ZM40,160h80v32H40Zm96,32V160h80v32Z"/>`
  ],
  [
    "bold",
    e`<path d="M224,44H32A12,12,0,0,0,20,56V200a12,12,0,0,0,12,12H224a12,12,0,0,0,12-12V56A12,12,0,0,0,224,44ZM92,140V116h72v24Zm-48,0V116H68v24Zm144-24h24v24H188Zm24-24H140V68h72ZM116,68V92H44V68ZM44,164h72v24H44Zm96,24V164h72v24Z"/>`
  ],
  [
    "fill",
    e`<path d="M232,56V88a4,4,0,0,1-4,4H136V52a4,4,0,0,1,4-4h84A8,8,0,0,1,232,56Zm-4,52H184v44h44a4,4,0,0,0,4-4V112A4,4,0,0,0,228,108ZM88,152h80V108H88Zm-60,0H72V108H28a4,4,0,0,0-4,4v36A4,4,0,0,0,28,152Zm200,16H136v36a4,4,0,0,0,4,4h84a8,8,0,0,0,8-8V172A4,4,0,0,0,228,168ZM28,92h92V52a4,4,0,0,0-4-4H32a8,8,0,0,0-8,8V88A4,4,0,0,0,28,92Zm-4,80v28a8,8,0,0,0,8,8h84a4,4,0,0,0,4-4V168H28A4,4,0,0,0,24,172Z"/>`
  ],
  [
    "duotone",
    e`<path d="M128,104H32V56h96Zm48,0v48H128v48h96V104Z" opacity="0.2"/><path d="M224,48H32a8,8,0,0,0-8,8V200a8,8,0,0,0,8,8H224a8,8,0,0,0,8-8V56A8,8,0,0,0,224,48ZM88,144V112h80v32Zm-48,0V112H72v32Zm144-32h32v32H184Zm32-16H136V64h80ZM120,64V96H40V64ZM40,160h80v32H40Zm96,32V160h80v32Z"/>`
  ]
]);
t.styles = l`
    :host {
      display: contents;
    }
  `;
a([
  o({ type: String, reflect: !0 })
], t.prototype, "size", 2);
a([
  o({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
a([
  o({ type: String, reflect: !0 })
], t.prototype, "color", 2);
a([
  o({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = a([
  p("ph-wall")
], t);
export {
  t as PhWall
};
