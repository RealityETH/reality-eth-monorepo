export declare const panicReasons: {
    readonly 1: "An `assert` condition failed.";
    readonly 17: "Arithmetic operation resulted in underflow or overflow.";
    readonly 18: "Division or modulo by zero (e.g. `5 / 0` or `23 % 0`).";
    readonly 33: "Attempted to convert to an invalid type.";
    readonly 34: "Attempted to access a storage byte array that is incorrectly encoded.";
    readonly 49: "Performed `.pop()` on an empty array";
    readonly 50: "Array index is out of bounds.";
    readonly 65: "Allocated too much memory or created an array which is too large.";
    readonly 81: "Attempted to call a zero-initialized variable of internal function type.";
};
export declare const solidityError: {
    readonly inputs: readonly [{
        readonly name: "message";
        readonly type: "string";
    }];
    readonly name: "Error";
    readonly type: "error";
};
export declare const solidityPanic: {
    readonly inputs: readonly [{
        readonly name: "reason";
        readonly type: "uint256";
    }];
    readonly name: "Panic";
    readonly type: "error";
};
//# sourceMappingURL=solidity.d.ts.map