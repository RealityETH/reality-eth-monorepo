import type { Abi, AbiStateMutability, Address } from 'abitype';
import type { Account } from '../../accounts/types.js';
import type { Client } from '../../clients/createClient.js';
import type { Transport } from '../../clients/transports/createTransport.js';
import type { ResolvedToken, Token, Tokens } from '../../tokens/defineToken.js';
import type { Chain } from '../../types/chain.js';
import type { ContractFunctionName, ContractFunctionParameters, ExtractAbiItem } from '../../types/contract.js';
import type { Hex } from '../../types/misc.js';
import type { UnionPick } from '../../types/utils.js';
import type { ReadContractParameters as viem_ReadContractParameters } from '../public/readContract.js';
import type { WriteContractSyncParameters as viem_WriteContractSyncParameters } from '../wallet/writeContractSync.js';
/**
 * Union of symbols of the Client's declared `tokens` whose `addresses` include
 * the Client's `chain.id`. Collapses to `never` when there is no chain mapping
 * (no `tokens`, no `chain`, a widened `chain.id`, or widened token symbols).
 *
 * @internal
 */
export type TokenName<chain extends Chain | undefined, tokens extends Tokens | undefined> = chain extends {
    id: infer chainId extends number;
} ? number extends chainId ? never : tokens extends Tokens ? TokenSymbolForChain<tokens[number], chainId> : never : never;
type TokenSymbolForChain<token, chainId extends number> = token extends Token ? chainId extends keyof token['addresses'] ? token['symbol'] extends string ? string extends token['symbol'] ? never : Lowercase<token['symbol']> : never : never : never;
/**
 * Selects an ERC-20 token by `token`, which is either the symbol of a token
 * declared on the Client's `tokens` array or a contract `address`.
 *
 * When `token` is a declared symbol (or an address that matches a declared
 * token), token metadata is resolved from the Client's `tokens` array.
 */
export type TokenParameter<chain extends Chain | undefined, tokens extends Tokens | undefined> = {
    /**
     * Token to operate on: either the symbol of a token declared on the Client's
     * `tokens` array (with an address for the Client's `chain.id`), or a
     * contract `address`.
     */
    token: TokenName<chain, tokens> | Address;
};
export type TokenParameters<chain extends Chain | undefined, tokens extends Tokens | undefined> = TokenParameter<chain, tokens> & {
    /**
     * Decimals used to convert between base units and the human-readable amount.
     * Inferred from the Client's `tokens` array when `token` matches a declared
     * token; otherwise fetched from the token contract when needed.
     */
    decimals?: number | undefined;
};
/**
 * A token amount, expressed both in the token's base units (`amount`) and as a
 * human-readable decimal string (`formatted`, derived from the token's
 * `decimals`).
 */
export type Amount = {
    /** Amount in the token's base units. */
    amount: bigint;
    /** Token decimals used to derive `formatted`. */
    decimals: number;
    /** Amount formatted as a human-readable decimal string. */
    formatted: string;
};
/** A write amount: a base-unit bigint, or an explicit formatted helper. */
export type AmountInput = bigint | {
    /** Token decimals used to parse `formatted`. */
    decimals?: number | undefined;
    /** Human-readable decimal amount. */
    formatted: string;
};
/**
 * Shapes a base-unit value into an {@link Amount} (base units, `decimals`, and
 * human-readable `formatted` string).
 *
 * @param amount - Amount in base units.
 * @param decimals - Token decimals used to format the amount.
 * @returns The {@link Amount}.
 */
export declare function toAmount(amount: bigint, decimals: number): Amount;
/**
 * Resolves a write amount to base units.
 *
 * @param amount - Base-unit amount, or formatted helper.
 * @param decimals - Token decimals used to parse formatted amounts.
 * @returns Amount in base units.
 */
