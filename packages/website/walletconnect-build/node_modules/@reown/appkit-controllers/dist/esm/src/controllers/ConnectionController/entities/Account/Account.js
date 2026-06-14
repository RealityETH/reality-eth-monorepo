export class Account {
    constructor({ address, caipAddress, type, namespace, metadata }) {
        this.address = address;
        this.namespace = namespace;
        this.caipAddress = caipAddress;
        this.type = type;
        this.metadata = metadata;
        // Initialize additional fields
        this.addressLabels = new Map();
    }
}
//# sourceMappingURL=Account.js.map