import { NumberUtil, ParseUtil } from '@reown/appkit-common';
import { CoreHelperUtil, FetchUtil, OptionsController, getNativeTokenAddress } from '@reown/appkit-controllers';
import { HelpersUtil } from '@reown/appkit-utils';
import { API_URL } from './ConstantsUtil.js';
import { getDirectTransferQuote } from './PaymentUtil.js';
const api = new FetchUtil({ baseUrl: CoreHelperUtil.getApiUrl(), clientId: null });
class JsonRpcError extends Error {
}
export function getApiUrl() {
    const projectId = OptionsController.getSnapshot().projectId;
    return `${API_URL}?projectId=${projectId}`;
}
function getSdkProperties() {
    const { projectId, sdkType, sdkVersion } = OptionsController.state;
    return {
        projectId,
        st: sdkType || 'appkit',
        sv: sdkVersion || 'html-wagmi-4.2.2'
    };
}
async function sendRequest(method, params) {
    const url = getApiUrl();
    const { sdkType: st, sdkVersion: sv, projectId } = OptionsController.getSnapshot();
    const requestBody = {
        jsonrpc: '2.0',
        id: 1,
        method,
        params: {
            ...(params || {}),
            st,
            sv,
            projectId
        }
    };
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
    });
    const json = await response.json();
    if (json.error) {
        throw new JsonRpcError(json.error.message);
    }
    return json;
}
export async function getExchanges(params) {
    const response = await sendRequest('reown_getExchanges', params);
    return response.result;
}
export async function getPayUrl(params) {
    const response = await sendRequest('reown_getExchangePayUrl', params);
    return response.result;
}
export async function getBuyStatus(params) {
    const response = await sendRequest('reown_getExchangeBuyStatus', params);
    return response.result;
}
export async function getTransfersQuote(params) {
    const amount = NumberUtil.bigNumber(params.amount)
        .times(10 ** params.toToken.metadata.decimals)
        .toString();
    const { chainId: originChainId, chainNamespace: originChainNamespace } = ParseUtil.parseCaipNetworkId(params.sourceToken.network);
    const { chainId: destinationChainId, chainNamespace: destinationChainNamespace } = ParseUtil.parseCaipNetworkId(params.toToken.network);
    const originCurrency = params.sourceToken.asset === 'native'
        ? getNativeTokenAddress(originChainNamespace)
        : params.sourceToken.asset;
    const destinationCurrency = params.toToken.asset === 'native'
        ? getNativeTokenAddress(destinationChainNamespace)
        : params.toToken.asset;
    const response = await api.post({
        path: '/appkit/v1/transfers/quote',
        body: {
            user: params.address,
            originChainId: originChainId.toString(),
            originCurrency,
            destinationChainId: destinationChainId.toString(),
            destinationCurrency,
            recipient: params.recipient,
            amount
        },
        params: getSdkProperties()
    });
    return response;
}
export async function getQuote(params) {
    const isSameChain = HelpersUtil.isLowerCaseMatch(params.sourceToken.network, params.toToken.network);
    const isSameAsset = HelpersUtil.isLowerCaseMatch(params.sourceToken.asset, params.toToken.asset);
    if (isSameChain && isSameAsset) {
        return getDirectTransferQuote(params);
    }
    return getTransfersQuote(params);
}
export async function getQuoteStatus(params) {
    const response = await api.get({
        path: '/appkit/v1/transfers/status',
        params: {
            requestId: params.requestId,
            ...getSdkProperties()
        }
    });
    return response;
}
export async function getAssetsForExchange(exchangeId) {
    const response = await api.get({
        path: `/appkit/v1/transfers/assets/exchanges/${exchangeId}`,
        params: getSdkProperties()
    });
    return response;
}
//# sourceMappingURL=ApiUtil.js.map