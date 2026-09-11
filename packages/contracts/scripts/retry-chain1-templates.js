#!/usr/bin/env node
// Fresh fetch of all chain 1 (Ethereum mainnet) templates using local archive node.
// Wipes any existing chain 1 data and errors, re-fetches cleanly.
'use strict';
const fs    = require('fs');
const path  = require('path');
const ethers = require('ethers');

const CONTRACTS_JSON = path.join(__dirname, '../generated/contracts.json');
const OUTPUT_PATH    = path.join(__dirname, '../generated/custom-templates.json');
const LOCAL_RPC      = 'http://localhost:8545';
const CHAIN_ID       = 1;

const TEMPLATES_ABI      = ['function templates(uint256 template_id) view returns (uint256)'];
const LOG_TEMPLATE_TOPIC = ethers.utils.id('LogNewTemplate(uint256,address,string)');
const iface = new ethers.utils.Interface([
  'event LogNewTemplate(uint256 indexed template_id, address indexed user, string question_text)',
]);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchForContract(prov, address, errors) {
  const rc = new ethers.Contract(address, TEMPLATES_ABI, prov);
  const templates = {};
  const blocksQueried = new Set();

  for (let id = 0; ; id++) {
    let blockNum;
    try {
      const bn = await rc.templates(id);
      blockNum = bn.toNumber();
    } catch (err) {
      const msg = err.message || String(err);
      console.error(`  ✗ templates(${id}): ${msg.slice(0, 120)}`);
      errors.push({ chainId: CHAIN_ID, contract: address, templateId: id, phase: 'templates()', error: msg });
      break;
    }
    if (blockNum === 0) { console.log(`  templates(${id}) = 0 — done`); break; }
    console.log(`  templates(${id}) = block ${blockNum}`);
    if (!blocksQueried.has(blockNum)) {
      blocksQueried.add(blockNum);
      try {
        const logs = await prov.getLogs({ address, topics: [LOG_TEMPLATE_TOPIC], fromBlock: blockNum, toBlock: blockNum });
        for (const log of logs) {
          const parsed = iface.parseLog(log);
          const tid = parsed.args.template_id.toString();
          const text = parsed.args.question_text;
          templates[tid] = text;
          console.log(`    ✓ template ${tid}: ${text.slice(0, 80)}${text.length > 80 ? '…' : ''}`);
        }
      } catch (logErr) {
        const msg = logErr.message || String(logErr);
        console.error(`  ✗ getLogs(block ${blockNum}): ${msg.slice(0, 120)}`);
        errors.push({ chainId: CHAIN_ID, contract: address, block: blockNum, phase: 'getLogs', error: msg });
      }
    }
    await sleep(50);
  }
  return templates;
}

async function main() {
  const allContracts = JSON.parse(fs.readFileSync(CONTRACTS_JSON, 'utf8'));
  const output = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));

  // Clean slate for chain 1
  delete output['1'];
  output._errors = (output._errors || []).filter(e => e.chainId !== CHAIN_ID);
  output['1'] = {};

  const prov = new ethers.providers.JsonRpcProvider(LOCAL_RPC, { chainId: CHAIN_ID, name: 'mainnet' });
  const bn = await prov.getBlockNumber();
  console.log(`Local node at block ${bn}\n`);

  const seen = new Set();
  const errors = [];
  for (const [token, vers] of Object.entries(allContracts[String(CHAIN_ID)] || {})) {
    for (const [ver, info] of Object.entries(vers)) {
      if (!info.address || !ver.includes('RealityETH')) continue;
      const lc = info.address.toLowerCase();
      if (seen.has(lc)) continue;
      seen.add(lc);
      console.log(`\nChain 1  ${ver}  ${lc}`);
      const templates = await fetchForContract(prov, lc, errors);
      templates._complete = true;
      output['1'][lc] = templates;
      output._errors.push(...errors.splice(0));
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  if (output._errors.filter(e => e.chainId === CHAIN_ID).length === 0) {
    console.log('No errors for chain 1.');
  } else {
    const e1 = output._errors.filter(e => e.chainId === CHAIN_ID);
    console.log(`${e1.length} error(s) for chain 1:`);
    for (const e of e1) console.log(`  ${e.phase}${e.block ? ` block ${e.block}` : ''}: ${e.error.slice(0, 80)}`);
  }
}

main().catch(err => { console.error('\nFatal:', err.message || err); process.exit(1); });
