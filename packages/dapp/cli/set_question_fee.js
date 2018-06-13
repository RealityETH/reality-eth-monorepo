const rc_common = require('./rc_common.js');

rc_common.checkArgumentLength(5, 'Usage: node set_question_fee.js <nonce> <gas_price_in_gwei> <fee_in_gwei>');

const fee = parseInt(process.argv[4]);
//if (fee == 0) throw 'Fee should be greater than 0';

const params = rc_common.commonParams(process.argv);
console.log(params);
console.log('Generating a transaction to set the question fee to ' + fee + ' gwei:');

const rc = rc_common.rcContract();
const arb = rc_common.arbContract();
const req = arb.setQuestionFee.request(fee * rc_common.GWEI_TO_WEI);
const data = req.params[0].data;

const stx = rc_common.serializedTX(params, arb, data);

rc_common.output(stx);
