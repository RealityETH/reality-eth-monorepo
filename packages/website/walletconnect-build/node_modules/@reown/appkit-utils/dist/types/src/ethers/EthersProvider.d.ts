import type { Provider } from '@reown/appkit-controllers';
export declare abstract class EthersProvider<T> {
    protected provider?: T;
    initialized: boolean;
    abstract initialize(): Promise<void>;
    getProvider(): Promise<T | undefined>;
}
declare global {
    interface Window {
        ethereum: Provider;
    }
}
