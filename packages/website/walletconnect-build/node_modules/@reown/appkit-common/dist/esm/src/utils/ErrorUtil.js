export const ErrorUtil = {
    RPC_ERROR_CODE: {
        USER_REJECTED_REQUEST: 4001,
        USER_REJECTED_METHODS: 5002,
        USER_REJECTED: 5000,
        SEND_TRANSACTION_ERROR: 5001
    },
    PROVIDER_RPC_ERROR_NAME: {
        PROVIDER_RPC: 'ProviderRpcError',
        USER_REJECTED_REQUEST: 'UserRejectedRequestError',
        SEND_TRANSACTION_ERROR: 'SendTransactionError'
    },
    isRpcProviderError(error) {
        try {
            if (typeof error === 'object' && error !== null) {
                const objErr = error;
                const hasMessage = typeof objErr['message'] === 'string';
                const hasCode = typeof objErr['code'] === 'number';
                return hasMessage && hasCode;
            }
            return false;
        }
        catch {
            return false;
        }
    },
    isUserRejectedMessage(message) {
        return (message.toLowerCase().includes('user rejected') ||
            message.toLowerCase().includes('user cancelled') ||
            message.toLowerCase().includes('user canceled'));
    },
    isUserRejectedRequestError(error) {
        if (ErrorUtil.isRpcProviderError(error)) {
            const isUserRejectedCode = error.code === ErrorUtil.RPC_ERROR_CODE.USER_REJECTED_REQUEST;
            const isUserRejectedMethodsCode = error.code === ErrorUtil.RPC_ERROR_CODE.USER_REJECTED_METHODS;
            return (isUserRejectedCode ||
                isUserRejectedMethodsCode ||
                ErrorUtil.isUserRejectedMessage(error.message));
        }
        if (error instanceof Error) {
            return ErrorUtil.isUserRejectedMessage(error.message);
        }
        return false;
    }
};
export class ProviderRpcError extends Error {
    constructor(cause, options) {
        super(options.message, { cause });
        this.name = ErrorUtil.PROVIDER_RPC_ERROR_NAME.PROVIDER_RPC;
        this.code = options.code;
    }
}
export class UserRejectedRequestError extends ProviderRpcError {
    constructor(cause) {
        super(cause, {
            code: ErrorUtil.RPC_ERROR_CODE.USER_REJECTED_REQUEST,
            message: 'User rejected the request'
        });
        this.name = ErrorUtil.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST;
    }
}
export class SendTransactionError extends ProviderRpcError {
    constructor(message) {
        super(undefined, {
            code: ErrorUtil.RPC_ERROR_CODE.SEND_TRANSACTION_ERROR,
            message
        });
        this.name = ErrorUtil.PROVIDER_RPC_ERROR_NAME.SEND_TRANSACTION_ERROR;
    }
}
//# sourceMappingURL=ErrorUtil.js.map