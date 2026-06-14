var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _SolanaWalletConnectStandardWallet_instances, _SolanaWalletConnectStandardWallet_listeners, _SolanaWalletConnectStandardWallet_version, _SolanaWalletConnectStandardWallet_provider, _SolanaWalletConnectStandardWallet_name, _SolanaWalletConnectStandardWallet_icon, _SolanaWalletConnectStandardWallet_account, _SolanaWalletConnectStandardWallet_on, _SolanaWalletConnectStandardWallet_emit, _SolanaWalletConnectStandardWallet_off, _SolanaWalletConnectStandardWallet_connected, _SolanaWalletConnectStandardWallet_disconnected, _SolanaWalletConnectStandardWallet_reconnected, _SolanaWalletConnectStandardWallet_connect, _SolanaWalletConnectStandardWallet_disconnect, _SolanaWalletConnectStandardWallet_signAndSendTransaction, _SolanaWalletConnectStandardWallet_signTransaction, _SolanaWalletConnectStandardWallet_signMessage;
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { registerWallet } from '@wallet-standard/wallet';
import bs58 from 'bs58';
import { ParseUtil } from '@reown/appkit-common';
import { RouterController } from '@reown/appkit-controllers';
import { createNamespaces } from '../WCNamespaceUtil.js';
import { SolConstantsUtil } from '../solana/SolanaConstantsUtil.js';
import { WalletConnectAccount } from './WalletConnectAccount.js';
import { SOLANA_CHAINS } from './constants.js';
import { isSolanaChain, isVersionedTransaction } from './utils.js';
function caipNetworkToStandardChain(caipNetworkId) {
    const map = {
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': 'solana:mainnet',
        'solana:4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ': 'solana:mainnet',
        'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z': 'solana:testnet',
        'solana:8E9rvCKLFQia2Y35HXjjpWzj8weVo44K': 'solana:devnet',
        'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1': 'solana:devnet'
    };
    return map[caipNetworkId];
}
export class SolanaWalletConnectStandardWallet {
    static register(provider) {
        const instance = new SolanaWalletConnectStandardWallet(provider);
        registerWallet(instance);
    }
    get version() {
        return __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_version, "f");
    }
    get name() {
        return __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_name, "f");
    }
    get icon() {
        return __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_icon, "f");
    }
    get chains() {
        return SOLANA_CHAINS.slice();
    }
    /* eslint-disable @typescript-eslint/no-redundant-type-constituents */
    get features() {
        return {
            'standard:connect': {
                version: '1.0.0',
                connect: __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_connect, "f")
            },
            'standard:disconnect': {
                version: '1.0.0',
                disconnect: __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_disconnect, "f")
            },
            'standard:events': {
                version: '1.0.0',
                on: __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_on, "f")
            },
            'solana:signAndSendTransaction': {
                version: '1.0.0',
                supportedTransactionVersions: ['legacy', 0],
                signAndSendTransaction: __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_signAndSendTransaction, "f")
            },
            'solana:signTransaction': {
                version: '1.0.0',
                supportedTransactionVersions: ['legacy', 0],
                signTransaction: __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_signTransaction, "f")
            },
            'solana:signMessage': {
                version: '1.0.0',
                signMessage: __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_signMessage, "f")
            }
        };
    }
    get accounts() {
        const solanaNamespace = __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_provider, "f").session?.namespaces?.['solana'];
        const standardChains = solanaNamespace?.chains?.map(chain => caipNetworkToStandardChain(chain));
        return (solanaNamespace?.accounts.map(account => {
            const { address } = ParseUtil.parseCaipAddress(account);
            const publicKey = new PublicKey(bs58.decode(address));
            return {
                address,
                publicKey: publicKey.toBytes(),
                chains: standardChains,
                features: [
                    'solana:signAndSendTransaction',
                    'solana:signTransaction',
                    'solana:signMessage'
                ]
            };
        }) || []);
    }
    constructor(provider) {
        _SolanaWalletConnectStandardWallet_instances.add(this);
        _SolanaWalletConnectStandardWallet_listeners.set(this, {});
        _SolanaWalletConnectStandardWallet_version.set(this, '1.0.0');
        _SolanaWalletConnectStandardWallet_provider.set(this, void 0);
        _SolanaWalletConnectStandardWallet_name.set(this, 'WalletConnect');
        _SolanaWalletConnectStandardWallet_icon.set(this, 'data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjE4NSIgdmlld0JveD0iMCAwIDMwMCAxODUiIHdpZHRoPSIzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0ibTYxLjQzODU0MjkgMzYuMjU2MjYxMmM0OC45MTEyMjQxLTQ3Ljg4ODE2NjMgMTI4LjIxMTk4NzEtNDcuODg4MTY2MyAxNzcuMTIzMjA5MSAwbDUuODg2NTQ1IDUuNzYzNDE3NGMyLjQ0NTU2MSAyLjM5NDQwODEgMi40NDU1NjEgNi4yNzY1MTEyIDAgOC42NzA5MjA0bC0yMC4xMzY2OTUgMTkuNzE1NTAzYy0xLjIyMjc4MSAxLjE5NzIwNTEtMy4yMDUzIDEuMTk3MjA1MS00LjQyODA4MSAwbC04LjEwMDU4NC03LjkzMTE0NzljLTM0LjEyMTY5Mi0zMy40MDc5ODE3LTg5LjQ0Mzg4Ni0zMy40MDc5ODE3LTEyMy41NjU1Nzg4IDBsLTguNjc1MDU2MiA4LjQ5MzYwNTFjLTEuMjIyNzgxNiAxLjE5NzIwNDEtMy4yMDUzMDEgMS4xOTcyMDQxLTQuNDI4MDgwNiAwbC0yMC4xMzY2OTQ5LTE5LjcxNTUwMzFjLTIuNDQ1NTYxMi0yLjM5NDQwOTItMi40NDU1NjEyLTYuMjc2NTEyMiAwLTguNjcwOTIwNHptMjE4Ljc2Nzc5NjEgNDAuNzczNzQ0OSAxNy45MjE2OTcgMTcuNTQ2ODk3YzIuNDQ1NTQ5IDIuMzk0Mzk2OSAyLjQ0NTU2MyA2LjI3NjQ3NjkuMDAwMDMxIDguNjcwODg5OWwtODAuODEwMTcxIDc5LjEyMTEzNGMtMi40NDU1NDQgMi4zOTQ0MjYtNi40MTA1ODIgMi4zOTQ0NTMtOC44NTYxNi4wMDAwNjItLjAwMDAxLS4wMDAwMS0uMDAwMDIyLS4wMDAwMjItLjAwMDAzMi0uMDAwMDMybC01Ny4zNTQxNDMtNTYuMTU0NTcyYy0uNjExMzktLjU5ODYwMi0xLjYwMjY1LS41OTg2MDItMi4yMTQwNCAwLS4wMDAwMDQuMDAwMDA0LS4wMDAwMDcuMDAwMDA4LS4wMDAwMTEuMDAwMDExbC01Ny4zNTI5MjEyIDU2LjE1NDUzMWMtMi40NDU1MzY4IDIuMzk0NDMyLTYuNDEwNTc1NSAyLjM5NDQ3Mi04Ljg1NjE2MTIuMDAwMDg3LS4wMDAwMTQzLS4wMDAwMTQtLjAwMDAyOTYtLjAwMDAyOC0uMDAwMDQ0OS0uMDAwMDQ0bC04MC44MTI0MTk0My03OS4xMjIxODVjLTIuNDQ1NTYwMjEtMi4zOTQ0MDgtMi40NDU1NjAyMS02LjI3NjUxMTUgMC04LjY3MDkxOTdsMTcuOTIxNzI5NjMtMTcuNTQ2ODY3M2MyLjQ0NTU2MDItMi4zOTQ0MDgyIDYuNDEwNTk4OS0yLjM5NDQwODIgOC44NTYxNjAyIDBsNTcuMzU0OTc3NSA1Ni4xNTUzNTdjLjYxMTM5MDguNTk4NjAyIDEuNjAyNjQ5LjU5ODYwMiAyLjIxNDAzOTggMCAuMDAwMDA5Mi0uMDAwMDA5LjAwMDAxNzQtLjAwMDAxNy4wMDAwMjY1LS4wMDAwMjRsNTcuMzUyMTAzMS01Ni4xNTUzMzNjMi40NDU1MDUtMi4zOTQ0NjMzIDYuNDEwNTQ0LTIuMzk0NTUzMSA4Ljg1NjE2MS0uMDAwMi4wMDAwMzQuMDAwMDMzNi4wMDAwNjguMDAwMDY3My4wMDAxMDEuMDAwMTAxbDU3LjM1NDkwMiA1Ni4xNTU0MzJjLjYxMTM5LjU5ODYwMSAxLjYwMjY1LjU5ODYwMSAyLjIxNDA0IDBsNTcuMzUzOTc1LTU2LjE1NDMyNDljMi40NDU1NjEtMi4zOTQ0MDkyIDYuNDEwNTk5LTIuMzk0NDA5MiA4Ljg1NjE2IDB6IiBmaWxsPSIjM2I5OWZjIi8+PC9zdmc+');
        _SolanaWalletConnectStandardWallet_account.set(this, null);
        _SolanaWalletConnectStandardWallet_on.set(this, (event, listener) => {
            if (!__classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_listeners, "f")[event]) {
                __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_listeners, "f")[event] = [];
            }
            __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_listeners, "f")[event].push(listener);
            return () => __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_instances, "m", _SolanaWalletConnectStandardWallet_off).call(this, event, listener);
        });
        _SolanaWalletConnectStandardWallet_connected.set(this, () => {
            const account = this.accounts[0];
            const publicKey = account?.publicKey;
            if (publicKey) {
                __classPrivateFieldSet(this, _SolanaWalletConnectStandardWallet_account, new WalletConnectAccount(account), "f");
                __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_instances, "m", _SolanaWalletConnectStandardWallet_emit).call(this, 'change', { accounts: this.accounts });
            }
        });
        _SolanaWalletConnectStandardWallet_disconnected.set(this, () => {
            if (__classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_account, "f")) {
                __classPrivateFieldSet(this, _SolanaWalletConnectStandardWallet_account, null, "f");
                __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_instances, "m", _SolanaWalletConnectStandardWallet_emit).call(this, 'change', { accounts: this.accounts });
            }
        });
        _SolanaWalletConnectStandardWallet_reconnected.set(this, () => {
            if (__classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_provider, "f").session?.namespaces?.['solana']?.accounts.length) {
                __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_connected, "f").call(this);
            }
            else {
                __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_disconnected, "f").call(this);
            }
        });
        _SolanaWalletConnectStandardWallet_connect.set(this, async () => {
            if (!__classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_account, "f")) {
                RouterController.push('ConnectingWalletConnect');
                await __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_provider, "f").connect({
                    namespaces: createNamespaces([SolConstantsUtil.DEFAULT_CHAIN])
                });
            }
            __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_connected, "f").call(this);
            return { accounts: this.accounts };
        });
        _SolanaWalletConnectStandardWallet_disconnect.set(this, async () => {
            await __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_provider, "f").disconnect();
        });
        _SolanaWalletConnectStandardWallet_signAndSendTransaction.set(this, async (...inputs) => {
            if (!__classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_account, "f")) {
                throw new Error('not connected');
            }
            const outputs = [];
            if (inputs.length === 1) {
                const { transaction, account, chain, options } = inputs[0] || {};
                const { minContextSlot, preflightCommitment, skipPreflight, maxRetries } = options || {};
                if (account?.address !== __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_account, "f")?.address) {
                    throw new Error('invalid account');
                }
                if (!isSolanaChain(chain || ':')) {
                    throw new Error('invalid chain');
                }
                if (!transaction) {
                    throw new Error('invalid transaction');
                }
                const signature = await __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_provider, "f").request({
                    method: 'solana_signAndSendTransaction',
                    params: {
                        transaction,
                        pubkey: __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_account, "f").address,
                        sendOptions: {
                            preflightCommitment,
                            minContextSlot,
                            maxRetries,
                            skipPreflight
                        }
                    }
                });
                outputs.push({ signature: bs58.decode(signature.signature) });
            }
            else if (inputs.length > 1) {
                const results = await Promise.all(inputs.map(input => __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_signAndSendTransaction, "f").call(this, input)));
                for (const result of results) {
                    outputs.push(...result);
                }
            }
            return outputs;
        });
        _SolanaWalletConnectStandardWallet_signTransaction.set(this, async (...inputs) => {
            if (!__classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_account, "f")) {
                throw new Error('not connected');
            }
            const outputs = [];
            if (inputs.length === 1) {
                const { transaction, account, chain } = inputs[0] || {};
                if (account?.address !== __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_account, "f").address) {
                    throw new Error('invalid account');
                }
                if (chain && !isSolanaChain(chain)) {
                    throw new Error('invalid chain');
                }
                if (!transaction) {
                    throw new Error('invalid transaction');
                }
                const tx = Transaction.from(transaction);
                let result = undefined;
                const signedTransaction = await __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_provider, "f").request({
                    method: 'solana_signTransaction',
                    params: {
                        transaction,
                        pubkey: __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_account, "f").address
                    }
                });
                // If the result contains signature is the old RPC response
                if ('signature' in signedTransaction) {
                    const decoded = bs58.decode(signedTransaction.signature);
                    tx.addSignature(new PublicKey(__classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_account, "f").publicKey), Buffer.from(decoded));
                    result = tx;
                }
                else {
                    const decodedTransaction = Buffer.from(signedTransaction.transaction, 'base64');
                    if (isVersionedTransaction(tx)) {
                        result = VersionedTransaction.deserialize(new Uint8Array(decodedTransaction));
                    }
                    result = Transaction.from(decodedTransaction);
                }
                if (!result) {
                    throw new Error('invalid transaction');
                }
                const serializedTransaction = isVersionedTransaction(result)
                    ? result.serialize()
                    : new Uint8Array(result.serialize({
                        requireAllSignatures: false,
                        verifySignatures: false
                    }));
                outputs.push({ signedTransaction: serializedTransaction });
            }
            else if (inputs.length > 1) {
                let chain = undefined;
                for (const input of inputs) {
                    if (input.account?.address !== __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_account, "f").address) {
                        throw new Error('invalid account');
                    }
                    if (input.chain) {
                        if (!isSolanaChain(input.chain)) {
                            throw new Error('invalid chain');
                        }
                        if (chain && input.chain !== chain) {
                            throw new Error('conflicting chain');
                        }
                        chain = input.chain;
                    }
                }
                const transactions = inputs.map(({ transaction }) => VersionedTransaction.deserialize(transaction));
                const result = await __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_provider, "f").request({
                    method: 'solana_signAllTransactions',
                    params: {
                        transactions
                    }
                });
                const signedTransactions = result.transactions.map((serializedTransaction, index) => {
                    const transaction = transactions[index];
                    if (!transaction) {
                        throw new Error('Invalid transactions response');
                    }
                    const decodedTransaction = Buffer.from(serializedTransaction, 'base64');
                    if (isVersionedTransaction(transaction)) {
                        return VersionedTransaction.deserialize(new Uint8Array(decodedTransaction));
                    }
                    return Transaction.from(decodedTransaction);
                });
                outputs.push(...signedTransactions.map(signedTransaction => {
                    const serializedTransaction = isVersionedTransaction(signedTransaction)
                        ? signedTransaction.serialize()
                        : new Uint8Array(signedTransaction.serialize({
                            requireAllSignatures: false,
                            verifySignatures: false
                        }));
                    return { signedTransaction: serializedTransaction };
                }));
            }
            return outputs;
        });
        _SolanaWalletConnectStandardWallet_signMessage.set(this, async (...inputs) => {
            if (!__classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_account, "f")) {
                throw new Error('not connected');
            }
            const outputs = [];
            if (inputs.length === 1) {
                const { message, account } = inputs[0] || {};
                if (account?.address !== __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_account, "f").address) {
                    throw new Error('invalid account');
                }
                if (!message) {
                    throw new Error('invalid message');
                }
                const signature = await __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_provider, "f").request({
                    method: 'solana_signMessage',
                    params: {
                        message,
                        pubkey: __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_account, "f").address
                    }
                });
                outputs.push({ signedMessage: message, signature: bs58.decode(signature.signature) });
            }
            else if (inputs.length > 1) {
                const results = await Promise.all(inputs.map(input => __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_signMessage, "f").call(this, input)));
                for (const result of results) {
                    outputs.push(...result);
                }
            }
            return outputs;
        });
        __classPrivateFieldSet(this, _SolanaWalletConnectStandardWallet_provider, provider, "f");
        this.setProvider(provider);
        registerWallet(this);
    }
    setProvider(provider) {
        __classPrivateFieldSet(this, _SolanaWalletConnectStandardWallet_provider, provider, "f");
        __classPrivateFieldSet(this, _SolanaWalletConnectStandardWallet_name, 'WalletConnect', "f");
        provider.on('connect', () => __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_connected, "f").call(this));
        provider.on('disconnect', () => __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_disconnected, "f").call(this));
        provider.on('accountsChanged', () => __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_reconnected, "f").call(this));
        provider.on('chainChanged', () => __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_reconnected, "f").call(this));
        __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_connected, "f").call(this);
    }
}
_SolanaWalletConnectStandardWallet_listeners = new WeakMap(), _SolanaWalletConnectStandardWallet_version = new WeakMap(), _SolanaWalletConnectStandardWallet_provider = new WeakMap(), _SolanaWalletConnectStandardWallet_name = new WeakMap(), _SolanaWalletConnectStandardWallet_icon = new WeakMap(), _SolanaWalletConnectStandardWallet_account = new WeakMap(), _SolanaWalletConnectStandardWallet_on = new WeakMap(), _SolanaWalletConnectStandardWallet_connected = new WeakMap(), _SolanaWalletConnectStandardWallet_disconnected = new WeakMap(), _SolanaWalletConnectStandardWallet_reconnected = new WeakMap(), _SolanaWalletConnectStandardWallet_connect = new WeakMap(), _SolanaWalletConnectStandardWallet_disconnect = new WeakMap(), _SolanaWalletConnectStandardWallet_signAndSendTransaction = new WeakMap(), _SolanaWalletConnectStandardWallet_signTransaction = new WeakMap(), _SolanaWalletConnectStandardWallet_signMessage = new WeakMap(), _SolanaWalletConnectStandardWallet_instances = new WeakSet(), _SolanaWalletConnectStandardWallet_emit = function _SolanaWalletConnectStandardWallet_emit(event, ...args) {
    // eslint-disable-next-line prefer-spread
    __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_listeners, "f")[event]?.forEach(listener => listener.apply(null, args));
}, _SolanaWalletConnectStandardWallet_off = function _SolanaWalletConnectStandardWallet_off(event, listener) {
    __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_listeners, "f")[event] = __classPrivateFieldGet(this, _SolanaWalletConnectStandardWallet_listeners, "f")[event]?.filter(existingListener => listener !== existingListener);
};
//# sourceMappingURL=SolanaWalletConnectStandardWallet.js.map