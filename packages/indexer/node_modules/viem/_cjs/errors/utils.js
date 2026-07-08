"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUrl = exports.getContractAddress = void 0;
exports.getAbortError = getAbortError;
exports.isAbortError = isAbortError;
const getContractAddress = (address) => address;
exports.getContractAddress = getContractAddress;
function getAbortError(signal) {
    if (signal?.reason)
        return signal.reason;
    if (typeof DOMException === 'function')
        return new DOMException('This operation was aborted', 'AbortError');
    const error = new Error('This operation was aborted');
    error.name = 'AbortError';
    return error;
}
function isAbortError(error) {
    return (typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        error.name === 'AbortError');
}
const getUrl = (url) => {
    try {
        const parsed = new URL(url);
        if (!parsed.username && !parsed.password)
            return url;
        parsed.username = '';
        parsed.password = '';
        return parsed.toString();
    }
    catch {
        return url;
    }
};
exports.getUrl = getUrl;
//# sourceMappingURL=utils.js.map