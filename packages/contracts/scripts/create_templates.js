const fs = require('fs');
const ethers = require('ethers');
const project_base = './../';
const rc = require('../index.js');
const { join } = require('path');
const chain_configs = require('./../generated/chains.json');

let secrets_dir = join(__dirname, '../secrets');
if (process.env.SECRETS) {
    secrets_dir = process.env.SECRETS;
}

const deployed_at = null;

var undef;

console.log(process.argv);
if (process.argv.length > 6 || process.argv.length < 6) {
    usage_error();
}

const version = process.argv[2]
const chain = process.argv[3]
const token = process.argv[4]
const template_files = process.argv[5].split(',');

function usage_error(msg) {
    msg = msg + "\n";
    msg += "Usage: node create_template.js <version> <chain_name> <token> <template_files>";
    throw msg;
}


let chain_id;
let rpc;
for (const c in chain_configs) {
    const cn = chain_configs[c].chainName.toLowerCase().replace(' ', '-');
    if (cn == chain || ""+c == ""+chain) {
        rpc = chain_configs[c].hostedRPC;
        chain_id = c;
        break;
    }
    if (chain_configs[c].network_name) {
        const cn2 = chain_configs[c].network_name.toLowerCase();
        if (cn2 == chain) {
            rpc = chain_configs[c].hostedRPC;
            chain_id = c;
            break;
        }
    }
}

if (!chain_id) {
    usage_error("Network unknown");
}

if (token == undef) {
    usage_error("token_name not supplied");
}

const priv = fs.readFileSync(secrets_dir + '/' + chain + '.sec', 'utf8').replace(/\n/, '')

const config = rc.realityETHConfig(chain_id, token, version)
const contract = rc.realityETHInstance(config);
console.log('using rpc', rpc);
const provider = new ethers.providers.JsonRpcProvider(rpc);
const signer = new ethers.Wallet(priv, provider);
const ethers_instance = new ethers.Contract(contract.address, contract.abi, signer);

createMultiple(template_files);

async function createMultiple(template_files) {
    const latest = await provider.getBlock('latest');
    console.log('starting at block', latest.number);
    for (let ti=0; ti<template_files.length; ti++) {
        const template_file = template_files[ti];
        console.log('template is', template_file)
        const template_content = fs.readFileSync(template_file, 'utf8');
        await createTemplate(template_content.trim());
    }
}

/*
function store_deployed_template(template, chain_id, token_name, out_json) {
    const file = project_base + '/chains/deployments/' + chain_id + '/' + token_name + '/' + template + '.json';
    fs.writeFileSync(file, JSON.stringify(out_json, null, 4));
    console.log('wrote file', file);
}
*/

async function createTemplate(template_content) {
    // console.log('creating template', template_content);
    const tx = await ethers_instance.createTemplate(template_content);
    // console.log('tx was', tx);
}
