import { Account } from './Account.js';
export class EvmAccount extends Account {
    constructor({ address, caipAddress, type, namespace, metadata, userInfo, smartAccountDeployed }) {
        super({ address, caipAddress, type, namespace, metadata });
        this.type = type;
        this.userInfo = userInfo;
        this.smartAccountDeployed = smartAccountDeployed;
    }
}
//# sourceMappingURL=EvmAccount.js.map