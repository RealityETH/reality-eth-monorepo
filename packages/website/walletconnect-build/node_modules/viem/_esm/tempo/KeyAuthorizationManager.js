export function from(options) {
    return options.source;
}
export function memory() {
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