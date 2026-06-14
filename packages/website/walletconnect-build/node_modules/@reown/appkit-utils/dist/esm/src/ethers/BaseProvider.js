import { ChainController, OptionsController } from '@reown/appkit-controllers';
import { EthersProvider } from './EthersProvider.js';
export class BaseProvider extends EthersProvider {
    async initialize() {
        const caipNetworks = ChainController.getCaipNetworks();
        const { metadata, coinbasePreference } = OptionsController.state;
        try {
            const { createBaseAccountSDK } = await import('@base-org/account');
            if (typeof window === 'undefined') {
                return Promise.resolve();
            }
            const baseAccountSdk = createBaseAccountSDK({
                appName: metadata?.name,
                appLogoUrl: metadata?.icons[0],
                appChainIds: caipNetworks?.map(caipNetwork => caipNetwork.id) || [1, 84532],
                preference: {
                    options: coinbasePreference ?? 'all'
                }
            });
            this.provider = baseAccountSdk.getProvider();
            this.initialized = true;
            return Promise.resolve();
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error('Failed to import Coinbase Wallet SDK:', error);
            return Promise.resolve();
        }
    }
    async getProvider() {
        return Promise.resolve(this.provider);
    }
}
//# sourceMappingURL=BaseProvider.js.map