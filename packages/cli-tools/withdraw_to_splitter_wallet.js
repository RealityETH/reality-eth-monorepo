const rc_common = require('./rc_common.js');

rc_common.checkArgumentLength(4, 'Usage: node withdraw.js <nonce> <gas_price_in_gwei>');

const params = rc_common.commonParams(process.argv);
console.log(params);
console.log('Generating a transaction to withdraw funds from the arbitrator contract to the splitter wallet');

const arb = rc_common.arbContract();
const req = arb.withdrawToRegisteredWallet.request();
const data = req.params[0].data;

const stx = rc_common.serializedTX(params, arb, data, 60000, true);

rc_common.output(stx);
