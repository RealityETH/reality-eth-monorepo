import { BaseError } from './base.js';
export class IntegerOutOfRangeError extends BaseError {
    constructor({ max, min, signed, size, value, }) {
        super(`Number "${value}" is not in safe ${size ? `${size * 8}-bit ${signed ? 'signed' : 'unsigned'} ` : ''}integer range ${max ? `(${min} to ${max})` : `(above ${min})`}`, { name: 'IntegerOutOfRangeError' });
    }
}
export class InvalidBytesBooleanError extends BaseError {
    constructor(bytes) {
        super(`Bytes value "${bytes}" is not a valid boolean. The bytes array must contain a single byte of either a 0 or 1 value.`, {
            name: 'InvalidBytesBooleanError',
        });
    }
}
export class InvalidHexBooleanError extends BaseError {
    constructor(hex) {
        super(`Hex value "${hex}" is not a valid boolean. The hex value must be "0x0" (false) or "0x1" (true).`, { name: 'InvalidHexBooleanError' });
    }
}
export class InvalidHexValueError extends BaseError {
    constructor(value) {
        super(`Hex value "${value}" is an odd length (${value.length}). It must be an even length.`, { name: 'InvalidHexValueError' });
    }
}
export class RlpDepthLimitExceededError extends BaseError {
    constructor({ limit }) {
        super(`RLP depth limit of \`${limit}\` exceeded.`, {
            name: 'RlpDepthLimitExceededError',
        });
    }
}
export class RlpListBoundaryExceededError extends BaseError {
    constructor({ consumed, declared }) {
        super(`RLP list items consumed \`${consumed}\` bytes but the list declared a length of \`${declared}\`.`, { name: 'RlpListBoundaryExceededError' });
    }
}
export class RlpTrailingBytesError extends BaseError {
    constructor({ count }) {
        super(`RLP payload encodes a single item, but \`${count}\` trailing ${count === 1 ? 'byte remains' : 'bytes remain'}.`, { name: 'RlpTrailingBytesError' });
    }
}
export class SizeOverflowError extends BaseError {
    constructor({ givenSize, maxSize }) {
        super(`Size cannot exceed ${maxSize} bytes. Given size: ${givenSize} bytes.`, { name: 'SizeOverflowError' });
    }
}
//# sourceMappingURL=encoding.js.map