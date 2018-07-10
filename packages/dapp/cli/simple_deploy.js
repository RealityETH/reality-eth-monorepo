/*
Makes a transaction to redeploys a single contract. 
Send it to the network manually with https://etherscan.io/pushTx and get the resulting contract address from etherscan.

Assumes you have already deployed to testnet, so you already have a working json contract definition.

Since our migrations are simple, this is simpler than doing a truffle migrate, which has various on-chain tracking clevers that make things painful on a congested network.
*/

const config = require('./config.json');
const rc_common = require('./rc_common.js');

rc_common.checkArgumentLength(6, 'Usage: node simple_deploy.js <nonce> <gas_price_in_gwei> <contract_name> <gas_limit>');

const params = rc_common.commonParams(process.argv);
console.log(params);

const contract_name = process.argv[4];
const gas_limit = parseInt(process.argv[5]);

console.log('Generating a transaction to deploy a ' + contract_name + ' contract');

const contract_json = require(config.contract_dir + '/'+ contract_name + '.json');

const bytecode = contract_json.bytecode

const stx = rc_common.serializedTX(params, {address:null}, bytecode, gas_limit);
console.log('0x' + stx.toString('hex'));                                                           
