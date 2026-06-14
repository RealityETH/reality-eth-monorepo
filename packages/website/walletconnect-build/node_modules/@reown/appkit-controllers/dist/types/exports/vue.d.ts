import { type Ref } from 'vue';
import { type ChainNamespace } from '@reown/appkit-common';
import type { Connection } from '@reown/appkit-common';
import type { UseAppKitAccountReturn } from '../src/utils/TypeUtil.js';
export type { Connection } from '@reown/appkit-common';
interface DisconnectParams {
    id?: string;
    namespace?: ChainNamespace;
}
interface UseAppKitConnectionProps {
    namespace?: ChainNamespace;
    onSuccess?: (params: {
        address: string;
        namespace: ChainNamespace;
        hasSwitchedAccount: boolean;
        hasSwitchedWallet: boolean;
        hasDeletedWallet: boolean;
    }) => void;
    onError?: (error: Error) => void;
}
interface SwitchConnectionParams {
    connection: Connection;
    address?: string;
}
interface DeleteRecentConnectionProps {
    address: string;
    connectorId: string;
}
interface FormattedConnection extends Connection {
    name: string | undefined;
    icon: string | undefined;
    networkIcon: string | undefined;
}
interface UseAppKitConnectionsReturn {
    connections: FormattedConnection[];
    recentConnections: FormattedConnection[];
}
interface UseAppKitConnectionReturn {
    connection: Connection | undefined;
    isPending: boolean;
    switchConnection: (params: SwitchConnectionParams) => Promise<void>;
    deleteConnection: (params: DeleteRecentConnectionProps) => void;
}
export declare function useAppKitAccount(options?: {
    namespace?: ChainNamespace;
}): Ref<UseAppKitAccountReturn>;
export declare function useDisconnect(): {
    disconnect: (props?: DisconnectParams) => Promise<void>;
};
export declare function useAppKitConnections(namespace?: ChainNamespace): Ref<UseAppKitConnectionsReturn>;
export declare function useAppKitConnection(props: UseAppKitConnectionProps): Ref<UseAppKitConnectionReturn>;
