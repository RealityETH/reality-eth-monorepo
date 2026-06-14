import { isAbortError } from '../../errors/utils.js';
export function withTimeout(fn, { errorInstance = new Error('timed out'), timeout, signal, }) {
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
                    }, timeout); // need to cast because bun globals.d.ts overrides @types/node
                }
                resolve(await fn({ signal: controller?.signal || null }));
            }
            catch (err) {
                if (controller?.signal.aborted && isAbortError(err)) {
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