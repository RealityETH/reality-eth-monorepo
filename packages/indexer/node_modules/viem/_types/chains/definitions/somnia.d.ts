export declare const somnia: {
    blockExplorers: {
        readonly default: {
            readonly name: "Somnia Explorer";
            readonly url: "https://explorer.somnia.network";
            readonly apiUrl: "https://explorer.somnia.network/api";
        };
    };
    blockTime: 100;
    contracts: {
        readonly multicall3: {
            readonly address: "0x5e44F178E8cF9B2F5409B6f18ce936aB817C5a11";
            readonly blockCreated: 38516341;
        };
    };
    ensTlds?: readonly string[] | undefined;
    id: 5031;
    name: "Somnia";
    nativeCurrency: {
        readonly name: "Somnia";
        readonly symbol: "SOMI";
        readonly decimals: 18;
    };
    experimental_preconfirmationTime?: number | undefined | undefined;
    rpcUrls: {
        readonly default: {
            readonly http: readonly ["https://api.infra.mainnet.somnia.network"];
        };
    };
    sourceId?: number | undefined | undefined;
    testnet: false;
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
//# sourceMappingURL=somnia.d.ts.map