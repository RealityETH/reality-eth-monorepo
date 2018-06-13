const rc_common = require('./rc_common.js');

rc_common.checkArgumentLength(5, 'Usage: node transfer_ownership.js <nonce> <gas_price_in_gwei> <address>');

const addr = rc_common.sanitizeAddress(process.argv[4]);

const params = rc_common.commonParams(process.argv);
console.log(params);
console.log('Generating a transaction to transfer ownership of the arbitrator contract to ' + addr);

const arb = rc_common.arbContract();
const req = arb.transferOwnership.request(addr);
const data = req.params[0].data;

const stx = rc_common.serializedTX(params, arb, data);

rc_common.output(stx);

