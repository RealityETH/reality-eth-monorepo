import * as Address from 'ox/Address';
import * as Hex from 'ox/Hex';
import * as PublicKey from 'ox/PublicKey';
import { Channel, KeyAuthorization, MultisigConfig, SignatureEnvelope } from 'ox/tempo';
import * as WebAuthnP256 from 'ox/WebAuthnP256';
import * as WebCryptoP256 from 'ox/WebCryptoP256';
import type { LocalAccount, Account as viem_Account } from '../accounts/types.js';
import type { TransactionSerializable } from '../types/transaction.js';
import type { OneOf, RequiredBy } from '../types/utils.js';
import type { SerializeTransactionFn } from '../utils/transaction/serializeTransaction.js';
import type { KeyAuthorizationManager } from './KeyAuthorizationManager.js';
import * as Transaction from './Transaction.js';
export type Account_base<source extends string = string> = RequiredBy<LocalAccount<source>, 'sign' | 'signAuthorization' | 'signTransaction'> & {
    /** Key type. */
    keyType: SignatureEnvelope.Type;
    /** Sign fn. */
    sign: NonNullable<LocalAccount['sign']>;
    /** Sign transaction fn. */
    signTransaction: <serializer extends SerializeTransactionFn<TransactionSerializable> = SerializeTransactionFn<Transaction.TransactionSerializableTempo>, transaction extends Parameters<serializer>[0] = Parameters<serializer>[0]>(transaction: transaction, options?: {
        serializer?: serializer | undefined;
    } | undefined) => Promise<Hex.Hex>;
    /** Sign voucher fn. */
    signVoucher: (parameters: signVoucher.Parameters) => Promise<signVoucher.ReturnValue>;
};
export type RootAccount = Account_base<'root'> & {
    /** Sign key authorization. */
    signKeyAuthorization: (key: resolveAccessKey.Parameters, parameters: Pick<KeyAuthorization.KeyAuthorization, 'chainId' | 'expiry' | 'limits' | 'scopes' | 'witness'> & {
        /** Whether to authorize the key as an admin key (TIP-1049). */
        admin?: boolean | undefined;
    }) => Promise<KeyAuthorization.Signed>;
};
export type AccessKeyAccount = Account_base<'accessKey'> & {
    /** Access key ID. */
    accessKeyAddress: Address.Address;
    /** Pending key authorization manager. */
    keyAuthorizationManager?: KeyAuthorizationManager | undefined;
    /**
     * Signs a hash.
     *
     * By default, access key accounts sign through a keychain envelope so the
     * signature authorizes the parent account.
     *
     * Set `raw` to `true` to sign directly with the access key, without keychain
     * hashing or keychain enveloping.
     */
    sign: (parameters: {
        /** Hash to sign. */
        hash: Hex.Hex;
        /** Sign directly with the access key, without keychain hashing or enveloping. */
        raw?: boolean | undefined;
    }) => Promise<Hex.Hex>;
};
export type Account = OneOf<RootAccount | AccessKeyAccount>;
/** Instantiates an Account. */
export declare function from<const parameters extends from.Parameters>(parameters: parameters | from.Parameters): from.ReturnValue<parameters>;
export declare namespace from {
    type Parameters = OneOf<fromRoot.Parameters | fromAccessKey.Parameters>;
    type ReturnValue<parameters extends {
        access?: fromAccessKey.Parameters['access'] | undefined;
    } = {
        access?: fromAccessKey.Parameters['access'] | undefined;
    }> = parameters extends {
        access: fromAccessKey.Parameters['access'];
    } ? AccessKeyAccount : RootAccount;
}
/**
 * Instantiates an Account from a headless WebAuthn credential (P256 private key).
 *
 * @example
 * ```ts
 * import { Account } from 'viem/tempo'
 *
 * const account = Account.fromHeadlessWebAuthn('0x...')
 * ```
 *
 * @param privateKey P256 private key.
 * @returns Account.
 */
export declare function fromHeadlessWebAuthn<const options extends fromHeadlessWebAuthn.Options>(privateKey: Hex.Hex, options: options | fromHeadlessWebAuthn.Options): fromHeadlessWebAuthn.ReturnValue<options>;
export declare namespace fromHeadlessWebAuthn {
    type Options = Omit<WebAuthnP256.getSignPayload.Options, 'challenge' | 'rpId' | 'origin'> & Pick<from.Parameters, 'access' | 'internal_version' | 'keyAuthorizationManager'> & {
        rpId: string;
        origin: string;
    };
    type ReturnValue<options extends Options = Options> = from.ReturnValue<options>;
}
/**
 * Instantiates an Account from a P256 private key.
 *
 * @example
 * ```ts
 * import { Account } from 'viem/tempo'
 *
 * const account = Account.fromP256('0x...')
 * ```
 *
 * @param privateKey P256 private key.
 * @returns Account.
 */
