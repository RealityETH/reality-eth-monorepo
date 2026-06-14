export declare const ErrorUtil: {
    EmbeddedWalletAbortController: AbortController;
    /**
     * Universal Provider errors. Make sure the `message` is matching with the errors thrown by the Universal Provider.
     * We use the `alertErrorKey` to map the error to the correct AppKit alert error.
     */
    UniversalProviderErrors: {
        UNAUTHORIZED_DOMAIN_NOT_ALLOWED: {
            message: string;
            alertErrorKey: string;
        };
        JWT_VALIDATION_ERROR: {
            message: string;
            alertErrorKey: string;
        };
        INVALID_KEY: {
            message: string;
            alertErrorKey: string;
        };
    };
    ALERT_ERRORS: {
        SWITCH_NETWORK_NOT_FOUND: {
            code: string;
            displayMessage: string;
            debugMessage: string;
        };
        ORIGIN_NOT_ALLOWED: {
            code: string;
            displayMessage: string;
            debugMessage: () => string;
        };
        IFRAME_LOAD_FAILED: {
            code: string;
            displayMessage: string;
            debugMessage: () => string;
        };
        IFRAME_REQUEST_TIMEOUT: {
            code: string;
            displayMessage: string;
            debugMessage: () => string;
        };
        UNVERIFIED_DOMAIN: {
            code: string;
            displayMessage: string;
            debugMessage: () => string;
        };
        JWT_TOKEN_NOT_VALID: {
            code: string;
            displayMessage: string;
            debugMessage: string;
        };
        INVALID_PROJECT_ID: {
            code: string;
            displayMessage: string;
            debugMessage: string;
        };
        PROJECT_ID_NOT_CONFIGURED: {
            code: string;
            displayMessage: string;
            debugMessage: string;
        };
        SERVER_ERROR_APP_CONFIGURATION: {
            code: string;
            displayMessage: string;
            debugMessage: (errorMessage?: string) => string;
        };
        RATE_LIMITED_APP_CONFIGURATION: {
            code: string;
            displayMessage: string;
            debugMessage: string;
        };
    };
    ALERT_WARNINGS: {
        LOCAL_CONFIGURATION_IGNORED: {
            debugMessage: (warningMessage: string) => string;
        };
        INACTIVE_NAMESPACE_NOT_CONNECTED: {
            code: string;
            displayMessage: string;
            debugMessage: (namespace: string, errorMessage?: string) => string;
        };
        INVALID_EMAIL: {
            code: string;
            displayMessage: string;
            debugMessage: string;
        };
    };
};
