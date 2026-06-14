"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.call = call;
exports.getRevertErrorData = getRevertErrorData;
const abitype_1 = require("abitype");
const BlockOverrides = require("ox/BlockOverrides");
const parseAccount_js_1 = require("../../accounts/utils/parseAccount.js");
const abis_js_1 = require("../../constants/abis.js");
const contract_js_1 = require("../../constants/contract.js");
const contracts_js_1 = require("../../constants/contracts.js");
const base_js_1 = require("../../errors/base.js");
const chain_js_1 = require("../../errors/chain.js");
const contract_js_2 = require("../../errors/contract.js");
const utils_js_1 = require("../../errors/utils.js");
const decodeFunctionResult_js_1 = require("../../utils/abi/decodeFunctionResult.js");
const encodeDeployData_js_1 = require("../../utils/abi/encodeDeployData.js");
const encodeFunctionData_js_1 = require("../../utils/abi/encodeFunctionData.js");
const isAddressEqual_js_1 = require("../../utils/address/isAddressEqual.js");
const formatBlockParameter_js_1 = require("../../utils/block/formatBlockParameter.js");
const getChainContractAddress_js_1 = require("../../utils/chain/getChainContractAddress.js");
const getCallError_js_1 = require("../../utils/errors/getCallError.js");
const extract_js_1 = require("../../utils/formatters/extract.js");
const transactionRequest_js_1 = require("../../utils/formatters/transactionRequest.js");
const createBatchScheduler_js_1 = require("../../utils/promise/createBatchScheduler.js");
const stateOverride_js_1 = require("../../utils/stateOverride.js");
const assertRequest_js_1 = require("../../utils/transaction/assertRequest.js");
async function call(client, args) {
    const { account: account_ = client.account, authorizationList, batch = Boolean(client.batch?.multicall), blockHash, blockNumber, blockTag = client.experimental_blockTag ?? 'latest', requireCanonical, accessList, blobs, blockOverrides, code, data: data_, factory, factoryData, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, requestOptions, to, value, stateOverride, ...rest } = args;
    const account = account_ ? (0, parseAccount_js_1.parseAccount)(account_) : undefined;
    if (code && (factory || factoryData))
        throw new base_js_1.BaseError('Cannot provide both `code` & `factory`/`factoryData` as parameters.');
    if (code && to)
        throw new base_js_1.BaseError('Cannot provide both `code` & `to` as parameters.');
    const deploylessCallViaBytecode = code && data_;
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
        (0, assertRequest_js_1.assertRequest)(args);
        const block = (0, formatBlockParameter_js_1.formatBlockParameter)({
            blockHash,
            blockNumber,
            blockTag,
            requireCanonical,
        });
        const rpcBlockOverrides = blockOverrides
            ? BlockOverrides.toRpc(blockOverrides)
            : undefined;
        const rpcStateOverride = (0, stateOverride_js_1.serializeStateOverride)(stateOverride);
        const chainFormat = client.chain?.formatters?.transactionRequest?.format;
        const format = chainFormat || transactionRequest_js_1.formatTransactionRequest;
        const request = format({
            ...(0, extract_js_1.extract)(rest, { format: chainFormat }),
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
                if (!(err instanceof chain_js_1.ClientChainNotConfiguredError) &&
                    !(err instanceof chain_js_1.ChainDoesNotSupportContract))
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
            throw (0, utils_js_1.getAbortError)(requestOptions.signal);
        if ((0, utils_js_1.isAbortError)(err))
            throw err;
        const data = getRevertErrorData(err);
        const { offchainLookup, offchainLookupSignature } = await Promise.resolve().then(() => require('../../utils/ccip.js'));
        if (client.ccipRead !== false &&
            data?.slice(0, 10) === offchainLookupSignature &&
            to)
            return {
                data: await offchainLookup(client, { data, requestOptions, to }),
            };
        if (deploylessCall && data?.slice(0, 10) === '0x101bb98d')
            throw new contract_js_2.CounterfactualDeploymentFailedError({ factory });
        throw (0, getCallError_js_1.getCallError)(err, {
            ...args,
            account,
            chain: client.chain,
        });
    }
}
function shouldPerformMulticall({ request }) {
    const { data, to, ...request_ } = request;
    if (!data)
        return false;
    if (data.startsWith(contract_js_1.aggregate3Signature))
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
    const block = (0, formatBlockParameter_js_1.formatBlockParameter)({
        blockHash,
        blockNumber,
        blockTag,
        requireCanonical,
    });
    const blockId = typeof block === 'string' ? block : JSON.stringify(block);
    const stateOverrideKey = rpcStateOverride
        ? `.${JSON.stringify(rpcStateOverride)}`
        : '';
    const { schedule } = (0, createBatchScheduler_js_1.createBatchScheduler)({
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
            const calldata = (0, encodeFunctionData_js_1.encodeFunctionData)({
                abi: abis_js_1.multicall3Abi,
                args: [calls],
                functionName: 'aggregate3',
            });
            const multicallRequest = {
                ...(multicallAddress === null
                    ? {
                        data: toDeploylessCallViaBytecodeData({
                            code: contracts_js_1.multicall3Bytecode,
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
            return (0, decodeFunctionResult_js_1.decodeFunctionResult)({
                abi: abis_js_1.multicall3Abi,
                args: [calls],
                functionName: 'aggregate3',
                data: data || '0x',
            });
        },
    });
    const [{ returnData, success }] = await schedule({ data, to });
    if (!success)
        throw new contract_js_2.RawContractError({ data: returnData });
    if (returnData === '0x')
        return { data: undefined };
    return { data: returnData };
}
function getMulticallAddress(client, parameters) {
    const { blockNumber, deployless } = parameters;
    if (deployless)
        return null;
    if (client.chain)
        return (0, getChainContractAddress_js_1.getChainContractAddress)({
            blockNumber,
            chain: client.chain,
            contract: 'multicall3',
        });
    throw new chain_js_1.ClientChainNotConfiguredError();
}
function hasStateOverrideForAddress(rpcStateOverride, address) {
    if (!rpcStateOverride)
        return false;
    return Object.keys(rpcStateOverride).some((stateOverrideAddress) => (0, isAddressEqual_js_1.isAddressEqual)(stateOverrideAddress, address));
}
function toDeploylessCallViaBytecodeData(parameters) {
    const { code, data } = parameters;
    return (0, encodeDeployData_js_1.encodeDeployData)({
        abi: (0, abitype_1.parseAbi)(['constructor(bytes, bytes)']),
        bytecode: contracts_js_1.deploylessCallViaBytecodeBytecode,
        args: [code, data],
    });
}
function toDeploylessCallViaFactoryData(parameters) {
    const { data, factory, factoryData, to } = parameters;
    return (0, encodeDeployData_js_1.encodeDeployData)({
        abi: (0, abitype_1.parseAbi)(['constructor(address, bytes, address, bytes)']),
        bytecode: contracts_js_1.deploylessCallViaFactoryBytecode,
        args: [to, data, factory, factoryData],
    });
}
function getRevertErrorData(err) {
    if (!(err instanceof base_js_1.BaseError))
        return undefined;
    const error = err.walk();
    return typeof error?.data === 'object' ? error.data?.data : error.data;
}
//# sourceMappingURL=call.js.map