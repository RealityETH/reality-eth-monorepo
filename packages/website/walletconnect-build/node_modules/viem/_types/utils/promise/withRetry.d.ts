import { type ErrorType } from '../../errors/utils.js';
export type WithRetryParameters = {
    delay?: ((config: {
        count: number;
        error: Error;
    }) => number) | number | undefined;
    retryCount?: number | undefined;
    shouldRetry?: (({ count, error, }: {
        count: number;
        error: Error;
    }) => Promise<boolean> | boolean) | undefined;
    signal?: AbortSignal | undefined;
};
export type WithRetryErrorType = ErrorType;
export declare function withRetry<data>(fn: () => Promise<data>, { delay: delay_, retryCount, shouldRetry, signal, }?: WithRetryParameters): Promise<data>;
//# sourceMappingURL=withRetry.d.ts.map