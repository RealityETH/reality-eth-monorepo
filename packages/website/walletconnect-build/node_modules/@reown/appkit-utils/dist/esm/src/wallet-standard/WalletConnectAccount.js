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
var _WalletConnectAccount_address, _WalletConnectAccount_publicKey, _WalletConnectAccount_chains, _WalletConnectAccount_features, _WalletConnectAccount_label, _WalletConnectAccount_icon;
import { SOLANA_CHAINS } from './constants.js';
export class WalletConnectAccount {
    get address() {
        return __classPrivateFieldGet(this, _WalletConnectAccount_address, "f");
    }
    get publicKey() {
        return __classPrivateFieldGet(this, _WalletConnectAccount_publicKey, "f").slice();
    }
    get chains() {
        return __classPrivateFieldGet(this, _WalletConnectAccount_chains, "f").slice();
    }
    get features() {
        return __classPrivateFieldGet(this, _WalletConnectAccount_features, "f").slice();
    }
    get label() {
        return __classPrivateFieldGet(this, _WalletConnectAccount_label, "f");
    }
    get icon() {
        return __classPrivateFieldGet(this, _WalletConnectAccount_icon, "f");
    }
    constructor({ address, publicKey, label, icon }) {
        _WalletConnectAccount_address.set(this, void 0);
        _WalletConnectAccount_publicKey.set(this, void 0);
        _WalletConnectAccount_chains.set(this, void 0);
        _WalletConnectAccount_features.set(this, void 0);
        _WalletConnectAccount_label.set(this, void 0);
        _WalletConnectAccount_icon.set(this, void 0);
        __classPrivateFieldSet(this, _WalletConnectAccount_address, address, "f");
        __classPrivateFieldSet(this, _WalletConnectAccount_publicKey, publicKey, "f");
        __classPrivateFieldSet(this, _WalletConnectAccount_chains, SOLANA_CHAINS, "f");
        __classPrivateFieldSet(this, _WalletConnectAccount_features, [
            'solana:signAndSendTransaction',
            'solana:signTransaction',
            'solana:signMessage'
        ], "f");
        __classPrivateFieldSet(this, _WalletConnectAccount_label, label, "f");
        __classPrivateFieldSet(this, _WalletConnectAccount_icon, icon, "f");
    }
}
_WalletConnectAccount_address = new WeakMap(), _WalletConnectAccount_publicKey = new WeakMap(), _WalletConnectAccount_chains = new WeakMap(), _WalletConnectAccount_features = new WeakMap(), _WalletConnectAccount_label = new WeakMap(), _WalletConnectAccount_icon = new WeakMap();
//# sourceMappingURL=WalletConnectAccount.js.map