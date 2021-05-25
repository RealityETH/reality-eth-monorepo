const rc_common = require('./rc_common.js');

rc_common.checkArgumentLength(4, 'Usage: node withdraw.js <nonce> <gas_price_in_gwei>');

const params = rc_common.commonParams(process.argv);
console.log(params);
console.log('Generating a transaction to withdraw funds from the arbitrator contract to the splitter wallet');

const wal = rc_common.splitterContract();
const req = wal.withdraw.request();
const data = req.params[0].data;

const stx = rc_common.serializedTX(params, wal, data, 60000, true);

rc_common.output(stx);
