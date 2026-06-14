"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Analytics = void 0;
const md5_1 = __importDefault(require("md5"));
const errors_js_1 = require("./errors.js");
const errors_js_2 = require("./openapi-client/errors.js");
const version_js_1 = require("./version.js");
// This is a public client id for the analytics service
const publicClientId = "54f2ee2fb3d2b901a829940d70fbfc13";
exports.Analytics = {
    identifier: "", // set in cdp.ts
    sendEvent,
    trackAction,
    trackError,
};
/**
 * Sends an analytics event to the default endpoint
 *
 * @param event - The event data containing event-specific fields
 * @returns Promise that resolves when the event is sent
 */
async function sendEvent(event) {
    if (event.name === "error" && process.env.DISABLE_CDP_ERROR_REPORTING === "true") {
        return;
    }
    if (event.name !== "error" && process.env.DISABLE_CDP_USAGE_TRACKING === "true") {
        return;
    }
    const timestamp = Date.now();
    const enhancedEvent = {
        user_id: exports.Analytics.identifier,
        event_type: event.name,
        platform: "server",
        timestamp,
        event_properties: {
            project_name: "cdp-sdk",
            cdp_sdk_language: "typescript",
            version: version_js_1.version,
            ...event,
        },
    };
    const events = [enhancedEvent];
    const stringifiedEventData = JSON.stringify(events);
    const uploadTime = timestamp.toString();
    const checksum = (0, md5_1.default)(stringifiedEventData + uploadTime);
    const analyticsServiceData = {
        client: publicClientId,
        e: stringifiedEventData,
        checksum,
    };
    const apiEndpoint = "https://cca-lite.coinbase.com";
    const eventPath = "/amp";
    const eventEndPoint = `${apiEndpoint}${eventPath}`;
    await fetch(eventEndPoint, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(analyticsServiceData),
    });
}
/**
 * Track an action being performed
 *
 * @param params - The parameters for tracking an action
 * @param params.action - The action being performed
 * @param params.accountType - The type of account
 * @param params.properties - Additional properties
 */
function trackAction(params) {
    if (params.properties?.network &&
        typeof params.properties.network === "string" &&
        params.properties.network.startsWith("http")) {
        const url = new URL(params.properties.network);
        params.properties.customRpcHost = url.hostname;
        params.properties.network = "custom";
    }
    sendEvent({
        action: params.action,
        accountType: params.accountType,
        properties: params.properties,
        name: "action",
    }).catch(() => {
        // ignore error
    });
}
/**
 * Track an error that occurred in a method
 *
 * @param error - The error to track
 * @param method - The method name where the error occurred
 */
function trackError(error, method) {
    if (process.env.DISABLE_CDP_ERROR_REPORTING === "true")
        return;
    if (!shouldTrackError(error))
        return;
    const { message, stack } = error;
    sendEvent({ method, message, stack, name: "error" }).catch(() => { });
}
/**
 * Filters out non-errors and API errors
 *
 * @param error - The error to check.
 * @returns True if the error should be tracked, false otherwise.
 */
function shouldTrackError(error) {
    if (!(error instanceof Error)) {
        return false;
    }
    if (error instanceof errors_js_1.UserInputValidationError) {
        return false;
    }
    if (error instanceof errors_js_2.NetworkError) {
        return true;
    }
    if (error instanceof errors_js_2.APIError && error.errorType !== "unexpected_error") {
        return false;
    }
    return true;
}
//# sourceMappingURL=analytics.js.map