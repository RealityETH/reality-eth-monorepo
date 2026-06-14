import type { SolanaSignAndSendTransactionFeature, SolanaSignMessageFeature, SolanaSignTransactionFeature } from '@solana/wallet-standard-features';
import type { Wallet, WalletIcon } from '@wallet-standard/base';
import type { StandardConnectFeature, StandardDisconnectFeature, StandardEventsFeature } from '@wallet-standard/features';
import type UniversalProvider from '@walletconnect/universal-provider';
import { type CaipNetworkId } from '@reown/appkit-common';
export declare class SolanaWalletConnectStandardWallet implements Wallet {
    #private;
    static register(provider: UniversalProvider): void;
    get version(): "1.0.0";
    get name(): string;
    get icon(): WalletIcon;
    get chains(): ("solana:mainnet" | "solana:devnet" | "solana:testnet" | "solana:localnet")[];
    get features(): StandardConnectFeature & StandardDisconnectFeature & StandardEventsFeature & SolanaSignAndSendTransactionFeature & SolanaSignTransactionFeature & SolanaSignMessageFeature;
    get accounts(): {
        address: string;
        publicKey: Uint8Array<ArrayBufferLike>;
        chains: CaipNetworkId[];
        features: readonly ["solana:signAndSendTransaction", "solana:signTransaction", "solana:signMessage"];
    }[];
    private constructor();
    setProvider(provider: UniversalProvider): void;
}
