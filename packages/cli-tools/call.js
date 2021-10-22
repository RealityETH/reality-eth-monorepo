const fs = require('fs');
const ethers = require('ethers');
const rc_contracts = require('@reality.eth/contracts');

var undef;

const defaultConfigs = {
    //maxFeePerGas:         81000000000,
    //maxFeePerGas:         1000000008,
    //maxPriorityFeePerGas:  1000000000,
    //gasPrice: 70000000000,
    //gasLimit: 1000000,
    //etherscanApiKey: 'TPA4BFDDIH8Q7YBQ4JMGN6WDDRRPAV6G34'
    // gasLimit: 155734867 // arbitrum
}
const task = process.argv[2]
const version = process.argv[3]
const chain_id = process.argv[4]
const token_name = process.argv[5]

// For askQuestion
const delim = '\u241f';
//const qtext = 'reality' + delim + 'QmVSKvdV5TUBQkrqstNZtUAyTepAMbDqvhh4zP3SJKRXAs';
const qtext = 'rapture';
const timeout_val = ethers.BigNumber.from(86401);
const opening_ts = ethers.BigNumber.from(0);
const arbitrator = '0xf72cfd1b34a91a64f9a98537fe63fbab7530adca';

// for createTemplate
const tmpl = '{"title":"When will %s happen?", "type": "datetime", "precision":"i", "lang": "en_US", "category": "test"}';

if (!task || !version || !chain_id || !token_name) {
    usage_error("Usage: node call.js <askQuestion|createTemplate> <2.0|2.1|3.0> <chain_id> <token> [<template_id>]");
}

let template_id;
if (task != 'createTemplate') {
    template_id = ethers.BigNumber.from(parseInt(process.argv[6]));
}

const chain_info = rc_contracts.chainData(chain_id);
const rpc_node = chain_info['hostedRPC'];

//const chain_name = (chain_info['network']== 'mainnet' && 'shortName' in chain_info) ? chain_info['shortName'] : chain_info['network'];
const chain_name = chain_info['network_name'];
const config = rc_contracts.realityETHConfig(chain_id, token_name, version);
const inst = rc_contracts.realityETHInstance(config);

const is_infura = rpc_node.includes('infura');
const provider = is_infura ? new ethers.providers.InfuraProvider(chain_id) : new ethers.providers.JsonRpcProvider(rpc_node);

console.log('provider', provider);

const ctn = new ethers.Contract(config.address, inst.abi, provider);

const priv = fs.readFileSync('/home/ed/secrets/' + chain_name + '.sec', 'utf8').replace(/\n/, '')
const signer = new ethers.Wallet(priv, provider);

const signed_ctn = ctn.connect(signer);

function usage_error(msg) {
    throw msg;
}

doCall();

async function doCall() {
    await waitForGas(provider);
    const conf = defaultConfigs;
    conf['value'] = ethers.BigNumber.from(0);
    if (task == 'askQuestion') {
        const tx_response = await signed_ctn.functions.askQuestion(template_id, qtext, arbitrator, timeout_val, opening_ts, 0, conf);
        console.log(tx_response);
    } else if (task == 'createTemplate') {
        const tx_response = await signed_ctn.functions.createTemplate(tmpl);
        console.log(tx_response);
    }
}

async function waitForGas(provider) {
    if (!defaultConfigs.maxFeePerGas) {
        return true;
    }
    // console.log('in waitForGas');
    const sleep = (milliseconds) => {
      return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    const f = await provider.getFeeData()
    // console.log('fee', f)
    if (f.gasPrice.gt(ethers.BigNumber.from(defaultConfigs.maxFeePerGas))) {
        console.log('Gas is too expensive, got', f.gasPrice.toString(), 'but you will only pay ', defaultConfigs.maxFeePerGas, ', retrying...')
        await sleep(2000);
        await waitForGas(provider);
    } 
}
