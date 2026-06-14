import { proxy } from 'valtio/vanilla';
import { subscribeKey as subKey } from 'valtio/vanilla/utils';
import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common';
import { withErrorBoundary } from '../utils/withErrorBoundary.js';
import { OptionsController } from './OptionsController.js';
// -- State --------------------------------------------- //
const state = proxy({
    message: '',
    variant: 'info',
    open: false
});
// -- Controller ---------------------------------------- //
const controller = {
    state,
    subscribeKey(key, callback) {
        return subKey(state, key, callback);
    },
    open(message, variant) {
        const { debug } = OptionsController.state;
        const { code, displayMessage, debugMessage } = message;
        if (displayMessage && debug) {
            state.message = displayMessage;
            state.variant = variant;
            state.open = true;
        }
        if (debugMessage) {
            if (!CommonConstantsUtil.IS_DEVELOPMENT) {
                return;
            }
            const resolved = typeof debugMessage === 'function' ? debugMessage() : debugMessage;
            const meta = code ? { code } : undefined;
            if (variant === 'error') {
                // eslint-disable-next-line no-console
                console.error(resolved, meta);
            }
            else if (variant === 'warning') {
                // eslint-disable-next-line no-console
                console.warn(resolved, meta);
            }
            else {
                // eslint-disable-next-line no-console
                console.info(resolved, meta);
            }
        }
    },
    warn(title, description, code) {
        state.open = true;
        state.message = title;
        state.variant = 'warning';
        if (description) {
            console.warn(description, code);
        }
    },
    close() {
        state.open = false;
        state.message = '';
        state.variant = 'info';
    }
};
// Export the controller wrapped with our error boundary
export const AlertController = withErrorBoundary(controller);
//# sourceMappingURL=AlertController.js.map