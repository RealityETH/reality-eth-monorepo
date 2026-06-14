import { parseAbi } from 'abitype';
import * as BlockOverrides from 'ox/BlockOverrides';
import { parseAccount, } from '../../accounts/utils/parseAccount.js';
import { multicall3Abi } from '../../constants/abis.js';
import { aggregate3Signature } from '../../constants/contract.js';
import { deploylessCallViaBytecodeBytecode, deploylessCallViaFactoryBytecode, multicall3Bytecode, } from '../../constants/contracts.js';
import { BaseError } from '../../errors/base.js';
import { ChainDoesNotSupportContract, ClientChainNotConfiguredError, } from '../../errors/chain.js';
import { CounterfactualDeploymentFailedError, RawContractError, } from '../../errors/contract.js';
import { getAbortError, isAbortError, } from '../../errors/utils.js';
import { decodeFunctionResult, } from '../../utils/abi/decodeFunctionResult.js';
import { encodeDeployData, } from '../../utils/abi/encodeDeployData.js';
import { encodeFunctionData, } from '../../utils/abi/encodeFunctionData.js';
import { isAddressEqual } from '../../utils/address/isAddressEqual.js';
import { formatBlockParameter, } from '../../utils/block/formatBlockParameter.js';
import { getChainContractAddress, } from '../../utils/chain/getChainContractAddress.js';
import { getCallError, } from '../../utils/errors/getCallError.js';
import { extract } from '../../utils/formatters/extract.js';
import { formatTransactionRequest, } from '../../utils/formatters/transactionRequest.js';
import { createBatchScheduler, } from '../../utils/promise/createBatchScheduler.js';
import { serializeStateOverride, } from '../../utils/stateOverride.js';
import { assertRequest } from '../../utils/transaction/assertRequest.js';
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
export async function call(client, args) {
    const { account: account_ = client.account, authorizationList, batch = Boolean(client.batch?.multicall), blockHash, blockNumber, blockTag = client.experimental_blockTag ?? 'latest', requireCanonical, accessList, blobs, blockOverrides, code, data: data_, factory, factoryData, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, requestOptions, to, value, stateOverride, ...rest } = args;
    const account = account_ ? parseAccount(account_) : undefined;
    if (code && (factory || factoryData))
        throw new BaseError('Cannot provide both `code` & `factory`/`factoryData` as parameters.');
    if (code && to)
        throw new BaseError('Cannot provide both `code` & `to` as parameters.');
    // Check if the call is deployless via bytecode.
    const deploylessCallViaBytecode = code && data_;
    // Check if the call is deployless via a factory.
    const deploylessCallViaFactory = factory && factoryData && to && data_;
    const deploylessCall = deploylessCallViaBytecode || deploylessCallViaFactory;
    const data = (() => {
        if (deploylessCallViaBytecode)
            return toDeploylessCallViaBytecodeData({
                code,
                data: data_,
            });
        if (deploylessCallViaFactory)
            return toDeploylessCallViaFactoryData({
                data: data_,
                factory,
                factoryData,
                to,
            });
        return data_;
    })();
    try {
        assertRequest(args);
        const block = formatBlockParameter({
            blockHash,
            blockNumber,
            blockTag,
            requireCanonical,
        });
        const rpcBlockOverrides = blockOverrides
            ? BlockOverrides.toRpc(blockOverrides)
            : undefined;
        const rpcStateOverride = serializeStateOverride(stateOverride);
        const chainFormat = client.chain?.formatters?.transactionRequest?.format;
        const format = chainFormat || formatTransactionRequest;
        const request = format({
            // Pick out extra data that might exist on the chain's transaction request type.
            ...extract(rest, { format: chainFormat }),
            accessList,
            account,
            authorizationList,
            blobs,
            data,
            gas,
            gasPrice,
            maxFeePerBlobGas,
            maxFeePerGas,
            maxPriorityFeePerGas,
            nonce,
            to: deploylessCall ? undefined : to,
            value,
        }, 'call');
        if (batch &&
            shouldPerformMulticall({ request }) &&
            !rpcBlockOverrides &&
            blockHash === undefined) {
            try {
                const { deployless = false } = typeof client.batch?.multicall === 'object'
                    ? client.batch.multicall
                    : {};
                const multicallAddress = getMulticallAddress(client, {
                    blockNumber,
                    deployless,
                });
                if (!multicallAddress ||
                    !hasStateOverrideForAddress(rpcStateOverride, multicallAddress))
                    return await scheduleMulticall(client, {
                        ...request,
                        blockHash,
                        blockNumber,
                        blockTag,
                        multicallAddress,
                        requestOptions,
                        requireCanonical,
                        rpcStateOverride,
                    });
            }
            catch (err) {
                if (!(err instanceof ClientChainNotConfiguredError) &&
                    !(err instanceof ChainDoesNotSupportContract))
                    throw err;
            }
        }
        const params = (() => {
            const base = [
                request,
                block,
            ];
            if (rpcStateOverride && rpcBlockOverrides)
                return [...base, rpcStateOverride, rpcBlockOverrides];
            if (rpcStateOverride)
                return [...base, rpcStateOverride];
            if (rpcBlockOverrides)
                return [...base, {}, rpcBlockOverrides];
            return base;
        })();
        const response = await client.request({
            method: 'eth_call',
            params,
        }, requestOptions);
        if (response === '0x')
            return { data: undefined };
        return { data: response };
    }
    catch (err) {
        if (requestOptions?.signal?.aborted)
            throw getAbortError(requestOptions.signal);
        if (isAbortError(err))
            throw err;
        const data = getRevertErrorData(err);
        // Check for CCIP-Read offchain lookup signature.
        const { offchainLookup, offchainLookupSignature } = await import('../../utils/ccip.js');
        if (client.ccipRead !== false &&
            data?.slice(0, 10) === offchainLookupSignature &&
            to)
            return {
                data: await offchainLookup(client, { data, requestOptions, to }),
            };
        // Check for counterfactual deployment error.
        if (deploylessCall && data?.slice(0, 10) === '0x101bb98d')
            throw new CounterfactualDeploymentFailedError({ factory });
        throw getCallError(err, {
            ...args,
            account,
            chain: client.chain,
        });
    }
}
// We only want to perform a scheduled multicall if:
// - The request has calldata,
// - The request has a target address,
// - The target address is not already the aggregate3 signature,
// - The request has no other properties (`nonce`, `gas`, etc cannot be sent with a multicall).
function shouldPerformMulticall({ request }) {
    const { data, to, ...request_ } = request;
    if (!data)
        return false;
    if (data.startsWith(aggregate3Signature))
        return false;
    if (!to)
        return false;
    if (Object.values(request_).filter((x) => typeof x !== 'undefined').length > 0)
        return false;
    return true;
}
let requestOptionsId = 0;
const requestOptionsIds = new WeakMap();
function getRequestOptionsId(requestOptions) {
    if (!requestOptions)
        return 'default';
    const id = requestOptionsIds.get(requestOptions);
    if (id !== undefined)
        return id;
    const nextId = requestOptionsId++;
    requestOptionsIds.set(requestOptions, nextId);
    return nextId;
}
async function scheduleMulticall(client, args) {
    const { batchSize = 1024, deployless = false, wait = 0, } = typeof client.batch?.multicall === 'object' ? client.batch.multicall : {};
    const { blockHash, blockNumber, blockTag = client.experimental_blockTag ?? 'latest', requireCanonical, data, multicallAddress: multicallAddress_, requestOptions, rpcStateOverride, to, } = args;
    const multicallAddress = multicallAddress_ !== undefined
        ? multicallAddress_
        : getMulticallAddress(client, {
            blockNumber,
            deployless,
        });
    const block = formatBlockParameter({
        blockHash,
        blockNumber,
        blockTag,
        requireCanonical,
    });
    const blockId = typeof block === 'string' ? block : JSON.stringify(block);
    const stateOverrideKey = rpcStateOverride
        ? `.${JSON.stringify(rpcStateOverride)}`
        : '';
    const { schedule } = createBatchScheduler({
        id: `${client.uid}.${blockId}.${getRequestOptionsId(requestOptions)}${stateOverrideKey}`,
        wait,
        shouldSplitBatch(args) {
            const size = args.reduce((size, { data }) => size + (data.length - 2), 0);
            return size > batchSize * 2;
        },
        fn: async (requests) => {
            const calls = requests.map((request) => ({
                allowFailure: true,
                callData: request.data,
                target: request.to,
            }));
            const calldata = encodeFunctionData({
                abi: multicall3Abi,
                args: [calls],
                functionName: 'aggregate3',
            });
            const multicallRequest = {
                ...(multicallAddress === null
                    ? {
                        data: toDeploylessCallViaBytecodeData({
                            code: multicall3Bytecode,
                            data: calldata,
                        }),
                    }
                    : { to: multicallAddress, data: calldata }),
            };
            const data = await client.request({
                method: 'eth_call',
                params: rpcStateOverride
                    ? [multicallRequest, block, rpcStateOverride]
                    : [multicallRequest, block],
            }, requestOptions);
            return decodeFunctionResult({
                abi: multicall3Abi,
                args: [calls],
                functionName: 'aggregate3',
                data: data || '0x',
            });
        },
    });
    const [{ returnData, success }] = await schedule({ data, to });
    if (!success)
        throw new RawContractError({ data: returnData });
    if (returnData === '0x')
        return { data: undefined };
    return { data: returnData };
}
function getMulticallAddress(client, parameters) {
    const { blockNumber, deployless } = parameters;
    if (deployless)
        return null;
    if (client.chain)
        return getChainContractAddress({
            blockNumber,
            chain: client.chain,
            contract: 'multicall3',
        });
    throw new ClientChainNotConfiguredError();
}
function hasStateOverrideForAddress(rpcStateOverride, address) {
    if (!rpcStateOverride)
        return false;
    return Object.keys(rpcStateOverride).some((stateOverrideAddress) => isAddressEqual(stateOverrideAddress, address));
}
function toDeploylessCallViaBytecodeData(parameters) {
    const { code, data } = parameters;
    return encodeDeployData({
        abi: parseAbi(['constructor(bytes, bytes)']),
        bytecode: deploylessCallViaBytecodeBytecode,
        args: [code, data],
    });
}
function toDeploylessCallViaFactoryData(parameters) {
    const { data, factory, factoryData, to } = parameters;
    return encodeDeployData({
        abi: parseAbi(['constructor(address, bytes, address, bytes)']),
        bytecode: deploylessCallViaFactoryBytecode,
        args: [to, data, factory, factoryData],
    });
}
/** @internal */
export function getRevertErrorData(err) {
    if (!(err instanceof BaseError))
        return undefined;
    const error = err.walk();
    return typeof error?.data === 'object' ? error.data?.data : error.data;
}
//# sourceMappingURL=call.js.map