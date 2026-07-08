"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transfer = transfer;
const abis_js_1 = require("../../constants/abis.js");
const parseEventLogs_js_1 = require("../../utils/abi/parseEventLogs.js");
const estimateContractGas_js_1 = require("../public/estimateContractGas.js");
const simulateContract_js_1 = require("../public/simulateContract.js");
const writeContract_js_1 = require("../wallet/writeContract.js");
const internal_js_1 = require("./internal.js");
async function transfer(client, parameters) {
    return transfer.inner(writeContract_js_1.writeContract, client, parameters);
}
(function (transfer) {
    async function inner(action, client, parameters) {
        return (await action(client, {
            ...parameters,
            ...transfer.call(client, parameters),
        }));
    }
    transfer.inner = inner;
    function call(client, parameters) {
        return (0, internal_js_1.defineCall)(getCall(client, parameters));
    }
    transfer.call = call;
    async function estimateGas(client, parameters) {
        return (0, estimateContractGas_js_1.estimateContractGas)(client, {
            ...(0, internal_js_1.pickWriteParameters)(parameters),
            ...transfer.call(client, parameters),
        });
    }
    transfer.estimateGas = estimateGas;
    async function simulate(client, parameters) {
        return (0, simulateContract_js_1.simulateContract)(client, {
            ...(0, internal_js_1.pickWriteParameters)(parameters),
            ...transfer.call(client, parameters),
        });
    }
    transfer.simulate = simulate;
    function extractEvent(logs) {
        const [log] = (0, parseEventLogs_js_1.parseEventLogs)({
            abi: abis_js_1.erc20Abi,
            logs,
            eventName: 'Transfer',
            strict: true,
        });
        if (!log)
            throw new Error('`Transfer` event not found.');
        return log;
    }
    transfer.extractEvent = extractEvent;
})(transfer || (exports.transfer = transfer = {}));
function getCall(client, parameters) {
    const { amount, from, to, token } = parameters;
    const { address, decimals } = (0, internal_js_1.resolveToken)(client, { token });
    const value = (0, internal_js_1.toBaseUnits)(amount, decimals);
    if (from)
        return {
            abi: abis_js_1.erc20Abi,
            address,
            args: [from, to, value],
            functionName: 'transferFrom',
        };
    return {
        abi: abis_js_1.erc20Abi,
        address,
        args: [to, value],
        functionName: 'transfer',
    };
}
//# sourceMappingURL=transfer.js.map