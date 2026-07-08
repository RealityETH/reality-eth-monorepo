import { call } from '../actions/public/call.js';
import { OffchainLookupError, OffchainLookupResponseMalformedError, OffchainLookupSenderMismatchError, } from '../errors/ccip.js';
import { HttpRequestError, } from '../errors/request.js';
import { getAbortError, isAbortError } from '../errors/utils.js';
import { decodeErrorResult } from './abi/decodeErrorResult.js';
import { encodeAbiParameters } from './abi/encodeAbiParameters.js';
import { isAddressEqual } from './address/isAddressEqual.js';
import { concat } from './data/concat.js';
import { isHex } from './data/isHex.js';
import { localBatchGatewayRequest, localBatchGatewayUrl, } from './ens/localBatchGatewayRequest.js';
import { stringify } from './stringify.js';
export const offchainLookupSignature = '0x556f1830';
export const offchainLookupAbiItem = {
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
export async function offchainLookup(client, { blockNumber, blockTag, data, requestOptions, to, }) {
    const { args } = decodeErrorResult({
        data,
        abi: [offchainLookupAbiItem],
    });
    const [sender, urls, callData, callbackSelector, extraData] = args;
    const { ccipRead } = client;
    const ccipRequest_ = ccipRead && typeof ccipRead?.request === 'function'
        ? ccipRead.request
        : ccipRequest;
    try {
        if (!isAddressEqual(to, sender))
            throw new OffchainLookupSenderMismatchError({ sender, to });
        const result = urls.includes(localBatchGatewayUrl)
            ? await localBatchGatewayRequest({
                data: callData,
                ccipRequest: (parameters) => ccipRequest_({ ...parameters, requestOptions }),
            })
            : await ccipRequest_({ data: callData, requestOptions, sender, urls });
        const { data: data_ } = await call(client, {
            blockNumber,
            blockTag,
            data: concat([
                callbackSelector,
                encodeAbiParameters([{ type: 'bytes' }, { type: 'bytes' }], [result, extraData]),
            ]),
            requestOptions,
            to,
        });
        return data_;
    }
    catch (err) {
        if (requestOptions?.signal?.aborted)
            throw getAbortError(requestOptions.signal);
        if (isAbortError(err))
            throw err;
        throw new OffchainLookupError({
            callbackSelector,
            cause: err,
            data,
            extraData,
            sender,
            urls,
        });
    }
}
export async function ccipRequest({ data, requestOptions, sender, urls, }) {
    let error = new Error('An unknown error occurred.');
    for (let i = 0; i < urls.length; i++) {
        if (requestOptions?.signal?.aborted)
            throw getAbortError(requestOptions.signal);
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
                error = new HttpRequestError({
                    body,
                    details: result?.error
                        ? stringify(result.error)
                        : response.statusText,
                    headers: response.headers,
                    status: response.status,
                    url,
                });
                continue;
            }
            if (!isHex(result)) {
                error = new OffchainLookupResponseMalformedError({
                    result,
                    url,
                });
                continue;
            }
            return result;
        }
        catch (err) {
            if (requestOptions?.signal?.aborted)
                throw getAbortError(requestOptions.signal);
            if (isAbortError(err))
                throw err;
            error = new HttpRequestError({
                body,
                details: err.message,
                url,
            });
        }
    }
    throw error;
}
//# sourceMappingURL=ccip.js.map