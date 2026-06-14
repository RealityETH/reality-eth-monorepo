"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ccipReadTunnel = ccipReadTunnel;
const abis_js_1 = require("../constants/abis.js");
const solidity_js_1 = require("../constants/solidity.js");
const request_js_1 = require("../errors/request.js");
const decodeErrorResult_js_1 = require("./abi/decodeErrorResult.js");
const decodeFunctionResult_js_1 = require("./abi/decodeFunctionResult.js");
const encodeFunctionData_js_1 = require("./abi/encodeFunctionData.js");
const ccip_js_1 = require("./ccip.js");
const localBatchGatewayRequest_js_1 = require("./ens/localBatchGatewayRequest.js");
function ccipReadTunnel({ batchGateways, ccipRequest = ccip_js_1.ccipRequest, }) {
    return {
        async request({ data, sender, urls }) {
            if (urls.includes(localBatchGatewayRequest_js_1.localBatchGatewayUrl)) {
                return ccipRequest({
                    data,
                    sender,
                    urls: batchGateways,
                });
            }
            else {
                const [failures, responses] = (0, decodeFunctionResult_js_1.decodeFunctionResult)({
                    abi: abis_js_1.batchGatewayAbi,
                    functionName: 'query',
                    data: await ccipRequest({
                        data: (0, encodeFunctionData_js_1.encodeFunctionData)({
                            abi: abis_js_1.batchGatewayAbi,
                            functionName: 'query',
                            args: [[{ sender, data, urls }]],
                        }),
                        sender,
                        urls: batchGateways,
                    }),
                });
                if (failures[0]) {
                    let error;
                    try {
                        const res = (0, decodeErrorResult_js_1.decodeErrorResult)({
                            abi: [...abis_js_1.batchGatewayAbi, solidity_js_1.solidityError],
                            data: responses[0],
                        });
                        if (res.errorName === 'HttpError') {
                            error = new request_js_1.HttpRequestError({
                                body: { message: res.args[1] },
                                status: res.args[0],
                                url: urls.join(' | '),
                            });
                        }
                        else {
                            const message = res.args[0];
                            if (message) {
                                error = new Error(message);
                            }
                        }
                    }
                    catch { }
                    throw error ?? new Error('An unknown error occurred.');
                }
                return responses[0];
            }
        },
    };
}
//# sourceMappingURL=ccipTunnel.js.map