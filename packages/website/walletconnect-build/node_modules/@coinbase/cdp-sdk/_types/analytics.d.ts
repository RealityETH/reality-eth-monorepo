/**
 * The data in an error event
 */
type ErrorEventData = {
    /**
     * The API method where the error occurred, e.g. createAccount, getAccount
     */
    method: string;
    /**
     * The error message
     */
    message: string;
    /**
     * The error stack trace
     */
    stack?: string;
    /**
     * The name of the event. This should match the name in AEC
     */
    name: "error";
};
/**
 * The data in an action event
 */
type ActionEventData = {
    /**
     * The operation being performed, e.g. "transfer", "swap", "fund", "requestFaucet"
     */
    action: string;
    /**
     * The account type, e.g. "evm-server", "evm-smart", "solana"
     */
    accountType?: "evm_server" | "evm_smart" | "solana";
    /**
     * Additional properties specific to the action
     */
    properties?: Record<string, unknown>;
    /**
     * The name of the event
     */
    name: "action";
};
type EventData = ErrorEventData | ActionEventData;
export declare const Analytics: {
    identifier: string;
    sendEvent: typeof sendEvent;
    trackAction: typeof trackAction;
    trackError: typeof trackError;
};
/**
 * Sends an analytics event to the default endpoint
 *
 * @param event - The event data containing event-specific fields
 * @returns Promise that resolves when the event is sent
 */
declare function sendEvent(event: EventData): Promise<void>;
/**
 * Track an action being performed
 *
 * @param params - The parameters for tracking an action
 * @param params.action - The action being performed
 * @param params.accountType - The type of account
 * @param params.properties - Additional properties
 */
declare function trackAction(params: {
    action: string;
    accountType?: "evm_server" | "evm_smart" | "solana";
    properties?: Record<string, unknown>;
}): void;
/**
 * Track an error that occurred in a method
 *
 * @param error - The error to track
 * @param method - The method name where the error occurred
 */
declare function trackError(error: unknown, method: string): void;
export {};
//# sourceMappingURL=analytics.d.ts.map