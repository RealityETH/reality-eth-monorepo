"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withRetry = withRetry;
const utils_js_1 = require("../../errors/utils.js");
const wait_js_1 = require("../wait.js");
function withRetry(fn, { delay: delay_ = 100, retryCount = 2, shouldRetry = () => true, signal, } = {}) {
    return new Promise((resolve, reject) => {
        const attemptRetry = async ({ count = 0 } = {}) => {
            if (signal?.aborted) {
                reject((0, utils_js_1.getAbortError)(signal));
                return;
            }
            const retry = async ({ error }) => {
                const delay = typeof delay_ === 'function' ? delay_({ count, error }) : delay_;
                if (delay) {
                    try {
                        await (0, wait_js_1.wait)(delay, { signal });
                    }
                    catch (err) {
                        reject(err);
                        return;
                    }
                }
                attemptRetry({ count: count + 1 });
            };
            try {
                const data = await fn();
                resolve(data);
            }
            catch (err) {
                if (signal?.aborted) {
                    reject((0, utils_js_1.getAbortError)(signal));
                    return;
                }
                if ((0, utils_js_1.isAbortError)(err)) {
                    reject(err);
                    return;
                }
                if (count < retryCount &&
                    (await shouldRetry({ count, error: err })))
                    return retry({ error: err });
                reject(err);
            }
        };
        attemptRetry();
    });
}
//# sourceMappingURL=withRetry.js.map