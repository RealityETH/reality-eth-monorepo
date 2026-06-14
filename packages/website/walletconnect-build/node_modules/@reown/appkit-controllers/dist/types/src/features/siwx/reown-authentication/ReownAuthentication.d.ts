import { type CaipNetworkId, type ChainNamespace } from '@reown/appkit-common';
import type { SIWXConfig, SIWXMessage, SIWXSession } from '../../../utils/SIWXUtil.js';
/**
 * This is the configuration for using SIWX with Reown Authentication service.
 * It allows you to authenticate and capture user sessions through the Cloud Dashboard.
 */
export declare class ReownAuthentication implements SIWXConfig {
    private readonly localAuthStorageKey;
    private readonly localNonceStorageKey;
    private readonly messenger;
    private required;
    private otpUuid;
    private listeners;
    constructor(params?: ReownAuthentication.ConstructorParams);
    createMessage(input: SIWXMessage.Input): Promise<SIWXMessage>;
    addSession(session: SIWXSession): Promise<void>;
    getSessions(chainId: CaipNetworkId, address: string): Promise<SIWXSession[]>;
    revokeSession(_chainId: CaipNetworkId, _address: string): Promise<void>;
    setSessions(sessions: SIWXSession[]): Promise<void>;
    getRequired(): boolean;
    getSessionAccount(): Promise<Omit<ReownAuthentication.SessionAccount, "appKitAccount">>;
    setSessionAccountMetadata(metadata?: object | null): Promise<unknown>;
    on<Event extends keyof ReownAuthentication.Events>(event: Event, callback: ReownAuthentication.Listener<Event>): () => void;
    removeAllListeners(): void;
    requestEmailOtp({ email, account }: {
        email: string;
        account: string;
    }): Promise<{
        uuid: string | null;
    }>;
    confirmEmailOtp({ code }: {
        code: string;
    }): Promise<null>;
    private request;
    private getStorageToken;
    private setStorageToken;
    private clearStorageTokens;
    private getNonce;
    private getClientId;
    private getWalletInfo;
    private getSDKProperties;
    private emit;
    private setAppKitAccountUser;
}
export declare namespace ReownAuthentication {
    type ConstructorParams = {
        /**
         * The key to use for storing the session token in local storage.
         * @default '@appkit/siwx-auth-token'
         */
        localAuthStorageKey?: string;
        /**
         * The key to use for storing the nonce token in local storage.
         * @default '@appkit/siwx-nonce-token'
         */
        localNonceStorageKey?: string;
        /**
         * If false the wallet stays connected when user denies the signature request.
         * @default true
         */
        required?: boolean;
    };
    type AvailableRequestHeaders = {
        nonce: {
            'x-nonce-jwt': string;
        };
        auth: {
            Authorization: string;
        };
        otp: {
            'x-otp'?: string;
        };
    };
    type RequestParams<Key extends keyof Requests[Method], Method extends Methods> = {
        method: Method;
        key: Key;
    } & Pick<Requests[Method][Key], 'query' | 'body' | 'headers'>;
    type RequestResponse<Method extends Methods, Key extends RequestKeys<Method>> = Requests[Method][Key]['response'];
    type Request<Body, Response, Query extends Record<string, unknown> | undefined = undefined, Headers extends (keyof AvailableRequestHeaders)[] | undefined = undefined> = (Response extends undefined ? {
        response?: never;
    } : {
        response: Response;
    }) & (Body extends undefined ? {
        body?: never;
    } : {
        body: Body;
    }) & (Query extends undefined ? {
        query?: never;
    } : {
        query: Query;
    }) & (Headers extends undefined ? {
        headers?: never;
    } : {
        headers: Headers;
    });
    type Requests = {
        GET: {
            nonce: Request<undefined, {
                nonce: string;
                token: string;
            }>;
            me: Request<undefined, Omit<SessionAccount, 'appKitAccount'>, {
                includeAppKitAccount?: boolean;
            }, [
                'auth'
            ]>;
        };
        POST: {
            authenticate: Request<{
                data?: SIWXMessage.Data;
                message: string;
                signature: string;
                clientId?: string | null;
                walletInfo?: WalletInfo;
            }, {
                token: string;
            }, undefined, [
                'nonce',
                'otp'
            ]>;
            'sign-out': Request<undefined, never, never, ['auth']>;
            otp: Request<{
                email: string;
                account: string;
            }, {
                uuid: string | null;
            }>;
        };
        PUT: {
            'account-metadata': Request<{
                metadata: object | null;
            }, unknown, undefined, ['auth']>;
            otp: Request<{
                code: string;
            }, null, undefined, ['otp']>;
        };
    };
    type Methods = 'GET' | 'POST' | 'PUT';
    type RequestKeys<Method extends Methods> = keyof Requests[Method];
    type WalletInfo = {
        type: 'walletconnect' | 'extension' | 'unknown';
        name: string | undefined;
        icon: string | undefined;
    } | {
        type: 'social';
        social: string;
        identifier: string;
    };
    type Events = {
        sessionChanged: SIWXSession | undefined;
    };
    type Listener<Event extends keyof Events> = (event: Events[Event]) => void;
    type EventListeners = {
        [Key in keyof Events]: Listener<Key>[];
    };
    type SessionAccount = {
        aud: string;
        iss: string;
        exp: number;
        projectIdKey: string;
        sub: string;
        address: string;
        chainId: number | string;
        chainNamespace: ChainNamespace;
        caip2Network: string;
        uri: string;
        domain: string;
        projectUuid: string;
        profileUuid: string;
        nonce: string;
        email?: string;
        appKitAccount?: {
            uuid: string;
            caip2_chain: string;
            address: string;
            profile_uuid: string;
            created_at: string;
            is_main_account: boolean;
            verification_status: null;
            connection_method: object | null;
            metadata: object;
            last_signed_in_at: string;
            signed_up_at: string;
            updated_at: string;
        };
    };
}
