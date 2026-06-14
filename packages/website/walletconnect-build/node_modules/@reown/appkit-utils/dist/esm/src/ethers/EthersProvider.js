export class EthersProvider {
    constructor() {
        this.initialized = false;
    }
    async getProvider() {
        return Promise.resolve(this.provider);
    }
}
//# sourceMappingURL=EthersProvider.js.map