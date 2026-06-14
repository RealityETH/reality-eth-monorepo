import type { Provider } from '@reown/appkit-controllers';
import { EthersProvider } from './EthersProvider.js';
export declare class InjectedProvider extends EthersProvider<Provider> {
    initialize(): Promise<void>;
}
