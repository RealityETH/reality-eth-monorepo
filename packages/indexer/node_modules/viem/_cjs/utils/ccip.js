"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offchainLookupAbiItem = exports.offchainLookupSignature = void 0;
exports.offchainLookup = offchainLookup;
exports.ccipRequest = ccipRequest;
const call_js_1 = require("../actions/public/call.js");
const ccip_js_1 = require("../errors/ccip.js");
const request_js_1 = require("../errors/request.js");
const utils_js_1 = require("../errors/utils.js");
const decodeErrorResult_js_1 = require("./abi/decodeErrorResult.js");
const encodeAbiParameters_js_1 = require("./abi/encodeAbiParameters.js");
const isAddressEqual_js_1 = require("./address/isAddressEqual.js");
const concat_js_1 = require("./data/concat.js");
const isHex_js_1 = require("./data/isHex.js");
const localBatchGatewayRequest_js_1 = require("./ens/localBatchGatewayRequest.js");
const stringify_js_1 = require("./stringify.js");
exports.offchainLookupSignature = '0x556f1830';
exports.offchainLookupAbiItem = {
    name: 'OffchainLookup',
    type: 'error',
    inputs: [
        {
            name: 'sender',
            type: 'address',
        },
        {
            name: 'urls',
            type: 'string[]',
        },
        {
            name: 'callData',
            type: 'bytes',
        },
        {
            name: 'callbackFunction',
            type: 'bytes4',
        },
        {
            name: 'extraData',
            type: 'bytes',
        },
    ],
};
async function offchainLookup(client, { blockNumber, blockTag, data, requestOptions, to, }) {
    const { args } = (0, decodeErrorResult_js_1.decodeErrorResult)({
        data,
        abi: [exports.offchainLookupAbiItem],
    });
    const [sender, urls, callData, callbackSelector, extraData] = args;
    const { ccipRead } = client;
    const ccipRequest_ = ccipRead && typeof ccipRead?.request === 'function'
        ? ccipRead.request
        : ccipRequest;
    try {
        if (!(0, isAddressEqual_js_1.isAddressEqual)(to, sender))
            throw new ccip_js_1.OffchainLookupSenderMismatchError({ sender, to });
        const result = urls.includes(localBatchGatewayRequest_js_1.localBatchGatewayUrl)
            ? await (0, localBatchGatewayRequest_js_1.localBatchGatewayRequest)({
                data: callData,
                ccipRequest: (parameters) => ccipRequest_({ ...parameters, requestOptions }),
            })
            : await ccipRequest_({ data: callData, requestOptions, sender, urls });
        const { data: data_ } = await (0, call_js_1.call)(client, {
            blockNumber,
            blockTag,
            data: (0, concat_js_1.concat)([
                callbackSelector,
                (0, encodeAbiParameters_js_1.encodeAbiParameters)([{ type: 'bytes' }, { type: 'bytes' }], [result, extraData]),
            ]),
            requestOptions,
            to,
        });
        return data_;
    }
    catch (err) {
        if (requestOptions?.signal?.aborted)
            throw (0, utils_js_1.getAbortError)(requestOptions.signal);
        if ((0, utils_js_1.isAbortError)(err))
            throw err;
        throw new ccip_js_1.OffchainLookupError({
            callbackSelector,
            cause: err,
            data,
            extraData,
            sender,
            urls,
        });
    }
}
async function ccipRequest({ data, requestOptions, sender, urls, }) {
    let error = new Error('An unknown error occurred.');
    for (let i = 0; i < urls.length; i++) {
        if (requestOptions?.signal?.aborted)
            throw (0, utils_js_1.getAbortError)(requestOptions.signal);
        const url = urls[i];
        const method = url.includes('{data}') ? 'GET' : 'POST';
        const body = method === 'POST' ? { data, sender } : undefined;
        const headers = method === 'POST' ? { 'Content-Type': 'application/json' } : {};
        try {
            const response = await fetch(url.replace('{sender}', sender.toLowerCase()).replace('{data}', data), {
                body: JSON.stringify(body),
                headers,
                method,
                ...(requestOptions?.signal ? { signal: requestOptions.signal } : {}),
            });
            let result;
            if (response.headers.get('Content-Type')?.startsWith('application/json')) {
                result = (await response.json()).data;
            }
            else {
                result = (await response.text());
            }
            if (!response.ok) {
                error = new request_js_1.HttpRequestError({
                    body,
                    details: result?.error
                        ? (0, stringify_js_1.stringify)(result.error)
                        : response.statusText,
                    headers: response.headers,
                    status: response.status,
                    url,
                });
                continue;
            }
            if (!(0, isHex_js_1.isHex)(result)) {
                error = new ccip_js_1.OffchainLookupResponseMalformedError({
                    result,
                    url,
                });
                continue;
            }
            return result;
        }
        catch (err) {
            if (requestOptions?.signal?.aborted)
                throw (0, utils_js_1.getAbortError)(requestOptions.signal);
            if ((0, utils_js_1.isAbortError)(err))
                throw err;
            error = new request_js_1.HttpRequestError({
                body,
                details: err.message,
                url,
            });
        }
    }
    throw error;
}
//# sourceMappingURL=ccip.js.map