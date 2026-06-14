import type { CaipNetwork, ChainNamespace } from '@reown/appkit-common';
import type { ConnectedWalletInfo } from '../../../../utils/TypeUtil.js';
import type { Account } from '../Account/Account.js';
export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected';
export type ConnectionId = string;
export type ConnectionProps = {
    /** Stable id for this session (connector + namespace + instance). */
    id: ConnectionId;
    /** Connector identity */
    connectorId: string;
    connectorType: 'walletConnect' | 'injected' | 'external' | 'embedded' | 'custom';
    /** Namespace this connection serves */
    namespace: ChainNamespace;
    /** Accounts surfaced by the wallet */
    accounts: Account[];
    /** Active account */
    activeAccount: Account;
    /** Current active chain */
    caipNetwork?: CaipNetwork;
    /** Wallet info */
    wallet: ConnectedWalletInfo;
    /** Lifecycle */
    status: ConnectionStatus;
    lastError?: {
        code: string;
        message: string;
    };
    /** Opaque connector session info (for reconnect) */
    session?: unknown;
    /** Optional UX/auth preferences */
    preferences?: {
        preferredAccountType?: Account['type'];
    };
    /** Misc metadata */
    meta?: {
        walletName?: string;
        walletIconUrl?: string;
        connectedAt?: number;
        lastUpdatedAt?: number;
        walletInfo?: unknown;
    };
};
export declare class Connection {
    /** Stable id for this session (connector + namespace + instance). */
    id: ConnectionId;
    /** Connector identity */
    connectorId: string;
    connectorType: 'walletConnect' | 'injected' | 'external' | 'embedded' | 'custom';
    /** Namespace this connection serves */
    namespace: ChainNamespace;
    /** Accounts surfaced by the wallet */
    accounts: Account[];
    /** Active account */
    activeAccount: Account;
    /** Current active chain */
    caipNetwork?: CaipNetwork;
    /** Wallet info */
    wallet: ConnectedWalletInfo;
    /** Lifecycle */
    status: ConnectionStatus;
    lastError?: {
        code: string;
        message: string;
    };
    /** Opaque connector session info (for reconnect) */
    session?: unknown;
    /** Optional UX/auth preferences */
    preferences?: {
        preferredAccountType?: Account['type'];
    };
    /** Misc metadata */
    meta?: {
        walletName?: string;
        walletIconUrl?: string;
        connectedAt?: number;
        lastUpdatedAt?: number;
        walletInfo?: unknown;
    };
    constructor(props: ConnectionProps);
    /**
     * Set the active account
     */
    setActiveAccount(account: Account): void;
    /**
     * Get connection info for serialization
     */
    toJSON(): ConnectionProps;
}
