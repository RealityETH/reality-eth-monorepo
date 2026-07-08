"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approve = approve;
const abis_js_1 = require("../../constants/abis.js");
const parseEventLogs_js_1 = require("../../utils/abi/parseEventLogs.js");
const estimateContractGas_js_1 = require("../public/estimateContractGas.js");
const simulateContract_js_1 = require("../public/simulateContract.js");
const writeContract_js_1 = require("../wallet/writeContract.js");
const internal_js_1 = require("./internal.js");
async function approve(client, parameters) {
    return approve.inner(writeContract_js_1.writeContract, client, parameters);
}
(function (approve) {
    async function inner(action, client, parameters) {
        return (await action(client, {
            ...parameters,
            ...approve.call(client, parameters),
        }));
    }
    approve.inner = inner;
    function call(client, parameters) {
        return (0, internal_js_1.defineCall)(getCall(client, parameters));
    }
    approve.call = call;
    async function estimateGas(client, parameters) {
        return (0, estimateContractGas_js_1.estimateContractGas)(client, {
            ...(0, internal_js_1.pickWriteParameters)(parameters),
            ...approve.call(client, parameters),
        });
    }
    approve.estimateGas = estimateGas;
    async function simulate(client, parameters) {
        return (0, simulateContract_js_1.simulateContract)(client, {
            ...(0, internal_js_1.pickWriteParameters)(parameters),
            ...approve.call(client, parameters),
        });
    }
    approve.simulate = simulate;
    function extractEvent(logs) {
        const [log] = (0, parseEventLogs_js_1.parseEventLogs)({
            abi: abis_js_1.erc20Abi,
            logs,
            eventName: 'Approval',
            strict: true,
        });
        if (!log)
            throw new Error('`Approval` event not found.');
        return log;
    }
    approve.extractEvent = extractEvent;
})(approve || (exports.approve = approve = {}));
function getCall(client, parameters) {
    const { amount, spender, token } = parameters;
    const { address, decimals } = (0, internal_js_1.resolveToken)(client, { token });
    return {
        abi: abis_js_1.erc20Abi,
        address,
        args: [spender, (0, internal_js_1.toBaseUnits)(amount, decimals)],
        functionName: 'approve',
    };
}
//# sourceMappingURL=approve.js.map