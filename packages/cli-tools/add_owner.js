const rc_common = require('./rc_common.js');

rc_common.checkArgumentLength(5, 'Usage: node add_owner.js <nonce> <gas_price_in_gwei> <owner>');

if (!rc_common.configParam('multisig_wallet')) {
    console.log('You cannot add an owner unless you have configured a multisig wallet in config.json');
    process.exit(1);
}
const wal = rc_common.walletContract();
const addr = rc_common.sanitizeAddress(process.argv[4]);

const params = rc_common.commonParams(process.argv);
console.log(params);
console.log('Generating a transaction to add the owner ' + addr + ' to the wallet ' + wal.address);

//console.log('GWEI_TO_WEI', rc_common.GWEI_TO_WEI);

const req = wal.addOwner.request(addr);
const data = req.params[0].data;

const stx = rc_common.serializedTX(params, wal, data);

rc_common.output(stx);

