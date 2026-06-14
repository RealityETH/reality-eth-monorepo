import type { ChainNamespace } from './TypeUtil.js';
export declare const ConstantsUtil: {
    readonly WC_NAME_SUFFIX: ".reown.id";
    readonly WC_NAME_SUFFIX_LEGACY: ".wcn.id";
    readonly BLOCKCHAIN_API_RPC_URL: "https://rpc.walletconnect.org";
    readonly PULSE_API_URL: "https://pulse.walletconnect.org";
    readonly W3M_API_URL: "https://api.web3modal.org";
    readonly CONNECTOR_ID: {
        readonly WALLET_CONNECT: "walletConnect";
        readonly INJECTED: "injected";
        readonly WALLET_STANDARD: "announced";
        readonly COINBASE: "coinbaseWallet";
        readonly COINBASE_SDK: "coinbaseWalletSDK";
        readonly BASE_ACCOUNT: "baseAccount";
        readonly SAFE: "safe";
        readonly LEDGER: "ledger";
        readonly OKX: "okx";
        readonly EIP6963: "eip6963";
        readonly AUTH: "AUTH";
    };
    readonly CONNECTOR_NAMES: {
        readonly AUTH: "Auth";
    };
    readonly AUTH_CONNECTOR_SUPPORTED_CHAINS: ChainNamespace[];
    readonly LIMITS: {
        readonly PENDING_TRANSACTIONS: 99;
    };
    readonly CHAIN: {
        readonly EVM: "eip155";
        readonly SOLANA: "solana";
        readonly POLKADOT: "polkadot";
        readonly BITCOIN: "bip122";
        readonly TON: "ton";
    };
    readonly CHAIN_NAME_MAP: {
        readonly eip155: "EVM Networks";
        readonly solana: "Solana";
        readonly polkadot: "Polkadot";
        readonly bip122: "Bitcoin";
        readonly cosmos: "Cosmos";
        readonly sui: "Sui";
        readonly stacks: "Stacks";
        readonly ton: "TON";
    };
    readonly ADAPTER_TYPES: {
        readonly BITCOIN: "bitcoin";
        readonly SOLANA: "solana";
        readonly WAGMI: "wagmi";
        readonly ETHERS: "ethers";
        readonly ETHERS5: "ethers5";
        readonly TON: "ton";
    };
    readonly USDT_CONTRACT_ADDRESSES: readonly ["0xdac17f958d2ee523a2206206994597c13d831ec7", "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7", "0x919C1c267BC06a7039e03fcc2eF738525769109c", "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e", "0x55d398326f99059fF775485246999027B3197955", "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9"];
    readonly SOLANA_SPL_TOKEN_ADDRESSES: {
        readonly SOL: "So11111111111111111111111111111111111111112";
    };
    readonly NATIVE_IMAGE_IDS_BY_NAMESPACE: Partial<Record<ChainNamespace, string>>;
    readonly TOKEN_SYMBOLS_BY_ADDRESS: {
        readonly '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': "USDC";
        readonly '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': "USDC";
        readonly '0x0b2c639c533813f4aa9d7837caf62653d097ff85': "USDC";
        readonly '0xaf88d065e77c8cc2239327c5edb3a432268e5831': "USDC";
        readonly '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359': "USDC";
        readonly '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': "USDC";
        readonly EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: "USDC";
        readonly '0xdac17f958d2ee523a2206206994597c13d831ec7': "USDT";
        readonly '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58': "USDT";
        readonly '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9': "USDT";
        readonly '0xc2132d05d31c914a87c6611c10748aeb04b58e8f': "USDT";
        readonly Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: "USDT";
    };
    readonly HTTP_STATUS_CODES: {
        readonly SERVER_ERROR: 500;
        readonly TOO_MANY_REQUESTS: 429;
        readonly SERVICE_UNAVAILABLE: 503;
        readonly FORBIDDEN: 403;
    };
    readonly UNSUPPORTED_NETWORK_NAME: "Unknown Network";
    readonly SECURE_SITE_SDK_ORIGIN: string;
    readonly REMOTE_FEATURES_ALERTS: {
        readonly MULTI_WALLET_NOT_ENABLED: {
            readonly DEFAULT: {
                readonly displayMessage: "Multi-Wallet Not Enabled";
                readonly debugMessage: "Multi-wallet support is not enabled. Please enable it in your AppKit configuration at cloud.reown.com.";
            };
            readonly CONNECTIONS_HOOK: {
                readonly displayMessage: "Multi-Wallet Not Enabled";
                readonly debugMessage: "Multi-wallet support is not enabled. Please enable it in your AppKit configuration at cloud.reown.com to use the useAppKitConnections hook.";
            };
            readonly CONNECTION_HOOK: {
                readonly displayMessage: "Multi-Wallet Not Enabled";
                readonly debugMessage: "Multi-wallet support is not enabled. Please enable it in your AppKit configuration at cloud.reown.com to use the useAppKitConnection hook.";
            };
        };
        readonly HEADLESS_NOT_ENABLED: {
            readonly DEFAULT: {
                readonly displayMessage: "";
                readonly debugMessage: "Headless support is not enabled. Please enable it with the features.headless option in the AppKit configuration and make sure your current plan supports it.";
            };
        };
    };
    readonly IS_DEVELOPMENT: boolean;
    readonly DEFAULT_ALLOWED_ANCESTORS: string[];
    readonly METMASK_CONNECTOR_NAME: "MetaMask";
    readonly TRUST_CONNECTOR_NAME: "Trust Wallet";
    readonly SOLFLARE_CONNECTOR_NAME: "Solflare";
    readonly PHANTOM_CONNECTOR_NAME: "Phantom";
    readonly COIN98_CONNECTOR_NAME: "Coin98";
    readonly MAGIC_EDEN_CONNECTOR_NAME: "Magic Eden";
    readonly BACKPACK_CONNECTOR_NAME: "Backpack";
    readonly BITGET_CONNECTOR_NAME: "Bitget Wallet";
    readonly FRONTIER_CONNECTOR_NAME: "Frontier";
    readonly XVERSE_CONNECTOR_NAME: "Xverse Wallet";
    readonly LEATHER_CONNECTOR_NAME: "Leather";
    readonly OKX_CONNECTOR_NAME: "OKX Wallet";
    readonly BINANCE_CONNECTOR_NAME: "Binance Wallet";
    readonly EIP155: "eip155";
    readonly ADD_CHAIN_METHOD: "wallet_addEthereumChain";
    readonly EIP6963_ANNOUNCE_EVENT: "eip6963:announceProvider";
    readonly EIP6963_REQUEST_EVENT: "eip6963:requestProvider";
    readonly CONNECTOR_RDNS_MAP: Record<string, string>;
    readonly CONNECTOR_TYPE_EXTERNAL: "EXTERNAL";
    readonly CONNECTOR_TYPE_WALLET_CONNECT: "WALLET_CONNECT";
    readonly CONNECTOR_TYPE_INJECTED: "INJECTED";
    readonly CONNECTOR_TYPE_ANNOUNCED: "ANNOUNCED";
    readonly CONNECTOR_TYPE_AUTH: "AUTH";
    readonly CONNECTOR_TYPE_MULTI_CHAIN: "MULTI_CHAIN";
    readonly CONNECTOR_TYPE_W3M_AUTH: "AUTH";
};
