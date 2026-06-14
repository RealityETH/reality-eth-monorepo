import { AuthTypes } from "@walletconnect/types";
export declare function hashEthereumMessage(message: string): string;
export declare function verifySignature(address: string, reconstructedMessage: string, cacaoSignature: AuthTypes.CacaoSignature, chainId: string, projectId: string, baseRpcUrl?: string): Promise<boolean>;
export declare function isValidEip191Signature(address: string, message: string, signature: string): boolean;
export declare function isValidEip1271Signature(address: string, reconstructedMessage: string, signature: string, chainId: string, projectId: string, baseRpcUrl?: string): Promise<boolean>;
export declare function extractSolanaTransactionId(solanaTransaction: string): string;
export declare function getSuiDigest(transaction: string): string;
export declare function getNearTransactionIdFromSignedTransaction(signedTransaction: unknown): string;
export declare function getNearUint8ArrayFromBytes(bytes: unknown): Uint8Array<ArrayBuffer>;
export declare function getAlgorandTransactionId(transaction: string): string;
export declare function getSignDirectHash(payload: {
    signed: {
        chainId: string;
        accountNumber: string;
        authInfoBytes: string;
        bodyBytes: string;
    };
    signature: {
        pub_key: {
            type: string;
            value: string;
        };
        signature: string;
    };
}): string;
export declare function getWalletSendCallsHashes(result: string | {
    id: string;
    capabilities: {
        caip345: {
            transactionHashes: string[];
        };
    };
}): string[];
//# sourceMappingURL=signatures.d.ts.map