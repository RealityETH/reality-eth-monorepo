const createKeccakHash = require('keccak')
const secp256k1 = require('secp256k1')

const rc_common = require('./rc_common.js');

const privateKey = rc_common.loadKey();
let pubKey = secp256k1.publicKeyCreate(privateKey, false).slice(1);
let address = createKeccakHash('keccak256').update(pubKey).digest().slice(-20).toString('hex');

rc_common.output(address);
