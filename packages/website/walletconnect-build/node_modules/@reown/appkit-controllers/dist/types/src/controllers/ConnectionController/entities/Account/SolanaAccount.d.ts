import { Account, type AccountProps, type EmbeddedWalletProps } from './Account.js';
type SolanaAccountProps = AccountProps & EmbeddedWalletProps & {
    type: 'eoa';
    publicKey: string;
};
export declare class SolanaAccount extends Account {
    type: 'eoa';
    publicKey: string;
    userInfo?: Record<string, unknown>;
    constructor({ address, caipAddress, namespace, metadata, publicKey, userInfo }: SolanaAccountProps);
}
export {};
