export const ConstantsUtil = {
    WC_NAME_SUFFIX: '.reown.id',
    WC_NAME_SUFFIX_LEGACY: '.wcn.id',
    BLOCKCHAIN_API_RPC_URL: 'https://rpc.walletconnect.org',
    PULSE_API_URL: 'https://pulse.walletconnect.org',
    W3M_API_URL: 'https://api.web3modal.org',
    CONNECTOR_ID: {
        WALLET_CONNECT: 'walletConnect',
        INJECTED: 'injected',
        WALLET_STANDARD: 'announced',
        COINBASE: 'coinbaseWallet',
        COINBASE_SDK: 'coinbaseWalletSDK',
        BASE_ACCOUNT: 'baseAccount',
        SAFE: 'safe',
        LEDGER: 'ledger',
        OKX: 'okx',
        EIP6963: 'eip6963',
        AUTH: 'AUTH'
    },
    CONNECTOR_NAMES: {
        AUTH: 'Auth'
    },
    AUTH_CONNECTOR_SUPPORTED_CHAINS: ['eip155', 'solana'],
    LIMITS: {
        PENDING_TRANSACTIONS: 99
    },
    CHAIN: {
        EVM: 'eip155',
        SOLANA: 'solana',
        POLKADOT: 'polkadot',
        BITCOIN: 'bip122',
        TON: 'ton'
    },
    CHAIN_NAME_MAP: {
        eip155: 'EVM Networks',
        solana: 'Solana',
        polkadot: 'Polkadot',
        bip122: 'Bitcoin',
        cosmos: 'Cosmos',
        sui: 'Sui',
        stacks: 'Stacks',
        ton: 'TON'
    },
    ADAPTER_TYPES: {
        BITCOIN: 'bitcoin',
        SOLANA: 'solana',
        WAGMI: 'wagmi',
        ETHERS: 'ethers',
        ETHERS5: 'ethers5',
        TON: 'ton'
    },
    USDT_CONTRACT_ADDRESSES: [
        '0xdac17f958d2ee523a2206206994597c13d831ec7',
        '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7',
        '0x919C1c267BC06a7039e03fcc2eF738525769109c',
        '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e',
        '0x55d398326f99059fF775485246999027B3197955',
        '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9'
    ],
    SOLANA_SPL_TOKEN_ADDRESSES: {
        SOL: 'So11111111111111111111111111111111111111112'
    },
    NATIVE_IMAGE_IDS_BY_NAMESPACE: {
        eip155: 'ba0ba0cd-17c6-4806-ad93-f9d174f17900',
        solana: '3e8119e5-2a6f-4818-c50c-1937011d5900',
        bip122: '0b4838db-0161-4ffe-022d-532bf03dba00'
    },
    TOKEN_SYMBOLS_BY_ADDRESS: {
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC',
        '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': 'USDC',
        '0x0b2c639c533813f4aa9d7837caf62653d097ff85': 'USDC',
        '0xaf88d065e77c8cc2239327c5edb3a432268e5831': 'USDC',
        '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359': 'USDC',
        '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': 'USDC',
        EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: 'USDC',
        '0xdac17f958d2ee523a2206206994597c13d831ec7': 'USDT',
        '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58': 'USDT',
        '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9': 'USDT',
        '0xc2132d05d31c914a87c6611c10748aeb04b58e8f': 'USDT',
        Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: 'USDT'
    },
    HTTP_STATUS_CODES: {
        SERVER_ERROR: 500,
        TOO_MANY_REQUESTS: 429,
        SERVICE_UNAVAILABLE: 503,
        FORBIDDEN: 403
    },
    UNSUPPORTED_NETWORK_NAME: 'Unknown Network',
    SECURE_SITE_SDK_ORIGIN: (typeof process !== 'undefined' && typeof process.env !== 'undefined'
        ? process.env['NEXT_PUBLIC_SECURE_SITE_ORIGIN']
        : undefined) || 'https://secure.walletconnect.org',
    REMOTE_FEATURES_ALERTS: {
        MULTI_WALLET_NOT_ENABLED: {
            DEFAULT: {
                displayMessage: 'Multi-Wallet Not Enabled',
                debugMessage: 'Multi-wallet support is not enabled. Please enable it in your AppKit configuration at cloud.reown.com.'
            },
            CONNECTIONS_HOOK: {
                displayMessage: 'Multi-Wallet Not Enabled',
                debugMessage: 'Multi-wallet support is not enabled. Please enable it in your AppKit configuration at cloud.reown.com to use the useAppKitConnections hook.'
            },
            CONNECTION_HOOK: {
                displayMessage: 'Multi-Wallet Not Enabled',
                debugMessage: 'Multi-wallet support is not enabled. Please enable it in your AppKit configuration at cloud.reown.com to use the useAppKitConnection hook.'
            }
        },
        HEADLESS_NOT_ENABLED: {
            DEFAULT: {
                displayMessage: '',
                debugMessage: 'Headless support is not enabled. Please enable it with the features.headless option in the AppKit configuration and make sure your current plan supports it.'
            }
        }
    },
    IS_DEVELOPMENT: typeof process !== 'undefined' && process.env['NODE_ENV'] === 'development',
    DEFAULT_ALLOWED_ANCESTORS: [
        'http://localhost:*',
        'https://localhost:*',
        'http://127.0.0.1:*',
        'https://127.0.0.1:*',
        'https://*.pages.dev',
        'https://*.vercel.app',
        'https://*.ngrok-free.app',
        'https://secure-mobile.walletconnect.com',
        'https://secure-mobile.walletconnect.org'
    ],
    METMASK_CONNECTOR_NAME: 'MetaMask',
    TRUST_CONNECTOR_NAME: 'Trust Wallet',
    SOLFLARE_CONNECTOR_NAME: 'Solflare',
    PHANTOM_CONNECTOR_NAME: 'Phantom',
    COIN98_CONNECTOR_NAME: 'Coin98',
    MAGIC_EDEN_CONNECTOR_NAME: 'Magic Eden',
    BACKPACK_CONNECTOR_NAME: 'Backpack',
    BITGET_CONNECTOR_NAME: 'Bitget Wallet',
    FRONTIER_CONNECTOR_NAME: 'Frontier',
    XVERSE_CONNECTOR_NAME: 'Xverse Wallet',
    LEATHER_CONNECTOR_NAME: 'Leather',
    OKX_CONNECTOR_NAME: 'OKX Wallet',
    BINANCE_CONNECTOR_NAME: 'Binance Wallet',
    EIP155: 'eip155',
    ADD_CHAIN_METHOD: 'wallet_addEthereumChain',
    EIP6963_ANNOUNCE_EVENT: 'eip6963:announceProvider',
    EIP6963_REQUEST_EVENT: 'eip6963:requestProvider',
    CONNECTOR_RDNS_MAP: {
        coinbaseWallet: 'com.coinbase.wallet',
        coinbaseWalletSDK: 'com.coinbase.wallet'
    },
    CONNECTOR_TYPE_EXTERNAL: 'EXTERNAL',
    CONNECTOR_TYPE_WALLET_CONNECT: 'WALLET_CONNECT',
    CONNECTOR_TYPE_INJECTED: 'INJECTED',
    CONNECTOR_TYPE_ANNOUNCED: 'ANNOUNCED',
    CONNECTOR_TYPE_AUTH: 'AUTH',
    CONNECTOR_TYPE_MULTI_CHAIN: 'MULTI_CHAIN',
    CONNECTOR_TYPE_W3M_AUTH: 'AUTH'
};
//# sourceMappingURL=ConstantsUtil.js.map