const rc_common = require('./rc_common.js');

rc_common.checkArgumentLength(5, 'Usage: node confirm_transaction.js <nonce> <gas_price_in_gwei> <id>');

if (!rc_common.configParam('multisig_wallet')) {
    console.log('You cannot confirm a transaction unless you have configured a multisig wallet in config.json');
    process.exit(1);
}
const wal = rc_common.walletContract();
const id = parseInt(process.argv[4]);

const params = rc_common.commonParams(process.argv);
console.log(params);
console.log('Generating a transaction to approve entry ' + id + ' of the wallet ' + wal.address);

//console.log('GWEI_TO_WEI', rc_common.GWEI_TO_WEI);

const req = wal.confirmTransaction.request(id);
const data = req.params[0].data;

const stx = rc_common.serializedTX(params, wal, data, 200000, true);

rc_common.output(stx);

