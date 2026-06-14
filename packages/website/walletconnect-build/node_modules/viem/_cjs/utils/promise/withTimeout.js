"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withTimeout = withTimeout;
const utils_js_1 = require("../../errors/utils.js");
function withTimeout(fn, { errorInstance = new Error('timed out'), timeout, signal, }) {
    return new Promise((resolve, reject) => {
        ;
        (async () => {
            let timeoutId;
            const controller = new AbortController();
            try {
                if (timeout > 0) {
                    timeoutId = setTimeout(() => {
                        if (signal) {
                            controller.abort();
                        }
                        else {
                            reject(errorInstance);
                        }
                    }, timeout);
                }
                resolve(await fn({ signal: controller?.signal || null }));
            }
            catch (err) {
                if (controller?.signal.aborted && (0, utils_js_1.isAbortError)(err)) {
                    reject(errorInstance);
                    return;
                }
                reject(err);
            }
            finally {
                clearTimeout(timeoutId);
            }
        })();
    });
}
//# sourceMappingURL=withTimeout.js.map