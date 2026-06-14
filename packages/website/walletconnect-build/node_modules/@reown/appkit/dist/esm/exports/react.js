import { CoreHelperUtil } from '@reown/appkit-controllers';
import { useAppKitNetworkCore } from '@reown/appkit-controllers/react';
import { AppKit } from '../src/client/appkit.js';
import { getAppKit } from '../src/library/react/index.js';
import { _internalFetchBalance } from '../src/utils/BalanceUtil.js';
import { PACKAGE_VERSION } from './constants.js';
// -- Hooks ------------------------------------------------------------
export * from '../src/library/react/index.js';
// -- Utils & Other -----------------------------------------------------
export * from '../src/utils/index.js';
export { CoreHelperUtil } from '@reown/appkit-controllers';
export let modal = undefined;
export function createAppKit(options) {
    if (!modal) {
        modal = new AppKit({
            ...options,
            sdkVersion: CoreHelperUtil.generateSdkVersion(options.adapters ?? [], 'react', PACKAGE_VERSION)
        });
        getAppKit(modal);
    }
    return modal;
}
export { AppKit };
// -- Hooks ------------------------------------------------------------
export * from '../src/library/react/index.js';
export { useAppKitProvider } from '@reown/appkit-controllers/react';
export function useAppKitNetwork() {
    const { caipNetwork, caipNetworkId, chainId } = useAppKitNetworkCore();
    async function switchNetwork(network) {
        await modal?.switchNetwork(network);
    }
    return {
        caipNetwork,
        caipNetworkId,
        chainId,
        switchNetwork
    };
}
export function useAppKitBalance() {
    async function fetchBalance() {
        return await _internalFetchBalance(modal);
    }
    return {
        fetchBalance
    };
}
export { useAppKitAccount, useAppKitWallets } from '@reown/appkit-controllers/react';
export { AppKitButton, AppKitNetworkButton, AppKitConnectButton, AppKitAccountButton } from '../src/library/react/components.js';
export { AppKitProvider } from '../src/library/react/providers.js';
//# sourceMappingURL=react.js.map