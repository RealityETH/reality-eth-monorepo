import type { WalletAccount } from '@wallet-standard/base';
import { SOLANA_CHAINS } from './constants.js';
/** Type of all Solana clusters */
export type SolanaChain = (typeof SOLANA_CHAINS)[number];
export declare class WalletConnectAccount implements WalletAccount {
    #private;
    get address(): string;
    get publicKey(): Uint8Array<ArrayBuffer>;
    get chains(): `${string}:${string}`[];
    get features(): `${string}:${string}`[];
    get label(): string | undefined;
    get icon(): `data:image/svg+xml;base64,${string}` | `data:image/webp;base64,${string}` | `data:image/png;base64,${string}` | `data:image/gif;base64,${string}` | undefined;
    constructor({ address, publicKey, label, icon }: Omit<WalletAccount, 'chains' | 'features'>);
}
