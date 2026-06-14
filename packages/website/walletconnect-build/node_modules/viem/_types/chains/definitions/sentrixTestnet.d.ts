export declare const sentrixTestnet: {
    blockExplorers: {
        readonly default: {
            readonly name: "SentrixScan Testnet";
            readonly url: "https://scan-testnet.sentrixchain.com";
        };
    };
    blockTime: 1000;
    contracts: {
        readonly multicall3: {
            readonly address: "0x7900826De548425c6BE56caEbD4760AB0155Cd54";
            readonly blockCreated: 723191;
        };
    };
    ensTlds?: readonly string[] | undefined;
    id: 7120;
    name: "Sentrix Testnet";
    nativeCurrency: {
        readonly name: "Sentrix";
        readonly symbol: "SRX";
        readonly decimals: 18;
    };
    experimental_preconfirmationTime?: number | undefined | undefined;
    rpcUrls: {
        readonly default: {
            readonly http: readonly ["https://testnet-rpc.sentrixchain.com"];
            readonly webSocket: readonly ["wss://testnet-rpc.sentrixchain.com/ws"];
        };
    };
    sourceId?: number | undefined | undefined;
    testnet: true;
    custom?: Record<string, unknown> | undefined;
    extendSchema?: Record<string, unknown> | undefined;
    fees?: import("../../index.js").ChainFees<undefined> | undefined;
    formatters?: undefined;
    prepareTransactionRequest?: ((args: import("../../index.js").PrepareTransactionRequestParameters, options: {
        client: import("../../index.js").Client;
        phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
    }) => Promise<import("../../index.js").PrepareTransactionRequestParameters>) | [fn: ((args: import("../../index.js").PrepareTransactionRequestParameters, options: {
        client: import("../../index.js").Client;
        phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
    }) => Promise<import("../../index.js").PrepareTransactionRequestParameters>) | undefined, options: {
        runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
    }] | undefined;
    serializers?: import("../../index.js").ChainSerializers<undefined, import("../../index.js").TransactionSerializable> | undefined;
    verifyHash?: ((client: import("../../index.js").Client, parameters: import("../../index.js").VerifyHashActionParameters) => Promise<import("../../index.js").VerifyHashActionReturnType>) | undefined;
};
//# sourceMappingURL=sentrixTestnet.d.ts.map