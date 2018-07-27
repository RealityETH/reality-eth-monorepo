const rc_common = require('./rc_common.js');

rc_common.checkArgumentLength(4, 'Usage: node set_realitycheck.js <nonce> <gas_price_in_gwei>');

const rc = rc_common.rcContract();
const addr = rc_common.sanitizeAddress(rc.address);

const params = rc_common.commonParams(process.argv);
console.log(params);
console.log('Generating a transaction to set the address ' + addr);

//console.log('GWEI_TO_WEI', rc_common.GWEI_TO_WEI);

const arb = rc_common.arbContract();
const req = arb.setRealityCheck.request(addr);
const data = req.params[0].data;

const stx = rc_common.serializedTX(params, arb, data);

rc_common.output(stx);
