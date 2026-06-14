export type ProviderRpcErrorCode = 4001 | 4100 | 4200 | 4900 | 4901 | 4902 | 5710 | 5002 | 5000 | 5001;
type RpcProviderError = {
    message: string;
    code: ProviderRpcErrorCode;
};
export declare const ErrorUtil: {
    RPC_ERROR_CODE: {
        readonly USER_REJECTED_REQUEST: 4001;
        readonly USER_REJECTED_METHODS: 5002;
        readonly USER_REJECTED: 5000;
        readonly SEND_TRANSACTION_ERROR: 5001;
    };
    PROVIDER_RPC_ERROR_NAME: {
        PROVIDER_RPC: string;
        USER_REJECTED_REQUEST: string;
        SEND_TRANSACTION_ERROR: string;
    };
    isRpcProviderError(error: unknown): error is RpcProviderError;
    isUserRejectedMessage(message: string): boolean;
    isUserRejectedRequestError(error: unknown): boolean;
};
export declare class ProviderRpcError extends Error {
    code: ProviderRpcErrorCode;
    name: string;
    constructor(cause: unknown, options: RpcProviderError);
}
export declare class UserRejectedRequestError extends ProviderRpcError {
    name: string;
    constructor(cause: unknown);
}
export declare class SendTransactionError extends ProviderRpcError {
    name: string;
    constructor(message: string);
}
export {};
