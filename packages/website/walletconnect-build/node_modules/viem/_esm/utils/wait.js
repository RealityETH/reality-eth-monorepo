import { getAbortError } from '../errors/utils.js';
export async function wait(time, { signal } = {}) {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(getAbortError(signal));
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
            reject(getAbortError(signal));
        };
        signal?.addEventListener('abort', onAbort, { once: true });
    });
}
//# sourceMappingURL=wait.js.map