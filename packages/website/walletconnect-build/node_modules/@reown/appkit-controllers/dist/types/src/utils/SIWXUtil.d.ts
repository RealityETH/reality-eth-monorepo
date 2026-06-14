import type { AuthTypes } from '@walletconnect/types';
import UniversalProvider from '@walletconnect/universal-provider';
import type { CaipNetworkId, ChainNamespace } from '@reown/appkit-common';
import type { W3mFrameProvider } from '@reown/appkit-wallet';
export declare const SIWXUtil: {
    getSIWX(): SIWXConfig | undefined;
    initializeIfEnabled(caipAddress?: `eip155:${string}:${string}` | `eip155:${number}:${string}` | `solana:${string}:${string}` | `solana:${number}:${string}` | `polkadot:${string}:${string}` | `polkadot:${number}:${string}` | `bip122:${string}:${string}` | `bip122:${number}:${string}` | `cosmos:${string}:${string}` | `cosmos:${number}:${string}` | `sui:${string}:${string}` | `sui:${number}:${string}` | `stacks:${string}:${string}` | `stacks:${number}:${string}` | `ton:${string}:${string}` | `ton:${number}:${string}` | undefined): Promise<void>;
    isAuthenticated(caipAddress?: `eip155:${string}:${string}` | `eip155:${number}:${string}` | `solana:${string}:${string}` | `solana:${number}:${string}` | `polkadot:${string}:${string}` | `polkadot:${number}:${string}` | `bip122:${string}:${string}` | `bip122:${number}:${string}` | `cosmos:${string}:${string}` | `cosmos:${number}:${string}` | `sui:${string}:${string}` | `sui:${number}:${string}` | `stacks:${string}:${string}` | `stacks:${number}:${string}` | `ton:${string}:${string}` | `ton:${number}:${string}` | undefined): Promise<boolean>;
    requestSignMessage(): Promise<void>;
    cancelSignMessage(): Promise<void>;
    getAllSessions(): Promise<SIWXSession[]>;
    getSessions(args?: {
        address?: string;
        caipNetworkId?: CaipNetworkId;
    }): Promise<SIWXSession[]>;
    isSIWXCloseDisabled(): Promise<boolean | undefined>;
    authConnectorAuthenticate({ authConnector, chainId, socialUri, preferredAccountType, chainNamespace }: {
        authConnector: W3mFrameProvider;
        chainId?: number | string;
        socialUri?: string;
        preferredAccountType?: string;
        chainNamespace: ChainNamespace;
    }): Promise<{
        address: string;
        chainId: string | number;
        accounts: {
            type: "eoa" | "smartAccount";
            address: string;
        }[] | {
            type: "eoa" | "smartAccount";
            address: string;
        }[] | undefined;
    }>;
    addEmbeddedWalletSession(siwxMessageData: SIWXMessage.Data, message: string, signature: string): Promise<void>;
    universalProviderAuthenticate({ universalProvider, chains, methods }: {
        universalProvider: UniversalProvider;
        chains: CaipNetworkId[];
        methods: string[];
    }): Promise<boolean>;
    getSIWXEventProperties(error?: unknown): {
        network: string;
        isSmartAccount: boolean;
        message: string | undefined;
    };
    clearSessions(): Promise<void>;
};
/**
 * This interface represents the SIWX configuration plugin, which is used to create and manage SIWX messages and sessions.
 * AppKit provides predefined implementations for this interface through `@reown/appkit-siwx`.
 * You may use it to create a custom implementation following your needs, but watch close for the methods requirements.
 */
