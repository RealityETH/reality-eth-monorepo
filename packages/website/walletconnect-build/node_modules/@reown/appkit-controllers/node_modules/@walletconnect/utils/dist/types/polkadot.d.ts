export declare function ss58AddressToPublicKey(address: string): Uint8Array;
export declare function addSignatureToExtrinsic({ publicKey, signature, payload, }: {
    publicKey: Uint8Array;
    signature: Uint8Array;
    payload: any;
}): Uint8Array;
export declare function deriveExtrinsicHash(signedExtrinsicHex: string): string;
export declare function buildSignedExtrinsicHash(payload: {
    transaction: {
        method: string;
        era: string;
        nonce: string;
        tip: string;
        mode: string;
        address: string;
        version: number;
    };
    signature: string;
}): string;
//# sourceMappingURL=polkadot.d.ts.map