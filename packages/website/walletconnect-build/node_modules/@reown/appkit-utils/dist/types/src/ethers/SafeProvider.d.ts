import { SafeAppProvider } from '@safe-global/safe-apps-provider';
import { EthersProvider } from './EthersProvider.js';
declare class _SafeProvider extends SafeAppProvider {
    request(request: {
        method: string;
        params?: any[];
    }): Promise<any>;
}
export declare class SafeProvider extends EthersProvider<_SafeProvider> {
    initialize(): Promise<void>;
    getProvider(): Promise<_SafeProvider | undefined>;
}
export {};
