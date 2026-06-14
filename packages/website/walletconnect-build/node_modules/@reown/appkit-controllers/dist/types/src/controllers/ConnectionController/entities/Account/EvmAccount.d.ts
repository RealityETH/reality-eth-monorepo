import type { AccountProps } from './Account.js';
import { Account } from './Account.js';
type EvmAccountProps = AccountProps & {
    type: 'eoa' | 'smartAccount';
    userInfo?: Record<string, unknown>;
    smartAccountDeployed?: boolean;
};
export declare class EvmAccount extends Account {
    type: 'eoa' | 'smartAccount';
    userInfo?: Record<string, unknown>;
    smartAccountDeployed?: boolean;
    constructor({ address, caipAddress, type, namespace, metadata, userInfo, smartAccountDeployed }: EvmAccountProps);
}
export {};
