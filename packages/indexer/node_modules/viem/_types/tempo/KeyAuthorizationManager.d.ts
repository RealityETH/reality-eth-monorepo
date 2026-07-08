import type { Address } from 'abitype';
import type { KeyAuthorization } from 'ox/tempo';
import type { MaybePromise } from '../types/utils.js';
export type Key = {
    address: Address;
    accessKey: Address;
    chainId: number;
};
export type KeyAuthorizationManager = {
    get(key: Key): MaybePromise<KeyAuthorization.Signed | undefined>;
    remove(key: Key): MaybePromise<void>;
    set(key: Key, keyAuthorization: KeyAuthorization.Signed): MaybePromise<void>;
};
export declare function from(options: from.Options): KeyAuthorizationManager;
export declare namespace from {
    type Options = {
        source: KeyAuthorizationManager;
    };
}
export declare function memory(): KeyAuthorizationManager;
//# sourceMappingURL=KeyAuthorizationManager.d.ts.map