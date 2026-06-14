import { Account, type AccountProps } from './Account.js';
type BitcoinAccountProps = AccountProps & {
    type: 'ordinal' | 'payment';
    publicKey: string;
    path: string;
};
export declare class BitcoinAccount extends Account {
    type: 'ordinal' | 'payment';
    publicKey: string;
    path: string;
    constructor({ address, caipAddress, namespace, metadata, publicKey, type, path }: BitcoinAccountProps);
}
export {};
