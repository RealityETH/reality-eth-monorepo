import type { ProviderInterface } from '@base-org/account';
import { EthersProvider } from './EthersProvider.js';
export declare class BaseProvider extends EthersProvider<ProviderInterface> {
    initialize(): Promise<void>;
    getProvider(): Promise<ProviderInterface | undefined>;
}
