"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transfer = transfer;
exports.swap = swap;
exports.deposit = deposit;
async function transfer(client, parameters) {
    return client.request({
        method: 'wallet_transfer',
        params: [parameters],
    }, { retryCount: 0 });
}
async function swap(client, parameters = {}) {
    return client.request({
        method: 'wallet_swap',
        params: [parameters],
    }, { retryCount: 0 });
}
async function deposit(client, parameters = {}) {
    return client.request({
        method: 'wallet_deposit',
        params: [parameters],
    }, { retryCount: 0 });
}
//# sourceMappingURL=wallet.js.map