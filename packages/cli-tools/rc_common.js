const rc_json = require('@reality.eth/contracts/truffle/build/contracts/Realitio.json');
const arb_json = require('@reality.eth/contracts/truffle/build/contracts/Arbitrator.json');

const wallet_json = require('./abi/MultiSigWallet.json');
const splitter_json = require('./abi/SplitterWallet.json');

try{ 
    require('./config.json');
} catch(err) {
    console.log('Error: Config file config.json is missing. Please create one based on config.example.json');
    process.exit(1);
}

const config = require('./config.json');

const BigNumber = require('bignumber.js');
const fs = require('fs');
const contract = require('truffle-contract');
const Tx = require('ethereumjs-tx')
const createKeccakHash = require('keccak')
const secp256k1 = require('secp256k1')

const web3_utils = require('web3-utils');

const qr = require('qrcode-terminal');

const GWEI_TO_WEI = 1000000000;

exports.GWEI_TO_WEI = GWEI_TO_WEI;

exports.sanitizeNonce = function(nonce) {
    var n = parseInt(nonce);
    if (n > config.max_nonce) {
        console.log('nonce higher than max ' + config.max_nonce);
        process.exit(1);
    }
    if (n < config.min_nonce) {
        console.log('nonce lower than min ' + config.min_nonce);
        process.exit(1);
    }
    return n;
}

exports.sanitizeGasPrice = function(gas_price_in_gwei) {
    var n = parseInt(gas_price_in_gwei);
    if (n > config.max_gas_price_in_gwei) {
        console.log('gas_price_in_gwei higher than max ' + config.max_gas_price_in_gwei);
        process.exit(1);
    }
    if (n < config.min_gas_price_in_gwei) {
        console.log('gas_price_in_gwei lower than min ' + config.min_gas_price_in_gwei);
        process.exit(1);
    }
    return n;
}

exports.loadKey = function() {
    const key_file = config.key_file;
    const key_hex = fs.readFileSync(key_file, 'utf8').replace(/\n$/, "");

    if (key_hex.length != 66) throw 'Private key was the wrong length';
    if (key_hex.substring(0,2) != '0x') throw 'Private key did not begin with 0x';

    return new Buffer(key_hex.substring(2,66), 'hex')
}

exports.rcContract = function() {
    const rc_address = rc_json.networks[config.network_id].address;
    const rc_contract = contract(rc_json);
    return rc_contract.at(rc_address);
}

exports.arbContract = function() {
    const arb_address = arb_json.networks[config.network_id].address;
    const arb_contract = contract(arb_json);
    return arb_contract.at(arb_address);
}

exports.walletContract = function() {
    if (!config.multisig_wallet) {
        return null;
    }
    const wallet_contract = contract(wallet_json);
    return wallet_contract.at(config.multisig_wallet);
}

exports.splitterContract= function() {
    if (!config.splitter_wallet) {
        return null;
    }
    const wallet_contract = contract(splitter_json);
    return wallet_contract.at(config.splitter_wallet);
}


exports.checkArgumentLength = function(num_args, usage_txt) {
    if (process.argv.length != num_args) {
        console.log(usage_txt);
        process.exit(1);
    }
}

exports.commonParams = function(argv) {
    return {
        'nonce': this.sanitizeNonce(argv[2]),
        'gas_price_in_gwei': this.sanitizeGasPrice(argv[3])
    }
}

exports.serializedValueTX = function(params, addr, val, no_multisig) {

    var gas_limit = 22000;
    var data = "0x";

    // If there's a multi-sig wallet configured, use the data and address as arguments
    // ...then switch out the wallet for the address and data.
    if (!no_multisig && config.multisig_wallet) {
        const wallet = this.walletContract();
        const wallet_req = wallet.submitTransaction.request(addr, val, data);
        data = wallet_req.params[0].data;
        addr = config.multisig_wallet;
        gas_limit = 1000000;
    }

    const key = this.loadKey();
	const tra = {
		gasPrice: web3_utils.toHex(params['gas_price_in_gwei'] * GWEI_TO_WEI),
		gasLimit: web3_utils.toHex(gas_limit),
		nonce: web3_utils.toHex(params['nonce']),
		to: addr,
		data: data,
		value: web3_utils.toHex(val),
		chainId: config.network_id
	};

	const tx = new Tx(tra);
    tx.sign(key);

	return tx.serialize();
}

exports.serializedTX = function(params, cntr, data, gas_limit, no_multisig) {

    var address = cntr.address;

    // If there's a multi-sig wallet configured, use the data and address as arguments
    // ...then switch out the wallet for the address and data.
    if (!no_multisig && config.multisig_wallet) {
        const wallet = this.walletContract();
        const wallet_req = wallet.submitTransaction.request(address, 0, data);
        data = wallet_req.params[0].data;
        address = config.multisig_wallet;
    }

    if (gas_limit == undefined) {
        gas_limit = config.gas_limit;
    }
    const key = this.loadKey();
	const tra = {
		gasPrice: web3_utils.toHex(params['gas_price_in_gwei'] * GWEI_TO_WEI),
		gasLimit: web3_utils.toHex(gas_limit),
		data: data,
		nonce: web3_utils.toHex(params['nonce']),
		to: address,
		value: '0x00',
		data: data,
		chainId: config.network_id
	};

	const tx = new Tx(tra);
    tx.sign(key);

	return tx.serialize();
}

exports.sanitizeBytes32 = function(item, name, allow_zero) {
    if (item.length != 66) throw name + ' was not the expected length';
    if (!allow_zero && new BigNumber(item).equals(0)) throw name + ' was 0';
    var BYTES32_REGEX = /^0x[0-9a-f]{64}/i;
    if (!BYTES32_REGEX.test(item)) throw name + ' hex string incorrectly formatted';
    return item;
}

exports.sanitizeAddress = function(addr) {
    if (addr.length != 42) throw 'Answerer address was not the expected length';
    console.log(new BigNumber(addr));
    if (new BigNumber(addr).equals(0)) throw 'Address was zero';
    if (new BigNumber(addr).lt("0xffffffff")) throw 'Address was suspiciously low';
    if (new BigNumber(addr).gt("0xffffffff00000000000000000000000000000000")) throw 'Address was suspiciously high';
    var ADDRESS_REGEX = /^0x[0-9a-f]{40}/i;
    if (!ADDRESS_REGEX.test(addr)) throw 'address hex string incorrectly formatted';
    return addr
}

exports.configParam = function(n) {
    return config[n];
}

exports.address = function() {
    const privateKey = this.loadKey();
    let pubKey = secp256k1.publicKeyCreate(privateKey, false).slice(1);
    let address = createKeccakHash('keccak256').update(pubKey).digest().slice(-20).toString('hex');
    return address;
}

exports.output = function(tx) {
    console.log('0x' + tx.toString('hex'));
    qr.generate('0x' + tx.toString('hex'), {small: true});
}
