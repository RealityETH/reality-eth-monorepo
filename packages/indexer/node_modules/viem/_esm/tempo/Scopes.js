import * as Selectors from './Selectors.js';
/**
 * Creates a call scope builder for an arbitrary target.
 *
 * @experimental
 */
export function target(address) {
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
/**
 * Creates a typed call scope builder from a selector map.
 *
 * @experimental
 */
export function contract(address, selectors) {
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
/**
 * Creates a call scope builder for a TIP-20 token.
 *
 * @experimental
 */
export function tip20(address) {
    return contract(address, Selectors.tip20);
}
//# sourceMappingURL=Scopes.js.map