import { Account } from './Account.js';
export class BitcoinAccount extends Account {
    constructor({ address, caipAddress, namespace, metadata, publicKey, type, path }) {
        super({ address, caipAddress, type, namespace, metadata });
        this.type = type;
        this.publicKey = publicKey;
        this.path = path;
    }
}
//# sourceMappingURL=BitcoinAccount.js.map