import type { ByteArray, Hex } from '../types/misc.js';
import { BaseError } from './base.js';
export type IntegerOutOfRangeErrorType = IntegerOutOfRangeError & {
    name: 'IntegerOutOfRangeError';
};
export declare class IntegerOutOfRangeError extends BaseError {
    constructor({ max, min, signed, size, value, }: {
        max?: string | undefined;
        min: string;
        signed?: boolean | undefined;
        size?: number | undefined;
        value: string;
    });
}
export type InvalidBytesBooleanErrorType = InvalidBytesBooleanError & {
    name: 'InvalidBytesBooleanError';
};
export declare class InvalidBytesBooleanError extends BaseError {
    constructor(bytes: ByteArray);
}
export type InvalidHexBooleanErrorType = InvalidHexBooleanError & {
    name: 'InvalidHexBooleanError';
};
export declare class InvalidHexBooleanError extends BaseError {
    constructor(hex: Hex);
}
export type InvalidHexValueErrorType = InvalidHexValueError & {
    name: 'InvalidHexValueError';
};
export declare class InvalidHexValueError extends BaseError {
    constructor(value: Hex);
}
export type RlpDepthLimitExceededErrorType = RlpDepthLimitExceededError & {
    name: 'RlpDepthLimitExceededError';
};
export declare class RlpDepthLimitExceededError extends BaseError {
    constructor({ limit }: {
        limit: number;
    });
}
export type RlpListBoundaryExceededErrorType = RlpListBoundaryExceededError & {
    name: 'RlpListBoundaryExceededError';
};
export declare class RlpListBoundaryExceededError extends BaseError {
    constructor({ consumed, declared }: {
        consumed: number;
        declared: number;
    });
}
export type RlpTrailingBytesErrorType = RlpTrailingBytesError & {
    name: 'RlpTrailingBytesError';
};
export declare class RlpTrailingBytesError extends BaseError {
    constructor({ count }: {
        count: number;
    });
}
export type SizeOverflowErrorType = SizeOverflowError & {
    name: 'SizeOverflowError';
};
export declare class SizeOverflowError extends BaseError {
    constructor({ givenSize, maxSize }: {
        givenSize: number;
        maxSize: number;
    });
}
//# sourceMappingURL=encoding.d.ts.map