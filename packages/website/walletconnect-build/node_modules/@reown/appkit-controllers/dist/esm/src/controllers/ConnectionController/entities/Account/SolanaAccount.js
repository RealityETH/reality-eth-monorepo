import { Account } from './Account.js';
export class SolanaAccount extends Account {
    constructor({ address, caipAddress, namespace, metadata, publicKey, userInfo }) {
        super({ address, caipAddress, type: 'eoa', namespace, metadata });
        this.type = 'eoa';
        this.publicKey = publicKey;
        this.userInfo = userInfo;
    }
}
//# sourceMappingURL=SolanaAccount.js.map