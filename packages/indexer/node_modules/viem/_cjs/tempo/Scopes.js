"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.target = target;
exports.contract = contract;
exports.tip20 = tip20;
const Selectors = require("./Selectors.js");
function target(address) {
    return {
        any: () => ({ address }),
        selector: (selector, options) => ({
            address,
            ...(options && 'recipients' in options
                ? { recipients: options.recipients }
                : {}),
            selector,
        }),
    };
}
function contract(address, selectors) {
    const target_ = target(address);
    const result = { ...target_ };
    for (const [name, selector] of Object.entries(selectors)) {
        if (typeof selector === 'string') {
            result[name] = (options) => target_.selector(selector, options);
            continue;
        }
        const overloads = {};
        for (const [signature, overloadSelector] of Object.entries(selector)) {
            overloads[signature] = (options) => target_.selector(overloadSelector, options);
        }
        overloads.selector = (signature, options) => target_.selector(selector[signature], options);
        result[name] = overloads;
    }
    return result;
}
function tip20(address) {
    return contract(address, Selectors.tip20);
}
//# sourceMappingURL=Scopes.js.map