export declare function fromP256<const options extends fromP256.Options>(privateKey: Hex.Hex, options?: options | fromP256.Options): fromP256.ReturnValue<options>;
export declare namespace fromP256 {
    type Options = Pick<from.Parameters, 'access' | 'internal_version' | 'keyAuthorizationManager'>;
    type ReturnValue<options extends Options = Options> = from.ReturnValue<options>;
}
/**
 * Instantiates an Account from a Secp256k1 private key.
 *
 * @example
 * ```ts
 * import { Account } from 'viem/tempo'
 *
 * const account = Account.fromSecp256k1('0x...')
 * ```
 *
 * @param privateKey Secp256k1 private key.
 * @returns Account.
 */
export declare function fromSecp256k1<const options extends fromSecp256k1.Options>(privateKey: Hex.Hex, options?: options | fromSecp256k1.Options): fromSecp256k1.ReturnValue<options>;
export declare namespace fromSecp256k1 {
    type Options = Pick<from.Parameters, 'access' | 'internal_version' | 'keyAuthorizationManager'>;
    type ReturnValue<options extends Options = Options> = from.ReturnValue<options>;
}
/**
 * Instantiates a synthetic Account for a native multisig (TIP-1061) config.
 *
 * The returned account does not hold a key. It is used purely to drive the
 * standard `sendTransaction` flow: it derives the multisig address from the
 * config and passes the prepared request (carrying the collected owner
 * `signatures`) through to the chain serializer, which combines the approvals
 * into the multisig signature envelope.
 *
 * Owner approvals are produced separately by signing with `multisig` request
 * metadata (see `signTransaction`), and provided here via `signatures`.
 *
 * Accepts a raw config and normalizes it internally (via `MultisigConfig.from`),
 * so callers don't need to call `MultisigConfig.from` themselves.
 *
 * @example
 * ```ts
 * import { Account } from 'viem/tempo'
 *
 * const account = Account.fromMultisig({
 *   threshold: 2,
 *   owners: [
 *     { owner: owner_1.address, weight: 1 },
 *     { owner: owner_2.address, weight: 1 },
 *   ],
 * })
 *
 * // Pass the account to `prepareTransactionRequest` — the multisig config is
 * // inferred from it, so no `multisig` field is needed.
 * const request = await client.prepareTransactionRequest({ account, ...rest })
 *
 * // The prepared request carries the multisig account as sender, so it doesn't
 * // need to be re-passed to `sendTransaction`.
 * const transaction = await client.sendTransaction({
 *   ...request,
 *   signatures: [signature_1, signature_2],
 * })
 * ```
 *
 * @param config Multisig config (raw or from `MultisigConfig.from`).
 * @returns Multisig account.
 */
export declare function fromMultisig(config: MultisigConfig.Config): MultisigAccount;
export type MultisigAccount = LocalAccount<'multisig'> & {
    /** Multisig config (from `MultisigConfig.from`). */
    config: MultisigConfig.Config;
};
/**
 * Instantiates an Account from a WebAuthn credential.
 *
 * @example
 *
 * ### Create Passkey + Instantiate Account
 *
 * Create a credential with `WebAuthnP256.createCredential` and then instantiate
 * a Viem Account with `Account.fromWebAuthnP256`.
 *
 * It is highly recommended to store the credential's public key in an external store
 * for future use (ie. for future calls to `WebAuthnP256.getCredential`).
 *
 * ```ts
 * import { Account, WebAuthnP256 } from 'viem/tempo'
 * import { publicKeyStore } from './store'
 *
 * // 1. Create credential
 * const credential = await WebAuthnP256.createCredential({ name: 'Example' })
 *
 * // 2. Instantiate account
 * const account = Account.fromWebAuthnP256(credential)
 *
 * // 3. Store public key
 * await publicKeyStore.set(credential.id, credential.publicKey)
 *
 * ```
 *
 * @example
 *
 * ### Get Credential + Instantiate Account
 *
 * Gets a credential from `WebAuthnP256.getCredential` and then instantiates
 * an account with `Account.fromWebAuthnP256`.
 *
 * The `getPublicKey` function is required to fetch the public key paired with the credential
 * from an external store. The public key is required to derive the account's address.
 *
 * ```ts
 * import { Account, WebAuthnP256 } from 'viem/tempo'
 * import { publicKeyStore } from './store'
 *
 * // 1. Get credential
 * const credential = await WebAuthnP256.getCredential({
 *   async getPublicKey(credential) {
 *     // 2. Get public key from external store.
 *     return await publicKeyStore.get(credential.id)
 *   }
 * })
 *
 * // 3. Instantiate account
 * const account = Account.fromWebAuthnP256(credential)
 * ```
 *
 * @param credential WebAuthnP256 credential.
 * @returns Account.
 */
