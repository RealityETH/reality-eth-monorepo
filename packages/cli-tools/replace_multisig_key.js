const rc_common = require('./rc_common.js');

rc_common.checkArgumentLength(6, 'Usage: node replace_multisig_key.js <nonce> <gas_price_in_gwei> <old_address> <new_address>');

const old_addr = rc_common.sanitizeAddress(process.argv[4]);
const new_addr = rc_common.sanitizeAddress(process.argv[5]);

const params = rc_common.commonParams(process.argv);
console.log(params);
console.log('Generating a transaction to transfer ownership of the wallet key contract from the current ' + old_addr + ' to ' + new_addr);

const wall = rc_common.walletContract();
const req = wall.replaceOwner.request(old_addr, new_addr);
const data = req.params[0].data;

const stx = rc_common.serializedTX(params, wall, data);

rc_common.output(stx);

