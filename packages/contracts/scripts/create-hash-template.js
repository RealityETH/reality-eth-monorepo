#!/usr/bin/env node
// Creates the hash-type template on a deployed RealityETH contract.
//
// Usage:
//   node create-hash-template.js <chain_name> <version> <token_name|native>
//
// The private key is read from <secrets_dir>/<chain_name>.sec
// (set SECRETS env var to override the default secrets directory).

'use strict';

const fs = require('fs');
const ethers = require('ethers');
const { join } = require('path');
const rc = require('../index.js');
const chain_configs = require('../generated/chains.json');

let secrets_dir = join(__dirname, '../secrets');
if (process.env.SECRETS) {
    secrets_dir = process.env.SECRETS;
}

const chain      = process.argv[2];
const version    = process.argv[3];
const token_name = process.argv[4];

function usage_error(msg) {
    console.error('Error:', msg);
    console.error('Usage: node create-hash-template.js <chain_name> <version> <token_name|native>');
    process.exit(1);
}

if (!chain)      usage_error('chain_name not supplied');
if (!version)    usage_error('version not supplied');
if (!token_name) usage_error('token_name not supplied');

// ── Resolve chain ID ──────────────────────────────────────────────────────────

let chain_id;
for (const id in chain_configs) {
    const cc = chain_configs[id];
    if (cc.network_name === chain || cc.chainName?.toLowerCase().replace(/ /g, '-') === chain) {
        chain_id = id;
        break;
    }
}
if (!chain_id) usage_error(`Unknown chain: ${chain}`);

// ── Resolve contract ──────────────────────────────────────────────────────────

const rc_conf = rc.realityETHConfig(chain_id, token_name, version);
if (!rc_conf) usage_error(`No contract found for chain=${chain} version=${version} token=${token_name}`);

console.log('Contract address:', rc_conf.address);
console.log('Version:         ', rc_conf.version_number);

// ── Template text ─────────────────────────────────────────────────────────────

// v3.2 already ships hash as built-in template 5; warn but proceed in case
// the deployer wants an extra copy (e.g. with category instead of description).
if (rc_conf.version_number === '3.2') {
    console.warn('Warning: v3.2 contracts already include hash as built-in template 5.');
}

// v3.0 and earlier use "category"; v3.2 uses "description".
const field = (rc_conf.version_number === '3.2') ? 'description' : 'category';
const template_text = `{"title": "%s", "type": "hash", "${field}": "%s", "lang": "%s"}`;
console.log('Template text:   ', template_text);

// ── RPC / signer ──────────────────────────────────────────────────────────────

function provider_for_chain() {
    const cc = chain_configs[chain_id];
    const rpc = cc?.hostedRPC || cc?.rpcUrls?.find(u => u.startsWith('https://'));
    if (!rpc) usage_error(`No RPC URL found for chain: ${chain}`);
    console.log('RPC:', rpc);
    return new ethers.providers.JsonRpcProvider(rpc);
}

const priv = fs.readFileSync(`${secrets_dir}/${chain}.sec`, 'utf8').replace(/\n/, '');

const CREATE_TEMPLATE_ABI = [
    'function createTemplate(string content) returns (uint256)',
    'event LogNewTemplate(uint256 indexed template_id, address indexed user, string question_text)',
];

async function main() {
    const provider = provider_for_chain();
    const signer = new ethers.Wallet(priv, provider);
    console.log('Sending from:    ', signer.address);

    const contract = new ethers.Contract(rc_conf.address, CREATE_TEMPLATE_ABI, signer);

    console.log('\nSending createTemplate transaction…');
    const tx = await contract.createTemplate(template_text);
    console.log('Transaction hash:', tx.hash);

    const receipt = await tx.wait();
    const log = receipt.logs
        .map(l => { try { return contract.interface.parseLog(l); } catch { return null; } })
        .find(l => l?.name === 'LogNewTemplate');

    if (log) {
        console.log('Created template ID:', log.args.template_id.toString());
    } else {
        console.log('Transaction confirmed (could not parse LogNewTemplate from receipt).');
    }
}

main().catch(err => {
    console.error('Fatal:', err.message || err);
    process.exit(1);
});
