export declare const valygoSmartchain: {
    blockExplorers: {
        readonly default: {
            readonly name: "VYOScan";
            readonly url: "https://vyoscan.com";
            readonly apiUrl: "https://vyoscan.com/api";
        };
    };
    blockTime?: number | undefined | undefined;
    contracts: {
        readonly multicall3: {
            readonly address: "0xeFa3c632BD275750597cE9ca2346A5becAA0F344";
        };
    };
    ensTlds?: readonly string[] | undefined;
    id: 7771777;
    name: "VALYGO Smartchain";
    nativeCurrency: {
        readonly decimals: 18;
        readonly name: "VYO";
        readonly symbol: "VYO";
    };
    experimental_preconfirmationTime?: number | undefined | undefined;
    rpcUrls: {
        readonly default: {
            readonly http: readonly ["https://rpc-gw-1.vyoscan.com/ext/bc/2t51dXsuxUvd9teY9TKEJmgxmxMk3CRF88UYTA4HQgjeYZqzSX/rpc", "https://rpc-gw-2.vyoscan.com/ext/bc/2t51dXsuxUvd9teY9TKEJmgxmxMk3CRF88UYTA4HQgjeYZqzSX/rpc"];
            readonly webSocket: readonly ["wss://ws.vyoscan.com/ext/bc/2t51dXsuxUvd9teY9TKEJmgxmxMk3CRF88UYTA4HQgjeYZqzSX/ws"];
        };
    };
    sourceId?: number | undefined | undefined;
    testnet?: boolean | undefined | undefined;
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
//# sourceMappingURL=valygoSmartchain.d.ts.map