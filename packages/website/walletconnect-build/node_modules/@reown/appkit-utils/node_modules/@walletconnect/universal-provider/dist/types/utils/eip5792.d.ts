import JsonRpcProvider from "@walletconnect/jsonrpc-provider";
import { StoredSendCalls, StoreSendCallsParams } from "../types/index.js";
import { Storage } from "./storage.js";
export declare function prepareCallStatusFromStoredSendCalls(storedSendCalls: StoredSendCalls, getHttpProvider: (chainId: number) => JsonRpcProvider): Promise<{
    id: string;
    version: string;
    atomic: boolean;
    chainId: `0x${string}`;
    capabilities: {
        caip345: {
            caip2: string;
            transactionHashes: string[];
        };
    };
    receipts: any[];
    status: any;
}>;
export declare function getTransactionReceipt(chainId: string, transactionHash: string, getHttpProvider: (chainId: number) => JsonRpcProvider): Promise<any>;
export declare function storeSendCalls({ sendCalls, storage, }: {
    sendCalls: StoreSendCallsParams;
    storage: Storage;
}): Promise<void>;
export declare function deleteSendCallsResult({ resultId, storage, }: {
    resultId: string;
    storage: Storage;
}): Promise<void>;
export declare function getStoredSendCalls({ resultId, storage, }: {
    resultId: string;
    storage: Storage;
}): Promise<StoredSendCalls | undefined>;
//# sourceMappingURL=eip5792.d.ts.map