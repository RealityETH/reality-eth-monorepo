import { ReactiveElement as l } from "../../../@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { defaultConverter as C, notEqual as E } from "../../../@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { render as a, noChange as d } from "../../../lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { html as b, nothing as g, svg as R } from "../../../lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
class n extends l {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var t, r;
    const e = super.createRenderRoot();
    return (r = (t = this.renderOptions).renderBefore) != null || (t.renderBefore = e.firstChild), e;
  }
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = a(t, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var e;
    super.connectedCallback(), (e = this._$Do) == null || e.setConnected(!0);
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this._$Do) == null || e.setConnected(!1);
  }
  render() {
    return d;
  }
}
var o;
n._$litElement$ = !0, n.finalized = !0, (o = globalThis.litElementHydrateSupport) == null || o.call(globalThis, { LitElement: n });
const s = globalThis.litElementPolyfillSupport;
s == null || s({ LitElement: n });
var i;
((i = globalThis.litElementVersions) != null ? i : globalThis.litElementVersions = []).push("4.0.6");
export {
  n as LitElement,
  l as ReactiveElement,
  C as defaultConverter,
  b as html,
  d as noChange,
  E as notEqual,
  g as nothing,
  a as render,
  R as svg
};
