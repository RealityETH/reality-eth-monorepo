"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wait = wait;
const utils_js_1 = require("../errors/utils.js");
async function wait(time, { signal } = {}) {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject((0, utils_js_1.getAbortError)(signal));
            return;
        }
        const cleanup = () => signal?.removeEventListener('abort', onAbort);
        const timeout = setTimeout(() => {
            cleanup();
            resolve();
        }, time);
        const onAbort = () => {
            clearTimeout(timeout);
            cleanup();
            reject((0, utils_js_1.getAbortError)(signal));
        };
        signal?.addEventListener('abort', onAbort, { once: true });
    });
}
//# sourceMappingURL=wait.js.map