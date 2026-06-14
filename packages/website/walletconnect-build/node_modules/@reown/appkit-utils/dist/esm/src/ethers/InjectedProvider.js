import { EthersProvider } from './EthersProvider.js';
export class InjectedProvider extends EthersProvider {
    async initialize() {
        if (typeof window === 'undefined') {
            return undefined;
        }
        if (!window.ethereum) {
            return undefined;
        }
        this.provider = window.ethereum;
        this.initialized = true;
        return Promise.resolve();
    }
}
//# sourceMappingURL=InjectedProvider.js.map