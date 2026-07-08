"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.from = from;
exports.memory = memory;
function from(options) {
    return options.source;
}
function memory() {
    const keyAuthorizations = new Map();
    return from({
        source: {
            get(key) {
                return keyAuthorizations.get(serializeKey(key));
            },
            remove(key) {
                keyAuthorizations.delete(serializeKey(key));
            },
            set(key, keyAuthorization) {
                keyAuthorizations.set(serializeKey(key), keyAuthorization);
            },
        },
    });
}
function serializeKey(key) {
    return [
        key.chainId,
        key.address.toLowerCase(),
        key.accessKey.toLowerCase(),
    ].join(':');
}
//# sourceMappingURL=KeyAuthorizationManager.js.map