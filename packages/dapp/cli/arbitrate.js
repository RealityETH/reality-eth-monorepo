
const rc_common = require('./rc_common.js');
const arbitration_requests = require(rc_common.configParam('arbitration_requests_file'));

const arb = rc_common.arbContract();
const rc = rc_common.rcContract();
const rc_address = rc.address;

rc_common.checkArgumentLength(5, 'Usage: node arbitrate.js <nonce> <gas_price_in_gwei> <entry_id>');

const params = rc_common.commonParams(process.argv);
console.log(params);

const item = parseInt(process.argv[4]);
if (item > arbitration_requests.length) throw 'Item ID higher than length of request list';

const req_item = arbitration_requests[item];
const question_id = rc_common.sanitizeBytes32(req_item[0], 'question_id', false);
const answer_data = rc_common.sanitizeBytes32(req_item[1], 'answer_data', true);
const answerer_address = rc_common.sanitizeAddress(req_item[2]);

console.log('Generating a transaction to set question_id ' + req_item[0]+ ' to ' + req_item[1] + ' and answerer to ' + req_item[2]);

const req = arb.submitAnswerByArbitrator.request(req_item[0], req_item[1], req_item[2]);
const data = req.params[0].data;

const stx = rc_common.serializedTX(params, arb, data);

rc_common.output(stx);

