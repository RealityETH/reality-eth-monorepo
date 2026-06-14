import { PayController } from './controllers/PayController.js';
import { AppKitPayError, AppKitPayErrorCodes } from './types/errors.js';
const PAYMENT_TIMEOUT_MS = 300000;
export async function openPay(options) {
    return PayController.handleOpenPay(options);
}
export async function pay(options, timeoutMs = PAYMENT_TIMEOUT_MS) {
    if (timeoutMs <= 0) {
        throw new AppKitPayError(AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG, 'Timeout must be greater than 0');
    }
    try {
        await openPay(options);
    }
    catch (error) {
        if (error instanceof AppKitPayError) {
            throw error;
        }
        throw new AppKitPayError(AppKitPayErrorCodes.UNABLE_TO_INITIATE_PAYMENT, error.message);
    }
    return new Promise((resolve, reject) => {
        let isSettled = false;
        const timeoutId = setTimeout(() => {
            if (isSettled) {
                return;
            }
            isSettled = true;
            cleanup();
            reject(new AppKitPayError(AppKitPayErrorCodes.GENERIC_PAYMENT_ERROR, 'Payment timeout'));
        }, timeoutMs);
        function checkAndResolve() {
            if (isSettled) {
                return;
            }
            const currentPayment = PayController.state.currentPayment;
            const error = PayController.state.error;
            const isInProgress = PayController.state.isPaymentInProgress;
            if (currentPayment?.status === 'SUCCESS') {
                isSettled = true;
                cleanup();
                clearTimeout(timeoutId);
                resolve({
                    success: true,
                    result: currentPayment.result
                });
                return;
            }
            if (currentPayment?.status === 'FAILED') {
                isSettled = true;
                cleanup();
                clearTimeout(timeoutId);
                resolve({
                    success: false,
                    error: error || 'Payment failed'
                });
                return;
            }
            if (error && !isInProgress && !currentPayment) {
                isSettled = true;
                cleanup();
                clearTimeout(timeoutId);
                resolve({
                    success: false,
                    error
                });
            }
        }
        const unsubscribePayment = subscribeStateKey('currentPayment', checkAndResolve);
        const unsubscribeError = subscribeStateKey('error', checkAndResolve);
        const unsubscribeProgress = subscribeStateKey('isPaymentInProgress', checkAndResolve);
        const cleanup = createCleanupHandler([
            unsubscribePayment,
            unsubscribeError,
            unsubscribeProgress
        ]);
        checkAndResolve();
    });
}
export function getAvailableExchanges(params) {
    return PayController.getAvailableExchanges(params);
}
export function getPayUrl(exchangeId, params) {
    return PayController.getPayUrl(exchangeId, params, true);
}
export function openPayUrl(exchangeId, params, openInNewTab) {
    return PayController.openPayUrl({ exchangeId, openInNewTab }, params, true);
}
export function getExchanges() {
    return PayController.getExchanges();
}
export function getPayResult() {
    return PayController.state.currentPayment?.result;
}
export function getPayError() {
    return PayController.state.error;
}
export function getIsPaymentInProgress() {
    return PayController.state.isPaymentInProgress;
}
export function subscribeStateKey(key, callback) {
    return PayController.subscribeKey(key, callback);
}
function createCleanupHandler(unsubscribeFunctions) {
    return () => {
        unsubscribeFunctions.forEach(unsubscribe => {
            try {
                unsubscribe();
            }
            catch {
            }
        });
    };
}
//# sourceMappingURL=client.js.map