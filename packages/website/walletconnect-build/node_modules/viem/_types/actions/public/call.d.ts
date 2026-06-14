import { type Address } from 'abitype';
import * as BlockOverrides from 'ox/BlockOverrides';
import type { Account } from '../../accounts/types.js';
import { type ParseAccountErrorType } from '../../accounts/utils/parseAccount.js';
import type { Client } from '../../clients/createClient.js';
import type { Transport } from '../../clients/transports/createTransport.js';
import { type RawContractErrorType } from '../../errors/contract.js';
import { type ErrorType } from '../../errors/utils.js';
import type { BlockTag } from '../../types/block.js';
import type { Chain } from '../../types/chain.js';
import type { EIP1193RequestOptions } from '../../types/eip1193.js';
import type { Hash, Hex } from '../../types/misc.js';
import type { StateOverride } from '../../types/stateOverride.js';
import type { UnionOmit } from '../../types/utils.js';
import { type DecodeFunctionResultErrorType } from '../../utils/abi/decodeFunctionResult.js';
import { type EncodeDeployDataErrorType } from '../../utils/abi/encodeDeployData.js';
import { type EncodeFunctionDataErrorType } from '../../utils/abi/encodeFunctionData.js';
import { type FormatBlockParameterErrorType } from '../../utils/block/formatBlockParameter.js';
import type { RequestErrorType } from '../../utils/buildRequest.js';
import { type GetChainContractAddressErrorType } from '../../utils/chain/getChainContractAddress.js';
import { type GetCallErrorReturnType } from '../../utils/errors/getCallError.js';
import { type FormatTransactionRequestErrorType, type FormattedTransactionRequest } from '../../utils/formatters/transactionRequest.js';
import { type CreateBatchSchedulerErrorType } from '../../utils/promise/createBatchScheduler.js';
import { type SerializeStateOverrideErrorType } from '../../utils/stateOverride.js';
import type { AssertRequestErrorType } from '../../utils/transaction/assertRequest.js';
export type CallParameters<chain extends Chain | undefined = Chain | undefined> = UnionOmit<FormattedCall<chain>, 'from'> & {
    /** Account attached to the call (msg.sender). */
    account?: Account | Address | undefined;
    /** Whether or not to enable multicall batching on this call. */
    batch?: boolean | undefined;
    /** Block overrides for the call. */
    blockOverrides?: BlockOverrides.BlockOverrides | undefined;
    /** Bytecode to perform the call on. */
    code?: Hex | undefined;
    /** Contract deployment factory address (ie. Create2 factory, Smart Account factory, etc). */
    factory?: Address | undefined;
    /** Calldata to execute on the factory to deploy the contract. */
    factoryData?: Hex | undefined;
    /** Request options. */
    requestOptions?: EIP1193RequestOptions | undefined;
    /** State overrides for the call. */
    stateOverride?: StateOverride | undefined;
} & ({
    /** The block number to perform the call against. */
    blockNumber?: bigint | undefined;
    blockTag?: undefined;
    blockHash?: undefined;
    requireCanonical?: undefined;
} | {
    blockNumber?: undefined;
    /**
     * The block tag to perform the call against.
     * @default 'latest'
     */
    blockTag?: BlockTag | undefined;
    blockHash?: undefined;
    requireCanonical?: undefined;
} | {
    blockNumber?: undefined;
    blockTag?: undefined;
    /** The block hash to perform the call against. */
    blockHash: Hash;
    /** Whether or not to throw an error if the block is not in the canonical chain. Only allowed in conjunction with `blockHash`. */
    requireCanonical?: boolean | undefined;
});
type FormattedCall<chain extends Chain | undefined = Chain | undefined> = FormattedTransactionRequest<chain>;
export type CallReturnType = {
    data: Hex | undefined;
};
export type CallErrorType = GetCallErrorReturnType<ParseAccountErrorType | SerializeStateOverrideErrorType | AssertRequestErrorType | FormatBlockParameterErrorType | FormatTransactionRequestErrorType | ScheduleMulticallErrorType | RequestErrorType | ToDeploylessCallViaBytecodeDataErrorType | ToDeploylessCallViaFactoryDataErrorType>;
/**
 * Executes a new message call immediately without submitting a transaction to the network.
 *
 * - Docs: https://viem.sh/docs/actions/public/call
 * - JSON-RPC Methods: [`eth_call`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_call)
 *
 * @param client - Client to use
 * @param parameters - {@link CallParameters}
 * @returns The call data. {@link CallReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { call } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const data = await call(client, {
 *   account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
 *   data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 * })
 */
export declare function call<chain extends Chain | undefined>(client: Client<Transport, chain>, args: CallParameters<chain>): Promise<CallReturnType>;
type ScheduleMulticallErrorType = GetChainContractAddressErrorType | FormatBlockParameterErrorType | CreateBatchSchedulerErrorType | EncodeFunctionDataErrorType | DecodeFunctionResultErrorType | RawContractErrorType | ErrorType;
type ToDeploylessCallViaBytecodeDataErrorType = EncodeDeployDataErrorType | ErrorType;
type ToDeploylessCallViaFactoryDataErrorType = EncodeDeployDataErrorType | ErrorType;
/** @internal */
export type GetRevertErrorDataErrorType = ErrorType;
/** @internal */
export declare function getRevertErrorData(err: unknown): `0x${string}` | undefined;
export {};
//# sourceMappingURL=call.d.ts.map