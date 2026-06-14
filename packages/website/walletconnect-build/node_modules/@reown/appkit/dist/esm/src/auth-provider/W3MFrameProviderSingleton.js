import { OptionsController } from '@reown/appkit-controllers';
import { W3mFrameProvider } from '@reown/appkit-wallet';
export class W3mFrameProviderSingleton {
    // eslint-disable-next-line @typescript-eslint/no-empty-function -- This is a singleton
    constructor() { }
    static getInstance({ projectId, chainId, enableLogger, onTimeout, abortController, getActiveCaipNetwork, getCaipNetworks }) {
        const { metadata, sdkVersion, sdkType } = OptionsController.getSnapshot();
        if (!W3mFrameProviderSingleton.instance) {
            W3mFrameProviderSingleton.instance = new W3mFrameProvider({
                projectId,
                chainId,
                enableLogger,
                onTimeout,
                abortController,
                getActiveCaipNetwork,
                getCaipNetworks,
                enableCloudAuthAccount: Boolean(OptionsController.state.remoteFeatures?.emailCapture),
                metadata: metadata,
                sdkVersion: sdkVersion,
                sdkType
            });
        }
        return W3mFrameProviderSingleton.instance;
    }
}
//# sourceMappingURL=W3MFrameProviderSingleton.js.map