const rc_common = require('./rc_common.js');

rc_common.checkArgumentLength(4, 'Usage: node call_withdraw.js <nonce> <gas_price_in_gwei>');

const params = rc_common.commonParams(process.argv);

const rc = rc_common.rcContract();
const arb = rc_common.arbContract();

console.log(params);
console.log('Generating a transaction to withdraw funds from the reality check contract at ' + rc.address + ' to the arbitrator contract ' + arb.address);

const req = arb.callWithdraw.request();
const data = req.params[0].data;

const stx = rc_common.serializedTX(params, arb, data);

rc_common.output(stx);