export interface SIWXConfig {
    /**
     * This method will be called to create a new message to be signed by the user.
     *
     * Constraints:
     * - The message MUST be unique and contain all the necessary information to verify the user's identity.
     * - SIWXMessage.toString() method MUST be implemented to return the message string.
     *
     * @param input SIWXMessage.Input
     * @returns SIWXMessage
     */
    createMessage: (input: SIWXMessage.Input) => Promise<SIWXMessage>;
    /**
     * This method will be called to sign a message with the wallet using the signer handler.
     * This behavior can be overriden by passing in a `signer` parameter to the `SIWXConfig` constructor.
     * Constraints:
     * - This method MUST forward the message to the wallet for a signature request.
     * - If the signature process fails or is cancelled it MUST throw an error.
     *
     * @param message string
     * @param chainId CaipNetworkId
     * @param accountAddress string
     * @returns string
     */
    signMessage?: ({ message, chainId, accountAddress }: {
        message: string;
        chainId: string;
        accountAddress: string;
    }) => Promise<string>;
    /**
     * This method will be called to store a new single session.
     *
     * Constraints:
     * - This method MUST verify if the session is valid and store it in the storage successfully.
     *
     * @param session SIWXSession
     */
    addSession: (session: SIWXSession) => Promise<void>;
    /**
     * This method will be called to revoke all the sessions stored for a specific chain and address.
     *
     * Constraints:
     * - This method MUST delete all the sessions stored for the specific chain and address successfully.
     *
     * @param chainId CaipNetworkId
     * @param address string
     */
    revokeSession: (chainId: CaipNetworkId, address: string) => Promise<void>;
    /**
     * This method will be called to replace all the sessions in the storage with the new ones.
     *
     * Constraints:
     * - This method MUST verify all the sessions before storing them in the storage;
     * - This method MUST replace all the sessions in the storage with the new ones succesfully otherwise it MUST throw an error.
     *
     * @param sessions SIWXSession[]
     */
    setSessions: (sessions: SIWXSession[]) => Promise<void>;
    /**
     * This method will be called to get all the sessions stored for a specific chain and address.
     *
     * Constraints:
     * - This method MUST return only sessions that are verified and valid;
     * - This method MUST NOT return expired sessions.
     *
     * @param chainId CaipNetworkId
     * @param address string
     * @returns
     */
    getSessions: (chainId: CaipNetworkId, address: string) => Promise<SIWXSession[]>;
    /**
     * This method determines whether the wallet stays connected when the user denies the signature request.
     *
     * @returns {boolean}
     */
    getRequired?: () => boolean;
    /**
     * This method determines whether the session should be cleared when the user disconnects.
     *
     * @default true
     * @returns {boolean}
     */
    signOutOnDisconnect?: boolean;
}
/**
 * This interface represents a SIWX session, which is used to store the user's identity information.
 */
export interface SIWXSession {
    data: SIWXMessage.Data;
    message: string;
    signature: string;
    cacao?: AuthTypes.Cacao;
}
/**
 * This interface represents a SIWX message, which is used to create a message to be signed by the user.
 * This must contain the necessary information to verify the user's identity and how to generate the string message.
 */
export interface SIWXMessage extends SIWXMessage.Data, SIWXMessage.Methods {
}
export declare namespace SIWXMessage {
    /**
     * This interface represents the SIWX message data, which is used to create a message to be signed by the user.
     */
    interface Data extends Input, Metadata, Identifier {
    }
    /**
     * This interface represents the SIWX message input.
     * Here must contain what is different for each user of the application.
     */
    interface Input {
        accountAddress: string;
        chainId: CaipNetworkId;
        notBefore?: Timestamp;
    }
    /**
     * This interface represents the SIWX message metadata.
     * Here must contain the main data related to the app.
     */
    interface Metadata {
        domain: string;
        uri: string;
        version: string;
        nonce: string;
        statement?: string;
        resources?: string[];
    }
    /**
     * This interface represents the SIWX message identifier.
     * Here must contain the request id and the timestamps.
     */
    interface Identifier {
        requestId?: string;
        issuedAt?: Timestamp;
        expirationTime?: Timestamp;
    }
    /**
     * This interface represents the SIWX message methods.
     * Here must contain the method to generate the message string and any other method performed by the SIWX message.
     */
    interface Methods {
        toString: () => string;
    }
    /**
     * The timestamp is a UTC string representing the time in ISO 8601 format.
     */
    type Timestamp = string;
}
/**
 * The Cacao interface is a reference of CAIP-74 and represents a chain-agnostic Object Capability (OCAP).
 * https://chainagnostic.org/CAIPs/caip-74
 */
export interface Cacao {
    h: AuthTypes.CacaoHeader;
    p: AuthTypes.BaseAuthRequestParams;
    s: AuthTypes.CacaoSignature;
}
export declare namespace Cacao {
    interface Header {
        t: 'caip122';
    }
    interface Payload {
        domain: string;
        aud?: string;
        nonce: string;
        version?: string;
        iat?: string;
        nbf?: string;
        exp?: string;
        chainId?: string;
        statement?: string;
        requestId?: string;
        resources?: string[];
        expiry?: number;
        type?: string;
    }
}
