import type { Transaction, TransactionImage, TransactionTransfer } from '@reown/appkit-common';
export declare const TransactionUtil: {
    getTransactionGroupTitle(year: number, month: number): string | undefined;
    getTransactionImages(transfers: TransactionTransfer[]): TransactionImage[];
    getTransactionImage(transfer?: TransactionTransfer): TransactionImage;
    getTransactionImageURL(transfer: TransactionTransfer | undefined): string | undefined;
    getTransactionTransferTokenType(transfer?: TransactionTransfer): "FUNGIBLE" | "NFT" | undefined;
    getTransactionDescriptions(transaction: Transaction, mergedTransfers?: TransactionTransfer[]): string[];
    getTransferDescription(transfer?: TransactionTransfer): string;
    getFungibleTransferDescription(transfer?: TransactionTransfer): string | null;
    mergeTransfers(transfers: TransactionTransfer[]): TransactionTransfer[];
    filterGasFeeTransfers(transfers: TransactionTransfer[]): TransactionTransfer[];
    filterGasFeesFromTokenGroup(tokenTransfers: TransactionTransfer[]): TransactionTransfer[];
    getQuantityFixedValue(value: string | undefined): string | null;
};
