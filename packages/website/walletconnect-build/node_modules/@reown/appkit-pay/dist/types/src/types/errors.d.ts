export declare const AppKitPayErrorCodes: {
    readonly INVALID_PAYMENT_CONFIG: "INVALID_PAYMENT_CONFIG";
    readonly INVALID_RECIPIENT: "INVALID_RECIPIENT";
    readonly INVALID_ASSET: "INVALID_ASSET";
    readonly INVALID_AMOUNT: "INVALID_AMOUNT";
    readonly UNKNOWN_ERROR: "UNKNOWN_ERROR";
    readonly UNABLE_TO_INITIATE_PAYMENT: "UNABLE_TO_INITIATE_PAYMENT";
    readonly INVALID_CHAIN_NAMESPACE: "INVALID_CHAIN_NAMESPACE";
    readonly GENERIC_PAYMENT_ERROR: "GENERIC_PAYMENT_ERROR";
    readonly UNABLE_TO_GET_EXCHANGES: "UNABLE_TO_GET_EXCHANGES";
    readonly ASSET_NOT_SUPPORTED: "ASSET_NOT_SUPPORTED";
    readonly UNABLE_TO_GET_PAY_URL: "UNABLE_TO_GET_PAY_URL";
    readonly UNABLE_TO_GET_BUY_STATUS: "UNABLE_TO_GET_BUY_STATUS";
    readonly UNABLE_TO_GET_TOKEN_BALANCES: "UNABLE_TO_GET_TOKEN_BALANCES";
    readonly UNABLE_TO_GET_QUOTE: "UNABLE_TO_GET_QUOTE";
    readonly UNABLE_TO_GET_QUOTE_STATUS: "UNABLE_TO_GET_QUOTE_STATUS";
    readonly INVALID_RECIPIENT_ADDRESS_FOR_ASSET: "INVALID_RECIPIENT_ADDRESS_FOR_ASSET";
};
export type AppKitPayErrorCode = (typeof AppKitPayErrorCodes)[keyof typeof AppKitPayErrorCodes];
export declare const AppKitPayErrorMessages: {
    readonly INVALID_PAYMENT_CONFIG: "Invalid payment configuration";
    readonly INVALID_RECIPIENT: "Invalid recipient address";
    readonly INVALID_ASSET: "Invalid asset specified";
    readonly INVALID_AMOUNT: "Invalid payment amount";
    readonly INVALID_RECIPIENT_ADDRESS_FOR_ASSET: "Invalid recipient address for the asset selected";
    readonly UNKNOWN_ERROR: "Unknown payment error occurred";
    readonly UNABLE_TO_INITIATE_PAYMENT: "Unable to initiate payment";
    readonly INVALID_CHAIN_NAMESPACE: "Invalid chain namespace";
    readonly GENERIC_PAYMENT_ERROR: "Unable to process payment";
    readonly UNABLE_TO_GET_EXCHANGES: "Unable to get exchanges";
    readonly ASSET_NOT_SUPPORTED: "Asset not supported by the selected exchange";
    readonly UNABLE_TO_GET_PAY_URL: "Unable to get payment URL";
    readonly UNABLE_TO_GET_BUY_STATUS: "Unable to get buy status";
    readonly UNABLE_TO_GET_TOKEN_BALANCES: "Unable to get token balances";
    readonly UNABLE_TO_GET_QUOTE: "Unable to get quote. Please choose a different token";
    readonly UNABLE_TO_GET_QUOTE_STATUS: "Unable to get quote status";
};
export type AppKitPayErrorMessage = (typeof AppKitPayErrorMessages)[keyof typeof AppKitPayErrorMessages];
export declare class AppKitPayError extends Error {
    readonly code: AppKitPayErrorCode;
    readonly details?: unknown;
    get message(): AppKitPayErrorMessage;
    constructor(code: AppKitPayErrorCode, details?: unknown);
}
export declare function createAppKitPayError(code?: AppKitPayErrorCode, details?: unknown): AppKitPayError;
