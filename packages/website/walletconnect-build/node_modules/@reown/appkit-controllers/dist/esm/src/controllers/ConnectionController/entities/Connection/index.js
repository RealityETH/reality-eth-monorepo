export class Connection {
    constructor(props) {
        this.id = props.id;
        this.connectorId = props.connectorId;
        this.connectorType = props.connectorType;
        this.namespace = props.namespace;
        this.accounts = props.accounts;
        this.activeAccount = props.activeAccount;
        this.caipNetwork = props.caipNetwork;
        this.wallet = props.wallet;
        this.status = props.status;
        this.lastError = props.lastError;
        this.session = props.session;
        this.preferences = props.preferences;
        this.meta = props.meta;
    }
    /**
     * Set the active account
     */
    setActiveAccount(account) {
        if (!this.accounts.find(acc => acc.address === account.address)) {
            throw new Error('Account not found in connection accounts');
        }
        this.activeAccount = account;
        this.meta = { ...this.meta, lastUpdatedAt: Date.now() };
    }
    /**
     * Get connection info for serialization
     */
    toJSON() {
        return {
            id: this.id,
            connectorId: this.connectorId,
            connectorType: this.connectorType,
            namespace: this.namespace,
            accounts: this.accounts,
            activeAccount: this.activeAccount,
            caipNetwork: this.caipNetwork,
            wallet: this.wallet,
            status: this.status,
            lastError: this.lastError,
            session: this.session,
            preferences: this.preferences,
            meta: this.meta
        };
    }
}
//# sourceMappingURL=index.js.map