export declare function toBaseUnits(amount: AmountInput, decimals: number | undefined): bigint;
/**
 * Requires resolved token decimals for parsing or formatting amounts.
 *
 * @param decimals - Token decimals.
 * @returns Token decimals.
 * @internal
 */
export declare function requireTokenDecimals(decimals: number | undefined): number;
/**
 * Resolves the decimals used for formatting a write amount.
 *
 * @param amount - Base-unit amount, or formatted helper.
 * @param decimals - Token decimals.
 * @returns Token decimals, overridden by the formatted helper when present.
 */
export declare function resolveAmountDecimals(amount: AmountInput, decimals: number | undefined): number | undefined;
/**
 * Resolves the token contract `address` and `decimals` from a `token`, which is
 * either the symbol of a token declared on the client's `tokens` array or a
 * contract `address`.
 *
 * When `token` is a declared symbol, the `address` and `decimals` are resolved
 * from the Client's `tokens` array for the Client's `chain.id` (`decimals` can
 * be overridden via the explicit `decimals`). When `token` is an address, its
 * `decimals` is inferred from the Client's `tokens` array when the address
 * matches a declared token, otherwise taken from the explicit `decimals`.
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The resolved `address` and `decimals`.
 */
export declare function resolveToken(client: Client<Transport, Chain | undefined>, parameters: resolveToken.Parameters): {
    address: Address;
    decimals: number | undefined;
};
export declare namespace resolveToken {
    type Parameters = {
        /** Decimals, if provided explicitly. */
        decimals?: number | undefined;
        /** Token symbol (declared on the client's `tokens` array) or contract address. */
        token: string;
    };
}
/**
 * Finds the declared token on the Client's `tokens` array matching `token`
 * (either a token symbol or contract `address`), resolved to a {@link ResolvedToken}
 * for the Client's `chain.id`. Returns `undefined` when no declared token
 * matches, or the matching token has no address for the Client's chain.
 *
 * @param client - Client.
 * @param token - Token symbol (declared on the client's `tokens` array) or contract address.
 * @returns The matching resolved token config, or `undefined`.
 */
export declare function findDeclaredToken(client: Client<Transport, Chain | undefined>, token: string): ResolvedToken | undefined;
/**
 * Resolves token decimals, fetching from the token contract when they are not
 * provided explicitly or declared on the client.
 * @internal
 */
export declare function resolveTokenWithDecimals(client: Client<Transport, Chain | undefined>, parameters: resolveToken.Parameters): Promise<{
    address: Address;
    decimals: number;
}>;
/**
 * Picks the transaction-override fields shared by write actions, so the
 * action-specific args (`token`, `amount`, `to`, etc.) don't leak into
 * `estimateContractGas` / `simulateContract` requests. @internal
 */
export declare function pickWriteParameters(parameters: Record<string, unknown>): {
    account: unknown;
    chain: unknown;
    gas: unknown;
    maxFeePerGas: unknown;
    maxPriorityFeePerGas: unknown;
    nonce: unknown;
};
export type ReadParameters = Pick<viem_ReadContractParameters<never, never, never>, 'account' | 'blockNumber' | 'blockOverrides' | 'blockTag' | 'stateOverride'>;
export type WriteParameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = UnionPick<viem_WriteContractSyncParameters<never, never, never, chain, account>, 'account' | 'chain' | 'gas' | 'maxFeePerGas' | 'maxPriorityFeePerGas' | 'nonce' | 'throwOnReceiptRevert'>;
export declare function defineCall<const abi extends Abi, const functionName extends ContractFunctionName<abi, AbiStateMutability>, call extends ContractFunctionParameters<abi, AbiStateMutability, functionName>>(call: call | ContractFunctionParameters<abi, AbiStateMutability, functionName>): ContractFunctionParameters<[
    ExtractAbiItem<abi, functionName>
], AbiStateMutability, functionName> & {
    data: Hex;
    to: Address;
};
export {};
//# sourceMappingURL=internal.d.ts.map