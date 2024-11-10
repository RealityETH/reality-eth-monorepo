const fs = require('fs');
const ethers = require('ethers');

const rc = require('../index.js');

const deployment_json = process.argv[2]; // '../chains/deployments/11155420/ETH/RealityETH-3.0.json';

if (!deployment_json) {
    throw new Error("Usage: node store_template_ids <chain_token_file>");
}

const config = require(deployment_json);
const bits = deployment_json.split('/');
const chain_id = parseInt(bits[3]);
const token = bits[4];
const full_version = bits[5];
const vnum = ""+full_version.split('-')[1].replace('.json', '');

const settings = require(deployment_json);
const address = settings.address;
const chain_data = rc.chainData(chain_id);
const rpc = chain_data.hostedRPC ? chain_data.hostedRPC : chain_data.rpcUrls[0];
const start_block = config.block-1;

const provider = new ethers.providers.JsonRpcProvider(rpc);
const abi = JSON.parse(fs.readFileSync('../abi/solc-0.8.6/RealityETH-all.abi.json'));
const inst = new ethers.Contract(address, abi, provider);

const per_request = 1000;
try {
    templateLoop();
} catch(e) {
    fs.appendFileSync('FAILED-'+f, e.message);
}
const f = chain_id + '-' + token + '-' + vnum + '.txt';

async function templateLoop() {
    const latest = await provider.getBlock('latest');
    for (let i=start_block; i< latest.number; i = i + per_request) {
        await queryTemplates(i, per_request);
    }
}

function storeTemplateID(deployment_json, template_id, template_text) {
    // Reread the template in case it change
    const existing = JSON.parse(fs.readFileSync(deployment_json));
    if (!existing['templates']) {
        existing['templates'] = {};
    }
    existing['templates'][template_id] = template_text;
    // TODO: Write back template
    fs.writeFileSync(deployment_json, JSON.stringify(existing, null, 4));
}

async function queryTemplates(start_block, per_request) {
    console.log('::', per_request, 'from ', start_block);
    const template_filter = inst.filters.LogNewTemplate();
    const template_arr = await inst.queryFilter(template_filter, start_block, start_block+per_request);
    for(let j=0; j<template_arr.length; j++) {
        // fs.appendFileSync(f, template_arr[j].args.template_id.toString() + ',' + template_arr[j].args.question_text+"\n");
        storeTemplateID(deployment_json, template_arr[j].args.template_id.toString(), template_arr[j].args.question_text);
    }
    return;
}