export declare function fromWebAuthnP256(credential: fromWebAuthnP256.Credential, options?: fromWebAuthnP256.Options): fromWebAuthnP256.ReturnValue;
export declare namespace fromWebAuthnP256 {
    type Credential = {
        id: WebAuthnP256.P256Credential['id'];
        publicKey: Hex.Hex;
    };
    type Options = {
        getFn?: WebAuthnP256.sign.Options['getFn'] | undefined;
        rpId?: WebAuthnP256.sign.Options['rpId'] | undefined;
    };
    type ReturnValue = from.ReturnValue;
}
/**
 * Instantiates an Account from a P256 private key.
 *
 * @example
 * ```ts
 * import { Account } from 'viem/tempo'
 * import { WebCryptoP256 } from 'ox'
 *
 * const keyPair = await WebCryptoP256.createKeyPair()
 *
 * const account = Account.fromWebCryptoP256(keyPair)
 * ```
 *
 * @param keyPair WebCryptoP256 key pair.
 * @returns Account.
 */
export declare function fromWebCryptoP256<const options extends fromWebCryptoP256.Options>(keyPair: Awaited<ReturnType<typeof WebCryptoP256.createKeyPair>>, options?: options | fromWebCryptoP256.Options): fromWebCryptoP256.ReturnValue<options>;
export declare namespace fromWebCryptoP256 {
    type Options = Pick<from.Parameters, 'access' | 'internal_version' | 'keyAuthorizationManager'>;
    type ReturnValue<options extends Options = Options> = from.ReturnValue<options>;
}
export declare function signVoucher(account: LocalAccount, parameters: signVoucher.Parameters): Promise<signVoucher.ReturnValue>;
export declare namespace signVoucher {
    type Parameters = {
        /** Chain ID. */
        chainId: number | bigint;
        /** Channel descriptor or ID. */
        channel: Channel.computeId.Channel | Hex.Hex;
        /** Total voucher amount signed for the channel. */
        cumulativeAmount: bigint;
    };
    type ReturnValue = Hex.Hex;
}
export declare function signKeyAuthorization(account: LocalAccount, parameters: signKeyAuthorization.Parameters): Promise<signKeyAuthorization.ReturnValue>;
export declare namespace signKeyAuthorization {
    type Parameters = Pick<KeyAuthorization.KeyAuthorization, 'chainId' | 'expiry' | 'limits' | 'scopes' | 'witness'> & {
        key: resolveAccessKey.Parameters;
        /**
         * Whether to authorize the key as an admin key. Admin keys are
         * unrestricted and can manage the account's other access keys; `expiry`,
         * `limits`, and `scopes` are ignored. Requires the T6 hardfork.
         *
         * [TIP-1049](https://tips.sh/1049)
         */
        admin?: boolean | undefined;
    };
    type ReturnValue = KeyAuthorization.Signed;
}
/** @internal */
declare function fromBase(parameters: fromBase.Parameters): Account_base;
declare namespace fromBase {
    type Parameters = {
        /** Parent address. */
        parentAddress?: Address.Address | undefined;
        /** Public key. */
        publicKey: PublicKey.PublicKey;
        /** Key type. */
        keyType?: SignatureEnvelope.Type | undefined;
        /** Pending key authorization manager. */
        keyAuthorizationManager?: KeyAuthorizationManager | undefined;
        /** Sign function. */
        sign: NonNullable<LocalAccount['sign']>;
        /** Source. */
        source?: string | undefined;
        /** Access key version. Will be removed in a future release. @deprecated @internal */
        internal_version?: 'v1' | 'v2' | undefined;
    };
    type ReturnValue = Account_base;
}
/** @internal */
declare function fromRoot(parameters: fromRoot.Parameters): RootAccount;
declare namespace fromRoot {
    type Parameters = fromBase.Parameters;
    type ReturnValue = RootAccount;
}
declare function fromAccessKey(parameters: fromAccessKey.Parameters): AccessKeyAccount;
declare namespace fromAccessKey {
    type Parameters = fromBase.Parameters & {
        /**
         * Parent account to access.
         * If defined, this account will act as an "access key", and use
         * the parent account's address as the keychain address.
         */
        access: viem_Account | Address.Address;
        /** Pending key authorization manager. */
        keyAuthorizationManager?: KeyAuthorizationManager | undefined;
    };
    type ReturnValue = AccessKeyAccount;
}
/** @internal */
export declare function resolveAccessKey(accessKey: resolveAccessKey.Parameters): resolveAccessKey.ReturnType;
export declare namespace resolveAccessKey {
    type Parameters = Pick<AccessKeyAccount, 'accessKeyAddress' | 'keyType'> | OneOf<{
        /** Access key address. */
        address: Address.Address;
        /** Key type. */
        type: SignatureEnvelope.Type;
    } | {
        /** Access key public key. */
        publicKey: Hex.Hex;
        /** Key type. */
        type: SignatureEnvelope.Type;
    }>;
    type ReturnType = {
        accessKeyAddress: Address.Address;
        keyType: SignatureEnvelope.Type;
    };
}
export { 
/** @deprecated */
KeyAuthorization as z_KeyAuthorization, 
/** @deprecated */
SignatureEnvelope as z_SignatureEnvelope, 
/** @deprecated */
TxEnvelopeTempo as z_TxEnvelopeTempo, } from 'ox/tempo';
//# sourceMappingURL=Account.d.ts.map