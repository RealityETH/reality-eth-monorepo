import {} from '@reown/appkit-common';
import { ChainController, ConnectionController, ConnectorController, CoreHelperUtil, OptionsController } from '@reown/appkit-controllers';
import { AppKitBaseClient } from './appkit-base-client.js';
// -- Helpers -------------------------------------------------------------------
let isInitialized = false;
// -- Client --------------------------------------------------------------------
export class AppKit extends AppKitBaseClient {
    // -- Overrides --------------------------------------------------------------
    async open(options) {
        // Only open modal when not connected
        const isConnected = ConnectorController.isConnected();
        if (!isConnected) {
            await super.open(options);
        }
    }
    async close() {
        await super.close();
        if (this.options.manualWCControl) {
            const address = ChainController.getAccountData(this.activeChainNamespace)?.address;
            ConnectionController.finalizeWcConnection(address);
        }
    }
    async syncIdentity(_request) {
        return Promise.resolve();
    }
    async syncBalance(_params) {
        return Promise.resolve();
    }
    async injectModalUi() {
        if (!isInitialized && CoreHelperUtil.isClient()) {
            await import('@reown/appkit-scaffold-ui/basic');
            await import('@reown/appkit-scaffold-ui/w3m-modal');
            const isElementCreated = document.querySelector('w3m-modal');
            if (!isElementCreated) {
                const modal = document.createElement('w3m-modal');
                if (!OptionsController.state.disableAppend && !OptionsController.state.enableEmbedded) {
                    document.body.insertAdjacentElement('beforeend', modal);
                }
            }
            isInitialized = true;
        }
    }
}
//# sourceMappingURL=appkit-core.js.map