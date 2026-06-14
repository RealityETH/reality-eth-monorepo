import { EngineTypes } from "@walletconnect/types";
export declare const ENGINE_CONTEXT = "engine";
export declare const ENGINE_RPC_OPTS: EngineTypes.RpcOptsMap;
export declare const SESSION_REQUEST_EXPIRY_BOUNDARIES: {
    min: number;
    max: number;
};
export declare const ENGINE_QUEUE_STATES: {
    idle: "IDLE";
    active: "ACTIVE";
};
export declare const TVF_METHODS: {
    eth_sendTransaction: {
        key: string;
    };
    eth_sendRawTransaction: {
        key: string;
    };
    wallet_sendCalls: {
        key: string;
    };
    solana_signTransaction: {
        key: string;
    };
    solana_signAllTransactions: {
        key: string;
    };
    solana_signAndSendTransaction: {
        key: string;
    };
    sui_signAndExecuteTransaction: {
        key: string;
    };
    sui_signTransaction: {
        key: string;
    };
    hedera_signAndExecuteTransaction: {
        key: string;
    };
    hedera_executeTransaction: {
        key: string;
    };
    near_signTransaction: {
        key: string;
    };
    near_signTransactions: {
        key: string;
    };
    tron_signTransaction: {
        key: string;
    };
    xrpl_signTransaction: {
        key: string;
    };
    xrpl_signTransactionFor: {
        key: string;
    };
    algo_signTxn: {
        key: string;
    };
    sendTransfer: {
        key: string;
    };
    stacks_stxTransfer: {
        key: string;
    };
    polkadot_signTransaction: {
        key: string;
    };
    cosmos_signDirect: {
        key: string;
    };
};
//# sourceMappingURL=engine.d.ts.map