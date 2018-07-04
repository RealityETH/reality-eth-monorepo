const rc_common = require('./rc_common.js');

rc_common.checkArgumentLength(6, 'Usage: node send_value.js <nonce> <gas_price_in_gwei> <address> <amount_in_gwei>');

const addr = rc_common.sanitizeAddress(process.argv[4]);
const val = parseInt(process.argv[5]);
if (val == 0) throw 'Amount should be greater than 0';

const params = rc_common.commonParams(process.argv);
console.log(params);
console.log('Generating a transaction to send ' + val + ' gwei ' + (val / rc_common.GWEI_TO_WEI) + 'ETH):');

const valwei = val * rc_common.GWEI_TO_WEI;

const stx = rc_common.serializedValueTX(params, addr, valwei);

rc_common.output(stx);

