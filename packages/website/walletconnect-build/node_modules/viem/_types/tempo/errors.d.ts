import { BaseError } from '../errors/base.js';
export type InvalidFeeTokenErrorType = InvalidFeeTokenError & {
    name: 'InvalidFeeTokenError';
};
export declare class InvalidFeeTokenError extends BaseError {
    constructor({ cause, token, }: {
        cause?: BaseError | Error | undefined;
        token: string;
    });
}
export type FeeTokenNotTip20ErrorType = FeeTokenNotTip20Error & {
    name: 'FeeTokenNotTip20Error';
};
export declare class FeeTokenNotTip20Error extends BaseError {
    constructor({ token }: {
        token: string;
    });
}
export type FeeTokenNotUsdErrorType = FeeTokenNotUsdError & {
    name: 'FeeTokenNotUsdError';
};
export declare class FeeTokenNotUsdError extends BaseError {
    constructor({ currency, token, }: {
        currency: string;
        token: string;
    });
}
export type FeeTokenPausedErrorType = FeeTokenPausedError & {
    name: 'FeeTokenPausedError';
};
export declare class FeeTokenPausedError extends BaseError {
    constructor({ token }: {
        token: string;
    });
}
//# sourceMappingURL=errors.d.ts.map