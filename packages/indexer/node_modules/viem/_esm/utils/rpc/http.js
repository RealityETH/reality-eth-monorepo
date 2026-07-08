import { HttpRequestError, ResponseBodyTooLargeError, TimeoutError, } from '../../errors/request.js';
import { getAbortError, isAbortError, } from '../../errors/utils.js';
import { withTimeout, } from '../promise/withTimeout.js';
import { stringify } from '../stringify.js';
import { idCache } from './id.js';
const defaultMaxResponseBodySize = 10_485_760;
export function getHttpRpcClient(url_, options = {}) {
    const { url, headers: headers_url } = parseUrl(url_);
    return {
        async request(params) {
            const { body, fetchFn = options.fetchFn ?? fetch, maxResponseBodySize = options.maxResponseBodySize ??
                defaultMaxResponseBodySize, onRequest = options.onRequest, onResponse = options.onResponse, timeout = options.timeout ?? 10_000, } = params;
            const fetchOptions = {
                ...(options.fetchOptions ?? {}),
                ...(params.fetchOptions ?? {}),
            };
            const { headers, method, signal: signal_ } = fetchOptions;
            try {
                const response = await withTimeout(async ({ signal }) => {
                    const init = {
                        ...fetchOptions,
                        body: Array.isArray(body)
                            ? stringify(body.map((body) => ({
                                jsonrpc: '2.0',
                                id: body.id ?? idCache.take(),
                                ...body,
                            })))
                            : stringify({
                                jsonrpc: '2.0',
                                id: body.id ?? idCache.take(),
                                ...body,
                            }),
                        headers: {
                            ...headers_url,
                            'Content-Type': 'application/json',
                            ...headers,
                        },
                        method: method || 'POST',
                        signal: signal_ || (timeout > 0 ? signal : null),
                    };
                    const request = new Request(url, init);
                    const args = (await onRequest?.(request, init)) ?? { ...init, url };
                    const response = await fetchFn(args.url ?? url, args);
                    return response;
                }, {
                    errorInstance: new TimeoutError({ body, url }),
                    timeout,
                    signal: true,
                });
                if (onResponse)
                    await onResponse(response);
                let data;
                const responseBody = await readResponseBody(response, {
                    maxResponseBodySize,
                });
                if (response.headers.get('Content-Type')?.startsWith('application/json'))
                    data = JSON.parse(responseBody);
                else {
                    data = responseBody;
                    try {
                        data = JSON.parse(data || '{}');
                    }
                    catch (err) {
                        if (response.ok)
                            throw err;
                        data = { error: data };
                    }
                }
                if (!response.ok) {
                    // If the response body contains a valid JSON-RPC error, return it
                    // so it flows through the normal RPC error handling pipeline.
                    if (typeof data.error?.code === 'number' &&
                        typeof data.error?.message === 'string')
                        return data;
                    throw new HttpRequestError({
                        body,
                        details: stringify(data.error) || response.statusText,
                        headers: response.headers,
                        status: response.status,
                        url,
                    });
                }
                return data;
            }
            catch (err) {
                if (signal_?.aborted)
                    throw getAbortError(signal_);
                if (isAbortError(err))
                    throw err;
                if (err instanceof HttpRequestError)
                    throw err;
                if (err instanceof ResponseBodyTooLargeError)
                    throw err;
                if (err instanceof TimeoutError)
                    throw err;
                throw new HttpRequestError({
                    body,
                    cause: err,
                    url,
                });
            }
        },
    };
}
async function readResponseBody(response, { maxResponseBodySize }) {
    if (maxResponseBodySize === false)
        return response.text();
    const contentLength = response.headers.get('Content-Length');
    if (contentLength) {
        const size = Number(contentLength);
        if (size > maxResponseBodySize)
            throw new ResponseBodyTooLargeError({
                maxSize: maxResponseBodySize,
                size,
            });
    }
    if (!response.body) {
        const body = await response.text();
        const size = new TextEncoder().encode(body).length;
        if (size > maxResponseBodySize)
            throw new ResponseBodyTooLargeError({
                maxSize: maxResponseBodySize,
                size,
            });
        return body;
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let body = '';
    let size = 0;
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            size += value.byteLength;
            if (size > maxResponseBodySize) {
                await reader.cancel();
                throw new ResponseBodyTooLargeError({
                    maxSize: maxResponseBodySize,
                    size,
                });
            }
            body += decoder.decode(value, { stream: true });
        }
        body += decoder.decode();
        return body;
    }
    finally {
        reader.releaseLock();
    }
}
/** @internal */
export function parseUrl(url_) {
    try {
        const url = new URL(url_);
        const result = (() => {
            // Handle Basic authentication credentials
            if (url.username) {
                const credentials = `${decodeURIComponent(url.username)}:${decodeURIComponent(url.password)}`;
                url.username = '';
                url.password = '';
                return {
                    url: url.toString(),
                    headers: { Authorization: `Basic ${btoa(credentials)}` },
                };
            }
            return;
        })();
        return { url: url.toString(), ...result };
    }
    catch {
        return { url: url_ };
    }
}
//# sourceMappingURL=http.js.map